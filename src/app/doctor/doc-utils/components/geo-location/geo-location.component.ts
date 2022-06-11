/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
} from "@angular/core";
import * as _ from "lodash";
import { reverseGeoCode } from "../../helper";
// import { LoaderService } from "../../../../utils/service/loader.service";
import { ToasterService } from "../../../../utils/service/toaster.service";

@Component({
  selector: "app-geo-location",
  templateUrl: "./geo-location.component.html",
  styleUrls: ["./geo-location.component.scss"],
})
export class GeoLocationComponent implements OnInit {
  public isGeoSupported: boolean;
  public isLocationDenied: boolean;
  public unableToFetchLocation: boolean;
  public curr: string;

  @Input("requestLocation") requestLocationFlag: boolean = true;
  @Input("showIconOnRight") showIconOnRight: boolean;
  @Input("locationFetched") locationFetched: boolean = false;
  @Output("locationEvent")
  locationEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private toaster: ToasterService,
    private vref: ViewContainerRef,
    //private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.checkGeoSupport();

    if (this.requestLocationFlag) {
      this.requestLocation();
    }
  }

  /**
   * Function to check whether geolocation is supported
   */
  checkGeoSupport() {
    if (_.hasIn(navigator, "geolocation")) {
      this.isGeoSupported = true;
    } else {
      this.showNoSupport();
    }
  }

  /**
   * Function to show no support of geolocation in browser
   */
  showNoSupport() {
    this.toaster.showError(
      this.vref,
      "Error Occurred",
      "GEOLOCATION_NOT_SUPPORTED"
    );
  }

  /**
   * Function to request location
   */
  requestLocation() {
    if (!this.isGeoSupported) {
      this.showNoSupport();
      return;
    }

    if (this.isLocationDenied) {
      this.toaster.showError(
        this.vref,
        "Location Access Denied",
        "PLEASE_ALLOW_LOCATION_ACCESS_FROM_SETTINGS"
      );
      return;
    }

    let locationOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 8.64e7,
    };
    // this.loaderService.showLoader();
    _.invoke(
      navigator.geolocation,
      "getCurrentPosition",
      _.bind(this.locationAccessAllowed, this),
      _.bind(this.locationAccessDenied, this),
      locationOptions
    );
  }

  /**
   * Function to handle if user denied access
   */
  locationAccessDenied(positionErr: any) {
    // this.loaderService.hideLoader();
    let errCode = _.get(positionErr, "code", null);

    this.initializeLocationBoolean();
    this.locationEvent.emit(null);

    switch (errCode) {
      case 1:
        this.isLocationDenied = true;
        break;
      case 2:
      case 3:
        this.unableToFetchLocation = true;
        this.toaster.showError(
          this.vref,
          "Unable to fetch location",
          "UNABLE_TO_FETCH_LOCATION"
        );
        break;
      default:
        return;
    }
  }

  /**
   * Function to initialize location variables
   */
  initializeLocationBoolean() {
    this.isLocationDenied = false;
    this.unableToFetchLocation = false;
    this.locationFetched = false;
  }

  /**
   * Function to handle if user allowed location access
   */
  locationAccessAllowed(position: any) {
    // this.loaderService.hideLoader();
    this.initializeLocationBoolean();
    this.locationFetched = true;
    let locationObj = {
      latitude: _.get(position, "coords.latitude", null),
      longitude: _.get(position, "coords.longitude", null),
      location: null,
      gpsOn:
        _.get(position, "coords.latitude") &&
        _.get(position, "coords.longitude")
          ? true
          : false,
    };
    this.locationEvent.emit(locationObj);
    this.getCurrentLocationAddress(position, locationObj);
  }

  private getCurrentLocationAddress(
    position: any,
    locationObj: {
      latitude: any;
      longitude: any;
      location: any;
      gpsOn: boolean;
    }
  ) {
    if (
      _.get(position, "coords.latitude") &&
      _.get(position, "coords.longitude")
    ) {
      let loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      reverseGeoCode(loc, (error, results) => {
        if (!error) {
          locationObj.location = results[0].formatted_address;
          this.locationEvent.emit(locationObj);
        } else {
          console.info(error.status, error.error);
          this.locationEvent.emit(locationObj);
        }
      });
    }
  }
}
