/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppointmentService } from "../../appointments/appointments.service";
import { LocalStorageService } from "../../../../utils/service/localStorage.service";
// import { CommonService } from '../../../utils/service/common.service';
// import { BackendService } from '../../backend.service';

@Component({
  selector: "app-calendar-header",
  templateUrl: "./calendar-header.component.html",
  styleUrls: ["./calendar-header.component.scss"],
})
export class CalendarHeaderComponent implements OnInit {
  @Input() fullDivRef;
  public isAppointment = false;
  public toggleView = true;
  userData: any;
  deleteAllMsg =false;

  constructor(
    private appointmentService: AppointmentService,
    public localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAppointment = JSON.parse(
      this.route.snapshot.queryParams.appointment
        ? this.route.snapshot.queryParams.appointment
        : "false"
    );
    this.userData = this.localStorageService.getItem("userData");
    if(this.userData.isCalenderDeleteAllPopup){
      this.deleteAllMsg = true;
    }
  }

  openFullscreen() {
    const elem = this.fullDivRef.nativeElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  availability() {
    this.router.navigateByUrl(
      "/feature/calendar/availability?appointment=false"
    );
  }

  appointment() {
    this.router.navigateByUrl("/feature/calendar/appointment?appointment=true");
  }

  openAppointmentTable() {
    this.toggleView = !this.toggleView;
    this.appointmentService.setAppointmentToggleView(this.toggleView);
    this.router.navigateByUrl(
      "/feature/calendar/appointment?appointment=true&type=upcoming"
    );

    // this.backendService.navigateTo('/backend/calendar/appointment/details');
  }

  isCalenderDeleteAllPopup(){
    this.deleteAllMsg = false;
    this.userData.isCalenderDeleteAllPopup = false;
    this.localStorageService.setItem("userData", this.userData);
     
  }
}
