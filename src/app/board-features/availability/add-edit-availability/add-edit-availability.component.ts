/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

 import { Component, ViewContainerRef, OnInit } from "@angular/core";
 import { FormBuilder, FormGroup, Validators } from "@angular/forms";
 import { ActivatedRoute, Router } from "@angular/router";
 import { concat, bind, invoke, get } from "lodash";
 import { MatDialog } from "@angular/material/dialog";
 import * as moment from "moment";
 import * as _ from "lodash";
 import { defaultTo } from "lodash";
 import { formConfig } from "./form-config";
 import { TranslaterService } from "../../../../utils/service/translater.service";
 import { ToasterService } from "../../../../utils/service/toaster.service";
 import { CalendarService } from "../../calendar.service";
 import { LocalStorageService } from "../../../../utils/service/localStorage.service";
 import { ErrorService } from "../../../../utils/service/error.service";
 import { DialogModalComponent } from "../../../../utils/component/cancel-modal/cancel-modal.component";
 import { TimezoneModalComponent } from "../../../../utils/component/timezone-modal/timezone-modal.component";
 import { HttpClient } from '@angular/common/http';
 
 @Component({
   selector: "app-add-edit-availability",
   templateUrl: "./add-edit-availability.component.html",
   styleUrls: ["./add-edit-availability.component.scss"],
 })
 export class AddEditAvailabilityComponent implements OnInit {
   availForm: FormGroup;
   startDateCalendar;
   availabilityType = formConfig.masterAvailabilityTypes[0].id;
   locationList = [];
   providerList = [];
   calendarObject;
   public durationArr = [
     { name: "TODAY", value: 0 },
     { name: "WEEKLY", value: 1 },
     { name: "MONTHLY", value: 2 },
   ];
   public timeSlots = formConfig.timeSlots;
   public startTimeSlots = this.generateTimeSlots("00:00", "24:00", 15);
   public endTimeSlots = [];
   public availableDays = new Set();
   public masterAvailableDays = formConfig.masterAvailableDays;
   public masterAvailabilityTypes = formConfig.masterAvailabilityTypes;
   public editMode = false;
   public availabilityId: number;
   public timeId: number;
   public calView:any;
   public enabledStatus = { enableEndTime: false };
   public selectAllToggleText = "Select All";
   public formLabel = "Add New";
   public isPracticeAdmin: boolean;
   public formSubmitted = false;
   public userData: any;
   public availabilityData: any;
   zoneDisplayValue: string;
   personalData: any;
   inOfficeOffset: any;
   myCurrenttimezone: any;
   clinic_zone: any;
   timeZoneName: any;
   currentZoneName: string;
 
   constructor(
     private route: ActivatedRoute,
     private http: HttpClient,
     private router: Router,
     private formBuilder: FormBuilder,
     private toaster: ToasterService,
     private vref: ViewContainerRef,
     private calendarService: CalendarService,
     private localStorageService: LocalStorageService,
     private errorService: ErrorService,
     private dialog: MatDialog,
     private translater: TranslaterService
   ) {
     this.startDateCalendar = parseInt(
       this.route.snapshot.queryParamMap.get("date"),
       10
     );
     this.startDateCalendar = moment(this.startDateCalendar).toISOString();
     this.timeId = parseInt(this.route.snapshot.queryParamMap.get("timeId"), 10);
     this.availabilityId = parseInt(this.route.snapshot.params.id, 10);
     this.calView = this.route.snapshot.queryParamMap.get("calView")
   }
 
   ngOnInit(): void {
     this.translater.TranslationAsPerSelection();
     this.setUserData();
     this.createForm();
     if (this.startDateCalendar) {
       this.availForm.patchValue({ startDate: this.startDateCalendar });
     }
     this.getRelevantFormData();
     this.durationChangeHandler();
     this.listenValueChanges();
     if(this.calView == 'day'){
       this.availForm.patchValue({ duration: 0 });
     }else if(this.calView == 'week'){
       this.availForm.patchValue({ duration: 1 });
     }else{
       this.availForm.patchValue({ duration: 2 });
     }
     this.getPersonalDetails();
   }
 
   setUserData() {
     this.userData = this.localStorageService.getItem("userData");
   }
 
   offSetToHours(offSet){
     let dateObj = new Date(offSet * 1000);
     let  hours = dateObj.getUTCHours();
     let  minutes = dateObj.getUTCMinutes();
     return hours.toString().padStart(2, '0')+ ':' + minutes.toString().padStart(2, '0');
   }
 
   getPersonalDetails() {
     if (this.userData["doctorId"]) {
       this.calendarService
         .getPersonalDetails(this.userData["doctorId"])
         .subscribe(
           (res) => {
            this.personalData = res.data;
              this.inOfficeService();
           },
           (err) => this.errorService.handleError(err, this.vref)
         );
     }
   }
 
   inOfficeService(){
     let startTimeStamp = moment(this.availForm.get("startDate").value)
         .startOf("day")
         .valueOf();
         startTimeStamp = startTimeStamp + (14*60*60*1000);
    if(!startTimeStamp){
      this.getPersonalDetails();
    } else {
      this.http.get<any>(`https://maps.googleapis.com/maps/api/timezone/json?location=${this.personalData.lat}%2C${this.personalData.lng}&timestamp=${Math.floor(startTimeStamp/1000)}&key=AIzaSyDAgGaY1OLGVMrT-afESjcdGPeZfwOE8s4`).subscribe(
        (res) => {
              let offSet = res.rawOffset+res.dstOffset;
              this.timeZoneName = res.timeZoneName
              let label = ''
              if(offSet < 0){
                offSet = offSet * -1;
                this.inOfficeOffset = '-'+this.offSetToHours(offSet)
                label = '(GMT'+this.inOfficeOffset+')'
              } else {
                this.inOfficeOffset = this.offSetToHours(offSet)
                label = '(GMT+'+this.inOfficeOffset+')'
              }
                this.zoneDisplayValue = label+' '+this.timeZoneName+' - '+res.timeZoneId;
                this.clinic_zone = this.inOfficeOffset;
                this.myCurrenttimezone = moment(this.availForm.get("startDate").value).format("Z");
                this.currentZoneName = String(String(new Date()).split("(")[1]).split(")")[0];
            },
        (err) => this.errorService.handleError(err, this.vref)
        )
    }
     
   }
 
   getRelevantFormData() {
     if (this.availabilityId && this.timeId) {
       if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
         this.calendarService.getManagerAvailabilityById(this.timeId,this.userData.selectedDoctorData ).subscribe((res) => {
           this.availabilityData = { ...res.data };
           this.prefillForm(this.availabilityData);
         });
       } else {
         this.calendarService.getAvailabilityById(this.timeId).subscribe((res) => {
           this.availabilityData = { ...res.data };
           this.prefillForm(this.availabilityData);
         });
       }
       
     }
   }
 
   createForm() {
     this.availForm = this.formBuilder.group(
       {
         duration: [null, Validators.required],
         startDate: [null, Validators.required],
         endDate: [null, Validators.required],
         startTime: [null, Validators.required],
         timeSlot: [null, Validators.required],
         endTime: [null, Validators.required],
         appointmentType: ['1'],
         weekendStatus: ["false"]
       },
       { validator: this.checkDateRange() }
     );
 
     this.availForm.get("endTime").disable();
   }
 
   /**
    * Function to check for start and end date
    */
   checkDateRange() {
     return (input: any) => {
       return _.get(this.availForm, "controls.endDate.disabled") ||
         moment(
           _.get(this.availForm, "controls.startDate.value")
         ).isSameOrBefore(
           moment(_.get(this.availForm, "controls.endDate.value"))
         )
         ? null
         : {
             dateRange: {
               valid: false,
             },
           };
     };
   }
 
   // easy access to form fields
   get f() {
     return this.availForm.controls;
   }
 
   displayDiffZonePopup(){
     const dialogRef = this.dialog.open(TimezoneModalComponent, {
       height: "300px",
       width: "550px",
       data: {
         message1: `DIFFERENT_TIME_ZONE_MSG_1`,
         message2: `DIFFERENT_TIME_ZONE_MSG_2`,
         message3: `DIFFERENT_TIME_ZONE_MSG_3`,
         message4: `DIFFERENT_TIME_ZONE_MSG_4`,
         buttonText: {
           ok: "Yes",
           cancel: "No",
         },
         data: {
          clinicZone : this.timeZoneName,
          currentTimeZone : this.currentZoneName
         }
       },
     });
     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
       if (confirmed) {
         this.createAvailability();
       } else {
         return
       }
     });
   }
 
   onSubmit() {
     // form is invalid
     this.formSubmitted = true;
     if (this.availForm.invalid) {
       return;
     }
 
     if(this.clinic_zone != this.myCurrenttimezone){
       this.displayDiffZonePopup()
     } else {
       this.createAvailability()
     }
   }
 
   createAvailability(){
     const bodyObj = this.createBodyObject();
     bodyObj['timeZoneName'] = this.currentZoneName ? this.currentZoneName : String(String(new Date()).split("(")[1]).split(")")[0];
     console.log(bodyObj);
     if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
       bodyObj.doctorId = this.userData.selectedDoctorData.parent_id;
       bodyObj.userId = this.userData.selectedDoctorData.user_id;
       this.calendarService.managerAddAvailability(bodyObj).subscribe(
         (res) => this.handleSaveSuccess(res),
         (err) => this.handleSaveError(err)
       );
     } else {
       this.calendarService.addAvailability(bodyObj).subscribe(
         (res) => this.handleSaveSuccess(res),
         (err) => this.handleSaveError(err)
       );
     }
   }
 
   createBodyObject() {
     let timeObj = this.getStartEndTime(
       moment(this.availForm.get("startDate").value).startOf("day").valueOf(),
       this.availForm.get("startTime").value,
       this.availForm.get("endTime").value
     );
 
     const bodyObj = {
       id: this.editMode ? this.availabilityId : null,
       userId: this.userData["userId"],
       startDate: moment(this.availForm.get("startDate").value)
         .startOf("day")
         .valueOf(),
       endDate: moment(this.availForm.get("endDate").value)
         .startOf("day")
         .valueOf(),
       offSet: moment(this.availForm.get("startDate").value).format("Z"),
       availability: {
         id: this.editMode ? this.timeId : null,
         startTime: timeObj.start,
         endTime: timeObj.end,
       },
       appointmentType: parseInt(this.availForm.get("appointmentType").value),
       duration: +this.availForm.get("timeSlot").value,
       weekendStatus: this.availForm.get("weekendStatus").value,
       doctorId: this.userData["doctorId"],
     };
     return bodyObj;
   }
 
   handleSaveSuccess(res: any) {
     this.onReset();
     this.toaster.showSuccess(
       this.vref,
       "SUCCESS",
       "AVAILABILITY_SAVED_SUCCESSFULLY"
     );
     this.router.navigateByUrl("/feature/calendar/availability");
   }
 
   handleSaveError(err) {
     this.errorService.handleError(err, this.vref);
   }
 
   onReset() {
     this.availForm.reset();
     this.availForm.patchValue({
       availabilityType: this.availabilityType,
       inVideoVisit: true,
       repeatEveryWeek: 0,
     });
     this.availableDays = new Set(); // reset reccurrence days as well
   }
 
   isInvalidInput(fieldName): boolean {
     return (
       this.availForm.controls[fieldName].invalid &&
       (this.availForm.controls[fieldName].dirty ||
         this.availForm.controls[fieldName].touched)
     );
   }
 
   prefillForm(data) {
     let appointmentTypeValue = data.appointmentType.toString();
     this.availForm.controls.startDate.disable();
     this.availForm.controls.endDate.disable();
     this.availForm.controls.duration.disable();
     this.availForm.patchValue({
       timeSlot: parseInt(data.duration, 10),
       startTime: moment(data.fromTimeStamp).format("hh:mm a"),
       endTime: moment(data.toTimeStamp).format("hh:mm a"),
       startDate: moment(data.date).toISOString(),
       endDate: moment(data.date).toISOString(),
     });
     this.availForm.get("appointmentType").patchValue(appointmentTypeValue);
     this.editMode = true;
     this.formLabel = "Edit";
   }
   /**
    * Function to generate time slots
    * @param startTime String  - Start time in 24hrs format
    * @param endTime String - End time in 24hrs format
    * @param diff Integer - Difference of time(minutes) in time slots
    */
   generateTimeSlots(startTime, endTime, diff) {
     let timeSlots = [];
     const start = moment(startTime, "hh:mm");
     const end = moment(endTime, "hh:mm");
     while (start.isBefore(end)) {
       timeSlots = concat(timeSlots, {
         name: start.format("hh:mm a"),
         id: start.format("hh:mm a"),
       });
       start.add(diff, "minutes");
     }
     return timeSlots;
   }
 
   hasError(type: string, key: string) {
     return this.formSubmitted && this.availForm.hasError(type, [key]);
   }
 
   /**
    * Function to listen to value changes
    */
   listenValueChanges() {
     invoke(
       this.availForm,
       "controls.timeSlot.valueChanges.subscribe",
       bind(this.timeSlotChangeHandler, this)
     );
     invoke(
       this.availForm,
       "controls.startTime.valueChanges.subscribe",
       bind(this.startTimeChangeHandler, this)
     );
     invoke(
       this.availForm,
       "controls.duration.valueChanges.subscribe",
       bind(this.durationChangeHandler, this)
     );
     invoke(
       this.availForm,
       "controls.startDate.valueChanges.subscribe",
       bind(this.startDateChangeHandler, this)
     );
   }
 
   /**
    * Function to handle timeSlot change
    */
   timeSlotChangeHandler() {
     this.modifyEnabledStatus();
   }
 
   /**
    * Function to handle start time change handler
    */
   startTimeChangeHandler() {
     this.availForm.controls.endTime.setValue(null);
     this.modifyEnabledStatus();
   }
 
   /**
    * Function to handle duration changes
    */
   durationChangeHandler() {
     let selectedDuration = _.get(this.availForm, "controls.duration.value");
     if (selectedDuration === 0) {
       let currentDate = this.startDateCalendar;
       this.availForm.controls.startDate.setValue(currentDate);
       this.availForm.controls.endDate.setValue(currentDate);
       this.availForm.controls.endDate.disable();
       this.availForm.controls.startDate.disable();
       this.setAvailabilityDates();
     } else if (selectedDuration === 1) {
       this.availForm.controls.endDate.disable();
       this.availForm.controls.startDate.enable();
       let startDate = _.get(this.availForm, "controls.startDate.value");
       if (!startDate) {
         let Date = moment().toISOString();
         this.availForm.controls.startDate.setValue(Date);
       }
       let weekEndDate = moment(startDate).add(6, "days").toISOString();
       this.availForm.controls.endDate.setValue(weekEndDate);
       this.setAvailabilityDates();
     } else if (selectedDuration === 2) {
       this.availForm.controls.endDate.disable();
       this.availForm.controls.startDate.enable();
       let startDate = _.get(this.availForm, "controls.startDate.value");
       if (!startDate) {
         let Date = moment().toISOString();
         this.availForm.controls.startDate.setValue(Date);
       }
       let weekEndDate = moment(startDate).add(30, "days").toISOString();
       this.availForm.controls.endDate.setValue(weekEndDate);
       this.setAvailabilityDates();
     }
   }
   setAvailabilityDates(){
    let fromDate = this.availForm.controls.startDate.value;
    let from = new Date(fromDate).getTime();
    let toDate = this.availForm.controls.endDate.value;
    let to = new Date(toDate).getTime();
    let offset = moment().format("Z")
    this.checkAvailability(to, from, offset);
   }

   offsetDiff:boolean
   availabilityTimezone:any;
  checkAvailability(to, from, offset){
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      const doctorId = this.userData.selectedDoctorData.parent_id;
      const userId = this.userData.selectedDoctorData.user_id;
      const queryParams = { to, from, offset, doctorId, userId };
      this.calendarService.getManagerAvailabilityByDates(queryParams).subscribe(
        (res) =>{
          this.checkOffSetDiff(res)
        },
        (err) => this.errorService.handleError(err, this.vref)
      );
    } else {
      const doctorId = this.userData["doctorId"];
      const queryParams = { to, from, offset, doctorId };
      this.calendarService.getAvailabilityByDates(queryParams).subscribe(
        (res) => {
          this.checkOffSetDiff(res)
        },
        (err) => this.errorService.handleError(err, this.vref)
      );
    }
  }

  checkOffSetDiff(res){
    console.log(res.data);
    if(res.data.availability.length > 0){
      res.data.availability.forEach(element => {
        if(res.data.availability[0].slots[0].offset == element.slots[0].offset){
          this.availabilityTimezone = res.data.availability[0].slots[0].offset;
          this.offsetDiff = false;
        } else {
          this.offsetDiff = true;
        }
       });
    } else {
      this.availabilityTimezone = '';
      this.offsetDiff = false;
    }

    if(!this.offsetDiff){
      this.myCurrenttimezone = moment(this.availForm.get("startDate").value).format("Z");
      if(this.availabilityTimezone && this.availabilityTimezone != this.myCurrenttimezone){
        this.offsetDiff = true;
        return;
       } else {
        this.offsetDiff = false;
       }
    }
  }
 
   checkIfDayExist(dayId) {
     if (this.availableDays && this.availableDays.has(dayId)) {
       return true;
     } else {
       return false;
     }
   }
 
   toggleActiveDaysStatus(dayId) {
     if (this.checkIfDayExist(dayId)) {
       this.availableDays.delete(dayId);
       this.selectAllToggleText = "Select All";
     } else {
       this.availableDays.add(dayId);
     }
   }
 
   selectAllDays() {
     if (this.availableDays.size === this.masterAvailableDays.length) {
       this.selectAllToggleText = "Select All";
       this.masterAvailableDays.forEach((item) =>
         this.availableDays.delete(item.id)
       );
     } else {
       this.selectAllToggleText = "Unselect All";
       this.masterAvailableDays.forEach((item) =>
         this.availableDays.add(item.id)
       );
     }
   }
 
   /**
    * Function to modify enabled status
    */
   modifyEnabledStatus() {
     if (
       get(this.availForm, "controls.startTime.value") &&
       get(this.availForm, "controls.timeSlot.value")
     ) {
       this.enabledStatus.enableEndTime = true;
       this.endTimeSlots = this.generateEndTimeSlots();
       if (!this.editMode) {
         this.availForm.get("endTime").setValue(null);
         this.availForm.get("endTime").enable();
       }
     } else {
       this.enabledStatus.enableEndTime = false;
       this.endTimeSlots = [];
       if (!this.editMode) {
         this.availForm.get("endTime").setValue(null);
         this.availForm.get("endTime").disable();
       }
     }
   }
 
   /**
    * Function to generate end time slots
    */
   generateEndTimeSlots() {
     let timeSlots = [];
     const startTime = moment(
       get(this.availForm, "controls.startTime.value"),
       "hh:mm a"
     ).add(
       defaultTo(get(this.availForm, "controls.timeSlot.value", 15), 15),
       "minutes"
     );
     const endTime = moment("24:00", "hh:mm a");
 
     while (startTime.isSameOrBefore(endTime)) {
       timeSlots = concat(timeSlots, {
         name: startTime.format("hh:mm a"),
         id: startTime.format("hh:mm a"),
       });
       startTime.add(
         defaultTo(get(this.availForm, "controls.timeSlot.value", 15), 15),
         "minutes"
       );
     }
     return timeSlots;
   }
 
   /**
    * Function to listen for start date change
    */
   startDateChangeHandler() {
     let startDate = this.availForm.controls.startDate.value;
     let selectedDuration = _.get(this.availForm, "controls.duration.value");
     if (!startDate) {
       startDate = moment().format("DD-MM-YYYY");
       this.availForm.controls.startDate.setValue(startDate);
     } else {
       if (selectedDuration == 1) {
         let weekEndDate = moment(startDate).add(6, "days").toISOString();
         this.availForm.controls.endDate.setValue(weekEndDate);
         this.setAvailabilityDates();
       }
       if (selectedDuration == 2) {
         let weekEndDate = moment(startDate).add(30, "days").toISOString();
         this.availForm.controls.endDate.setValue(weekEndDate);
         this.setAvailabilityDates();
       }
     }
   }
 
   // blockOutHandler() {
   //   if (this.availForm.controls['blockOut'].value) {
   //     this.availForm.patchValue({ inPerson: false, inVideoVisit: false });
   //     this.availForm.controls['inVideoVisit'].disable();
   //     this.availForm.controls['inPerson'].disable();
   //   } else {
   //     this.availForm.patchValue({ inVideoVisit: true });
   //     this.availForm.controls['inVideoVisit'].enable();
   //     this.availForm.controls['inPerson'].enable();
   //   }
   // }
 
   cancelHandler() {
     this.router.navigateByUrl("/feature/calendar/availability");
   }
 
   // availVideoModeHandler(event) {
   //   if (!event.target.checked && !this.availForm.controls['inPerson'].value) {
   //     this.availForm.patchValue({  inVideoVisit: true });
   //   }
   // }
 
   // availPersonModeHandler(event) {
   //   if (!event.target.checked && !this.availForm.controls['inVideoVisit'].value) {
   //     this.availForm.patchValue({ inPerson: true });
   //   }
   // }
 
   getStartEndTime(selectedEpocTime, from, to) {
     let result: any = {};
 
     if (to == "12:00 am") {
       let nextDayEpochTime = moment(selectedEpocTime).add(1, "day").valueOf();
       result.end = this.convertEpochTime(to, nextDayEpochTime);
     } else {
       result.end = this.convertEpochTime(to, selectedEpocTime);
     }
 
     result.start = this.convertEpochTime(from, selectedEpocTime);
 
     return result;
   }
 
   convertEpochTime(time, selectedEpocTime) {
     let timeArray = time.split(":");
 
     if (timeArray[0] == 12) {
       timeArray[0] = 0;
     }
 
     let result;
 
     if (time.includes("am")) {
       result = moment(selectedEpocTime).add(parseInt(timeArray[0]), "hours");
     } else {
       result = moment(selectedEpocTime).add(
         parseInt(timeArray[0]) + 12,
         "hours"
       );
     }
 
     let timeMin = timeArray[1].split(" ");
     result = moment(result).add(parseInt(timeMin), "minutes").valueOf();
 
     return result;
   }
 
   confirmDeleteSlot() {
     const dialogRef = this.dialog.open(DialogModalComponent, {
       height: "195px",
       width: "470px",
       data: {
         message: `ARE_YOU_SURE_TO_DELETE_THIS_AVAILABILITY`,
         buttonText: {
           ok: "Yes",
           cancel: "No",
         },
       },
     });
     dialogRef.afterClosed().subscribe((confirmed: boolean) => {
       if (confirmed) {
         this.deleteAvailabilitySlot();
       }
     });
   }
 
   deleteAvailabilitySlot() {
     const timeId = this.timeId;
     if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
       this.calendarService.managerDeleteAvailability(timeId,this.userData.selectedDoctorData).subscribe(
         (res) => {
           const message = "AVAILABILITY_DELETED_SUCCESSFULLY";
           this.toaster.showSuccess(this.vref, "", message);
           this.router.navigateByUrl("/feature/calendar/availability");
         },
         (err) => this.errorService.handleError(err, this.vref)
       );
     } else {
       this.calendarService.deleteAvailability(timeId).subscribe(
         (res) => {
           const message = "AVAILABILITY_DELETED_SUCCESSFULLY";
           this.toaster.showSuccess(this.vref, "", message);
           this.router.navigateByUrl("/feature/calendar/availability");
         },
         (err) => this.errorService.handleError(err, this.vref)
       );
     }
   }
 
   // providerChangeHandler(event) {
   //   if (this.isPracticeAdmin) {
   //     this.availForm.patchValue({practiceLocation: null});
   //     this.practiceService.getPracticeLocation({ provider_id: event.target.value }).subscribe(
   //       res => this.locationList = res.data,
   //       err => this.errorService.handleError(err, this.vref)
   //     );
   //   }
   // }
 }
 