/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators,FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ErrorService } from "../../../service/error.service";
import { LocalStorageService } from "../../../service/localStorage.service";
import { ToasterService } from "../../../service/toaster.service";
import { OnboardService } from "../onboard.service";
import { DashboardService } from "../../../service/dashboard.service";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { common } from "../../../../constants/common";
import { DialogModalComponent } from "../../cancel-modal/cancel-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { Input } from "@angular/core";
import { FaxModalComponent } from "./fax-modal/fax-modal.component";
import { OtpModalComponent } from "./otp-modal/otp-modal.component";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { MESSAGES } from "../constants/messages";
import { DynamicOtpService } from "../../../service/dynamic-otp.service";
import { CamImageConfirmComponent } from "../../camimageconfirm-modal/camimageconfirm-modal.component";

@Component({
  selector: "app-practice-details",
  templateUrl: "./practice-details.component.html",
  styleUrls: ["./practice-details.component.scss"],
})
export class PracticeDetailsComponent implements OnInit {
  @ViewChild("selectedService", { static: false }) selectedService;
  @ViewChild("selectedConsultation", { static: false }) selectedConsultation;

  @Input() isEditMode: boolean = false;
  public ramQPasswordType: string = "password";
  public practiceDetailsForm: FormGroup;
  public formSubmitted: boolean = false;
  public today = new Date();
  public fileUploading: boolean = false;
  public userData:any = {};
  public specialist = [];
  public selectedSpecialist;
  public specialtyType = [];
  public practiceMethods = [];
  public privateServices = [];
  public provinceList = [];
  public serviceid = "";
  public practiceDetails: any;
  public duplicateService = false;
  public onBillingCheck: boolean = false;
  public masterDataSubs: Subscription;
  public allSubs: Subscription;
  public dropDownSettings: IDropdownSettings;
  public isProvinceDisabled: boolean = false;
  public showUnApprovedDoctorMessage: boolean = false;
  public formatDate:any;
  public language:any;
  public passwordType: string = "password";
  public view_govt_id_front_image: boolean = false;
  public govt_id_front_image_error: boolean = false;
  filteredPracticeData: any;
  constructor(
    private formBuilder: FormBuilder,
    private errorHandler: ErrorService,
    private localStorageService: LocalStorageService,
    private onboardService: OnboardService,
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToasterService,
    public dynamicOtpService: DynamicOtpService,
    private vref: ViewContainerRef,
    private matDialog: MatDialog,
    private translate: TranslateService
  ) {
    this.language = this.localStorageService.getItem("language") || {};
  }

  ngOnInit(): void {
    this.setLocalStorageData();
    this.createFormBuilder();
    this.getAllMasterData();
    this.setDropdownSettings();
    this.getPracticeDetails();
    this.getDoctorStatus();
    this.dynamicOtpService.popupOpen = false;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.language = this.localStorageService.getItem("language") || {};
      let url = this.router.url.split("/");
      if (url[url.length - 1] == "practice" || url[url.length - 1] == "step2") {
        this.getAllMasterData();
        this.setDropdownSettings();
      }
    });
  }

  showHidePass(type) {
    this.passwordType = type;
  }
  
  getDoctorStatus() {
    this.dashboardService.getDoctorStatus().subscribe((res: any) => {
      if (res.data.status != "active") {
        this.showUnApprovedDoctorMessage = true;
      }
    });
  }

  setLocalStorageData() {
    this.userData = this.localStorageService.getItem("userData") || {};
    this.isProvinceDisabled = this.userData["onboardStep"] > 3 ? true : false;
    if(!this.userData.phoneNumber){
      this.onboardService.getPersonalDetails(this.userData["doctorId"]).subscribe(
        (res) => {
          this.userData["phoneNumber"] = res.data.phoneNumber;
        },
        (err) => {
          this.errorHandler.handleError(err, this.vref);
        }
      );
    }
  }
  
  createFormBuilder() {
    this.practiceDetailsForm = this.formBuilder.group({
      specialtyType: [null, [Validators.required]],
      specialist: [null],
      practiceNumber: [null, [Validators.required, Validators.minLength(6)]],
      practiceMethod: ["1", [Validators.required]],
      enableDefaultBilling: [false, []],
      privateServices: [null],
      province: [null, [Validators.required]],
      agentId: [null, [Validators.required,Validators.minLength(5)]],
      agentPassword: [null, [Validators.required]],
      patientCount: [null, [Validators.required]],
      accountType: [null, [Validators.required]],
      adminAccNo: [null],
      govtIdFrontImage: ["", [Validators.required, this.notNullUrl]],
      onlineRamqId: [""],
      onlineRamqPassword: [""]
    });
  }

  notNullUrl(control: FormControl) {
    return control.value && control.value.url ? null : { nullURL: true };
  }

  changeAccType(){
    this.practiceDetailsForm.controls['adminAccNo'].setValue('');
    let SelectedValue = this.practiceDetailsForm.get('accountType').value;
    if(SelectedValue == 'administrative') {
      this.practiceDetailsForm.get('adminAccNo').setValidators([Validators.required]);
      this.practiceDetailsForm.get('adminAccNo').updateValueAndValidity();
    } else {
      this.practiceDetailsForm.get('adminAccNo').clearValidators();
      this.practiceDetailsForm.get('adminAccNo').updateValueAndValidity();
    }
  }

  changePracticeMethod(){
    let SelectedValue = this.practiceDetailsForm.controls.practiceMethod.value;
    if(SelectedValue != '1') {
      this.practiceDetailsForm.controls["enableDefaultBilling"].setValidators(
        [
          Validators.required,
          (control) => {
            if (!control.value) {
              return { required: true };
            }
            return null;
          },
        ],
      );
      this.practiceDetailsForm.get('enableDefaultBilling').updateValueAndValidity();
    } else {
      this.practiceDetailsForm.get('enableDefaultBilling').clearValidators();
      this.practiceDetailsForm.get('enableDefaultBilling').updateValueAndValidity();
      this.practiceDetailsForm.controls.enableDefaultBilling.setValue(false);
    }
  }

  getAllMasterData() {
    this.masterDataSubs = this.onboardService
      .getAllPracticeMasterData()
      .subscribe((response) => {
        this.specialtyType = _.get(response, "[0]data", []);
        this.practiceMethods = _.get(response, "[1]data", []);
        this.specialist = _.get(response, "[2]data", []);
        this.provinceList = _.get(response, "[3]data", []);
        //set saved specialist on language change
        let selectedSpecialistLang = [];
        const specialist =
          this.practiceDetailsForm?.controls?.specialist?.value || [];
        specialist.forEach((savedSpeciality) => {
          const sIndex = this.specialist.findIndex(
            (speciality) => speciality.id == savedSpeciality.id
          );
          if (sIndex != -1) {
            selectedSpecialistLang.push(this.specialist[sIndex]);
          }
        });
        this.practiceDetailsForm.controls.specialist.setValue(
          selectedSpecialistLang
        );
      });
  }

  setDropdownSettings() {
    this.dropDownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: this.translate.instant("SELECT_ALL"),
      unSelectAllText: this.translate.instant("UNSELECT_ALL"),
      itemsShowLimit: 2,
      allowSearchFilter: true,
      searchPlaceholderText: this.translate.instant("SEARCH"),
    };
  }

  getPracticeDetails() {
    if (this.userData["doctorId"]) {
      this.onboardService
        .getPracticeDetails(this.userData["doctorId"])
        .subscribe(
          (res) => {
            this.practiceDetails = _.cloneDeep(_.get(res, "data", ""));
            this.dateFormat(this.practiceDetails.machinePassExpiryDate)
            this.prefillSavedData();
            this.getPrivateServices();
          },
          (err) => this.handleError(err)
        );
    }
  }

  dateFormat(date){
    var m = moment(date);
    this.formatDate = m.format('MM-DD-YYYY');
  }

  prefillSavedData() {
    if(this.practiceDetails.patientCount == 0){
      this.practiceDetails.patientCount = null
    }
    if(this.practiceDetails.accountType == 1){
      this.practiceDetails.accountType = "personal"
    }else{
      this.practiceDetails.accountType = "administrative"
    }
    this.filteredPracticeData = {
      specialtyType: _.get(this.practiceDetails, "specialtyType") || "",
      specialist: _.cloneDeep(_.get(this.practiceDetails, "specialist", null)),
      practiceNumber: _.get(this.practiceDetails, "practiceNumber", null),
      agentId: _.get(this.practiceDetails, "agentId", null),
      agentPassword: _.get(this.practiceDetails, "agentPassword", null),
      onlineRamqPassword: _.get(this.practiceDetails, "onlineRamqPassword") || "",
      onlineRamqId: _.get(this.practiceDetails, "onlineRamqId") || "",
      govtIdFrontImage: {
        url: _.get(this.practiceDetails, "govtIdFrontImage", null),
      },
      patientCount: _.get(this.practiceDetails, "patientCount", null),
      adminAccNo: _.get(this.practiceDetails, "adminAccNo", null),
      accountType: _.get(this.practiceDetails, "accountType", "personal"),
      practiceMethod: _.get(this.practiceDetails, "practiceMethod") || 1,
      enableDefaultBilling: _.get(
        this.practiceDetails,
        "enableDefaultBilling",
        null
      ),
      privateServices: _.get(this.practiceDetails, "privateService", null),
      province: _.get(this.practiceDetails, "provinceId") || "",
    };
    this.practiceDetailsForm.patchValue(this.filteredPracticeData);
    if (this.isProvinceDisabled) {
      this.practiceDetailsForm.controls.province.disable();
      this.practiceDetailsForm.controls.agentId.disable();
      //this.practiceDetailsForm.controls.agentPassword.disable();        
    }
    this.changePracticeMethod();
  }

  getPrivateServices() {
    let services = _.get(this.practiceDetails, "privateService", []);

    if (_.isNull(services)) {
      services = [];
    }

    if (services.length) {
      this.privateServices = _.cloneDeep(services);
      this.setIdToPrivateServices();
      this.localStorageService.setItem("privateServices", this.privateServices);
    } else {
      // Get Private services from local
      this.privateServices =
        this.localStorageService.getItem("privateServices") || [];
    }
  }
  public includeTaxValue: boolean = false;
  includeTaxChange(e){
    this.includeTaxValue = e.target.checked;
  }

  savePrivateService(serviceName, consultationFee) {
    serviceName.value = _.trim(serviceName.value);
    consultationFee.value = _.trim(consultationFee.value);

    if (
      !serviceName.value ||
      !consultationFee.value ||
      !this.isUniqueService(serviceName.value)
    ) {
      return;
    }

    // Storing Service in local
    this.localStorageService.setItem("privateServices", [
      ...this.privateServices,
      {
        tempId: moment().valueOf(),
        serviceName: serviceName.value,
        consultationFee: +consultationFee.value,
        includeTax: this.includeTaxValue,
        id:this.dbId
      },
    ]);
    this.privateServices =
      this.localStorageService.getItem("privateServices") || [];

    // Resetting input value
    serviceName.value = "";
    consultationFee.value = "";
    this.includeTaxValue = false;
    this.serviceid = "";
    this.dbId = "";
  }

  isUniqueService(serviceName) {
    const filteredService = this.privateServices.filter(
      (service) => service.serviceName === serviceName
    );

    if (filteredService.length) {
      this.duplicateService = true;
      return false;
    }
    this.duplicateService = false;
    return true;
  }
public dbId;
  updatePrivateService(id) {
    this.privateServices = this.localStorageService.getItem("privateServices");

    const index = this.privateServices.findIndex((item) => item.tempId == id);
    const service = this.privateServices[index];

    this.selectedService.nativeElement.value = service.serviceName;
    this.selectedConsultation.nativeElement.value = service.consultationFee;
    this.includeTaxValue = service.includeTax;
    this.dbId = service.id
    this.serviceid = service.tempId; 

    this.privateServices.splice(index, 1);
  }

  deletePrivateService(id) {
    const index = this.privateServices.findIndex((service) => service.tempId == id);
    this.privateServices.splice(index, 1);
    this.localStorageService.setItem("privateServices", this.privateServices);
  }

  onBillingChecked(e) {
    if (e.target.checked) {
      this.onBillingCheck = true;
      this.matDialog
        .open(FaxModalComponent)
        .afterClosed()
        .subscribe((result) => {
          if (!result) {
            this.practiceDetailsForm.controls.enableDefaultBilling.setValue(
              false
            );
          }
        });
      return;
    }
    this.onBillingCheck = false;
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  saveForm() {
    this.formSubmitted = true;
    if (this.isValidForm()) {
      return false;
    }
    if (!this.passAdditionalValidation()) {
      return false;
    }
    let bodyObj = this.createBodyObject();
    if(bodyObj.accountType == "personal"){
      bodyObj.accountType = 1
    }else{
      bodyObj.accountType = 2
    }
    console.log(bodyObj);
    bodyObj.patientCount = parseInt(bodyObj.patientCount);
    this.onboardService
      .savePracticeDetails(bodyObj, this.userData["doctorId"])
      .subscribe(
        (res: any) => this.handleSuccess(res),
        (err: any) => this.handleError(err)
      );
  }

  isValidForm() {
    return _.get(this.practiceDetailsForm, "invalid");
  }

  passAdditionalValidation() {
    const practiceMethod = this.practiceDetailsForm.controls.practiceMethod
      .value;
    const specialtyType = this.practiceDetailsForm.controls.specialtyType.value;
    const specialties = this.practiceDetailsForm.controls.specialist.value;
    const province = this.practiceDetailsForm.controls.province.value;

    if (
      (+practiceMethod == 1 || +practiceMethod == 3) &&
      !this.privateServices.length
    ) {
      return false;
    }
    if (specialtyType == 2 && specialties && !specialties.length) {
      return false;
    }
    if (!province) {
      return false;
    }
    return true;
  }

  createBodyObject() {
    return {
      specialtyType: +_.get(
        this.practiceDetailsForm,
        "controls.specialtyType.value"
      ),
      specialist: this.getSpecialistIdArray(),
      practiceNumber: _.get(
        this.practiceDetailsForm,
        "controls.practiceNumber.value"
      ),
      agentId: _.get(
        this.practiceDetailsForm,
        "controls.agentId.value"
      ),
      agentPassword: _.get(
        this.practiceDetailsForm,
        "controls.agentPassword.value"
      ),
      onlineRamqId: _.get(
        this.practiceDetailsForm,
        "controls.onlineRamqId.value"
      ),
      onlineRamqPassword: _.get(
        this.practiceDetailsForm,
        "controls.onlineRamqPassword.value"
      ),
      patientCount: _.get(
        this.practiceDetailsForm,
        "controls.patientCount.value"
      ),
      accountType: _.get(
        this.practiceDetailsForm,
        "controls.accountType.value"
      ),
      adminAccNo:_.get(
        this.practiceDetailsForm,
        "controls.adminAccNo.value"
      ),
      practiceMethod: +_.get(
        this.practiceDetailsForm,
        "controls.practiceMethod.value"
      ),
      enableDefaultBilling: _.get(
        this.practiceDetailsForm,
        "controls.enableDefaultBilling.value"
      ),
      govtIdFrontImage: _.trim(
        _.get(this.practiceDetailsForm.get("govtIdFrontImage"), "value.url")
      ),
      privateServices: this.getPrivateServicesToSend(),
      provinceId: +_.get(this.practiceDetailsForm, "controls.province.value"),
      isEditMode: this.isEditMode,
    };
  }

  navigateToNextPage() {
    this.router.navigate(["step3"], { relativeTo: this.route.parent });
  }

  handleSuccess(res: any) {
    this.toaster.showSuccess(
      this.vref,
      "Success",
      MESSAGES.UPDATED_SUCCESSFULLY
    );
    if (!this.isEditMode) {
      const userToken = res.headers.get("Access-Token") || "";
      this.localStorageService.setAccessToken(userToken);
      this.userData["onboardStep"] = 3;
      this.localStorageService.setItem("userData", this.userData);
      setTimeout(() => {
        this.router.navigateByUrl("auth/onboard/step3");
      }, common.responseTimeout);
    }
  }

  handleError(err: any) {
    this.errorHandler.handleError(err, this.vref);
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.practiceDetailsForm.hasError(type, [key]);
  }

  getSpecialistIdArray() {
    const specialistSelected = _.get(
      this.practiceDetailsForm,
      "controls.specialist.value",
      []
    );
    const idArray = [];

    specialistSelected.forEach((ele) => {
      if (_.isObject(ele)) {
        idArray.push(+ele.id);
      } else {
        idArray.push(ele);
      }
    });
    return idArray;
  }

  getPrivateServicesToSend() {
    return this.privateServices.map((service) => {
      return _.omit(service, ["tempId"]);
    });
  }

  setIdToPrivateServices() {
    this.privateServices = this.privateServices.map((service) => {
      return {
        tempId: service.id,
        ...service,
      };
    });
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
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.prefillSavedData();
    this.localStorageService.removeItem("privateServices");
    this.privateServices = this.practiceDetails.privateService || [];

    this.selectedService.nativeElement.value = "";
    this.selectedConsultation.nativeElement.value = "";
    this.includeTaxValue = false;
    this.serviceid = ""; 

    this.getPrivateServices();
  }

  ngOnDestroy() {
    this.localStorageService.removeItem("privateServices");
  }

  ramqRenew(){
    this.onboardService.sendOtponRamq().subscribe(
      (res) => {
        this.matDialog
        .open(OtpModalComponent, {
          data: {
            doctorId:this.userData["doctorId"],
            agentId: this.practiceDetails.agentId,
            agentPassword: this.practiceDetails.agentPassword,
          },
        })
        .afterClosed()
        .subscribe((result) => {
          if (!result) {
            console.log("success")
          }
        });
        this.toaster.showSuccess(
          this.vref,
          "Verification Code Sent",
          "VERIFICATION_CODE_SENT_TO_YOUR_REGISTERED_EMAIL"
        );
      },
      (err: any) => this.errorHandler.handleError(err, this.vref)
    );
  }

  showHideRamqPass(type){
    this.ramQPasswordType = type
  }

  viewLinkStatus(viewObj){
    if(viewObj.columnName == 'govt_id_front_image'){
      this.view_govt_id_front_image = true;
    }
  }

  uploadCardImage(columnName,userType){
    let body = {
      userType: userType,
      imageComponentName: columnName,
      userId: this.userData['userId'],
      email:this.userData['email'],
      phoneNumber:this.userData['phoneNumber']
    };
    this.onboardService.imageNotification(body).subscribe(
      (res: any) => {
        if(res.success){
          if(columnName == 'govt_id_front_image'){
            this.view_govt_id_front_image = true;
          }
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
  
  }

  verifyImg(columnName,userType){
    let body = {
      userId: this.userData['userId'],
      userType: userType,
      imageComponentName: columnName
    };
    this.onboardService.verifiyImage(body).subscribe(
      (res: any) => {
        let verifyData = res.body[0];
        this.verifyResponse(columnName,verifyData);
      }
    );
  }

  openImageStatus(status){
    this.imageView = false;
  }
  
  public imageView:boolean=false
  public fileSrc:any;
  verifyResponse(columnName,response){
    if(columnName == 'govt_id_front_image'){
      if(response && response.status == "received"){
        this.practiceDetailsForm.patchValue({
          govtIdFrontImage: {
            url: response.imagUrl,
          },
        });
        this.govt_id_front_image_error = false;
        this.imageView = true;
        this.fileSrc = response.imagUrl;
      } else {
        this.govt_id_front_image_error = true;
      }
    }      
 
  }

}
