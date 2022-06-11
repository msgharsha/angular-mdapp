/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { DOCUMENT } from "@angular/common";
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { LocalStorageService } from "../../../../utils/service/localStorage.service";

declare var google: any;
declare var $;
declare var MarkerClusterer: any;
@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit {
  @Input("dentistList") dentistList: Array<Object>;
  @Output("centerChanged")
  centerChanged: EventEmitter<any> = new EventEmitter();
  @Output("infoCardClick")
  infoCardClick: EventEmitter<any> = new EventEmitter();
  selectedSpeciality = null;

  public debounceEmit: any = _.debounce(this.emitCenterChangeEvent, 300);
  public mapReference: any;
  public markerReference: any;
  public markerClusterRef: any;
  public infoWindowRef: any;
  public centerChangedByMarkerClick: boolean = false;
  public langSubscription: Subscription;
  // public mapCenterMarker: any;

  constructor(
    private router: Router,
    private zone: NgZone,
    private localStorageService: LocalStorageService,
    private translateService: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // this.getSelectedSpeciality();
    // this.renderGoogleMap();
    this.subscribeLangChangeEvent();
    this.loadScriptDynamically();
  }

  subscribeLangChangeEvent() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    this.langSubscription = this.translateService.onLangChange.subscribe(() => {
      this.loadScriptDynamically();
    });
  }

  loadScriptDynamically() {
    const lang = this.localStorageService.getItem("language");
    document
      .querySelectorAll('script[src^="https://maps.googleapis.com"]')
      .forEach((script) => {
        script.remove();
      });

    if (google) delete google.maps;

    let newMapAPI = document.createElement("script");
    newMapAPI.type = "text/javascript";
    newMapAPI.src = `https://maps.googleapis.com/maps/api/js?libraries=places&key=${environment.googleMapKey}&language=${lang}`;

    document.querySelector("head").appendChild(newMapAPI);
    newMapAPI.onload = () => {
      this.getSelectedSpeciality();
      this.renderGoogleMap();
      this.subscribeLangChangeEvent();
    };
  }

  getSelectedSpeciality() {
    let filters = this.localStorageService.getItem("x-d-f");
    if(filters){
      this.selectedSpeciality = filters.specialty ? filters.specialty.name : "";
    }
  }

  ngOnChanges(changes: any) {
    if (this.mapReference) {
      this.reloadMarkers(changes.dentistList.currentValue);
    }
  }

  /**
   * Function to generate markers
   */
  generateMarkers(map, coordinates) {
    let markers = _.map(
      coordinates,
      (coordinate) =>
        new google.maps.Marker({
          position: coordinate,
          map: map,
          label: _.toString(this.getCommonDentist(coordinate).length),
        })
    );

    return markers;
  }

  /**
   * Function to generate lat , lng object from list
   */
  generateCoordinates(dentistList) {
    let coordinates = _.map(dentistList, (val, key) => ({
      lat: +_.get(val, "lat"),
      lng: +_.get(val, "lng"),
    }));
    return _.uniqWith(coordinates, _.isEqual);
  }

  /**
   * Function to generate signle dentist info card
   */
  generateSingleDentistInfoCard(doctor) {
    console.log(doctor);
    let content = `
            <div class="info-card-container" id="info-dentist-${
              doctor.doctorId
            }">
                <div class="">
                    <div class="img-wrapper">
                        <img class="img-responsive" height=80 width=80 src="${
                          doctor.profileImage
                            ? doctor.profileImage
                            : "/assets/images/profileImg.png"
                        }"/>
                    </div>
                </div>
                <div class="">
                    <div class="right-section">
                        <div class="name-wrapper">
                            <h6> Dr. ${doctor.firstName} ${doctor.lastName}</h6>
                            <div class="ris-med-text info-post">
                                ${_.get(doctor, "practiceMethod")} | ${
      this.selectedSpeciality || "Family Physician"
    }
                            </div>
                        </div>
                        <div class="address-wrapper">
                            <div class="street-wrapper ellipsis">
                            ${
                              _.get(doctor, "addressLine1") ||
                              _.get(doctor, "address")
                            }
                            </div>
                            <div class="city-country-wrapper ellipsis">
                            ${_.get(doctor, "province") + ","} ${_.get(
      doctor,
      "city"
    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    return content;
  }

  /**
   * Function to handle info card click event
   */
  dentistClickEvent(dentist, infoWindow) {
    infoWindow.close();
    this.infoCardClick.emit(dentist);
  }

  /**
   * Function to get template for info window
   */
  getInfoWindowTemplate(marker) {
    let dentistOnSameLocation = this.getDentistOnSameLocation(marker);

    let contentString = `
        <div class="info-card-wrapper">
            ${_.join(
              _.map(dentistOnSameLocation, (dentist) =>
                this.generateSingleDentistInfoCard(dentist)
              ),
              ""
            )}
        </div>
        `;
    return contentString;
  }

  /**
   * Function to get dentist based on lat lng
   */
  getCommonDentist(locationObject) {
    return _.filter(
      this.dentistList,
      (dentist) =>
        +_.get(dentist, "lat") === locationObject.lat &&
        +_.get(dentist, "lng") === locationObject.lng
    );
  }

  /**
   * Function to get dentist on same location
   */
  getDentistOnSameLocation(marker) {
    let locationObject = {
      lat: marker.position.lat(),
      lng: marker.position.lng(),
    };
    return this.getCommonDentist(locationObject);
  }

  /**
   * Function to close opened markers
   */
  closeOpenMarkers(markers, selectedMarker, infoWindowArray, map) {
    _.forEach(markers, (marker, key) => {
      if (!marker.getPosition().equals(selectedMarker.getPosition())) {
        _.set(marker, "opened", false);
        infoWindowArray[key].close(map, marker);
      }
    });
  }

  /**
   * Function to attach info window with markers
   */
  attachInfoWindowToMarker(map, markers) {
    this.infoWindowRef = _.map(markers, (marker) => {
      let contentString = this.getInfoWindowTemplate(marker);

      let infoWindow = new google.maps.InfoWindow({
        content: contentString,
      });

      return infoWindow;
    });

    _.forEach(markers, (marker, indx) => {
      let dentistList = this.getDentistOnSameLocation(marker);
      marker.addListener("click", () => {
        this.closeOpenMarkers(markers, marker, this.infoWindowRef, map);
        if (_.get(marker, "opened", false)) {
          _.set(marker, "opened", false);
          this.infoWindowRef[indx].close(map, marker);
        } else {
          _.set(marker, "opened", true);
          this.infoWindowRef[indx].open(map, marker);
          _.defer(() => {
            this.repositionInfoWindow();
            this.attachClickEvent(this.infoWindowRef[indx], dentistList);
            this.attachCloseButtonEvent(this.infoWindowRef[indx], marker);
          });
        }
      });
    });
  }

  /**
   * Function to attach close button event
   */
  attachCloseButtonEvent(infoWindow, marker) {
    google.maps.event.addListener(infoWindow, "closeclick", () => {
      _.set(marker, "opened", false);
    });
  }

  /**
   * Function to apply css to infowindow
   */
  repositionInfoWindow() {
    var iwOuter = $(".gm-style-iw");
    iwOuter.parent().parent().css({ top: "22px" });
  }

  /**
   * Function to attach click event to info card
   */
  attachClickEvent(infoWindow, dentistList) {
    _.forEach(dentistList, (dentist) => {
      let dom = document.getElementById(`info-dentist-${dentist["doctorId"]}`);
      dom.onclick = _.bind(this.dentistClickEvent, this, dentist, infoWindow);
    });
  }

  /**
   * Function to render map
   */
  renderGoogleMap() {
    let coordinates = this.generateCoordinates(this.dentistList);
    let filters = this.localStorageService.getItem("x-d-f") || {};
    this.mapReference = new google.maps.Map(
      document.getElementById("map_area"),
      {
        zoom: 4,
        center: {
          lat: _.mean(_.map(coordinates, "lat")) || filters["latitude"],
          lng: _.mean(_.map(coordinates, "lng")) || filters["longitude"],
        },
        //   center: { lat:parseFloat(coordinates["lat"]), lng: parseFloat(coordinates["lng"]) },

        minZoom: 1,
        maxZoom: 18,
      }
    );

    //  this.attachMapCenterMarker(this.mapReference);
    this.addMarkersToMap(coordinates);
    this.closeMarkerOnMapClick();
    this.addResizeTrigger(this.mapReference);
    this.mapCenterChange(this.mapReference);
  }

  /**
   * Function to add map resize trigger
   */
  addResizeTrigger(map) {
    google.maps.event.trigger(map, "resize");
  }

  /**
   * Function to set map center marker
   */
  // attachMapCenterMarker(map) {
  //     let coordinate = { lat: map.center.lat(), lng: map.center.lng() };

  //     this.mapCenterMarker = new google.maps.Marker({
  //         position: coordinate,
  //         map: map,
  //         // label: 'C',
  //         icon: {
  //             url: "https://s3.amazonaws.com/book-dental-static/pinIcon.png"
  //         }
  //     });
  // }

  /**
   * Function to listen for map click event and close marker
   */
  closeMarkerOnMapClick() {
    google.maps.event.addListener(this.mapReference, "click", () => {
      _.forEach(this.infoWindowRef, (infoWindow, key) => {
        _.set(this.markerReference[key], "opened", false);
        infoWindow.close();
      });
    });
  }

  /**
   * Function to reload markers
   */
  reloadMarkers(dentistList) {
    this.markerClusterRef.clearMarkers();
    _.forEach(this.markerReference, (marker) => {
      marker.setMap(null);
    });
    this.markerReference = [];
    // this.markerClusterRef = null;
    let coordinates = this.generateCoordinates(dentistList);
    this.addMarkersToMap(coordinates);
  }

  /**
   * Function to add markers to map
   */
  addMarkersToMap(coordinates) {
    this.markerReference = this.generateMarkers(this.mapReference, coordinates);
    this.clusterMarkers();
    this.attachMarkerClickEvent(this.markerReference);
    this.attachInfoWindowToMarker(this.mapReference, this.markerReference);
    this.generateBounds(this.mapReference, this.markerReference);
  }

  /**
   * Function to handle click event on marker
   */
  attachMarkerClickEvent(markers) {
    _.forEach(markers, (marker) => {
      marker.addListener("click", () => {
        this.centerChangedByMarkerClick = true;
      });
    });
  }

  /**
   * Function to generate bounds for marker
   */
  generateBounds(map, markers) {
    if (!this.dentistList.length) {
      return;
    }
    let bounds = new google.maps.LatLngBounds();
    _.forEach(markers, (marker) => {
      bounds.extend(marker.getPosition());
    });

    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
  }

  /**
   * Function to detect map center change event
   */
  mapCenterChange(map) {
    google.maps.event.addListenerOnce(map, "idle", () => {
      map.addListener("center_changed", (e) => {
        this.addResizeTrigger(map);
        // this.mapCenterMarker.setPosition(location);
        this.zone.run(() => {
          if (this.centerChangedByMarkerClick) {
            _.defer(() => {
              this.centerChangedByMarkerClick = false;
            });
          } else {
            this.debounceEmit(map);
          }
        });
      });
    });
  }

  /**
   * Function to emit map center change event
   */
  emitCenterChangeEvent(map) {
    let location = { lat: map.center.lat(), lng: map.center.lng() };
    this.centerChanged.emit(location);
  }

  /**
   * Function to cluster markers
   */
  clusterMarkers() {
    this.markerClusterRef = new MarkerClusterer(
      this.mapReference,
      this.markerReference,
      { imagePath: "/assets/images/map_clustering/" }
    );
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
