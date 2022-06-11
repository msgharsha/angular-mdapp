/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  ElementRef,
  ViewContainerRef,
  ViewEncapsulation,
  Directive,
  Input,
} from "@angular/core";
import {
  startOfDay,
  endOfDay,
  endOfMonth,
  format,
  isPast,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  isToday,
} from "date-fns";
import { Subject } from "rxjs";
import * as moment from "moment";
import {
  CalendarEvent,
  CalendarView,
  CalendarDayViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarMonthViewBeforeRenderEvent,
} from "angular-calendar";
import { ErrorService } from "../../../../utils/service/error.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { CalendarService } from "../../calendar.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../../../../utils/service/localStorage.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogModalComponent } from "../../../../utils/component/cancel-modal/cancel-modal.component";
import { ToasterService } from "../../../../utils/service/toaster.service";
@Component({
  selector: "app-calendar-availability",
  templateUrl: "./calendar-availability.component.html",
  styleUrls: ["./calendar-availability.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CalendarAvailabilityComponent implements OnInit {
  @ViewChild("fullscreen", { read: ElementRef, static: true })
  printRef: ElementRef;
  refresh: Subject<any> = new Subject();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  isPracticeAdmin: boolean;
  isProvider: boolean;
  events: CalendarEvent[] = [];
  public locationList = [];
  public providerList = [];
  expertId: number;
  officeId: number;
  filterForm: FormGroup;
  userData: any;

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach((day) => {
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
    private vref: ViewContainerRef,
    private errorService: ErrorService,
    private calendarService: CalendarService,
    private router: Router,
    public localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private toaster: ToasterService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    if (this.isPracticeAdmin) {
      this.getRelevantFilterData();
      this.createFilterForm();
    }
    this.setUserData();
    this.fetchEvents();
  }

  setUserData() {
    this.userData = this.localStorageService.getItem("userData");
  }

  createFilterForm() {
    this.filterForm = this.formBuilder.group({
      location: [null],
      provider: [null],
    });
  }

  getRelevantFilterData() {
    // const locationObservable = this.practiceService.getPracticeLocation({});
    // const providerObservable = this.practiceService.getProviderListing({});
    // const observableData = [locationObservable, providerObservable];
    // forkJoin(observableData).subscribe(data => {
    // this.locationList = data[0].data;
    // this.providerList = data[1].data;
    // });
  }

  fetchEvents(): void {
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

    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      const doctorId = this.userData.selectedDoctorData.parent_id;
      const userId = this.userData.selectedDoctorData.user_id;
      const queryParams = { to, from, offset, doctorId, userId };
      this.calendarService.getManagerAvailabilityByDates(queryParams).subscribe(
        (res) => this.handleEventsSuccess(res),
        (err) => this.handleError(err)
      );
    } else {
      const doctorId = this.userData["doctorId"];
      const queryParams = { to, from, offset, doctorId };
      this.calendarService.getAvailabilityByDates(queryParams).subscribe(
        (res) => this.handleEventsSuccess(res),
        (err) => this.handleError(err)
      );
    }
  }

  handleEventsSuccess(res) {
    res.data.availability.forEach(available => {
      available.slots.sort((x, y) => x.fromTimeStamp - y.fromTimeStamp);
    });
    if (this.view === "month") {
      this.monthlyEventsPopulate(res);
    } else {
      this.dailyandweeklyEventsPopulate(res);
    }
    this.refresh.next();
  }

  monthlyEventsPopulate(res) {
    this.events = res.data.availability.map((item) => {
      const title = "CactusMd Calendar";
      const start = new Date(moment(item.date).format("MM/DD/YYYY"));
      return {
        start,
        title,
        meta: { ...item },
      };
    });
  }

  dailyandweeklyEventsPopulate(res) {
    const slotArray = [];
    res.data.availability.map((item) => {
      item.slots.map((slot) => {
        const from = moment(slot.fromTimeStamp).format("hh:mm a");
        const to = moment(slot.toTimeStamp).format("hh:mm a");
        const title = `${from} to ${to}`;

        slotArray.push({
          start: new Date(slot.fromTimeStamp),
          end: new Date(slot.toTimeStamp),
          meta: { ...item },
          title,
          timeId: slot.id,
          cssClass: "availability-event",
        });
      });
    });
    this.events = slotArray;
  }
  handleError(err) {
    this.errorService.handleError(err, this.vref);
  }
  
  hourSegmentClicked( events,date ){
    const selectedTimeStamp = moment(date.date).startOf("day").valueOf();
    this.router.navigate([`feature/calendar/availability/add`], {
      queryParams: {
        date: selectedTimeStamp,
        calView: events
      },
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (events.length === 0 && !this.dateIsPast(date)) {
      const selectedTimeStamp = moment(date).startOf("day").valueOf();
      this.router.navigateByUrl(
        `/feature/calendar/availability/add?date=${selectedTimeStamp}`
      );
      this.viewDate = date;
    }
  }
  setView(event) {
    const selectedView = event.target.value;
    if (selectedView === "MONTH") {
      this.view = CalendarView.Month;
      this.fetchEvents();
    }
    if (selectedView === "WEEK") {
      this.setMontlyDailyProviderDefault();
      this.view = CalendarView.Week;
      this.fetchEvents();
    }
    if (selectedView === "DAY") {
      this.setMontlyDailyProviderDefault();
      this.view = CalendarView.Day;
      this.fetchEvents();
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

  closeOpenMonthViewDay() {
    this.fetchEvents();
  }

  eventsFilterHandler(event, type) {
    if (type === "PROVIDER") {
      this.expertId = parseInt(event.target.value, 10);
    } else {
      this.officeId = parseInt(event.target.value, 10);
    }
    this.fetchEvents();
  }

  dateIsPast(date) {
    return !isToday(date) && isPast(date);
  }

  eventClicked(calString,event) {
    if (!this.dateIsPast(event.start)) {
      const availabilityId = event.meta.id;
      const timeId = event.timeId;
      this.router.navigate([`feature/calendar/availability/edit/${availabilityId}`], {
        queryParams: {
          timeId: timeId,
          calView: calString
        },
      });
    }
  }

  confirmDeleteAllSlot(){
    const dialogRef = this.dialog.open(DialogModalComponent, {
      height: "270px",
      width: "650px",
      data: {
        message: `ARE_YOU_SURE_TO_DELETE_All_FEATURE_AVAILABILITY`,
        buttonText: {
          ok: "Yes",
          cancel: "No",
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteAvailabilitySlots();
      }
    });
  }

  deleteAvailabilitySlots(){
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
    let type = 'availability';
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
          "ALL_AVAILABILITIES_DELETED_SUCCESS"
        );
        this.fetchEvents();
      },
      (err) => {
        console.log(err)
      }
    );
  } 
  
}
