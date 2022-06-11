/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { REGEX } from "../../../authorization/constants/regex";
import { MSG } from "../../../constants/messages";
import { ErrorService } from "../../../utils/service/error.service";
import { ToasterService } from "../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { TranslaterService } from "../../../utils/service/translater.service";
import { AccountService } from "../../account.service";
import { EventService } from "../../../utils/service/eventservice";

@Component({
  selector: "app-change-password",
  templateUrl: "change-password.component.html",
  styleUrls: ["change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  public changePasswordForm: FormGroup;
  public formSubmitted: Boolean = false;
  public userData: any;
  check1Num: boolean;
  check1Upper: boolean;
  check1SpecialChar: boolean;
  checkLength: boolean;

  constructor(
    private authService: AccountService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private eventService: EventService,
    private router: Router,
    private toaster: ToasterService,
    private translate: TranslaterService,
    private vref: ViewContainerRef
  ) {}

  ngOnInit() {
   
    window.scroll(0, 0);
    this.createForm();
    this.translate.TranslationAsPerSelection();
    this.userData = this.localStorageService.getItem("userData");
    if (
      this.userData.subscriptionStatus == "cancelled" ||
      this.userData.subscriptionStatus == "declined"
    ) {
      this.eventService.setSideNavDisableOnSubscription(true);
      this.router.navigateByUrl("accounts/subscription");
      return;
    } 

    this.changePasswordForm.controls.newPwd.valueChanges.subscribe((res) => {
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
    this.changePasswordForm = this.formBuilder.group(
      {
        oldPwd: [null, [Validators.required]],
        newPwd: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(REGEX.PASSWORD),
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
      return _.get(this.changePasswordForm, "controls.newPwd.value") ===
        _.get(this.changePasswordForm, "controls.confirmPwd.value")
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
  changePassword() {
    this.formSubmitted = true;
    if (this.changePasswordForm.invalid) {
      return false;
    }
    let body = {
      oldPassword: this.changePasswordForm.get("oldPwd").value,
      newPassword: this.changePasswordForm.get("newPwd").value,
    };
    this.authService.changePassword(body).subscribe(
      (res: any) => {
        this.toaster.showSuccess(
          this.vref,
          "SUCCESS",
          MSG.PASSWORD_CHANGED_SUCCESSFULLY
        );
        this.formSubmitted = false;
        this.changePasswordForm.reset();
        this.resetPasswordChecks();
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  /**
   * Function to check for error
   */
  hasError(type: string, key: string) {
    return this.formSubmitted && this.changePasswordForm.hasError(type, [key]);
  }

  /**
   * Function to go back to profile
   */
  goToMyProfile() {
    this.router.navigate(["/accounts"]);
  }

  resetPasswordChecks() {
    this.check1Num = false;
    this.check1Upper = false;
    this.check1SpecialChar = false;
    this.checkLength = false;
  }
}
