/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { ErrorService } from "../../utils/service/error.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { UserService } from "../../utils/service/user.service";
import { AuthorizationService } from "../authorization.service";
import { AUTH } from "../constants/auth";
import { RESPONSES } from "../constants/response";
import { TranslaterService } from "../../utils/service/translater.service";
import { MessagingService } from "../../utils/service/messaging.service";
import { OnboardService } from "../../utils/component/details/onboard.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-otp",
  templateUrl: "./otp.component.html",
  styleUrls: ["./otp.component.scss"],
})
export class OtpComponent implements OnInit {
  public otpForm: FormGroup;
  public timerVal: number;
  public disableResend: boolean = true;
  public disableTimer: boolean = false;
  public formSubmitted: boolean = false;
  public navigateTo: string;
  public userId: any;
  public token: any;
  public action: any;
  public tenMinuteTimer = { leftTime: 10 * 60, format: "mm:ss", demand: false };
  public oneMinuteTimer = { leftTime: 60, format: "mm:ss", demand: false };
  public routeChangeSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private router: Router,
    private onboardService: OnboardService,
    private route: ActivatedRoute,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private translater: TranslaterService,
    private messageService: MessagingService
  ) {
    this.routeChangeSubscription = this.route.queryParams.subscribe((param) => {
      if (param.token) {
        this.token = param.token;
        this.action = param.action;
        this.navigateTo = param.navigateTo;
      } else {
        this.router.navigate(["/auth/login"]);
      }
    });
  }

  ngOnInit() {
    this.createFormBuilder();
    this.translater.TranslationAsPerSelection();
  }

  /**
   * Function to create form group
   */
  createFormBuilder() {
    this.otpForm = this.formBuilder.group({
      digit1: [null, [Validators.required, this.authService.trimEmptyCheck()]],
      digit2: [null, [Validators.required, this.authService.trimEmptyCheck()]],
      digit3: [null, [Validators.required, this.authService.trimEmptyCheck()]],
      digit4: [null, [Validators.required, this.authService.trimEmptyCheck()]],
      digit5: [null, [Validators.required, this.authService.trimEmptyCheck()]],
      digit6: [null, [Validators.required, this.authService.trimEmptyCheck()]],
    });
  }

  /**
   * Function to start resendOtp timer
   */

  handleTenMinuteTimer(counter) {
    if (counter.left == 0) {
      this.disableResend = false;
    }
  }

  handleOneMinuteTimer(counter) {
    if (counter.left == 0) {
      this.disableResend = false;
    }
  }
  /**
   * Function to check for error
   */

  hasError(type: string, key: string) {
    return this.formSubmitted && this.otpForm.hasError(type, [key]);
  }

  /**
   * Function to resend otp
   */
  resendOtp() {
    this.disableResend = true;
    this.disableTimer = false;
    this.authService.resendOtp(this.token, this.action).subscribe(
      (res) => {
        this.resetForm();
        this.toaster.showSuccess(this.vref, "Otp Sent", RESPONSES.OTP_SENT);
      },
      (err: any) => this.handleError(err)
    );
  }

  getOtp() {
    let otp = "";
    for (let i = 1; i <= 6; i++) {
      otp += this.otpForm.controls[`digit${i}`].value || "";
    }
    return otp;
  }

  handleError(err) {
    this.disableResend = false;
    this.resetForm();
    this.toaster.showError(
      this.vref,
      "Error",
      _.get(err, "error.message", RESPONSES.UNEXPECTED_ERROR)
    );
  }

  updateNavigateTo(resetToken) {
    if (this.navigateTo && resetToken) {
      this.navigateTo = `${this.navigateTo.replace(
        /'/g,
        ""
      )}?token=${resetToken}`;
    }
  }

  /**
   * Function to save form
   */
  submitOtp() {
    this.formSubmitted = true;
    if (this.otpForm.invalid) {
      return;
    }
    const otp = this.getOtp();
    const action = this.action;
    const token = this.token;
    let bodyObj = {
      otp: otp,
      action: this.action,
    };
    this.authService.verifyOtp(bodyObj, token).subscribe(
      (res) => {
        const response = res.body?.data[0];
        const authToken = res.headers?.get("Access-Token") || "AUTHTOKEN";
        this.toaster.showSuccess(
          this.vref,
          "Otp Verified",
          RESPONSES.OTP_VERIFIED
        );
        if (action == "lg") {
          const userData = this.localStorageService.getItem("userData") || {};
          userData.isOtpVerified = true;
          this.localStorageService.setItem("userData", {
            ...response,
            ...userData,
          });
          this.localStorageService.setItem("language", response.preferredLanguage);
          this.localStorageService.setAccessToken(authToken);
          if (this.localStorageService.getItem("x-id")) {
            this.messageService.requestInboxPermission();
          }
          this.authService.getProfileManagerData(response.userId).subscribe((res) => {
            const userData = this.localStorageService.getItem("userData") || {};
            this.localStorageService.setItem("userData", {
              ...res.data,
              ...userData,
            });
          });
          this.getSubscriptionStatus(response.userId);
        }
        if (action == "fp") {
          this.updateNavigateTo(response.resetToken);
          this.authService.getProfileManagerData(response.userId).subscribe((res) => {
            const userData = this.localStorageService.getItem("userData") || {};
            this.localStorageService.setItem("userData", {
              ...res.data,
              ...userData,
            });
          });
          this.getSubscriptionStatus(response.userId);
        }

      },
      (err) => {
        this.resetForm();
        this.handleError(err);
      }
    );
  }

  getSubscriptionStatus(userId){
    this.authService.getSubscriptionStatus(userId).subscribe((res) => {
      const userData = this.localStorageService.getItem("userData") || {};
      userData.isCalenderDeleteAllPopup = true;
      if(res && res.data && res.data[0] && res.data[0].subscriptionStatus){
        userData['subscriptionStatus'] = res.data[0].subscriptionStatus;
      } else {
        userData['subscriptionStatus'] = '';
      }
      this.localStorageService.setItem("userData", userData);
      this.authService.getTourStatus(userId).subscribe((res) => {
          this.localStorageService.setItem("tourFlag", JSON.stringify(res.introTour.introTour))
          setTimeout(() => {
            this.navigateToHomePage();
          }, 1000);
        });
    });
  }

  navigateToHomePage() {
    setTimeout(() => {
      this.router.navigateByUrl(this.navigateTo || "/feature");
    }, AUTH.RESPONSE_TIMEOUT);
  }

  resetForm() {
    this.otpForm.setValue({
      digit1: null,
      digit2: null,
      digit3: null,
      digit4: null,
      digit5: null,
      digit6: null,
    });
  }

  backNavigate() {
    this.router.navigate(["/auth/login"]);
  }

  ngOnDestroy() {
    this.authService.allowOtpAccess = false;
    if (this.routeChangeSubscription) {
      this.routeChangeSubscription.unsubscribe();
    }
  }
}
