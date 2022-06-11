/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject,ViewContainerRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { AccountService } from "../../account.service";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { ErrorService } from "../../../utils/service/error.service";
import * as moment from "moment";
import * as _ from "lodash";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

@Component({
  selector: "add-edit-manager",
  templateUrl: "./add-edit-manager.component.html",
  styleUrls: ["./add-edit-manager.component.scss"],
})
export class AddEditManagerComponent implements OnInit {
  public personalDetailsForm: FormGroup;
  public formSubmitted: boolean;
  public dropDownSettings: IDropdownSettings;
  public personalDetails: any = {};
  public today = new Date();
  public maxDate = moment(this.today.setFullYear(this.today.getFullYear() - 14))
    .startOf("day")
    .format();
  public minDate = moment(
    this.today.setFullYear(this.today.getFullYear() - 100)
  ).format();
  public profileManager = [];
  public userData: {};

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private dialogRef: MatDialogRef<AddEditManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.getSubscriptionPlans();
    
  }

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem("userData") || {};
    this.initializeForm();
    this.setDropdownSettings();
  }

  getSubscriptionPlans() {
    this.accountService.getSubscriptionPlans().subscribe(
      (res) => {
        this.profileManager = JSON.parse(_.get(res, "data[0].user_profile_list", {}));
      },
      (err) => {
        this.errorHandler.handleError(err, this.vref);
      }
    );
  }


  initializeForm() {
    const emailRegEx = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
    this.personalDetailsForm = this.formBuilder.group({
      first_name: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          this.accountService.trimEmptyCheck(),
        ],
      ],
      middle_name: [null, [Validators.maxLength(10)]],
      last_name: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          this.accountService.trimEmptyCheck(),
        ],
      ],
      email: [null, [Validators.required,Validators.pattern(emailRegEx)]],
      phone_number: [null, [Validators.required, Validators.minLength(10)]],
      dob: [null, []],
      gender: ["male", [Validators.required]],
      profileManager: [null, [Validators.required]],
      address: ["", [Validators.required]],
    });
    if (this.data) {
      console.log(this.data);
      this.fillForm();
    }else{
      let userData = this.localStorageService.getItem('userData')
      let filteredPersonalData = {
       
        address: {
          clinicName: _.get(userData, "clinicName", null),
          addressLine1: _.get(userData, "addressLine1", null),
          addressLine2: userData.addressLine2 == 'null' ? '' : userData.addressLine2,
          province: _.get(userData, "province", null),
          city: _.get(userData, "city", null),
          postalCode: _.get(userData, "postalCode", null),
          lat: _.get(userData, "lat", null),
          lng: _.get(userData, "lng", null),
          
        },
      };
      this.personalDetailsForm.patchValue(filteredPersonalData);
    }
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

  fillForm() {
    this.personalDetails = this.data[0];
    this.personalDetailsForm.controls.email.disable(); 
    // this.personalDetailsForm.controls["first_name"].patchValue(
    //   this.data[0].first_name
    // );
    // this.personalDetailsForm.controls["middle_name"].patchValue(this.data[0].middle_name);
    let filteredPersonalData = {
      first_name: _.get(this.personalDetails, "first_name", null),
      middle_name: _.get(this.personalDetails, "middle_name", null),
      last_name: _.get(this.personalDetails, "last_name", null),
      phone_number: _.get(this.personalDetails, "phone_number", null),
      dob: _.get(this.personalDetails, "dob", null),
      email: _.get(this.personalDetails, "email", null),
      gender: _.get(this.personalDetails, "gender", "male"),
      profileManager:this.personalDetails.role,
      address: {
        clinicName: _.get(this.personalDetails, "clinic_name", null),
        addressLine1: _.get(this.personalDetails, "address_line1", null),
        addressLine2: this.personalDetails.address_line2 == 'null' ? '' : this.personalDetails.address_line2,
        province: _.get(this.personalDetails, "province", null),
        city: _.get(this.personalDetails, "city", null),
        postalCode: _.get(this.personalDetails, "postal_code", null),
        lat: _.get(this.personalDetails, "lat", null),
        lng: _.get(this.personalDetails, "lng", null),
        // clinicFax: _.get(this.personalDetails, "clinicFax", null),
        // clinicName: _.get(this.personalDetails, "clinicName", null),
      },
    };
    this.personalDetailsForm.patchValue(filteredPersonalData);
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.personalDetailsForm.hasError(type, [key]);
  }

  saveForm() {
    this.formSubmitted = true;
    if (!this.personalDetailsForm.valid) {
      return false;
    }
    let reqBody = this.createBodyObject();
    reqBody['address_line1'] = reqBody.addressLine1 ? reqBody.addressLine1 : 'null';
    reqBody['address_line2'] = reqBody.addressLine2 ? reqBody.addressline2 : '';
    reqBody['postal_code'] = reqBody.postalCode ? reqBody.postalCode : 'null';
    reqBody['province_id'] = this.userData['provinceId'];
    reqBody['clinic_name'] = reqBody.clinicName ? reqBody.clinicName : 'null';
    delete reqBody.clinicFax;
    delete reqBody.clinicName;
    delete reqBody.addressLine1;
    delete reqBody.addressLine2;
    delete reqBody.postalCode;
    console.log(reqBody);

    this.dialogRef.close(reqBody);
  }

  onReset() {
    this.dialogRef.close();
  }

  createBodyObject() {
    return {
      doctor_id: this.userData["doctorId"],
      user_id: this.userData["userId"],
      doctorName: this.userData["firstName"]+" "+this.userData["lastName"],
      first_name: _.trim(
        _.get(this.personalDetailsForm, "controls.first_name.value")
      ),
      middle_name: _.trim(
        _.get(this.personalDetailsForm, "controls.middle_name.value")
      ),
      last_name: _.trim(
        _.get(this.personalDetailsForm, "controls.last_name.value")
      ),
      email: _.trim(_.get(this.personalDetailsForm, "controls.email.value")),
      phone_number: _.trim(
        _.get(this.personalDetailsForm, "controls.phone_number.value")
      ),
      profileManager: _.get(this.personalDetailsForm, "controls.profileManager.value"),
      dob: _.get(this.personalDetailsForm, "controls.dob.value"),
      gender: _.get(this.personalDetailsForm, "controls.gender.value", "male"),
      ..._.get(this.personalDetailsForm.get("address"), "value"),
    };
  }

}
