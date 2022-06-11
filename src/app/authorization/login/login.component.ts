/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, ViewContainerRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { AuthorizationService } from "../authorization.service";
import { ErrorService } from "../../utils/service/error.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { TranslaterService } from "../../utils/service/translater.service";
import { RESPONSES } from "../constants/response";
import { AUTH } from "../constants/auth";
import { REGEX } from "../constants/regex";
@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public formSubmitted: boolean;
  public authToken: string;

  public emailVerified: boolean = false;

  public showEmailResend: boolean = false;
  public showLinkResend: boolean = false;
  public emailResendText: string;
  public verifyingEmail: string;
  public passwordType: string = "password";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToasterService,
    private localStorageService: LocalStorageService,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    this.createForm();
    this.fetchParams();
    this.translater.TranslationAsPerSelection();
  }

  /**
   * Function to get params from url
   */
  fetchParams() {
    this.route.queryParams.subscribe((params) => {
      this.loginForm.get("email").setValue(params.email);
      this.initializeConditions();
      if (params.status && params.status == "200") {
        this.toaster.showSuccess(
          this.vref,
          "Success",
          RESPONSES.EMAIL_VERIFIED
        );
      } else if (params.status && params.status != "200") {
        this.handleEmailVerificationError(params);
      }
    });
  }

  /**
   * Function to handle email verification error
   */
  handleEmailVerificationError(err) {
    this.verifyingEmail = _.get(err, "email", null);
    this.showEmailResend = true;
    this.showLinkResend = true;
    const status = _.get(err, "status", null);
    if (status === "1400" || status === "1498") {
      this.showLinkResend = false;
    }
    if (status === "498" || status === "1498") {
      this.emailResendText = RESPONSES.EXPIRED_LINK;
    }
    if (status === "400" || status === "1400") {
      this.emailResendText = RESPONSES.TAMPERED_LINK;
    }
  }

  /**
   * Function to verify user email
   */

  verifyEmail() {
    if (!this.authToken) return;

    let bodyObj = {
      token: this.authToken,
    };

    this.authService.verifyEmail(bodyObj).subscribe(
      (res) => {
        this.emailVerified = true;
        let parsedRes = _.attempt(JSON.parse.bind(null, res["_body"]));
        let parsedHeaders = _.invoke(res.headers, "toJSON");
        this.toaster.showSuccess(
          this.vref,
          "Email Verified",
          _.get(parsedRes, "message")
        );
        this.loginForm
          .get("email")
          .setValue(_.get(parsedHeaders, "verifying-email[0]", null));
      },
      (err) =>
        this.errorService.handleError(
          err,
          this.vref,
          this.handleEmailVerificationError.bind(this)
        )
    );
  }

  /**
   * Function to create form builder
   */
  createForm() {
    this.loginForm = this.formBuilder.group({
      email: [
        null,
        [
          Validators.required,
          Validators.pattern(REGEX.EMAIL),
          this.authService.trimEmptyCheck(),
        ],
      ],
      password: [
        null,
        [Validators.required, this.authService.trimEmptyCheck()],
      ],
    });
  }

  /**
   * Function to check for error
   */
  hasError(type: string, key: string) {
    return this.formSubmitted && this.loginForm.hasError(type, [key]);
  }

  /**
   * Function to create body Object
   */
  createBodyObject() {
    let bodyObj = {
      email: _.trim(_.get(this.loginForm.get("email"), "value")),
      password: _.get(this.loginForm.get("password"), "value"),
    };
    return bodyObj;
  }

  /**
   * Function called for forget password
   */
  forgotPassword() {
    this.router.navigateByUrl(`/auth/forgot-password`);
  }

  /**
   * Function to handle login success
   */
  handleLoginSuccess(res: any) {
    this.localStorageService.setItem("language", res.body.data[0].preferredLanguage);
    res.body.data[0].onboardStep = +res.body.data[0].onboardStep + 1;
    let onboard = res.body.data[0].onboardStep;
    this.setLocalStorageData(res, onboard);
    this.authService.getTourStatus(res.body.data[0].userId).subscribe((tourRes) => {
      this.localStorageService.setItem("tourFlag", JSON.stringify(tourRes.introTour.introTour));
      if (onboard !== 4) {
        onboard = onboard > 3 ? 1 : onboard;
        this.router.navigateByUrl(`/auth/onboard/step${onboard}`);
        return;
      }
      const userToken = res.headers.get("Access-Token") || "AUTHTOKEN";
      this.toaster.showSuccess(this.vref, "Otp Sent", RESPONSES.OTP_SENT);
      setTimeout(() => {
        this.router.navigateByUrl(
          `/auth/verify-otp?token=${userToken}&action=lg`
        );
      }, AUTH.RESPONSE_TIMEOUT);
    });
    
  }

  setLocalStorageData(res, onboard) {
    const userToken = res.headers.get("Access-Token") || "AUTHTOKEN";
    this.localStorageService.setItem("onboardStep", onboard + "");
    this.localStorageService.setItem("userData", res.body.data[0]);
    this.localStorageService.setAccessToken(userToken);
  }

  /**
   * Function to handle login error callback
   */
  loginErrorHandler(errObject: any) {
    if (_.get(errObject, "error.data[0].isEmailVerified", null) === false) {
      this.showEmailResend = true;
      this.showLinkResend = true;
      this.emailResendText = RESPONSES.RESEND_EMAIL;
      this.verifyingEmail = _.get(errObject, "error.data[0].email", null);
      return;
    }
    this.toaster.showError(
      this.vref,
      "Error",
      _.get(errObject, "error.message", RESPONSES.UNEXPECTED_ERROR)
    );
  }

  /**
   * Function to resend verification email
   */
  resendVerification() {
    if (!this.verifyEmail) {
      return;
    }

    let bodyObj = {
      email: this.verifyingEmail,
    };

    this.authService.resendEmail(bodyObj).subscribe(
      (res) => {
        this.initializeConditions();
        this.toaster.showSuccess(this.vref, "SUCCESS", RESPONSES.EMAIL_SENT);
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  /**
   * Function to initialize login form conditions
   */
  initializeConditions() {
    this.emailVerified = false;
    this.showEmailResend = false;
    this.showLinkResend = false;
    this.verifyingEmail = null;
    this.emailResendText = null;
  }

  /**
   * Function to login patient
   */
  login() {
    this.formSubmitted = true;
    if (_.get(this.loginForm, "invalid")) {
      return false;
    }
    this.initializeConditions();

    let bodyObj: Object = this.createBodyObject();
    bodyObj["user"] = 2;
    this.authService.login(bodyObj).subscribe(
      (res) => {
        this.handleLoginSuccess(res);
      },
      (err) => {
        if(err.error.httpcode == 401){
          this.loginErrorHandler(err);
        } else {
          err.error.message = RESPONSES.EMAIL_PASSWORD_INCORRECT;
          this.loginErrorHandler(err);
        }
      }
    );
  }

  showHidePass(type) {
    this.passwordType = type;
  }
  
  ngOnDestroy() {
    window.location.reload();
  }
}
