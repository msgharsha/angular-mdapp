import { Component, Inject, OnInit, ViewContainerRef } from "@angular/core";
import { RepositoryService } from "../repository.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { OnboardService } from "../../utils/component/details/onboard.service";
import { MESSAGES } from "../../utils/component/details/constants/messages";
import { ToasterService } from "../../../../src/app/utils/service/toaster.service";
import { TranslaterService } from "../../utils/service/translater.service";
import { ErrorService } from "../../../../src/app/utils/service/error.service";
//import { DialogModalComponent } from "../../utils/component/cancel-modal/cancel-modal.component";
import { TranslateService } from "@ngx-translate/core";
import { REGEX } from "../../authorization/constants/regex";
import { MatDialog } from "@angular/material/dialog";
import { RESPONSES } from "../../constants/response";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: "app-my-addressbook",
  templateUrl: "./my-addressbook.component.html",
  styleUrls: ["./my-addressbook.component.scss"],
})
export class MyAddressbookComponent implements OnInit {
  public personalDetailsForm: FormGroup;
  public formSubmitted: boolean = false;
  public userData: {};
  public savePersonalDetailSubs: Subscription;
  public updatePersonalDetailSubs: Subscription;
  public uniqueKeySubs: Subscription;
  public personalDetails: any;
  constructor(
    private formBuilder: FormBuilder,
    private errorHandler: ErrorService,
    private repositoryService: RepositoryService,
    private localStorageService: LocalStorageService,
    private onboardService: OnboardService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private matDialog: MatDialog,
    private translaterService: TranslaterService,
    private traslate: TranslateService,
    private dialogRef: MatDialogRef<MyAddressbookComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    this.userData = this.localStorageService.getItem("userData") || {};
    this.createFormBuilder();
  }

  ngOnInit(): void {

  }

  handleError(err: any) {
    this.errorHandler.handleError(err, this.vref);
  }

  createFormBuilder() {
    this.personalDetailsForm = this.formBuilder.group({
      labName: [
        null,
        [
          Validators.required,
          this.repositoryService.trimEmptyCheck(),
        ],
      ],
      contactPerson: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          this.repositoryService.trimEmptyCheck(),
        ],
      ],
      phoneNumber: [
        null,
        [Validators.required, Validators.minLength(10)],
      ],
      defaultCommunication: ["email", [Validators.required]],
      email: ["", [Validators.required, Validators.pattern(REGEX.EMAIL)]],
      fax: [null],
      address: ["", [Validators.required]],
    });
    if (this.data) {
      this.personalDetails = this.data[0];
      this.prefillSavedData();
    }
  }

  changeDefaultCom() {
    this.personalDetailsForm.controls['email'].setValue('');
    this.personalDetailsForm.controls['fax'].setValue('');
    let SelectedValue = this.personalDetailsForm.get('defaultCommunication').value;
    if (SelectedValue == 'email') {
      this.personalDetailsForm.get('fax').clearValidators();
      this.personalDetailsForm.get('email').setValidators([Validators.required, Validators.pattern(REGEX.EMAIL)]);
      this.personalDetailsForm.get('email').updateValueAndValidity();
      this.personalDetailsForm.get('fax').updateValueAndValidity();
    } else {
      this.personalDetailsForm.get('email').clearValidators();
      this.personalDetailsForm.get('fax').setValidators([Validators.required, Validators.minLength(10)]);
      this.personalDetailsForm.get('fax').updateValueAndValidity();
      this.personalDetailsForm.get('email').updateValueAndValidity();

    }
  }

  prefillSavedData() {
    let filteredPersonalData = {
      labName: _.get(this.personalDetails, "labName", null),
      contactPerson: _.get(this.personalDetails, "contactPerson", null),
      email: _.get(this.personalDetails, "email", null),
      defaultCommunication: _.get(this.personalDetails, "defaultCommunication", null),
      fax: _.get(this.personalDetails, "fax", null),
      phoneNumber: _.get(this.personalDetails, "phoneNumber", null),
      address: {
        addressLine1: _.get(this.personalDetails, "addressLine1", null),
        addressLine2: _.get(this.personalDetails, "addressLine2", "") || "",
        province: _.get(this.personalDetails, "province", null),
        city: _.get(this.personalDetails, "city", null),
        postalCode: _.get(this.personalDetails, "postalCode", null),
        lat: _.get(this.personalDetails, "lat", null),
        lng: _.get(this.personalDetails, "lng", null),
      },
    };
    this.personalDetailsForm.patchValue(filteredPersonalData);

  }

  onReset() {
    this.dialogRef.close(true);
    // const dialogRef = this.matDialog.open(DialogModalComponent, {
    //   height: "auto",
    //   width: "350px",
    //   data: {
    //     message: "RESET_MSG",
    //   },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.prefillSavedData();
    //     this.dialogRef.close(true);
    //   }
    // });
  }


  saveForm() {
    this.formSubmitted = true;
    const address = this.personalDetailsForm.controls.address.value;
    delete address.clinicFax;
    delete address.clinicName;
    if (!this.onboardService.isValidAddressForm(address, ["addressLine2"])) {
      return false;
    }
    if (this.isValidForm()) {
      return false;
    }

    this.handleUniqueSuccess();
  }

  isValidForm() {
    return _.get(this.personalDetailsForm, "invalid");
  }

  createBodyObject() {
    return {
      doctorId: this.userData["doctorId"],
      labName: _.trim(
        _.get(this.personalDetailsForm, "controls.labName.value")
      ),
      contactPerson: _.trim(
        _.get(this.personalDetailsForm, "controls.contactPerson.value")
      ),
      email: _.trim(
        _.get(this.personalDetailsForm, "controls.email.value")
      ),
      fax: _.trim(
        _.get(this.personalDetailsForm, "controls.fax.value")
      ),
      defaultCommunication: _.get(
        this.personalDetailsForm,
        "controls.defaultCommunication.value"
      ),
      phoneNumber: _.trim(
        _.get(this.personalDetailsForm, "controls.phoneNumber.value")
      ),
      ..._.get(this.personalDetailsForm.get("address"), "value"),
    };
  }



  handleUniqueSuccess() {

    console.log(this.createBodyObject());

    this.dialogRef.close(this.createBodyObject());

    // if (!this.userData["doctorId"]) {
    //   this.savePersonalDetailSubs = this.onboardService
    //     .savePersonalDetails(this.createBodyObject())
    //     .subscribe(
    //       (response: any) => this.handleInsertSuccess(response),
    //       (err: any) => this.handleError(err)
    //     );
    //   return;
    // }

    // this.updatePersonalDetailSubs = this.onboardService
    //   .updatePersonalDetails(this.createBodyObject(), this.userData["doctorId"])
    //   .subscribe(
    //     (res: any) => this.handleUpdateSuccess(res),
    //     (err: any) => this.handleError(err)
    //   );
  }

  handleUniqueError() {
    this.toaster.showError(this.vref, "Error", RESPONSES.UNEXPECTED_ERROR);
  }

  handleInsertSuccess(res: any) {
    this.toaster.showSuccess(this.vref, "Success", MESSAGES.SAVED_SUCCESSFULLY);
  }

  handleUpdateSuccess(res: any) {
    this.toaster.showSuccess(
      this.vref,
      "Success",
      MESSAGES.UPDATED_SUCCESSFULLY
    );
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.personalDetailsForm.hasError(type, [key]);
  }




}
