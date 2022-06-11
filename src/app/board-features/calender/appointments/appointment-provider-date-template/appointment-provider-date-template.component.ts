/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";

@Component({
  selector: "app-appointment-provider-date-template",
  templateUrl: "./appointment-provider-date-template.component.html",
  styleUrls: ["./appointment-provider-date-template.component.scss"],
})
export class AppointmentProviderDateTemplateComponent implements OnInit {
  @Input() day: any;
  @Input() locale: any;
  @Output() fetchEvents = new EventEmitter<any>();
  selectedSlot = new Set();
  public providerIdWithPatientsList: any;
  public providerKeys;
  public currentIndex = 0;
  constructor(private router: Router) {}

  ngOnInit(): void {}

  openEventsPopOver(p, events) {
    // this.providerIdWithPatientsList = lodash.groupBy(events, function(currentObject) {
    //   return currentObject["meta"]["doctor"]["doctorId"];
    // });
    // console.log(pro)
    // this.providerKeys = Object.keys(this.providerIdWithPatientsList);
    if (events && events.length) {
      p.open();
    }
  }
  
  getAppointmentType(appointmenttype){
    return appointmenttype == 1 ? "VIRTUAL" : "INOFFICE"
  }

  patientImage(img) {
    return img ? img : "../../../../../assets/images/profile-img.svg";
  }

  getAppointmentById(appointmentId, data) {
    let currentTimeStamp = moment().valueOf();
    let status = "upcoming";
    if (data?.bookingDetail?.status == "cancelled") {
      status = "cancelled";
    } else if (
      data?.bookingDetail?.status == "confirmed" &&
      data?.bookingDetail?.endTime > currentTimeStamp
    ) {
      status = "upcoming";
    } else if (
      data?.bookingDetail?.status == "confirmed" &&
      data?.bookingDetail?.endTime < currentTimeStamp
    ) {
      status = "past";
    }
    this.router.navigateByUrl(
      "feature/calendar/appointment/detail/" + appointmentId + "/" + status
    );
  }
}
