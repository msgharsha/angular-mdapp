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
import { ToasterService } from "../../utils/service/toaster.service";
import { UserService } from "../../utils/service/user.service";
import { AuthorizationService } from "../authorization.service";
import { REGEX } from "../constants/regex";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  public formSubmitted: boolean = false;
  public passwordRegex: RegExp;
  public token: string;
  public passwordType: string = "password";
  public passwordTypeConfirm: string = "password";
  public check1Num: boolean;
  public check1Upper: boolean;
  public check1SpecialChar: boolean;
  public checkLength: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) {
    this.passwordRegex = REGEX.PASSWORD;
    this.activatedRoute.queryParams.subscribe((param) => {
      if (param.token) {
        this.token = param.token;
      } else {
        this.router.navigate(["/auth/login"]);
      }
    });
  }

  ngOnInit() {
    this.createForm();
    this.resetPasswordForm.controls.newPwd.valueChanges.subscribe((res) => {
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
  createForm() {
    this.resetPasswordForm = this.formBuilder.group(
      {
        newPwd: [
          null,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(this.passwordRegex),
          ],
        ],
        confirmPwd: [null, [Validators.required]],
      },
      { validator: this.isPasswordSame() }
    );
  }

  /**
   * Function to compare password
   */

  isPasswordSame() {
    return (input: any) => {
      return _.get(this.resetPasswordForm, "controls.newPwd.value") ===
        _.get(this.resetPasswordForm, "controls.confirmPwd.value")
        ? null
        : {
            match: {
              valid: false,
            },
          };
    };
  }

  /**
   * Function to go to reset password screen
   */
  resetPassword() {
    this.formSubmitted = true;
    if (this.resetPasswordForm.invalid) {
      return false;
    }

    let body = {
      token: this.token,
      password: this.resetPasswordForm.get("newPwd").value,
    };

    this.authService.resetPassword(body).subscribe(
      (res) => {
        const Body = res;
        this.toaster.showSuccess(this.vref, "Success", Body.message);
        this.formSubmitted = false;
        this.resetPasswordForm.reset();
        this.userService.logout();
        setTimeout(() => {
          this.router.navigateByUrl("auth/login");
        }, 2000);
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  /**
   * Function to check for error
   */
  hasError(type: string, key: string) {
    return this.formSubmitted && this.resetPasswordForm.hasError(type, [key]);
  }

  backNavigate() {
    this.router.navigate(["/auth/login"]);
  }

  showHidePass(type) {
    this.passwordType = type;
  }

  showHidePassConfirm(type) {
    this.passwordTypeConfirm = type;
  }
}
