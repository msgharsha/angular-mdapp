/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ErrorService } from "../../utils/service/error.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { AuthorizationService } from "../authorization.service";
import { RESPONSES } from "../constants/response";
import { TranslaterService } from "../../utils/service/translater.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPasswordForm: FormGroup;
  public formSubmitted: boolean = false;
  public email: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    this.createForm();
    this.translater.TranslationAsPerSelection();
  }

  /**
   * Function to create form builder
   */
  createForm() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: [
        this.activatedRoute.snapshot.queryParams.email,
        [
          Validators.required,
          Validators.email,
          this.authService.trimEmptyCheck(),
        ],
      ],
    });
  }

  /**
   * Function to go to reset password screen
   */
  forgotPassword() {
    this.formSubmitted = true;
    if (this.forgotPasswordForm.invalid) {
      return false;
    }
    this.email = this.forgotPasswordForm.value.email;
    this.authService.forgotPassword(this.email).subscribe(
      (res) => {
        if (res.body.success) {
          let userToken = res.headers?.get("Access-Token") || "AUTHTOKEN";
          this.toaster.showSuccess(this.vref, "Otp Sent", RESPONSES.OTP_SENT);
          this.router.navigateByUrl(
            `/auth/verify-otp?token=${userToken}&action=fp&navigateTo='/auth/reset-password'`
          );
          this.formSubmitted = false;
          this.forgotPasswordForm.reset();
          return;
        }
        this.toaster.showError(this.vref, "Error", "EMAIL_DOES_NOT_EXIST");
      },
      (err) =>
        this.errorService.handleError(
          err,
          this.vref,
          err.error.message,
          "message"
        )
    );
  }

  /**
   * Function to check for error
   */
  hasError(type: string, key: string) {
    return this.formSubmitted && this.forgotPasswordForm.hasError(type, [key]);
  }

  backNavigate() {
    this.router.navigate(["/auth/login"]);
  }
}
