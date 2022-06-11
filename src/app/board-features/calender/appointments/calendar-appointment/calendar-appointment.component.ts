/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import {
  CalendarView,
  CalendarEvent,
  CalendarDayViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarEventTimesChangedEvent,
} from "angular-calendar";
import * as moment from "moment";
import {
  startOfMonth,
  startOfWeek,
  startOfDay,
  endOfMonth,
  endOfWeek,
  endOfDay,
  format,
  isToday,
  isPast,
} from "date-fns";
import { forkJoin, Subject, Subscription } from "rxjs";
import { FormBuilder, FormGroup, FormArray, FormControl } from "@angular/forms";
import { ErrorService } from "../../../../utils/service/error.service";
import { EventService } from "../../../../utils/service/eventservice";
import { AppointmentService } from "../appointments.service";
import { ElementRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ToasterService } from "../../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../../utils/service/localStorage.service";
import { CalendarService } from "../../calendar.service";
import { DialogModalComponent } from "../../../..//utils/component/cancel-modal/cancel-modal.component";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-calendar-appointment",
  templateUrl: "./calendar-appointment.component.html",
  styleUrls: ["./calendar-appointment.component.scss"],
})
export class CalendarAppointmentComponent implements OnInit {
  refresh: Subject<any> = new Subject();
  @ViewChild("fullscreen", { read: ElementRef, static: true })
  printRef: ElementRef;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  isPracticeAdmin: Boolean;
  isProvider: Boolean;
  public locationList = [];
  public providerList = [];
  events: CalendarEvent[] = [];
  filterForm: FormGroup;
  expertId: any;
  officeId: Number;
  public selectedView;
  public isLocationOpen = false;
  public isProviderOpen = false;
  public selectedLocation: any;
  public selectedProvider: any;
  public locNext;
  public provNext;
  public locPage = 1;
  public provPage = 1;
  public limit = 8;
  public countArr: any;
  public isBlocked = false;
  public expertIds = "";
  public appointmentsToCancel: any = [];
  public deleteAppointments: [];
  public type: any;
  public userData = null;
  // public Type: Subscription;
  public tabIndex: any = 0;
  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach((day) => {
      const dayOfMonth = day.date.getDate();
      if (this.dateIsPast(day.date)) {
        day.cssClass = "date-disabled";
      }
    });
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          if (this.dateIsPast(segment.date)) {
            segment.cssClass = "date-disabled";
          }
        });
      });
    });
  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          if (this.dateIsPast(segment.date)) {
            segment.cssClass = "date-disabled";
          }
        });
      });
    });
  }

  constructor(
    private formBuilder: FormBuilder,
    private vref: ViewContainerRef,
    private errorService: ErrorService,
    private eventService: EventService,
    public appointmentService: AppointmentService,
    private dialog: MatDialog,
    private calendarService: CalendarService,
    private toaster: ToasterService,
    private router: Router,
    private route: ActivatedRoute,
    public localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    if (this.isPracticeAdmin) {
      this.getRelevantFilterData();
      this.createFilterForm();
    }

    this.route.queryParams.subscribe((params) => {
      const selectedIndex = params["type"];
      if (selectedIndex == "upcoming") {
        this.tabIndex = 0;
      } else if (selectedIndex == "past") {
        this.tabIndex = 1;
      } else if (selectedIndex == "cancelled") {
        this.tabIndex = 2;
      } else if (selectedIndex == "pending") {
        this.tabIndex = 3;
      }
    });
    this.userData = this.localStorageService.getItem("userData");

    this.fetchEvents();

    this.appointmentService.deleteAppointmentData.subscribe((data) => {
      this.deleteAppointments = data;
    });
  }

  onDelete() {
    this.appointmentService.deleteSubscription.next(true);
  }

  //get the provider list
  getRelevantFilterData() {
    // const locationObservable = this.practiceService.getPracticeLocation({limit:this.limit, page:1});
    // const providerObservable = this.practiceService.getProviderListing({limit:this.limit, page:1});
    // const observableData = [locationObservable, providerObservable];
    // forkJoin(observableData).subscribe(data => {
    //   this.locationList = data[0].data;
    //   this.providerList = data[1].data;
    //   this.filterForm.controls['selectedProviderControl'].setValue([this.providerList[0]]);
    //   this.locNext = data[0].pagination? data[0].pagination.next: null;
    //   this.provNext = data[1].pagination? data[1].pagination.next: null;
    // });
  }

  createFilterForm() {
    this.filterForm = this.formBuilder.group({
      provider: [null],
      selectedProviderControl: [null],
    });
  }

  fetchEvents(): void {
    if (!this.appointmentService.getAppointmentToggleView()) {
      let obj={};
      obj['status'] = true;
      obj['date'] = this.viewDate;
      this.eventService.setCalenderAvailabilityView(obj);
      return;
    }
    let obj={};
    obj['status'] = false;
    this.eventService.setCalenderAvailabilityView(obj);
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
    const startDateCalendarView = format(getStart(this.viewDate), "yyyy-MM-dd");
    const from = moment(getStart(this.viewDate), "yyyy-MM-dd")
      .startOf("day")
      .valueOf();
    const to = moment(getEnd(this.viewDate), "yyyy-MM-dd")
      .startOf("day")
      .valueOf();
    const offset = moment(startDateCalendarView).format("Z");
    const queryParams = { from, to, offset };
    queryParams["list"] = true;
    // if (this.expertId && this.roleService.isPracticeAdmin) {
    //   queryParams['expertIds'] = `${this.expertId}`;
    // }
    if(this.userData.subAccount){
      this.appointmentService.getAllAppointmentsByManager(queryParams,this.userData.selectedDoctorData).subscribe(
        (res) => this.handleEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }else{
      this.appointmentService.getAllAppointments(queryParams).subscribe(
        (res) => this.handleEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }

   
  }

  handleEventsSuccess(res) {
    res.data.appointments.sort((x, y) => x.bookingDetail.startTime - y.bookingDetail.startTime);
    if (this.view === "month") {
      this.monthlyEventsPopulate(res);
    } else {
      this.dailyandweeklyEventsPopulate(res);
    }
    this.refresh.next();
  }

  monthlyEventsPopulate(res) {
    this.events = res.data.appointments.map((item) => {
      const toTimeStamp = new Date(
        new Date(item.bookingDetail.endTime).getTime()
      );
      const from = moment(item.bookingDetail.startTime).format("hh:mm a");
      const to = moment(toTimeStamp).format("hh:mm a");
      const title = "CactusMd Calendar";
      const start = new Date(
        moment(item.bookingDetail.startTime).format("MM/DD/YYYY")
      );
      return {
        from,
        to,
        start,
        title,
        meta: { ...item },
      };
    });
  }

  dailyandweeklyEventsPopulate(res) {
    const slotArray = [];
    res.data.appointments.map((item) => {
      const toTimeStamp = new Date(
        new Date(item.bookingDetail.endTime).getTime()
      );
      const from = moment(item.bookingDetail.startTime).format("hh:mm a");
      const to = moment(toTimeStamp).format("hh:mm a");
      const title = `${from} to ${to} | ${item.doctor.firstName} ${item.doctor.lastName}`;
      let eventColor = "";
      if (item.status === "confirmed") {
        eventColor = "scheduled-event";
      } else if (item.status === "cancelled") {
        eventColor = "cancelled-event";
      } else if (item.status === "arrived") {
        eventColor = "arrived-event";
      } else if (item.status === "completed") {
        eventColor = "completed-event";
      } else if (item.status === "no show") {
        eventColor = "no-show-event";
      }
      slotArray.push({
        start: new Date(item.bookingDetail.startTime),
        end: new Date(toTimeStamp),
        meta: { ...item },
        title,
        cssClass: eventColor,
      });
    });
    this.events = slotArray;
  }

  handleError(err) {
    this.errorService.handleError(err, this.vref);
  }

  // eventsFilterHandler(event, type) {
  //   if (type === 'PROVIDER') {
  //     this.expertId = parseInt(event.target.value, 10);
  //   } else {
  //     this.officeId = parseInt(event.target.value, 10);
  //   }
  //   this.fetchEvents();
  // }

  closeOpenMonthViewDay() {
    this.fetchEvents();
  }

  setView(event) {
    this.selectedView = event.target.value;
    if (this.selectedView === "MONTH") {
      if (!this.appointmentService.getAppointmentToggleView()) {
        this.view = CalendarView.Month;
        this.fetchEvents();
      } else {
        this.view = CalendarView.Month;
        this.fetchEvents();
      }
    }
    if (this.selectedView === "WEEK") {
      this.setMontlyDailyProviderDefault();
      this.view = CalendarView.Week;
      this.expertId = null;
      this.fetchEvents();
    }
    if (this.selectedView === "DAY") {
      if (!this.appointmentService.getAppointmentToggleView()) {
        this.view = CalendarView.Day;
        this.fetchEvents();
      } else {
        this.setMontlyDailyProviderDefault();
        this.view = CalendarView.Day;
        this.fetchEvents();
      }
    }
  }

  setMontlyDailyProviderDefault() {
    if (!this.expertId && this.isPracticeAdmin) {
      this.filterForm.patchValue({
        provider: this.providerList[0].provider_id,
      });
      this.expertId = this.providerList[0].provider_id;
    }
  }

  dateIsPast(date) {
    return !isToday(date) && isPast(date);
  }

  onScroll(e, type) {
    // if(this.locNext && type=='Location'){
    //   this.locPage = this.locPage + 1;
    //   const locationObservable = this.practiceService.getPracticeLocation({limit:this.limit, page:this.locPage});
    //   locationObservable.subscribe(res=>{
    //     this.locationList = [...this.locationList , ...res.data]
    //     this.locNext = res?.pagination?.next? res?.pagination?.next: null;
    //   })
    // } else if(this.provNext && type=='Provider'){
    //   this.provPage = this.provPage + 1;
    //   const providerObservable = this.practiceService.getProviderListing({limit:this.limit, page:this.provPage});
    //   providerObservable.subscribe(res=>{
    //     this.providerList = [...this.providerList , ...res.data]
    //     this.provNext = res?.pagination?.next? res?.pagination?.next: null;
    //   })
    // }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.events = [...this.events];
  }

  userChanged({ event, newUser }) {
    event.color = newUser.color;
    event.meta.user = newUser;
    this.events = [...this.events];
  }

  changed(type, eventObj) {
    if (type == "Location") {
      this.officeId = eventObj.value?.location_id;
    } else {
      this.filterForm.controls["provider"].setValue(eventObj?.value);
      this.expertId = eventObj.value?.provider_id;
    }
    this.fetchEvents();
  }

  changedArray() {
    let expertIds = "";
    this.filterForm.controls["selectedProviderControl"].value?.forEach(
      (ele, i) => {
        if (
          i <
          this.filterForm.controls["selectedProviderControl"].value.length - 1
        ) {
          expertIds = expertIds + `${ele.provider_id},`;
        } else {
          expertIds = expertIds + `${ele.provider_id}`;
        }
      }
    );
    this.expertId = expertIds;
    this.fetchEvents();
  }

  providerImage(img) {
    return img ? img : "../../assets/images/profile-default.svg";
  }

  tabClick(e) {
    if (e.index == 0) {
      this.type = "upcoming";
    } else if (e.index == 1) {
      this.type = "past";
    } else if (e.index == 2) {
      this.type = "cancelled";
    } else if (e.index == 3) {
      this.type = "pending";
    }

    this.router.navigateByUrl(
      `/feature/calendar/appointment?appointment=true&type=${this.type}`
    );

    this.appointmentService.deleteAppointmentData.next([]);
  }

  confirmDeleteAllSlot(){
    const dialogRef = this.dialog.open(DialogModalComponent, {
      height: "250px",
      width: "550px",
      data: {
        message: `ARE_YOU_SURE_TO_DELETE_All_FEATURE_APPOINTMENTS`,
        buttonText: {
          ok: "Yes",
          cancel: "No",
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteAppointmentSlots();
      }
    });
  }

  deleteAppointmentSlots(){
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
    const startDateCalendarView = format(getStart(this.viewDate), "yyyy-MM-dd");
    const from = moment(getStart(this.viewDate), "yyyy-MM-dd")
      .startOf("day")
      .valueOf();
    const to = moment(getEnd(this.viewDate), "yyyy-MM-dd")
      .startOf("day")
      .valueOf();
    const offset = moment(startDateCalendarView).format("Z");
    let doctorId;
    let userId;
    let type = 'appointment';
    let selectedDocData;
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      doctorId = this.userData.selectedDoctorData.parent_id;
      userId = this.userData.selectedDoctorData.user_id;
      selectedDocData = {
        parent_id: doctorId,
        user_id: userId
      }
    } else {
      doctorId = this.userData["doctorId"];
      userId = this.userData["userId"];
      selectedDocData = {
        parent_id: doctorId,
        user_id: userId
      }
    }

    const queryParams = { to, from, offset, doctorId, userId, type};
    this.calendarService.DeleteAllSlots(queryParams,selectedDocData).subscribe(
      (res) => {
        this.toaster.showSuccess(
          this.vref,
          "Success",
          "All_APPOINTMENTS_DELETED_SUCCESS"
        );
        this.fetchEvents();
      },
      (err) => {
        console.log(err)
      }
    );
  }

  // ngOnDestroy(){
  //   this.appointmentService.routeType.unsubscribe();
  // }
}
