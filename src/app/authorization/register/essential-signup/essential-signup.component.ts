/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthorizationService } from "../../authorization.service";
import { ErrorService } from "../../../utils/service/error.service";
import { DynamicOtpService } from "../../../utils/service/dynamic-otp.service";
import { ESSENTIAL_SIGNUP } from "../../authorization.constants";
import { TranslaterService } from "../../../utils/service/translater.service";
import * as _ from "lodash";
import { REGEX } from "../../constants/regex";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./essential-signup.component.html",
  styleUrls: ["./essential-signup.component.scss"],
})
export class EssentialSignUpComponent implements OnInit {
  public registerForm: FormGroup;
  public formSubmitted: boolean = false;
  public showLinkSentMessage: boolean = false;
  public linkSentMessage: string = ESSENTIAL_SIGNUP.USER_REGISTERED.MESSAGE;
  check1Num: boolean;
  check1Upper: boolean;
  check1SpecialChar: boolean;
  checkLength: boolean;
  public passwordType: string = "password";
  public passwordTypeConfirm: string = "password";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private router: Router,
    private translation: TranslaterService,
    public dynamicOtp: DynamicOtpService
  ) {}

  ngOnInit() {
    this.createFormBuilder();
    this.translation.TranslationAsPerSelection();
    this.registerForm.controls.password.valueChanges.subscribe((res) => {
      if (res.length < 8) {
        this.checkLength = false;
      } else {
        this.checkLength = true;
      }
      if (res.match("(?=.*[0-9]){1,50}")) {
        this.check1Num = true;
      } else {
        this.check1Num = false;
      }
      if (res.match("(?=.*[A-Z]){1,50}")) {
        this.check1Upper = true;
      } else {
        this.check1Upper = false;
      }
      if (res.match("(?=.*[$@$!%*?#.^+=&]){1,50}")) {
        this.check1SpecialChar = true;
      } else {
        this.check1SpecialChar = false;
      }
    });
  }

  /**
   * Function to create form builder
   */
  createFormBuilder() {
    this.registerForm = this.formBuilder.group(
      {
        email: [null, [Validators.required, Validators.pattern(REGEX.EMAIL)]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(REGEX.PASSWORD),
          ],
        ],
        confirmPassword: [null, [Validators.required]],
      },
      { validator: this.isPasswordSame() }
    );
  }

  /**
   * Function to compare password
   */
  isPasswordSame() {
    return (input: any) => {
      return _.get(this.registerForm, "controls.password.value") ===
        _.get(this.registerForm, "controls.confirmPassword.value")
        ? null
        : {
            match: {
              valid: false,
            },
          };
    };
  }

  /**
   * Function to create post body object
   */
  createBodyObject() {
    let bodyObj = {
      email: _.trim(_.get(this.registerForm.get("email"), "value")),
      password: _.get(this.registerForm.get("password"), "value"),
      isPractice: true,
    };

    return bodyObj;
  }

  /**
   * Function to handle response success
   */

  handleSuccess() {
    this.showLinkSentMessage = true;
  }

  /**
   * Function to handle error
   */
  handleError(err) {
    this.errorHandler.handleError(err, this.vref);
  }

  /**
   * Function to check whether key has error
   */
  hasError(errorType: string, key: string) {
    return this.formSubmitted && this.registerForm.hasError(errorType, [key]);
  }

  /**
   * Function to save form
   */
  saveForm() {
    this.formSubmitted = true;
    if (_.get(this.registerForm, "invalid")) {
      return false;
    }
    let bodyObj = this.createBodyObject();
    this.authService.essentialSignUp(bodyObj).subscribe(
      (res) => {
        this.handleSuccess();
      },
      (err) => this.handleError(err)
    );
  }

  backNavigate() {
    this.router.navigateByUrl("auth/login");
  }

  showHidePass(type) {
    this.passwordType = type;
  }

  showHidePassConfirm(type) {
    this.passwordTypeConfirm = type;
  }
}
