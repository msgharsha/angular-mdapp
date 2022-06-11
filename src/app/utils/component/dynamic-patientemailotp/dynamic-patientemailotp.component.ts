
import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthorizationService } from "../../../authorization/authorization.service";
import { TranslaterService } from "../../../utils/service/translater.service";
import { ToasterService } from "../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { DynamicOtpService } from "../../../utils/service/dynamic-otp.service";
import { RESPONSES } from "../../../authorization/constants/response";
import { OnboardService } from "../details/onboard.service";
@Component({
  selector: "app-dynamic-verify-patienemailtotp",
  templateUrl: "./dynamic-patientemailotp.component.html",
  styleUrls: ["./dynamic-patientemailotp.component.scss"],
})
export class DynamicPatientEmailOtpComponent implements OnInit {
  public otpForm: FormGroup;
  public disableResend: boolean = true;
  public formSubmitted: boolean = false;
  public userId: any;
  public isTokenRequired: boolean;
  public navigateTo: string;
  public timerVal: number;
  public disableTimer: boolean = false;
  public tenMinuteTimer = { leftTime: 10 * 60, format: "mm:ss", demand: false };
  public oneMinuteTimer = { leftTime: 60, format: "mm:ss", demand: false };
  public patientData: any;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private translater: TranslaterService,
    private router: Router,
    private route: ActivatedRoute,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private localStorageService: LocalStorageService,
    private dynamicOtp: DynamicOtpService,
    private onboardService: OnboardService,
    private dialogRef: MatDialogRef<DynamicPatientEmailOtpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data) {
      console.log(data);
      this.patientData = data.patientData;
    }
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

  hasError(type: string, key: string) {
    return this.formSubmitted && this.otpForm.hasError(type, [key]);
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
    this.toaster.showError(this.vref, "Error", RESPONSES.UNEXPECTED_ERROR);
  }

  /**
   * Function to save form
   */
  saveForm() {
    this.formSubmitted = true;
    if (this.otpForm.invalid) {
      return;
    }
    const otp = this.getOtp();
    let bodyObj = {
      otp: otp,
      userId: this.patientData.userId
    };
    this.onboardService.managerVerifyOtpEmail(bodyObj).subscribe(
      (res) => {
        this.toaster.showSuccess(
          this.vref,
          "Verification Code Verfied",
          RESPONSES.OTP_VERIFIED
        );
        this.dialogRef.close('true')
      },
      (err) => {
        if (err.status == 400) {
          this.toaster.showError(
            this.vref,
            "Verification Code not Verfied",
            err.error.message
          );
        } else {
          this.handleError(err);
        }
        this.disableResend = false;
        this.resetForm();
      }
    );
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

  resendOtp() {
    this.disableResend = true;
    this.disableTimer = false;
    this.onboardService.sendOtp({userId:this.patientData.userId}).subscribe(
      (res) => {
        this.toaster.showSuccess(
          this.vref,
          "Verification Code Sent",
          "VERIFICATION_CODE_SENT_TO_YOUR_REGISTERED_EMAIL"
        );
      },
      (err: any) => this.handleError(err)
    );
  }


  // ngOnDestroy() {
  //   this.authService.allowOtpAccess = false;
  // }
}
