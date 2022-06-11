
import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { LOCAL_CONST } from "../constants";
import { DoctorService } from "../doctor.service";
import { ErrorService } from "../../utils/service/error.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { UserService } from "../../utils/service/user.service";
import { TranslaterService } from "../../utils/service/translater.service";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-doctor-profile",
  templateUrl: "./doctor-profile.component.html",
  styleUrls: ["./doctor-profile.component.scss"],
})
export class DoctorProfileComponent implements OnInit {
  public profileData: any;
  public queryParams: any;
  public procedureData: any;
  public bookingForm: FormGroup;
  public doctorId: any;
  public patientId: any;
  public slots: any;
  public selectedSlot: any;
  public nextAvailableDate: any;
  public errorMsg: any;
  public minDate = moment(new Date()).startOf("day").format();
  public office: any;
  public OPTION: any;
  public visitingType: any;
  public address: any;
  public slotAvailability: boolean = false;
  public appointmentSave: boolean = false;
  public formSubmitted: boolean;
  public visitingTypeId: any;
  familyDetail: any;
  public isQrcodeScanPage: boolean = false;
  qrcodeSelectedDoctorData: any;

  constructor(
    private dentistService: DoctorService,
    private _activateRoute: ActivatedRoute,
    private builder: FormBuilder,
    private toaster: ToasterService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    public userService: UserService,
    private router: Router,
    private _localStorageService: LocalStorageService,
    private translater: TranslaterService,
    private translate: TranslateService
  ) {
    this.OPTION = LOCAL_CONST.OPTION;
    this.visitingType = LOCAL_CONST.VISIT;
  }

  /*
   * @ this method create the form and initializing the form
   */
  initFormGroup(builder: FormBuilder) {
    this.bookingForm = builder.group({
      date: [
        this.queryParams.date && moment(this.queryParams.date).isValid()
          ? this.queryParams.date
          : this.minDate,
        [Validators.required],
      ],
      // procedureId: [parseInt(this.queryParams.procedure),[ Validators.required]],
      reasonToVisit: ["", [Validators.required]],
      isFirstVisit: ["", [Validators.required]],
      visitingType: ["", [Validators.required]]
    });
  }

  ngOnInit() {
    this.isQrcodeScanPage = this._localStorageService.getItem("isQrcodeScanPage") == true ? this._localStorageService.getItem("isQrcodeScanPage") : false;
    this.qrcodeSelectedDoctorData = this._localStorageService.getItem("selectedDoctorData");
    this.doctorId = parseInt(this._activateRoute.snapshot.params.id);
    this.patientId = parseInt(this._activateRoute.snapshot.queryParams.selectedId);
    if(this.isQrcodeScanPage){
      this.dentistService.getQrCodeFamilyData(this.patientId).subscribe(
        (res) => {
          this.familyDetail = res.data;
          this.getDentistSlots();
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    } else {
      this.dentistService.getFamilyData(this.patientId).subscribe(
        (res) => {
          this.familyDetail = res.data;
          this.getDentistSlots();
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    }
    
    let checkNotNum = isNaN(this.doctorId);
    if (checkNotNum) {
      this.router.navigateByUrl("/home");
      return;
    }
    this.queryParams = this._activateRoute.snapshot.queryParams;
    this.initFormGroup(this.builder);
    this.getDentistById(this.doctorId);

    this.translater.TranslationAsPerSelection();
    this.appointmentSave = false;
    this.newAppointment();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      let url = this.router.url.split("/");
      if (url[url.length - 2] == "profile") {
        this.getDentistById(this.doctorId);
      }
    });
  }

  newAppointment() {
    if (this._localStorageService.getItem("bookedAppointment")) {
      this._localStorageService.removeItem("bookedAppointment");
    }
  }
  getDentistById(id) {
    if (this.isQrcodeScanPage) {
      let obj = {};
      obj['id'] = id;
      obj['userid'] = this.qrcodeSelectedDoctorData.user_id;
      this.dentistService.getQrCodeDentistById(obj).subscribe(
        (res) => {
          this.profileData = _.get(_.cloneDeep(res), "data", {});

          if (Object.keys(this.profileData).length === 0) {
            this.router.navigateByUrl("/home");
          }
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        },
        () => { }
      );
    } else {
      this.dentistService.getDentistById(id).subscribe(
        (res) => {
          this.profileData = _.get(_.cloneDeep(res), "data", {});

          if (Object.keys(this.profileData).length === 0) {
            this.router.navigateByUrl("/home");
          }
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        },
        () => { }
      );
    }

  }

  /**
   * Function to handle master data success response
   */
  masterDataSuccess(res) {
    let body = _.attempt(JSON.parse.bind(null, _.get(res, "_body")));
    if (_.isError(body)) {
      this.errorHandler.handleError(res, this.vref);
      return;
    }
    this.procedureData = this.parseHierarchicalData(
      _.get(body, "data.procedure", []),
      "procedure"
    );
  }

  /**
   * Function to parse hierarchical data
   */

  parseHierarchicalData(dataArr, keyName) {
    let transformedArr = [];
    _.forEach(dataArr, (data: any) => {
      transformedArr = _.concat(
        transformedArr,
        [
          _.assign(
            { id: data.id, type: "parent", parentId: null },
            _.set({}, keyName, _.get(data, keyName))
          ),
        ],
        _.map(_.get(data, "child", []), (obj: any) =>
          _.assign(obj, { type: "child", parentId: data.id })
        )
      );
    });
    return transformedArr;
  }

  /**
   * Function to view practice info
   */
  viewPracticeInfo() {
    alert("Work in progress");
  }

  /**
   * Function to concat images
   */
  concatImage(imageArr, image) {
    return _.map(_.concat(image || [], imageArr), (img) =>
      _.assign({}, { url: img, title: "", altText: "", thumbnailUrl: img })
    );
  }
  radioHandleChange() {
    this.getDentistSlots();
  }

  /**
   * Function to get slots
   */
  getDentistSlots() {
    this.errorMsg = null;
    this.selectedSlot = null;
    let params = this.bookingForm.value;
    params.doctorId = this.doctorId;
    params.slotTime = moment(this.bookingForm.value.date)
      .startOf("day")
      .valueOf();
    params.endTime = moment(this.bookingForm.value.date).endOf("day").valueOf();
    if (this.isQrcodeScanPage) {
      this.dentistService.getDentistSlotsByQrCode(params).subscribe(
        (res) => {
          this.displaySlots(res);
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    } else {
      this.dentistService.getDentistSlots(params).subscribe(
        (res) => {
          this.displaySlots(res);
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    }

  }

  displaySlots(res) {
    if (this.familyDetail[0].guest) {
      let filtered_array = _.filter(res.data.slots, { 'appointmentType': 2 });
      this.slots = filtered_array;
      this.bookingForm.controls.visitingType.setValue('INOFFICE');
      this.visitingTypeId = 2
    } else {
      let availableSlots = res.data.slots;
      if (this.bookingForm.controls.visitingType.value.toLowerCase() == "virtual") {
        this.visitingTypeId = 1
      } else if (this.bookingForm.controls.visitingType.value.toLowerCase() == "inoffice") {
        this.visitingTypeId = 2
      }
      if (this.visitingTypeId) {
        let filtered_array = _.filter(availableSlots, { 'appointmentType': this.visitingTypeId });
        this.slots = filtered_array;
      } else {
        this.slots = availableSlots;
      }

    }
    this.nextAvailableDate = res.data.nextAvailableDate;
    this.office = res.data.office;
    this.slotAvailability = this.slots.length > 0 ? true : false;
  }

  slotSelected(slot) {
    this.errorMsg = null;
    this.selectedSlot = slot;
  }

  /**
   * Function to check whether key has error
   */
  hasError(errorType: string, key: string) {
    return this.formSubmitted && this.bookingForm.hasError(errorType, [key]);
  }

  /**
   * this method go for the booking detail
   */
  bookAppointment() {
    this.formSubmitted = true;
    if (!this.selectedSlot) {
      this.errorMsg = "PLEASE_SELECT_A_TIME_SLOT";
      return;
    }
    if (_.get(this.bookingForm, "invalid")) {
      return false;
    }
    let bookingDetail: any = this.bookingForm.value;
    bookingDetail.doctorId = this.doctorId;
    bookingDetail.slot = this.selectedSlot;
    bookingDetail.date = moment(bookingDetail.date).valueOf();
    this.slots.forEach(function (entry) {
      if (entry.time == bookingDetail.slot) {
        bookingDetail.dateId = entry.dateId;
        bookingDetail.timeId = entry.timeId;
      }
    });
    let userData = this._localStorageService.getItem("userData") || "";
    bookingDetail.email = userData.email;
    bookingDetail.doctor = this.profileData;
    let Speciality = [],
      index = 0;
    bookingDetail.doctor.specialities.forEach(function (speciality) {
      Speciality[index++] = speciality.specialityName;
    });
    let Service = [],
      i = 0;
    bookingDetail.doctor.services.forEach(function (service) {
      Service[i] = {
        id: service.id,
        serviceName: service.name,
        consultationFee: service.fee,
        includeTax: service.includeTax
      };
    });

    let bookedAppointment = {
      dateId: bookingDetail.dateId,
      timeId: bookingDetail.timeId,
      doctorId: bookingDetail.doctorId,
      appointmentType: this.visitingTypeId,
      doctorUserId: bookingDetail.doctor.doctorUserId,
      doctorInfo: {
        firstName: bookingDetail.doctor.firstName,
        lastName: bookingDetail.doctor.lastName,
        email: bookingDetail.doctor.email,
        date: bookingDetail.date,
        practiceMethod: bookingDetail.doctor.practiceMethod,
        speciality: Speciality,
        services: bookingDetail.doctor.services,
        doctorId: bookingDetail.doctorId,
        profileImage: bookingDetail.doctor.profileImage,
        addressLine1: bookingDetail.doctor.address,
        city: bookingDetail.doctor.city,
        province: bookingDetail.doctor.province,
        specialities: bookingDetail.doctor.specialities,
        lat: bookingDetail.doctor.lat,
        lng: bookingDetail.doctor.lng,
        age: bookingDetail.doctor.age,
        gender: bookingDetail.doctor.gender,
        phoneNumber: bookingDetail.doctor.phoneNumber,
        clinicPhoneNumber: bookingDetail.doctor.clinicPhoneNumber,
        clinicName: bookingDetail.doctor.clinicName,
        clinicFax: bookingDetail.doctor.clinicFax,
        licenseNumber: bookingDetail.doctor.licenseNumber,
        provinceId: bookingDetail.doctor.provinceId,
        postalCode: bookingDetail.doctor.postalCode,
        signature: bookingDetail.doctor.signature,
      },
      startTime: bookingDetail.slot.toString(),
      visitReason: bookingDetail.reasonToVisit,
      consultation: bookingDetail.doctor.practiceMethod,
      services: Service,
      offset: moment().format("Z"),
      isFirstVisit: bookingDetail.isFirstVisit,
      patientId: this.patientId
    };
    this._localStorageService.setItem("bookedAppointment", bookedAppointment);
    if (this.isQrcodeScanPage) {
      if (this._localStorageService.getItem("bookedAppointment")) {
        this.router.navigate(["/auth/book/" + this.selectedSlot]);
      }
      if (this.appointmentSave) {
        this.router.navigate(["/auth/book/" + this.selectedSlot]);
      }
    } else {
      if (this._localStorageService.getItem("bookedAppointment")) {
        this.router.navigate(["/appointments/book/" + this.selectedSlot]);
      }
      if (this.appointmentSave) {
        this.router.navigate(["/appointments/book/" + this.selectedSlot]);
      }
    }
  }

  /**
   * this method go for the booking detail
   */
  markFavouriteOrUnfavourite(expert) {
    this.stopPropogation(event);

    let body = {
      doctorId: expert.id,
      favourite: !expert.isFavourite,
    };

    this.dentistService.markFavouriteOrUnfavourite(body).subscribe(
      (res) => {
        expert.isFavourite = !expert.isFavourite;
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  /**
   * Function to stop propogation of event
   */
  stopPropogation(event: any) {
    _.invoke(event, "stopPropogation");
    _.invoke(event, "stopImmediatePropagation");
    _.set(event, "cancelBubble", true);
  }
}
