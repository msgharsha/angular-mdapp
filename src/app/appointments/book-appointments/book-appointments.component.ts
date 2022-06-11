/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import * as moment from "moment";
import { TranslaterService } from "../../utils/service/translater.service";
import { LOCAL_CONST } from "../../appointments/constants/constants";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { DoctorService } from "../../doctor/doctor.service";
import { ErrorService } from "../../utils/service/error.service";
import { AppointmentsService } from "../appointments.service";
import * as _ from "lodash";
import { ToasterService } from "../../utils/service/toaster.service";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { MatDialog } from "@angular/material/dialog";
import { BookedAppointmentDialogComponent } from "../booked-appointment-dialog/booked-appointment-dialog.component";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { AuthorizationService } from "../../authorization/authorization.service";
import { TermAndConditionComponent } from "../../utils/component/term-and-condition/term-and-condition.component";
import { environment } from "../../../environments/environment";
@Component({
  selector: "app-book-appointments",
  templateUrl: "./book-appointments.component.html",
  styleUrls: ["./book-appointments.component.scss"],
})
export class BookAppointmentsComponent implements OnInit {
  public appointmentReviewForm: FormGroup;
  public OPTION: any;
  public CONSTYPE: any;
  public radioConsType:any;
  public appointmentDetail;
  public familyDetail;
  public slotPopupOpen: boolean = false;
  public selectedSlot;
  public nextAvailableDate;
  public availableSlot;
  public formSubmitted: boolean = false;
  public isBookingConditionsHold: boolean = true;
  public notBookingMsg = null;
  public doctorSpecialities;
  public services = [];
  public timeSlotState = 0;
  public seen: boolean;
  public new: boolean;
  public minDate: any;
  public isQrcodeScanPage: boolean = false;
  dropdownSettings: IDropdownSettings = {};

  constructor(
    private builder: FormBuilder,
    private translater: TranslaterService,
    private localStorageService: LocalStorageService,
    private doctorService: DoctorService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private appointmentService: AppointmentsService,
    private toaster: ToasterService,
    private router: Router,
    private matDialog: MatDialog,
    private translate: TranslateService,
    private authorise: AuthorizationService
  ) {
    this.OPTION = LOCAL_CONST.OPTION;
    this.CONSTYPE = LOCAL_CONST.CONSTYPE;
  }

  ngOnInit() {
    this.isQrcodeScanPage = this.localStorageService.getItem("isQrcodeScanPage") == true ? this.localStorageService.getItem("isQrcodeScanPage") : false;
    this.appointmentDetail = this.localStorageService.getItem(
      "bookedAppointment"
    );
    this.appointmentDetail.services = this.appointmentDetail.doctorInfo.services.map(
      (item) => {
        item.name += `-$${item.fee}`;
        return item;
      }
    );

    if (!this.appointmentDetail) {
      this.router.navigate(["/home"]);
    } else {
      this.initForm();
      this.getFamilyMember();
      this.translater.TranslationAsPerSelection();
      this.setDropdownSettings();
    }

    this.translate.onLangChange.subscribe(() => {
      this.setDropdownSettings();
    });
  }

  setDropdownSettings() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      enableCheckAll: false,
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this.translate.instant("SEARCH"),
    };
  }

  hasError(type: string, key: string) {
    return (
      this.formSubmitted && this.appointmentReviewForm.hasError(type, [key])
    );
  }

  initForm() {
    if (_.get(this.appointmentReviewForm, "invalid")) {
      return false;
    }
    this.appointmentReviewForm = this.builder.group({
      appointmentIsFor: ["", [Validators.required]],
      consulationDate: ["", [Validators.required]],
      consulationTime: ["", [Validators.required]],
      reasonToVisit: ["", [Validators.required]],
      serviceType: ["", [Validators.required]],
      seenBefore: ["", [Validators.required]],
      consType: ["", []],
      officeNotes: ["", []],
      termsAndConditions: [
        false,
        [
          Validators.required,
          (control) => {
            if (!control.value) {
              return { required: true };
            }
            return null;
          },
        ],
      ],
    });
    this.minDate = new Date();
    this.fillForm();
    this.getDentistSlots();
    this.appointmentReviewForm
      .get("consulationDate")
      .valueChanges.subscribe((value) => {
        this.selectedSlot = null;
      });
  }

  fillForm() {
    this.selectedSlot = this.appointmentDetail.startTime;
    this.doctorSpecialities = this.appointmentDetail.doctorInfo.specialities;
    this.appointmentReviewForm
      .get("consulationDate")
      .patchValue(new Date(this.appointmentDetail.startTime * 1));
    this.appointmentReviewForm
      .get("consulationTime")
      .patchValue(this.appointmentDetail.startTime);
    this.appointmentReviewForm
      .get("reasonToVisit")
      .patchValue(this.appointmentDetail.visitReason);
    this.appointmentReviewForm
      .get("seenBefore")
      .patchValue(this.appointmentDetail.isFirstVisit);
      // this.appointmentReviewForm
      // .get("consType")
      // .patchValue(this.appointmentDetail.consType);
    this.appointmentReviewForm.get("termsAndConditions").patchValue(false);
  }

  checkCondition() {
    let patientId = this.appointmentReviewForm.value.appointmentIsFor;
    this.familyDetail.forEach((entry) => {
      if (entry.patientId == patientId) {
        this.appointmentDetail["patientInfo"] = entry;
      }
    });

    const [patient] = this.familyDetail.filter(
      (family) => !family.isFamilyMember
    );
    let selectedPatientInfo = this.getSelectedPatientInfo(
      this.familyDetail,
      patientId
    );

    // if (patient.isHealthCardExpired == true) {
    //   this.isBookingConditionsHold = false;
    //   this.notBookingMsg = "CANNOT_BOOK_APPOINTMENT_AS_HEALTH_CARD_HAS_EXPIRED";
    //   return;
    // }

    if (!patient.isEmailVerified || !patient.isPhoneVerified) {
      this.isBookingConditionsHold = false;
      this.notBookingMsg =
        "PLEASE_VERIFY_EMAIL_PHONE_NUMBER_TO_PROCEED_WITH_BOOKING";
      return;
    }
    if (!selectedPatientInfo.isMedicalHistoryAdded) {
      this.isBookingConditionsHold = false;
      this.notBookingMsg =
        "CANNOT_BOOK_APPOINTMENT_AS_YOUR_MEDICAL_HISTORY_NOT_ADDED";
      return;
    } else {
      this.isBookingConditionsHold = true;
    }
  }

  familyMemberChange(){
    this.isBookingConditionsHold = true;
  }

  consultationTypeCheck(){
    const practiceMethod = this.appointmentDetail[
      "doctorInfo"
    ].practiceMethod.toLowerCase();
    if (practiceMethod == "public") {
      if (
        this.appointmentDetail["patientInfo"].provinceId ===
        this.appointmentDetail["doctorInfo"].provinceId
      ) {
        this.appointmentDetail.consultation = "Public";
        this.appointmentReviewForm.get("serviceType").clearValidators();
        this.appointmentReviewForm.get("serviceType").updateValueAndValidity();
      } else {
        this.appointmentDetail.consultation = "--N.A--";
        this.isBookingConditionsHold = false;
        this.notBookingMsg =
          "BOOKING_CANNOT_BE_DONE_AS_DOCTOR_AND_PATIENT_PROVINCE_NOT_MATCH_ALONG_WITH_PRACTICE_METHOD_PUBLIC";
        return;
      }
    }

    if (
      practiceMethod == "private/public" ||
      practiceMethod == "privé/public"
    ) {
      if (
        this.appointmentDetail["patientInfo"].provinceId ==
        this.appointmentDetail["doctorInfo"].provinceId
      ) {
        this.appointmentDetail.consultation = "Private/Public";
        this.radioConsType = "Private/Public";
        this.appointmentReviewForm.get("consType").setValidators([Validators.required]);
        this.appointmentReviewForm.get("consType").updateValueAndValidity();
        this.appointmentReviewForm.get("serviceType").clearValidators();
        this.appointmentReviewForm.get("serviceType").updateValueAndValidity();
      } else {
        this.appointmentDetail.consultation = "Private";
        this.appointmentReviewForm.get("consType").clearValidators();
        this.appointmentReviewForm.get("consType").updateValueAndValidity();
      }
    }

    if (practiceMethod == "private" || practiceMethod == "privé") {
      this.appointmentDetail.consultation = "Private";
    }
  }

  handleChange(value){
    if(value == "PUBLIC"){
      this.services = [];
      this.appointmentDetail.consultation = "Public";
        this.appointmentReviewForm.get("serviceType").clearValidators();
        this.appointmentReviewForm.get("serviceType").updateValueAndValidity();
    } else if(value == "PRIVATE"){
      this.appointmentDetail.consultation = "Private";
      this.appointmentReviewForm.get("serviceType").setValidators([Validators.required]);
        this.appointmentReviewForm.get("serviceType").updateValueAndValidity();
    }
  }

  getFamilyMember() {
    if(this.isQrcodeScanPage){
      this.doctorService.getQrCodeFamilyData(this.appointmentDetail.patientId).subscribe(
        (res) => {
         this.familyMemberResult(res)
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    } else {
      this.doctorService.getFamilyData(this.appointmentDetail.patientId).subscribe(
        (res) => {
         this.familyMemberResult(res)
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    }
    
  }
  familyMemberResult(res){
    this.familyDetail = res.data;
    this.appointmentReviewForm.controls["appointmentIsFor"].setValue(
      this.familyDetail["0"].patientId
    );
    this.checkCondition();
    if(this.familyDetail[0].guest){
      this.appointmentReviewForm.controls.consType.setValue('PUBLIC');
      this.appointmentDetail.consultation = "Public";
      this.appointmentReviewForm.get("serviceType").clearValidators();
      this.appointmentReviewForm.get("serviceType").updateValueAndValidity();
    } else {
      this.consultationTypeCheck();
    }
  }

  getDentistSlots() {
    let params = this.appointmentReviewForm.value;
    params["doctorId"] = this.appointmentDetail.doctorId;
    params["slotTime"] = moment(
      this.appointmentReviewForm.value.consulationDate
    )
      .startOf("day")
      .valueOf();
    params["endTime"] = moment(this.appointmentReviewForm.value.consulationDate)
      .endOf("day")
      .valueOf();
    if (this.isQrcodeScanPage) {
      this.doctorService.getDentistSlotsByQrCode(params).subscribe(
        (res) => {
          let allSlots =res.data.slots
          let filtered_array =  _.filter(allSlots, { 'appointmentType': this.appointmentDetail.appointmentType  });
          this.availableSlot = filtered_array;
          this.nextAvailableDate = res.data.nextAvailableDate;
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    } else {
      this.doctorService.getDentistSlots(params).subscribe(
        (res) => {
          let allSlots =res.data.slots
          let filtered_array =  _.filter(allSlots, { 'appointmentType': this.appointmentDetail.appointmentType  });
          this.availableSlot = filtered_array;
          this.nextAvailableDate = res.data.nextAvailableDate;
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    }
  }

  selectSlot(selectedSlot) {
    this.timeSlotState = 1;
    this.appointmentReviewForm
      .get("consulationTime")
      .setValue(selectedSlot.time);
    this.selectedSlot = selectedSlot;
    this.slotPopupOpen = false;
  }

  closePopup() {
    this.slotPopupOpen = false;
  }

  showSlots() {
    this.getDentistSlots();
    this.slotPopupOpen = true;
  }

  addServices(){
    this.appointmentDetail.services = this.appointmentDetail.doctorInfo.services.map(
      (item) => {
        item.name += `-$${item.fee}`;
        return item;
      }
    );
  }

  saveForm() {
    this.checkCondition();
    this.formSubmitted = true;
    if (_.get(this.appointmentReviewForm, "invalid")) {
      return false;
    }

    this.modifyAppointmentDetail();
    if (this.isBookingConditionsHold) {
      if(this.appointmentDetail.consultation == "Public" && this.appointmentDetail.patientInfo && !this.appointmentDetail.patientInfo.healthCareNumber){
        this.addServices();
        this.toaster.showError(
          this.vref,
          "Error",
          "UNABLE_TO_BOOK_APPOINTMENT"
        );
      }else if(this.appointmentDetail.consultation == "Public" && this.appointmentDetail.patientInfo.isHealthCardExpired){
        this.addServices();
        this.toaster.showError(
          this.vref,
          "Error",
          "UNABLE_TO_BOOK_APPOINTMENT"
        );
      }else{
        console.log(this.appointmentDetail);
        if(this.isQrcodeScanPage){
          this.appointmentDetail['isQrcodeScanPage'] = this.isQrcodeScanPage;
          this.appointmentService.qrCodeSaveAppointment(this.appointmentDetail).subscribe(
            (res: any) => {
              if (res && res.data) {
                this.openBookingSuccessModal(res.data[0]);
              }
            },
            (err: any) => {
              this.addServices();
              this.errorHandler.handleError(err, this.vref);
            }
          );
        } else {
          this.appointmentDetail['isQrcodeScanPage'] = this.isQrcodeScanPage;
          this.appointmentService.managerSaveAppointment(this.appointmentDetail).subscribe(
            (res: any) => {
              if (res && res.data) {
                this.openBookingSuccessModal(res.data[0]);
              }
            },
            (err: any) => {
              this.addServices();
              this.errorHandler.handleError(err, this.vref);
            }
          );
        }
      } 
    } else {
      this.addServices();
    }
  }

  getSelectedPatientInfo(familyDetail, selectedId) {
    const [patientDetail] = familyDetail.filter(
      (detail) => !detail.isFamilyMember
    );
    const memberDetails = familyDetail.filter(
      (detail) => detail.isFamilyMember
    );

    if (selectedId == patientDetail.patientId) {
      return patientDetail;
    }

    const index = memberDetails.findIndex(
      (member) => member.memberId == selectedId
    );
    return memberDetails[index];
  }

  modifyAppointmentDetail() {
    let selectedServices = this.getSelectedServices();
    let patientId = this.appointmentReviewForm.value.appointmentIsFor;
    let [patientInfo] = this.familyDetail.filter(
      (detail) => !detail.isFamilyMember
    );
    let selectedPatientInfo = this.getSelectedPatientInfo(
      this.familyDetail,
      patientId
    );
    this.updateFrenchToEnglish();
    this.appointmentDetail = {
      ...this.appointmentDetail,
      services: selectedServices,
      patientId: parseInt(patientId),
      patientInfo: selectedPatientInfo,
      officeNotes: this.appointmentReviewForm.value.officeNotes,
      isFirstVisit: this.isFistVisit(),
      startTime: this.appointmentReviewForm.value.consulationTime.toString(),
      visitReason: this.appointmentReviewForm.value.reasonToVisit,
      timeId: this.selectedSlot["timeId"]
        ? this.selectedSlot["timeId"]
        : this.appointmentDetail["timeId"],
      dateId: this.selectedSlot["dateId"]
        ? this.selectedSlot["dateId"]
        : this.appointmentDetail["dateId"],
    };
    delete this.appointmentDetail.doctorInfo.specialities;

    this.convertDoctorInfoDateToString();
    this.setMemberInfo(selectedPatientInfo);
    this.checkToDeleteOfficeNotes();
    this.sanitizeServiceNames();
  }

  updateFrenchToEnglish() {
    this.appointmentDetail["consultation"] =
      this.appointmentDetail["consultation"] == "Privé"
        ? "private"
        : this.appointmentDetail["consultation"];
    this.appointmentDetail["doctorInfo"].practiceMethod =
      this.appointmentDetail["doctorInfo"].practiceMethod == "Privé"
        ? "private"
        : this.appointmentDetail["doctorInfo"].practiceMethod;
  }

  isFistVisit() {
    let firstVisit = false;
    if (
      this.appointmentReviewForm.value.seenBefore == LOCAL_CONST.MSG.First_Time
    ) {
      firstVisit = true;
    }
    return firstVisit;
  }

  convertDoctorInfoDateToString() {
    this.appointmentDetail["doctorInfo"].date += "";
  }

  setMemberInfo(selectedPatientInfo) {
    if (selectedPatientInfo.memberId) {
      this.appointmentDetail["memberInfo"] = selectedPatientInfo;
      this.appointmentDetail["memberId"] = selectedPatientInfo.memberId;
    }else{
      delete this.appointmentDetail["memberInfo"];
      delete this.appointmentDetail["memberId"];
    }
  }

  checkToDeleteOfficeNotes() {
    if (this.appointmentDetail["officeNotes"] == "") {
      delete this.appointmentDetail.officeNotes;
    }
  }

  sanitizeServiceNames() {
    this.appointmentDetail["doctorInfo"].services.forEach(function (service) {
      service.name = service.name.split("-$")[0];
    });
  }

  openBookingSuccessModal(data) {
    this.matDialog
      .open(BookedAppointmentDialogComponent, {
        data,
      })
      .afterClosed()
      .subscribe(() => {
        if (this.isQrcodeScanPage) {
          this.localStorageService.clearLocalStorage();
					window.location.replace(environment.portalURL);
        } else {
          this.router.navigateByUrl(`/feature/dashboard`, {
            replaceUrl: true,
          });
        }
        
      });
  }

  getSelectedServices() {
    const selectedServices = [];
    let self = this;
    this.services.forEach(function (service) {
      let selectedService = _.find(self.appointmentDetail.services, ['id', service.id]);
      selectedServices.push({
        id: service.id,
        consultationFee: +service.name.split("-$")[1],
        serviceName: service.name.split("-$")[0],
        includeTax:selectedService.includeTax
      });
    });
    return selectedServices;
  }

  getTermsCondition() {
    this.authorise.getTermsCondition().subscribe(
      (res) => {
        let data = res.data;
        const dialogRef = this.matDialog.open(TermAndConditionComponent, {
          height: "90vh",
          width: "1000px",
          data: {
            title: "CANCELLATION_POLICY",
            url: data?.cpUrl,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.appointmentReviewForm
              .get("termsAndConditions")
              .patchValue(result);
          } else if (result == false) {
            this.appointmentReviewForm
              .get("termsAndConditions")
              .patchValue(result);
          }
        });
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }
}
