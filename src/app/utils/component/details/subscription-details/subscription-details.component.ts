/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Input, OnInit, ViewContainerRef } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { common } from "../../../../constants/common";
import { ErrorService } from "../../../service/error.service";
import { LocalStorageService } from "../../../service/localStorage.service";
import { ToasterService } from "../../../service/toaster.service";
import { UserService } from "../../../service/user.service";
import { ConfirmModalComponent } from "./confirmation-modal/confirmation-modal.component";
import { OnboardService } from "../onboard.service";
import { DialogModalComponent } from "../../cancel-modal/cancel-modal.component";
import { MessagingService } from "../../../service/messaging.service";
import { TermsAndPolicyComponent } from "../../terms-and-policy/terms-and-policy.component";
import { CamImageConfirmComponent } from "../../camimageconfirm-modal/camimageconfirm-modal.component";
import * as moment from "moment";
import { EventService } from "../../../service/eventservice";

@Component({
  selector: "app-subscription-details",
  templateUrl: "./subscription-details.component.html",
  styleUrls: ["./subscription-details.component.scss"],
})
export class SubscriptionDetailsComponent implements OnInit {
  @Input() isOnboarding = false;
  public subscriptionDetailsForm: FormGroup;
  public formSubmitted: boolean = false;
  public userData: any;
  public subscriptionPlans: any;
  public subscriptionDetails: any = {};
  public cardDetails: any;
  public selectedPlan: any;
  public specimenUploadMsg = "SPECIMEN_UPLOADED_SUCCESS";
  public specimenRemoveMsg = "SPECIMEN_REMOVED_SUCCESS";
  public subscriptionActivationTillDate: any;
  public front_photo_error: boolean = false;
  public view_front_photo: boolean = false;
  maskedCard: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private onboardService: OnboardService,
    private errorHandler: ErrorService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private toaster: ToasterService,
    private userService: UserService,
    private eventService: EventService,
    private vref: ViewContainerRef,
    private messageService: MessagingService,
    private matDialog: MatDialog
  ) {
    this.subscribeRouterEvents();

  }

  subscribeRouterEvents() {
    this.activatedRoute.queryParams.subscribe((param) => {
      if (param.result) {
        let result = JSON.parse(param.result);
        if (result.for == "cardUpdate") {
          if (result.success) {
            this.toaster.showSuccess(
              this.vref,
              "Success",
              "CREDIT_CARD_UPDATED_SUCCESSFULLY"
            );
          } else {
            this.toaster.showError(
              this.vref,
              "",
              result.message || "UNEXPECTED_ERROR_OCCURRED"
            );
          }
        } else {
          if (
            result["PAYER_SETUP"] === "00" &&
            result["PMT_SETUP"] === "00" &&
            result["RESULT"] === "00"
          ) {
            this.toaster.showSuccess(
              this.vref,
              "Payment",
              "PAYMENT_DONE_SUCCESSFULLY"
            );
            this.updateLocalUserStatus();
            this.navigateToHomePage();
            this.messageService.requestInboxPermission();
          } else {
            this.toaster.showError(
              this.vref,
              "Payment",
              result.MESSAGE || "UNABLE_TO_PROCESS_PAYMENT"
            );
          }
        }
      }
    });
  }

  updateLocalUserStatus() {
    this.userData = this.localStorageService.getItem("userData");
    this.userData["onboardStep"] = 4;
    this.localStorageService.setItem("userData", this.userData);

    this.userService.userToken = this.localStorageService.getAccessToken();
  }

  ngOnInit() {
    this.setLocalStorageData();
    this.createFormBuilder();
    this.getSubscriptionPlans();

    if (!this.isOnboarding) {
      this.getOnboardStep3();
      this.getCardDetails();
      this.getselectedPlan();
    }
  }

  setLocalStorageData() {
    this.userData = this.localStorageService.getItem("userData");
    if ( this.userData.subscriptionStatus == "cancelled" || this.userData.subscriptionStatus == "declined" ) {
      this.eventService.setSideNavDisableOnSubscription(true);
    } 
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
    this.subscriptionDetailsForm = this.formBuilder.group({
      bankName: ["", [Validators.required, Validators.maxLength(60)]],
      transitNumber: [
        "",
        [Validators.required, Validators.minLength(5), Validators.maxLength(5)],
      ],
      institutionNumber: [
        "",
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
      ],
      accountNumber: [
        "",
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(7),
        ],
      ],
      specimenCheque: ["", [Validators.required, this.notNullUrl]],
      cardNumber: ["", []],
      cardName: ["", []],
      expiry: ["", []],
      TnCAccepted: [""],
    });

    if (this.isOnboarding) {
      this.subscriptionDetailsForm.controls["TnCAccepted"].setValidators(
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
      this.subscriptionDetailsForm.controls["TnCAccepted"].updateValueAndValidity();

    }
  }

  notNullUrl(control: FormControl) {
    return control.value && control.value.url ? null : { nullURL: true };
  }

  isValidExpiryDate(control: FormControl) {
    if (control.value && control.value.length == 4) {
      let month = +(control.value[0] + control.value[1]);
      let year = +(control.value[2] + control.value[3]);
      if (month > 0 && month <= 12 && year > 0 && year <= 50) {
        return null;
      }
    }
    if (!control.value) {
      return null;
    }
    return { invalidDate: true };
  }

  getSubscriptionPlans() {
    this.onboardService.getSubscriptionPlans().subscribe(
      (res) => {
        this.subscriptionPlans = _.get(res, "data[0]", {});
      },
      (err) => {
        this.errorHandler.handleError(err, this.vref);
      }
    );
  }

  getOnboardStep3() {
    if (this.userData["doctorId"]) {
      this.onboardService
        .getSubscriptionDetails(this.userData["doctorId"])
        .subscribe(
          (res) => {
            this.subscriptionDetails = res.data;
            this.prefillSavedData(this.subscriptionDetails);
          },
          (err) => {
            this.errorHandler.handleError(err, this.vref);
          }
        );
    }
  }

  getCardDetails() {
    this.onboardService.getCardDetails().subscribe(
      (res) => {
        this.cardDetails = res.data;
        var mainStr = this.cardDetails.cardNumber,
        vis = mainStr.slice(-4),
        countNum = '';

        for(var i = (mainStr.length)-4; i>0; i--){
            countNum += '*';
        }
        this.maskedCard = countNum+vis

      },
      (err) => {
        this.errorHandler.handleError(err, this.vref);
      }
    );
  }

  getselectedPlan() {
    this.onboardService.getselectedPlan().subscribe(
      (res) => {
        this.selectedPlan = res.data[0];
        this.subscriptionActivationTillDate = this.selectedPlan.activatedTill
          ? moment(this.selectedPlan.activatedTill).format("DD-MM-yyyy")
          : null;
      },
      (err) => {
        this.errorHandler.handleError(err, this.vref);
      }
    );
  }

  reactivate() {
    const dialogRef = this.matDialog.open(ConfirmModalComponent, {
      height: "auto",
      width: "400px",
      data: {
        message1: "PLEASE_CONFIRM_YOUR_SUBSCRIPTION_WHICH_WILL_COST",
        amount: this.subscriptionPlans.quarterlyAmount,
        message2: "FROM_YOUR_CREDIT_CARD",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onboardService.reactivateSubscription().subscribe(
          (res) => {
            this.toaster.showSuccess(
              this.vref,
              "Success",
              "SUBSCRIPTION_RESTARTED_SUCCESSFULLY"
            );
            this.getselectedPlan();
            this.getCardDetails();
          },
          (err) => {
            this.errorHandler.handleError(err, this.vref);
          }
        );
      }
    });
  }

  cancelPlan() {
    this.matDialog
      .open(DialogModalComponent, {
        data: {
          message: "CONFIRM_YOUR_CANCELLATION_OF_SUBSCRIPTION",
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.onboardService.cancelSubscription().subscribe(
            (res) => {
              this.toaster.showSuccess(
                this.vref,
                "Success",
                "SUBSCRIPTION_ENDED_SUCCESSFULLY"
              );
              this.getselectedPlan();
              this.getCardDetails();
            },
            (err) => {
              this.errorHandler.handleError(err, this.vref);
            }
          );
        }
      });
  }

  prefillSavedData(subscriptionDetails) {
    this.subscriptionDetailsForm.patchValue({
      transitNumber: _.get(subscriptionDetails, "transitNumber", ""),
      accountNumber: _.get(subscriptionDetails, "accountNumber", ""),
      bankName: _.get(subscriptionDetails, "bankName", ""),
      institutionNumber: _.get(subscriptionDetails, "institutionNumber", ""),
      specimenCheque: { url: _.get(subscriptionDetails, "specimenCheque", "") },
    });
  }

  saveForm() {
    this.formSubmitted = true;
    if (this.isValidForm()) {
      return false;
    }

    if (!this.isOnboarding) {
      this.onboardService
        .saveSubscriptionDetails(
          this.createBodyObject(),
          this.userData["doctorId"],
          this.userData["userId"]
        )
        .subscribe(
          (res) => this.handleUserData(res),
          (err) => this.errorHandler.handleError(err, this.vref)
        );

      return;
    }

    const dialogRef = this.matDialog.open(ConfirmModalComponent, {
      height: "auto",
      width: "400px",
      data: {
        message1: "PLEASE_CONFIRM_YOUR_SUBSCRIPTION_WHICH_WILL_COST",
        amount: this.subscriptionPlans.quarterlyAmount,
        message2: "FROM_YOUR_CREDIT_CARD",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onboardService
          .saveSubscriptionDetails(
            this.createBodyObject(),
            this.userData["doctorId"],
            this.userData["userId"]
          )
          .subscribe(
            (res) => this.handleUserData(res),
            (err) => this.errorHandler.handleError(err, this.vref)
          );
      }
    });
  }

  isNumber(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
  }

  isAlphaNumeric(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 97 && charCode <= 122) ||
      (charCode >= 65 && charCode <= 90)
    ) {
      return true;
    }
    return false;
  }

  createBodyObject() {
    let termsAndConditions = `${_.get(
      this.subscriptionDetailsForm,
      "controls.TnCAccepted.value",
      ""
    )}`;

    if (!this.isOnboarding) {
      termsAndConditions = "true";
    }

    return {
      transitNumber: _.get(
        this.subscriptionDetailsForm,
        "controls.transitNumber.value",
        ""
      ),
      bankName: _.get(
        this.subscriptionDetailsForm,
        "controls.bankName.value",
        ""
      ),
      accountNumber: _.get(
        this.subscriptionDetailsForm,
        "controls.accountNumber.value",
        ""
      ),
      institutionNumber: _.get(
        this.subscriptionDetailsForm,
        "controls.institutionNumber.value",
        ""
      ),
      specimenCheque: _.get(
        this.subscriptionDetailsForm,
        "controls.specimenCheque.value.url",
        ""
      ),
      TnCAccepted: termsAndConditions === "true" ? true : false,
    };
  }

  handleUserData(res: any) {
    this.view_front_photo = false;
    if (this.isOnboarding) {
      this.onboardService
        .getPaymentLink({
          planId: this.subscriptionPlans.planId,
          scheduleFrequency: "quarterly",
        })
        .subscribe(
          (response) => {
            window.location.href = response.hppPayByLink;
          },
          (err) => this.errorHandler.handleError(err, this.vref)
        );
    } else {
      this.toaster.showSuccess(this.vref, "Success", "UPDATED_SUCCESSFULLY");
    }
  }

  isValidForm() {
    return _.get(this.subscriptionDetailsForm, "invalid");
  }

  navigateToHomePage() {
    setTimeout(() => {
      this.router.navigateByUrl("/feature");
    }, common.responseTimeout);
  }

  hasError(type: string, key: string) {
    return (
      this.formSubmitted && this.subscriptionDetailsForm.hasError(type, [key])
    );
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
    this.prefillSavedData(this.subscriptionDetails);
  }

  editCard() {
    this.onboardService.updateCreditCard().subscribe(
      (res) => {
        window.location.href = res.hppLink;
      },
      (err) => this.toaster.showError(this.vref, "ERROR", err.error.message)
    );
  }

  getTermsCondition() {
    this.onboardService.getTermsCondition().subscribe(
      (res) => {
        const dialogRef = this.matDialog.open(TermsAndPolicyComponent, {
          height: "90vh",
          width: "1000px",
          data: {
            title: "TERMS_OF_USE",
            url: res.data.tsUrl,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.subscriptionDetailsForm.get("TnCAccepted").patchValue(result);
          } else if (result == false) {
            this.subscriptionDetailsForm.get("TnCAccepted").patchValue(result);
          }
        });
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  imageNotification(){

      let body = {
        userId: this.userData['userId'],
        userType: "doctor",
        imageComponentName: "specimen_cheque",
        email:this.userData['email'],
        phoneNumber:this.userData['phoneNumber']
        // phoneNumber:"9848866133",
        // email: "sriharsham@ibaseit.com"
      };
      this.onboardService.imageNotification(body).subscribe(
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
    
  }

  public imageView:boolean=false
  public fileSrc:any;
  verifyImg(){
    let body = {
      userId: this.userData['userId'],
      userType: "doctor",
      imageComponentName: "specimen_cheque"
    };
    this.onboardService.verifiyImage(body).subscribe(
      (res: any) => {
        console.log(res);
        let result = res.body[0];
        if(result && result.status == "received"){
          this.subscriptionDetails.specimenCheque = result.imagUrl
          this.subscriptionDetailsForm.patchValue({
            specimenCheque: { url: _.get(this.subscriptionDetails, "specimenCheque", "") },
          });
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
    if(viewObj.columnName == 'specimen_cheque'){
      this.view_front_photo = true
    }
  }
  openImageStatus(status){
    this.imageView = false;
  }

  ngOnDestroy() {}
}
