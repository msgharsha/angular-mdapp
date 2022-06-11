/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { AppointmentService } from "../appointments.service";
import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslaterService } from "../../../../utils/service/translater.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { ToasterService } from "../../../../utils/service/toaster.service";
import { ErrorService } from "../../../../utils/service/error.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogModalComponent } from "./../../../../utils/component/cancel-modal/cancel-modal.component";
import { MedicalHistoryModalComponent } from "../../medical-history-modal/medical-history-modal.component";
import { LocalStorageService } from "../../../../../../src/app/utils/service/localStorage.service";
import { TranslateService } from "@ngx-translate/core";
import { BillingHelper } from '../../../../claim-module/services/billing_helper';
import { UserRoleService } from "../../../../utils/service/user_role.service";

@Component({
  selector: "app-appointment-detail",
  templateUrl: "./appointment-detail.component.html",
  styleUrls: ["./appointment-detail.component.scss"],
})
export class AppointmentDetailComponent implements OnInit {
  public appointmentDetails: any;
  public appointmentForm: FormGroup;
  public inEditMode: boolean = false;
  public startDate;
  public startTime;
  public currentTimestamp = moment().valueOf();
  public appointmentId: any;
  public notes: any;
  public fiveMinutePrior = 5 * 60 * 1000;
  public patientUserId: any;
  public lang: string;
  fName:any;
  lName:any;
  healthCardErrMsg = '';
  healthCardErrorRamq:any;
  healthCardInfo = [];
  userData: any;
  constructor(
    private appointmentService: AppointmentService,
    private builder: FormBuilder,
    private translater: TranslaterService,
    private errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private matDialog: MatDialog,
    private toaster: ToasterService,
    private billingHelper: BillingHelper,
    private vref: ViewContainerRef,
    private userRoleService: UserRoleService,
    private localStorage: LocalStorageService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAppointmentIdParams();
    this.userData = this.localStorage.getItem("userData") || {};
    this.translater.TranslationAsPerSelection();

    this.translateService.onLangChange.subscribe(() => {
      this.lang = this.localStorage.getItem("language");
      this.setStartDateAndTime();
    });
    this.lang = this.localStorage.getItem("language");
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      this.fName = this.userData.firstName;
      this.lName = this.userData.lastName;
      this.userData.firstName = this.userData.selectedDoctorData.doctorName;
      this.userData.lastName = '';
    }
  }
  ngOnDestroy() {
    this.userData.firstName =  this.fName
    this.userData.lastName = this.lName;
  }

  initForm() {
    this.appointmentForm = this.builder.group({
      reason: [null, [Validators.required]],
    });
  }
  
  sendToPractice(){
    this.router.navigateByUrl("accounts/practice");
  }

  getAppointmentIdParams() {
    this.route.paramMap.subscribe((params) => {
      if (!params.get("appointmentId")) {
        this.router.navigateByUrl("feature/dashboard");
      } else {
        this.appointmentService
          .getAppointmentById(params.get("appointmentId"))
          .subscribe(
            (appointment) => {
              this.appointmentId = params.get("appointmentId");
              this.getAppointmentNotes(this.appointmentId);
              this.appointmentDetails = _.get(
                _.cloneDeep(appointment),
                "data",
                {}
              );
              this.healthCardErrMsg = '';
              this.healthCardInfo = [];
              this.appointmentService.validateHealthCard({cardNo: this.appointmentDetails.patient.healthCareNumber},this.appointmentDetails.doctor.doctorId).subscribe(
                async (responseInfo) => {
                  if (responseInfo.status === 0) {
                    if (responseInfo.rspData[0].cod_retou[0] !== '0') {
                      this.healthCardErrMsg = responseInfo.rspData[0].des_msg_retou[0];
                    } else {
                        const errorMsg = await this.billingHelper.getDeeperObjectByKey('sta_admis', responseInfo.rspData[0]);
                        if (errorMsg[0] === 'NON') {
                            this.healthCardErrMsg = responseInfo.rspData[0].txt_msg_inadm[0];
                        } else {
                            this.healthCardInfo = responseInfo.rspData;
                            if (this.healthCardInfo[0].dat_verif_admis) {
                              this.healthCardInfo[0].dat_verif_admis[0] = new Date(this.healthCardInfo[0].dat_verif_admis[0].replace('T00:00:00-04:00','T00:00:00')).toISOString();
                            }
                        }
                    }
                  } else if (responseInfo.status === 1 && responseInfo.rspCode === "CREDENTIALS_WRONG"){
                    this.healthCardErrorRamq = responseInfo.rspMessage;
                  }
                },
                (err) => {
                  this.errorService.handleError(err, null);
                }
              );

              this.appointmentDetails.bookingDetail['callDisableTime'] = this.appointmentDetails?.bookingDetail?.endTime + (60*60*1000);
              this.patientUserId = this.appointmentDetails["patient"][
                "patientUserId"
              ];
              if (
                this.appointmentDetails?.bookingDetail?.status == "confirmed" &&
                this.currentTimestamp >
                  this.appointmentDetails?.bookingDetail?.callDisableTime
              ) {
                this.getAppointmentNotes(this.appointmentId);
              }
              this.setStartDateAndTime();
            },
            (error) => {
              this.errorService.handleError(error, null);
              this.router.navigateByUrl("feature/dashboard");
            }
          );
      }
    });
  }

  getAppointmentNotes(appointmentId) {
    this.appointmentService.getAppointmentNotes(appointmentId).subscribe(
      (res) => {
        this.notes = res.data.content || "";
      },
      (err) => {
        this.errorService.handleError(err, null);
      }
    );
  }

  cancelAppointment() {
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      height: "auto",
      width: "600px",
      data: {
        message: "ARE_YOU_SURE_YOU_WANT_TO_CANCEL_APPOINTMENT",
        cancelLabel: "NO_KEEP_APPOINTMENT",
        confirmLabel: "CONFIRM_CANCELLATION",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let body = {
          appointmentIds: [_.toNumber(this.appointmentId)],
        };
        if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
          this.appointmentService.managerCancelAppointment(body,this.userData.selectedDoctorData).subscribe(
            (response) => {
              this.toaster.showSuccess(
                this.vref,
                "Success",
                "APPOINTMENT_CANCELLED_SUCCESS"
              );
              this.router.navigate(["/feature/dashboard"]);
            },
            (err) => {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                result.detail!.error!.message
              );
            }
          );
        } else {
          this.appointmentService.cancelAppointment(body).subscribe(
            (response) => {
              this.toaster.showSuccess(
                this.vref,
                "Success",
                "APPOINTMENT_CANCELLED_SUCCESS"
              );
              this.router.navigate(["/feature/dashboard"]);
            },
            (err) => {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                result.detail!.error!.message
              );
            }
          );
        }
        
      }
    });
  }

  setStartDateAndTime() {
    const date = this.appointmentDetails.bookingDetail.startTime;
    this.startDate = moment(date).locale(this.lang).format("DD MMM, YYYY");
    this.startTime = moment(date).format("HH:mm");
  }

  startVideoCall() {
    let currentTimeStamp = moment().valueOf();
    if (
      !(
        this.appointmentDetails?.bookingDetail?.callDisableTime > currentTimeStamp &&
        this.fiveMinutePrior >
          this.appointmentDetails?.bookingDetail?.startTime - currentTimeStamp
      )
    ) {
      this.toaster.showError(
        this.vref,
        "Error",
        "CALL_CAN_BE_STARTED_BEFORE_FIVE_MIN_ONLY"
      );
    } else {
      this.appointmentService
        .getVideoCallSession(this.appointmentDetails.id)
        .subscribe(
          (res) => {
            if (this.localStorage.getItem("test-data")) {
              this.localStorage.removeItem("test-data");
            }
            if (res.data.token && res.data.sessionId) {
              this.router.navigate(["video-call"], {
                relativeTo: this.route.parent,
                queryParams: {
                  sessionId: res.data.sessionId,
                  token: res.data.token,
                  bookingId: this.appointmentDetails.id,
                  patientUserId: this.appointmentDetails.patient.patientUserId,
                  patientId:this.appointmentDetails.patient.patientId,
                  offset: this.appointmentDetails.bookingDetail.offset,
                  consultationType: this.appointmentDetails.bookingDetail.consultation,
                  appointmentType:res.data.appointmentType,
                  patientEmail:
                    this.appointmentDetails.patient.memberEmail ||
                    this.appointmentDetails.patient.patientEmail,
                  patientName:
                    this.appointmentDetails.patient.memberName ||
                    this.appointmentDetails.patient.patientName,
                },
              });
            }
          },
          (error) => {
            this.errorService.handleError(error, null);
          }
        );
    }
  }

  openMedicalHistoryModal() {
    this.matDialog
      .open(MedicalHistoryModalComponent, {
        data: {
          patientUserId: this.patientUserId,
          bookingId: this.appointmentId,
        },
      })
      .afterClosed()
      .subscribe((res) => {});
  }

  backNavigate() {
    const type = this.router.url.split("/").pop();
    this.router.navigateByUrl(
      `feature/calendar/appointment?appointment=true&type=${type}`
    );
  }

  checkPermission(state) {
    return this.userRoleService.checkPermission(state);
  }

}
