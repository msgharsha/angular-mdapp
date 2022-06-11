import { Component, Inject, OnInit, ViewContainerRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthorizationService } from "../../../../../authorization/authorization.service";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../../../utils/service/localStorage.service";
import { RESPONSES } from "../../../../../authorization/constants/response";
import { OnboardService } from "../../onboard.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: "verify-otp",
  templateUrl: "./otp-modal.component.html",
  styleUrls: ["./otp-modal.component.scss"],
})
export class OtpModalComponent implements OnInit {
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

  constructor(
    private dialogRef: MatDialogRef<OtpModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private authService: AuthorizationService,
    private translater: TranslaterService,
    private router: Router,
    private route: ActivatedRoute,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private localStorageService: LocalStorageService,
    private onboardService: OnboardService
  ) {}

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
    };
    this.onboardService.verifyOtponPhoneNo(bodyObj).subscribe(
      (res) => {
        this.onboardService.generateMachinePwd().subscribe(
          (res) => {
            console.log(res);
            if( res && !res.success){
                this.toaster.showError(
                  this.vref,
                  "ERROR",
                  res.message[0].Erreur[0]
                );
            } else if( res && res.success){
              this.toaster.showSuccess(
                this.vref,
                "SUCCESS",
                "RAMQ_SUCCESS_MESSAGE"
              );
            }
            this.dialogRef.close(false);
          },
          (err) => {
            this.dialogRef.close(false);
          }
        );
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
    this.onboardService.sendOtponPhoneNo().subscribe(
      (res) => {
        this.toaster.showSuccess(
          this.vref,
          "Verification Code Sent",
          "VERIFICATION_CODE_SENT_TO_YOUR_REGISTERED_PHONE_NUMBER"
        );
      },
      (err: any) => this.handleError(err)
    );
  }

  backNavigate() {
    this.dialogRef.close(false);
  }

  // ngOnDestroy() {
  //   this.authService.allowOtpAccess = false;
  // }
}
