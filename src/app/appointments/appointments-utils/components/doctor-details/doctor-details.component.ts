/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslaterService } from "../../../../utils/service/translater.service";

@Component({
  selector: "app-doctor-details",
  templateUrl: "./doctor-details.component.html",
  styleUrls: ["./doctor-details.component.scss"],
})
export class DoctorDetailsComponent implements OnInit {
  public mapReference: any;
  public mapCenterMarker: any;
  public markerReference: any;

  @Input("expertData") expert;
  @Input("address") address;
  @Input("showButton") showButton;
  @Input("procedureId") procedureId;

  constructor(private router: Router, private translater: TranslaterService) {}
  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
  }

  /**
   * Function to generate markers
   */
  generateMarkers(map, coordinates) {
    let markers = new google.maps.Marker({
      position: coordinates,
      map: map,
    });

    return markers;
  }

  /**
   * Function to render map
   */
  renderGoogleMap() {
    this.mapReference = new google.maps.Map(
      document.getElementById("map_area"),
      {
        zoom: 10,
        center: this.address.address,
        minZoom: 1,
        // gestureHandling: 'none'
      }
    );
    this.addMarkersToMap(this.address.address);
  }

  /**
   * Function to add markers to map
   */
  addMarkersToMap(coordinates) {
    this.markerReference = this.generateMarkers(this.mapReference, coordinates);
  }

  /**
   * Function to detect changes in input
   */
  ngOnChanges(changes) {
    if (
      changes["address"] &&
      this.address &&
      this.address.address &&
      this.address.address.lat &&
      this.address.address.lng
    ) {
      this.renderGoogleMap();
    }
  }

  navigateToDentist(dentistId, procedureId) {
    this.router.navigate([`/dentist/profile/${dentistId}`], {
      queryParams: {
        procedure: procedureId,
      },
    });
  }
}
