/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewContainerRef,
} from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { CalendarView } from "angular-calendar";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import * as moment from "moment";
import * as _ from "lodash";
import { ErrorService } from "../../../../utils/service/error.service";
import { TranslaterService } from "../../../../utils/service/translater.service";
import { AppointmentService } from "../appointments.service";
import { MatDialog } from "@angular/material/dialog";
import { ToasterService } from "../../../../../app/utils/service/toaster.service";
import { DialogModalComponent } from "../../../../../../src/app/utils/component/cancel-modal/cancel-modal.component";
import { MedicalHistoryModalComponent } from "../../medical-history-modal/medical-history-modal.component";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../../../utils/service/localStorage.service";
import { EventService } from "../../../../utils/service/eventservice";

const LIST_TYPE = {
  UPCOMING: "upcoming",
  PAST: "past",
  CANCELLED: "cancelled",
  PENDING: "pending",
};

@Component({
  selector: "app-appointment-listing",
  templateUrl: "./appointment-listing.component.html",
  styleUrls: ["./appointment-listing.component.scss"],
})
export class AppointmentListingComponent implements OnInit, OnChanges {
  @Input("fromCalendarView") fromCalendarView: boolean = false;
  @Input() view: CalendarView = CalendarView.Day;
  @Input() type = null;
  @Input() list;
  @Input() selectedDoctorId;
  @Input() viewDate: Date = new Date();
  @Output() getAppointmentCount = new EventEmitter<any>();
  private pendingData: any;
  public delete: Subscription;
  // @Output() appointmentsChecked = new EventEmitter<any>();

  public isMultiSelectedAllowed: boolean;
  public appointmentList = [];
  public itemsPerPage = 10;
  public count = 0;
  public userData = null;
  public currentPage = 1;
  public currentDate = moment().toString();
  public appointmentsToCancel: any = [];
  public element: any = [];
  public checked: boolean;
  public lang: string;
  constructor(
    private router: Router,
    private translater: TranslaterService,
    public translateService: TranslateService,
    private appointmentService: AppointmentService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private matDialog: MatDialog,
    private toaster: ToasterService,
    private route: ActivatedRoute,
    private eventService: EventService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem("userData");
    this.translater.TranslationAsPerSelection();
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      this.fetchAvailableEvents();
    } else {
      this.fetchEvents();
    }
    // this.fetchPendingData()
    if (this.router.url.includes("appointment")) {
      this.isMultiSelectedAllowed = true;
    }

    this.delete = this.appointmentService.deleteSubscription.subscribe(
      (res) => {
        if (res) {
          this.cancelAppointment();
        }
      }
    );

    this.translateService.onLangChange.subscribe(() => {
      this.lang = this.localStorageService.getItem("language");
    });
    this.lang = this.localStorageService.getItem("language");
    this.eventService.calenderAvailabilityView.subscribe(data => {
      if(data['status']){
        this.viewDate = data['date'];
        if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
          this.currentPage = 1;
          this.fetchAvailableEvents();
        } else {
          this.currentPage = 1;
          this.fetchEvents();
        }
      }
    })
    
  }

  ngOnChanges(event) {
    if (event.view || event.viewDate) {
      if (event && event.type && event.type.previousValue) {
        this.fetchEvents();
      }
    }
    if(event && event.selectedDoctorId && event.selectedDoctorId.currentValue != event.selectedDoctorId.previousValue ){
      this.userData = this.localStorageService.getItem("userData");
      if(this.userData.subAccount){
        this.fetchAvailableEvents();
      }
    }
  }

  goToAppointment(appointmentId) {
    if (this.type == "pending") {
      const appointment = _.find(this.pendingData.data, {
        appointmentId: appointmentId,
      });
      this.router.navigate(["video-call"], {
        relativeTo: this.route.parent,
        queryParams: {
          sessionId: null,
          token: null,
          bookingId: appointment.appointmentId,
          patientUserId:
            appointment["member"]?.memberUserId ||
            appointment["patient"]?.patientUserId,
          patientEmail:
            appointment["member"]?.memberEmail ||
            appointment["patient"]?.patientEmail,
          patientName:
            appointment["member"]?.patientName ||
            appointment["patient"]?.patientName,
          startDate: appointment["startTime"],
          age: appointment["member"]?.age || appointment["patient"]?.age,
          gender:
            appointment["member"]?.gender || appointment["patient"]?.gender,
          profileImage:
            appointment["member"]?.profileImage ||
            appointment["patient"]?.profileImage,
          isFromPending: this.type === "pending",
        },
      });
    } else {
      if (this.type) {
        this.router.navigateByUrl(
          `feature/calendar/appointment/detail/${appointmentId}/${this.type}`
        );
      } else if (!this.type) {
        this.router.navigateByUrl(
          `feature/calendar/appointment/detail/${appointmentId}/todays-appointment`
        );
      }
    }
  }

  fetchPendingData() {
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      this.appointmentService.managerGetPendingData(this.userData.selectedDoctorData).subscribe(
        (res) => this.handlePendingEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }else{
      this.appointmentService.getPendingData().subscribe(
        (res) => this.handlePendingEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }
    
  }

  fetchAvailableEvents():void {
    if (this.type === "pending") {
      this.fetchPendingData();
    } else {
      const getStart: any = {
        month: startOfMonth,
        week: startOfWeek,
        day: startOfDay,
      }[this.view];
      const getEnd: any = {
        month: endOfMonth,
        week: endOfWeek,
        day: endOfDay,
      }[this.view];
      const startDateCalendarView = format(
        getStart(this.viewDate),
        "yyyy-MM-dd"
      );
      let from = moment(getStart(this.viewDate), "yyyy-MM-dd")
        .startOf("day")
        .valueOf();
      let to = moment(getEnd(this.viewDate), "yyyy-MM-dd")
        .startOf("day")
        .valueOf();

      const offset = moment(startDateCalendarView).format("Z");
      const queryParams = { from, to, offset };

      if (this.type) {
        queryParams["type"] = this.type;
      }

      queryParams["skip"] = (this.currentPage - 1) * this.itemsPerPage;
      queryParams["limit"] = this.itemsPerPage;
      queryParams["list"] = this.list;
      this.appointmentService.getAllAppointmentsByManager(queryParams,this.userData.selectedDoctorData).subscribe(
        (res) => this.handleEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }
  }

  fetchEvents(): void {
    if (this.type === "pending") {
      this.fetchPendingData();
    } else {
      const getStart: any = {
        month: startOfMonth,
        week: startOfWeek,
        day: startOfDay,
      }[this.view];
      const getEnd: any = {
        month: endOfMonth,
        week: endOfWeek,
        day: endOfDay,
      }[this.view];
      const startDateCalendarView = format(
        getStart(this.viewDate),
        "yyyy-MM-dd"
      );
      let from = moment(getStart(this.viewDate), "yyyy-MM-dd")
        .startOf("day")
        .valueOf();
      let to = moment(getEnd(this.viewDate), "yyyy-MM-dd")
        .startOf("day")
        .valueOf();

      const offset = moment(startDateCalendarView).format("Z");
      const queryParams = { from, to, offset };

      if (this.type) {
        queryParams["type"] = this.type;
      }

      queryParams["skip"] = (this.currentPage - 1) * this.itemsPerPage;
      queryParams["limit"] = this.itemsPerPage;
      queryParams["list"] = this.list;
      this.appointmentService.getAllAppointments(queryParams).subscribe(
        (res) => this.handleEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }
  }

  handlePendingEventsSuccess(res) {
    this.pendingData = res;
    const slotArray = [];
    this.itemsPerPage = res.data?.length;
    res.data.map((item) => {
      const toTimeStamp = new Date(new Date(item.endTime).getTime());
      slotArray.push({
        start: new Date(item.startTime),
        end: new Date(toTimeStamp),
        pId: item?.patient?.patientId,
        id: item.appointmentId,
        name: item.patient
          ? item.patient.patientName
          : item.member
          ? item.member.memberName
          : "Not Available",
        age: item.patient
          ? item.patient.age
          : item.member
          ? item.member.age
          : null,
        profileImage: item.patient?.profileImage,
        appointmentDate: new Date(item.startTime),
        gender: item.patient
          ? item.patient.gender
          : item.member
          ? item.member.gender
          : null,
        patientUserId: item?.patient?.patientUserId,

        // "reason": item.bookingDetail.reasonForVisit,
        // "practiceMethod": item.bookingDetail.consultation
      });
    });
    this.appointmentList = slotArray;
  }

  handleEventsSuccess(res) {
    setTimeout(() => {
      this.count = parseInt(res.data.count);
      this.getAppointmentCount && this.getAppointmentCount.next(this.count);
      this.dailyandweeklyEventsPopulate(res);
    }, 500);
  }
  setStartDateAndTime(type, date) {
    if (type == "date") {
      return moment(date).locale(this.lang).format("DD MMM, YYYY");
    } else if (type == "time") {
      return moment(date).format("HH:mm");
    }
  }

  pageChangedEvent(pageNo) {
    this.currentPage = pageNo;
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      this.fetchAvailableEvents();
    } else {
      this.fetchEvents();
    }
  }

  handleError(err) {
    this.errorService.handleError(err, this.vref);
  }

  dailyandweeklyEventsPopulate(res) {
    const slotArray = [];
    this.count = parseInt(res.data.count);
    this.getAppointmentCount && this.getAppointmentCount.next(this.count);
    res.data.appointments.map((item) => {
      const toTimeStamp = new Date(
        new Date(item.bookingDetail.endTime).getTime()
      );
      slotArray.push({
        start: new Date(item.bookingDetail.startTime),
        end: new Date(toTimeStamp),
        pId: item.patient.patientId,
        id: item.bookingDetail.appointmentId,
        name: item.patient.patientName,
        age: item.patient.age,
        profileImage: item.patient.profileImage,
        appointmentDate: new Date(item.bookingDetail.startTime),
        gender: item.patient.gender,
        reason: item.bookingDetail.reasonForVisit,
        practiceMethod: item.bookingDetail.consultation,
        patientUserId: item.patient.patientUserId,
        appointmentType: item.bookingDetail.appointmentType,
        isGuest:item.patient.guest
      });
    });
    this.appointmentList = slotArray;
  }

  checkboxEvent(event: any, i: any) {
    if (event.target.checked) {
      this.appointmentsToCancel.push(i);
      this.appointmentService.setAppointmentData(this.appointmentsToCancel);
    } else {
      this.appointmentsToCancel.splice(this.appointmentsToCancel.indexOf(i), 1);
      this.appointmentService.setAppointmentData(this.appointmentsToCancel);
    }
  }

  openMedicalHistory(bookingId, patientId) {
    if(this.userData && this.userData.subAccount == false ){
      this.matDialog
      .open(MedicalHistoryModalComponent, {
        data: { patientUserId: patientId, bookingId: bookingId },
      })
      .afterClosed()
      .subscribe((res) => {});
    }
    
  }

  cancelAppointment() {
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      height: "auto",
      width: "600px",
      data: {
        message: "CONFIRM_CANCEL",
        cancelLabel: "NO_KEEP_APPOINTMENT",
        confirmLabel: "CONFIRM_CANCELLATION",
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let body = {
          appointmentIds: this.appointmentsToCancel,
        };
        if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
          this.appointmentService.managerCancelAppointment(body,this.userData.selectedDoctorData).subscribe(
            (response) => {
              this.toaster.showSuccess(
                this.vref,
                "Success",
                "APPOINTMENT_CANCELLED_SUCCESS"
              );
              this.appointmentsToCancel = [];
              this.appointmentService.setAppointmentData(
              this.appointmentsToCancel
              );
              this.fetchEvents();
            },
            (err) => {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                err?.error?.message
              );
            }
          );
        } else {
          this.appointmentService.cancelAppointment(body).subscribe(
            (response) => {
              this.toaster.showSuccess(
                this.vref,
                "Success",
                "APPOINTMENT_CANCELLED_SUCCESS"
              );
              this.appointmentsToCancel = [];
              this.appointmentService.setAppointmentData(
              this.appointmentsToCancel
              );
              this.fetchEvents();
            },
            (err) => {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                err?.error?.message
              );
            }
          );
        }
      }
    });
  }

  getPracticeMethod(practiceMethod) {
    if (!practiceMethod) {
      return;
    }

    const method = practiceMethod.split("/");
    if (method.length == 2) {
      return `${this.translateService.instant(
        method[0].toUpperCase()
      )}/${this.translateService.instant(method[1].toUpperCase())}`;
    }
    return this.translateService.instant(practiceMethod.toUpperCase());
  }

  getAppointmentType(appointmenttype){
    return appointmenttype == 1 ? "VIRTUAL" : "INOFFICE"

  }

  ngOnDestroy() {
    this.delete && this.delete.unsubscribe();
  }
}
