/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ErrorService } from "../../../service/error.service";
import { LocalStorageService } from "../../../service/localStorage.service";
import { ToasterService } from "../../../service/toaster.service";
import { OnboardService } from "../onboard.service";
import { AccountService } from "../../../../account-settings/account.service";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { environment } from "../../../../../environments/environment";
import { common } from "../../../../constants/common";
import { RESPONSES } from "../../../../constants/response";
import { TranslaterService } from "../../../../utils/service/translater.service";
import { DynamicOtpService } from "../../../../utils/service/dynamic-otp.service";
import { DialogModalComponent } from "../../cancel-modal/cancel-modal.component";
import { CamImageConfirmComponent } from "../../camimageconfirm-modal/camimageconfirm-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { MESSAGES } from "../constants/messages";
import * as IntroJs from 'intro.js';
import { HelperService } from "../../../service/helper.service";

@Component({
  selector: "app-personal-details",
  templateUrl: "./personal-details.component.html",
  styleUrls: ["./personal-details.component.scss"],
})
export class PersonalDetailsComponent implements OnInit {
  public personalDetailsForm: FormGroup;
  public formSubmitted: boolean = false;
  public today = new Date();
  public maxDate = moment(this.today.setFullYear(this.today.getFullYear() - 14))
    .startOf("day")
    .format();
  public minDate = moment(
    this.today.setFullYear(this.today.getFullYear() - 100)
  ).format();
  public fileUploading: boolean = false;
  public userData: {};
  public languages = [];
  public preferedLanguages = [];
  public selectedLanguages = [];
  public editorApiKey = environment.editorApiKey;
  public editorConfig = common.editorConifg;
  public charCount;
  public lang:any;
  public introTour;
  public personalDetails: any = {};
  public notificationData;
  public profileUploadMsg = "PROFILE_IMAGE_UPLOADED_SUCCESS";
  public profileRemoveMsg = "PROFILE_IMAGE_REMOVED_SUCCESS";
  public signatureUploadMsg = "SIGNATURE_UPLOADED_SUCCESS";
  public signatureRemoveMsg = "SIGNATURE_REMOVED_SUCCESS";

  public languagesSubs: Subscription;
  public savePersonalDetailSubs: Subscription;
  public updatePersonalDetailSubs: Subscription;
  public getPersonalDetailSubs: Subscription;
  public uniqueKeySubs: Subscription;
  public allSubs: Subscription[] = [];
  public dropDownSettings: IDropdownSettings;
  public phoneNumberMand:boolean = false;
  public front_photo_error: boolean = false;
  public view_front_photo: boolean = false;
  profileManagerList: any;

  constructor(
    private formBuilder: FormBuilder,
    private errorHandler: ErrorService,
    private localStorageService: LocalStorageService,
    private onboardService: OnboardService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToasterService,
    private vref: ViewContainerRef,
    private translaterService: TranslaterService,
    private translate: TranslateService,
    private matDialog: MatDialog,
    public dynamicOtpService: DynamicOtpService,
    public helperService: HelperService
  ) {
    this.preferedLanguages = [{"id":"en","name":"ENGLISH"},{"id":"fr","name":"FRENCH"}]
  }

  ngOnInit() {
    this.introTour = this.localStorageService.getItem("tourFlag");
    this.lang = this.localStorageService.getItem("language");
    this.setLocalStorageData();
    this.getDoctorStatus();
    this.createFormBuilder();
    this.getAllLanguages();
    this.setDropdownSettings();
    this.getPersonalDetails();
    this.translaterService.TranslationAsPerSelection();
    this.dynamicOtpService.popupOpen = false;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      let url = this.router.url.split("/");
      if (url[url.length - 1] == "profile" || url[url.length - 1] == "step1") {
        this.getAllLanguages();
        this.setDropdownSettings();
        this.getPersonalDetails();
      }
    });
  }

  setLocalStorageData() {
    this.userData = this.localStorageService.getItem("userData") || {};
  }

  public saveMessage: boolean = false;
  getDoctorStatus() {
    this.accountService.getDoctorStatus().subscribe((res: any) => {
      if (res.data.status == "active") {
        this.saveMessage = true;
      }
    });
  }

  NotificationToggleValue(data) {
    this.accountService.getNotificationToggleValue().subscribe(
      (res: any) => {
        this.notificationData = res.data;
        this.setNotificationData(data)
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  imageNotification(){
    if(this.personalDetailsForm.controls.phoneNumber.value){
      let body = {
        userId: this.userData['userId'],
        userType: "doctor",
        imageComponentName: "signature",
        email:this.userData['email'],
        phoneNumber:this.userData['phoneNumber'] ? this.userData['phoneNumber']: this.personalDetailsForm.controls.phoneNumber.value
        // phoneNumber:"9848866133",
        // email: "sriharsham@ibaseit.com"
      };
      this.accountService.signatureNotification(body).subscribe(
        (res: any) => {
          console.log(res);
          if(res.success){
            this.view_front_photo = true;
            const dialogRef = this.matDialog.open(CamImageConfirmComponent, {
              height: "auto",
              width: "350px",
              data: {
                message: "PLZ_FOLLOW_THE_LINK_TO_UPLOAD_IMAGE",
              },
            });
          }
        },
        (err) => this.errorHandler.handleError(err, this.vref)
      );
    } else {
      this.phoneNumberMand = true;
    }
    
  }

  public imageView:boolean=false
  public fileSrc:any;
  verifySignature(){
    let body = {
      userId: this.userData['userId'],
      userType: "doctor",
      imageComponentName: "signature"
    };
    this.accountService.verifiySign(body).subscribe(
      (res: any) => {
        console.log(res);
        let result = res.body[0];
        if(result && result.status == "received"){
          this.personalDetails.signature = result.imagUrl;
          let filteredPersonalData = {
            eSignature: { url: _.get(this.personalDetails, "signature", "") },
          };
          this.personalDetailsForm.patchValue(filteredPersonalData);
          this.front_photo_error = false;
          this.imageView = true;
          this.fileSrc = result.imagUrl;
        } else {
          this.front_photo_error = true;
        }
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  viewLinkStatus(viewObj){
    if(viewObj.columnName == 'signature'){
      this.view_front_photo = true
    }
  }
  openImageStatus(status){
    this.imageView = false;
  }

  valuechange(event){
    this.phoneNumberMand = false;
  }

  setNotificationData(data){
    let body = {
      isEmailEnabled: this.notificationData.isEmailEnabled,
      isSMSEnabled: this.notificationData.isSMSEnabled,
      preferredLanguage : data.preferredLanguage,
      firstName : data.firstName,
      lastName : data.lastName,
    };
    this.accountService.updateNotificationToggleValue(body).subscribe(
      (res: any) => {
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  createFormBuilder() {
    this.personalDetailsForm = this.formBuilder.group({
      profileImage: [null, [Validators.required, this.notNullUrl]],
      firstName: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          this.onboardService.trimEmptyCheck(),
        ],
      ],
      middleName: [null, [Validators.maxLength(10)]],
      lastName: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          this.onboardService.trimEmptyCheck(),
        ],
      ],
      email: [this.userData["email"], [Validators.required]],
      phoneNumber: [null, [Validators.required, Validators.minLength(10)]],
      clinicPhoneNumber: [
        null,
        [Validators.required, Validators.minLength(10)],
      ],
      dob: [null, [Validators.required]],
      preferredLanguage: [null, [Validators.required]],
      gender: ["male", [Validators.required]],
      eSignature: ["", [Validators.required, this.notNullUrl]],
      languages: [null, [Validators.required]],
      bio: [null, [Validators.required]],
      address: ["", [Validators.required]],
    });
  }

  notNullUrl(control: FormControl) {
    return control.value && control.value.url ? null : { nullURL: true };
  }

  getAllLanguages() {
    this.languagesSubs = this.onboardService
      .getMasterData("languages")
      .subscribe((response) => {
        this.languages = _.get(response, "data", []);
        //set saved language on language change
        let selectedLang = [],
          index = 0;
        this.personalDetailsForm?.controls?.languages?.value.forEach(
          (savedLanguage) => {
            const sIndex = this.languages.findIndex(
              (language) => language.id == savedLanguage.id
            );
            if (sIndex != -1) {
              selectedLang[index++] = this.languages[sIndex];
            }
          }
        );
        this.personalDetailsForm.controls.languages.setValue(selectedLang);
      });
    this.allSubs.push(this.languagesSubs);
  }

  setDropdownSettings() {
    this.dropDownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "english_values",
      selectAllText: this.translate.instant("SELECT_ALL"),
      unSelectAllText: this.translate.instant("UNSELECT_ALL"),
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this.translate.instant("SEARCH"),
    };
  }

  deleteClinicData(){
    delete this.userData["clinicName"]
    delete this.userData["postalCode"]
    delete this.userData["addressLine1"]
    delete this.userData["addressLine2"]
    delete this.userData["city"]
    delete this.userData["province"]
    delete this.userData["lat"]
    delete this.userData["lng"]
  }

  getPersonalDetails() {
    if (this.userData["doctorId"]) {
      let clinicData = {};
      this.getPersonalDetailSubs = this.onboardService
        .getPersonalDetails(this.userData["doctorId"])
        .subscribe(
          (res) => {
            this.deleteClinicData();
            this.localStorageService.setItem("language", res.data.preferredLanguage);
            clinicData['clinicName'] = res.data.clinicName;
            clinicData['postalCode'] = res.data.postalCode;
            clinicData['addressLine1'] = res.data.addressLine1;
            clinicData['addressLine2'] = res.data.addressLine2;
            clinicData['city'] = res.data.city;
            clinicData['province'] = res.data.province;
            clinicData['lat'] = res.data.lat;
            clinicData['lng'] = res.data.lng;
            this.localStorageService.setItem("userData", {
              ...clinicData,
              ...this.userData,
            });
            this.translaterService.TranslationAsPerSelection();
            this.personalDetails = _.cloneDeep(_.get(res, "data", ""));
            this.prefillSavedData();
            this.checkClinicChange();
          },
          (err) => this.handleError(err)
        );
      this.allSubs.push(this.getPersonalDetailSubs);
    }
  }

  onReset() {
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      height: "auto",
      width: "350px",
      data: {
        message: "RESET_MSG",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.prefillSavedData();
      }
    });
  }


  prefillSavedData() {
    let filteredPersonalData = {
      firstName: _.get(this.personalDetails, "firstName", null),
      middleName: _.get(this.personalDetails, "middleName", null),
      lastName: _.get(this.personalDetails, "lastName", null),
      phoneNumber: _.get(this.personalDetails, "phoneNumber", null),
      clinicPhoneNumber: _.get(this.personalDetails, "clinicPhoneNumber", null),
      profileImage: { url: _.get(this.personalDetails, "profileImage", null) },
      dob: _.get(this.personalDetails, "dob", null),
      preferredLanguage: _.get(this.personalDetails, "preferredLanguage", null),
      gender: _.get(this.personalDetails, "gender", "male"),
      eSignature: { url: _.get(this.personalDetails, "signature", "") },
      languages: _.get(this.personalDetails, "languages"),
      bio: _.get(this.personalDetails, "bio"),
      address: {
        addressLine1: _.get(this.personalDetails, "addressLine1", null),
        addressLine2: _.get(this.personalDetails, "addressLine2", "") || "",
        province: _.get(this.personalDetails, "province", null),
        city: _.get(this.personalDetails, "city", null),
        postalCode: _.get(this.personalDetails, "postalCode", null),
        lat: _.get(this.personalDetails, "lat", null),
        lng: _.get(this.personalDetails, "lng", null),
        clinicFax: _.get(this.personalDetails, "clinicFax", null),
        clinicName: _.get(this.personalDetails, "clinicName", null),
      },
    };
    this.personalDetailsForm.patchValue(filteredPersonalData);
    this.dynamicOtpService.IsPhoneNumberVerified = this.personalDetails.phoneVerified;
  }

  sendOtponPhoneNumber() {
    this.onboardService.sendOtponPhoneNo().subscribe(
      (res) => {
        this.dynamicOtpService.popupOpen = true;
        this.toaster.showSuccess(
          this.vref,
          "Verification Code Sent",
          "VERIFICATION_CODE_SENT_TO_YOUR_REGISTERED_PHONE_NUMBER"
        );
      },
      (err: any) => this.errorHandler.handleError(err, this.vref)
    );
  }
  saveForm() {
    this.formSubmitted = true;
    const address = this.personalDetailsForm.controls.address.value;
    if (!this.onboardService.isValidAddressForm(address, ["addressLine2","clinicFax","clinicName"])) {
      return false;
    }
    if (this.isValidForm()) {
      return false;
    }

    this.upSertPersonalDetails();
  }

  isValidForm() {
    return _.get(this.personalDetailsForm, "invalid");
  }

  createBodyObject() {
    return {
      userId: this.userData["userId"],
      firstName: _.trim(
        _.get(this.personalDetailsForm, "controls.firstName.value")
      ),
      middleName: _.trim(
        _.get(this.personalDetailsForm, "controls.middleName.value")
      ),
      lastName: _.trim(
        _.get(this.personalDetailsForm, "controls.lastName.value")
      ),
      email: _.trim(_.get(this.personalDetailsForm, "controls.email.value")),
      phoneNumber: _.trim(
        _.get(this.personalDetailsForm, "controls.phoneNumber.value")
      ),
      clinicPhoneNumber: _.trim(
        _.get(this.personalDetailsForm, "controls.clinicPhoneNumber.value")
      ),
      profileImage: _.get(
        this.personalDetailsForm,
        "controls.profileImage.value.url"
      ),
      dob: _.get(this.personalDetailsForm, "controls.dob.value"),
      preferredLanguage: _.get(this.personalDetailsForm, "controls.preferredLanguage.value"),
      gender: _.get(this.personalDetailsForm, "controls.gender.value", "male"),
      signature: _.get(
        this.personalDetailsForm,
        "controls.eSignature.value.url",
        ""
      ),
      languages: this.getLanguagesIdArray(),
      bio: _.get(this.personalDetailsForm, "controls.bio.value", "male"),
      ..._.get(this.personalDetailsForm.get("address"), "value"),
    };
  }

  navigateToNextPage() {
    this.router.navigate(["step3"], { relativeTo: this.route.parent });
  }

  handleUniqueError() {
    this.toaster.showError(this.vref, "Error", RESPONSES.UNEXPECTED_ERROR);
  }

  handleUniqueSuccess(res: any) {
    let isError = false;
    if (!res[0]["data"]["phoneNumber"]["isUnique"]) {
      isError = true;
      this.toaster.showError(this.vref, "Error", RESPONSES.CELL_PHONE_EXIST);
    }
    if (!res[1]["data"]["clinicPhoneNumber"]["isUnique"]) {
      isError = true;
      this.toaster.showError(this.vref, "Error", RESPONSES.CLINIC_PHONE_EXIST);
    }

    if (isError) {
      return;
    }
    
    let finalObj = this.createBodyObject();
    finalObj['clinicName'] = this.helperService.titleCase(finalObj['clinicName'].replace(/\s+/g, ' ').trim());
    if (!this.userData["doctorId"]) {
      this.savePersonalDetailSubs = this.onboardService
        .savePersonalDetails(finalObj)
        .subscribe(
          (response: any) => this.handleInsertSuccess(response),
          (err: any) => this.handleError(err)
        );
      this.allSubs.push(this.savePersonalDetailSubs);
      return;
    }

    this.updatePersonalDetailSubs = this.onboardService
      .updatePersonalDetails(finalObj, this.userData["doctorId"])
      .subscribe(
        (res: any) => this.handleUpdateSuccess(res),
        (err: any) => this.handleError(err)
      );
    this.allSubs.push(this.updatePersonalDetailSubs);
  }

  upSertPersonalDetails() {
    this.uniqueKeySubs = this.onboardService
      .isUniqueKey(
        [
          {
            name: "phoneNumber",
            value: this.personalDetailsForm.controls.phoneNumber.value,
          },
          {
            name: "clinicPhoneNumber",
            value: this.personalDetailsForm.controls.clinicPhoneNumber.value,
          },
        ],
        this.userData["doctorId"] || null
      )
      .subscribe(
        (res) => this.handleUniqueSuccess(res),
        (err) => this.handleUniqueError()
      );
    this.allSubs.push(this.uniqueKeySubs);
  }

  handleInsertSuccess(res: any) {
    this.userData["doctorId"] = res.data.doctorId;
    this.userData["onboardStep"] = 2;
    this.userData["firstName"] = res.data.firstName;
    this.userData["lastName"] = res.data.lastName;
    this.userData["profileImage"] = res.data.profileImage;
    this.userData["phoneNumber"] = res.data.phoneNumber;
    this.localStorageService.setItem("language", res.data.preferredLanguage);
    this.translaterService.TranslationAsPerSelection();
    this.localStorageService.setItem("userData", this.userData);
    this.toaster.showSuccess(this.vref, "Success", MESSAGES.SAVED_SUCCESSFULLY);
    this.view_front_photo = false;
    setTimeout(() => {
      this.router.navigateByUrl("auth/onboard/step2");
    }, common.responseTimeout);
  }

  handleUpdateSuccess(res: any) {
    this.getPersonalDetails();
    this.NotificationToggleValue(res.data);
    this.view_front_photo = false;
    this.toaster.showSuccess(
      this.vref,
      "Success",
      MESSAGES.UPDATED_SUCCESSFULLY
    );
  }

  checkClinicChange(){
    let userData = this.localStorageService.getItem("userData");
    let addressObj = {
      clinicName: userData.clinicName,
      addressLine1: userData.addressLine1,
      addressLine2: userData.addressLine2,
      city: userData.city,
      province: userData.province,
      postalCode: userData.postalCode,
      clinicFax: userData.clinicFax ? userData.clinicFax : "",
      lat: userData.lat,
      lng: userData.lng,
      doctorId: userData.doctorId,
      doctorName:userData.firstName+' '+userData.lastName,
      userId: userData.userId,
      actionType: 0
    }
    this.onboardService.insertQrData(addressObj).subscribe((res) => {
      if (res && res.actionType == 0) {
        this.accountService.getProfileMngrList(this.userData).subscribe((res) => {
          if (res) {
            this.profileManagerList = res.data.list;
            let self = this;
            this.profileManagerList.forEach(function (profileManager) {
              let data = {};
              data['managerId'] = profileManager.id;
              data['parentId'] = self.userData['doctorId'];
              self.accountService.deleteExistingManager(data).subscribe(
                (res) => {},
                (err) => {
                  this.toaster.showError(
                    this.vref,
                    "Error Occurred",
                    "ERROR_OCCURED"
                  );
                }
              );
            });
          }
        });
      }
    },
    (err) => {
      this.toaster.showError(
        this.vref,
        "Error Occurred",
        err?.error?.message
      );
    })
  }

  handleError(err: any) {
    this.errorHandler.handleError(err, this.vref);
  }

  backNavigate() {
    this.router.navigate(["step1"], { relativeTo: this.route.parent });
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.personalDetailsForm.hasError(type, [key]);
  }

  uploadingStart(status: any) {
    this.fileUploading = status;
  }

  handleCharCount() {
    this.charCount = this.onboardService.getCharacterCountfromHtml(
      this.personalDetailsForm.controls["bio"].value
    );
  }

  getLanguagesIdArray() {
    const languages = _.get(
      this.personalDetailsForm,
      "controls.languages.value",
      []
    );
    const idArray = [];

    languages.forEach((lang) => {
      if (_.isObject(lang)) {
        idArray.push(+lang.id);
      } else {
        idArray.push(lang);
      }
    });
    return idArray;
  }

  ngOnDestroy() {
    this.allSubs.forEach((subs) => {
      if (subs) {
        subs.unsubscribe();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if(!this.introTour){
        this.startTour();
      }
    },1000)
  }


  startTour() {
    let self = this;
    console.log("Starting tour");
    let intro = IntroJs();
    let stepsContent
    if (this.lang == 'en') {
      intro.setOption("doneLabel", "Next");
      intro.setOption("nextLabel", "Next");
      intro.setOption("prevLabel", "Back");
      stepsContent = {
        steps: [
          {
            element: '#personal_step1',
            intro: "Make sure to list all the languages you want to offer in your health care practice.",
            position: 'right',
          }
        ]
      }
    } else {
      intro.setOption("doneLabel", "Prochaine");
      intro.setOption("nextLabel", "Prochaine");
      intro.setOption("prevLabel", "Arrière");
      stepsContent = {
        steps: [
          {
            element: '#personal_step1',
            intro: "Assurez-vous de choisir toutes les langues pour lesquelled votre pratique de santé dera disponible.",
            position: 'right',
            onchange: function () {
              alert("Do whatever you want on this callback.");
            }
          }
        ]
      }
    }

    // Initialize steps
    intro.setOptions(stepsContent);
    
    intro.oncomplete(function () {
      self.router.navigateByUrl('repository');
    });

    intro.onexit(function () {
      console.log("complete")
    });

    intro.setOptions({
      exitOnOverlayClick: false,
      showBullets: false
    });

    // Start tutorial
    intro.start();
  }
}
