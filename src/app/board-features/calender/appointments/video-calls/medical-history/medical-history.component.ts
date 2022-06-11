/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { AppointmentService } from "../../appointments.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorService } from "../../../../../utils/service/error.service";
import * as _ from "lodash";
import { LocalStorageService } from "../../../../../utils/service/localStorage.service";
import { BillingHelper } from '../../../../../claim-module/services/billing_helper';

@Component({
  selector: "app-medical-history",
  templateUrl: "./medical-history.component.html",
  styleUrls: ["./medical-history.component.scss"],
})
export class MedicalHistoryComponent implements OnInit {
  @Input() patientId;
  @Input() patientName;
  @Input() bookingId;
  @Input() invitePatientStatus;
  @Output("medicalDialogClose") medicalDialogClose: EventEmitter<any> = new EventEmitter();
  medicalHistory: any = null;
  medicineTypeList = [];
  dosageTypeList = [];
  frequencyTypeList = [];
  durationTypeList = [];
  usageTypeList = [];
  usageFormatList = [];
  healthCardErrMsg = '';
  healthCardErrorRamq:any;

  healthCardInfo = [];
  public medicalHistoryMasterData: any;
  public lastVisit = "";
  public userData:any= {};

  constructor(
    private translater: TranslaterService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router,
    private billingHelper: BillingHelper,
    private localStorage: LocalStorageService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
    this.getMedicationMasterData();
    this.userData = this.localStorage.getItem("userData") || {};
  }

  getMedicationMasterData() {
    this.appointmentService
      .getMedicalHistoryMasterData()
      .subscribe((res: any) => {
        const response = res;
        this.medicalHistoryMasterData = response.data;
        this.getMedicalHistory();
        this.getMedicineTypeList();
      });
  }

  sendToPractice(){
    this.medicalDialogClose.emit("close");
    this.router.navigateByUrl("accounts/practice");
  }
  
  getMedicineTypeList() {
    this.appointmentService.getMedicineType().subscribe((res) => {
      this.medicineTypeList = res.data.Measure;
      this.frequencyTypeList = res.data.Frequency;
      this.durationTypeList = res.data.Duration;
      this.dosageTypeList = res.data.Dosage;
      this.usageTypeList = res.data['Usage Type'];
      this.usageFormatList = res.data['Usage Format'];
    });
  }

  // getDosageName(id) {
  //   const measureDosage = this.medicalHistoryMasterData.duration;
  //   const index = measureDosage.findIndex((item) => item.id == id);
  //   return measureDosage[index] ? measureDosage[index].name : "";
  // }

  getMeasureName(id) {
    const measureList = this.medicineTypeList;
    const index = measureList.findIndex((item) => item.id == id);
    return measureList[index] ? measureList[index].medicineType : "";
  }
  getDosageName(id) {
    const index = this.dosageTypeList.findIndex((item) => item.id == id);
    return this.dosageTypeList[index] ? this.dosageTypeList[index].medicineType : "";
  }
  getFrequencyName(id) {
    const index = this.frequencyTypeList.findIndex((item) => item.id == id);
    return this.frequencyTypeList[index] ? this.frequencyTypeList[index].medicineType : "";
  }
  getDurationName(id) {
    const index = this.durationTypeList.findIndex((item) => item.id == id);
    return this.durationTypeList[index] ? this.durationTypeList[index].medicineType : "";
  }
  getUsageTypeName(id) {
    const index = this.usageTypeList.findIndex((item) => item.id == id);
    return this.usageTypeList[index] ? this.usageTypeList[index].medicineType : "";
  }
  getUsageFormatName(id) {
    const index = this.usageFormatList.findIndex((item) => item.id == id);
    return this.usageFormatList[index] ? this.usageFormatList[index].medicineType : "";
  }

  getMedicalHistory() {
    this.appointmentService
      .getMedicalHistory(this.bookingId, this.patientId)
      .subscribe(
        (res) => {
          if (res && res.data) {
            this.medicalHistory = res.data;
            this.lastVisit = this.medicalHistory.lastDoctorVisit;
            this.validHealthCard(this.medicalHistory);
            this.modifyMedicalHistory();
          } else {
            this.medicalHistory = {};
          }
        },
        (err) => {
          this.errorService.handleError(err, null);
        }
      );
  }

  validHealthCard(medicalHistory){
    this.healthCardErrMsg = '';
    this.healthCardInfo = [];
    this.appointmentService.validateHealthCard({cardNo: medicalHistory.healthCareNumber},this.userData.doctorId).subscribe(
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
  }

  modifyMedicalHistory() {
    if (this.medicalHistory.specifyProblem) {
      this.medicalHistory.healthProblems =
        this.medicalHistory.healthProblems || [];
      this.medicalHistory.healthProblems.push(
        this.medicalHistory.specifyProblem
      );
    }

    if (this.medicalHistory.specifyFamilyHealthProblems) {
      this.medicalHistory.familyHealthProblems =
        this.medicalHistory.familyHealthProblems || [];
      this.medicalHistory.familyHealthProblems.push(
        this.medicalHistory.specifyFamilyHealthProblems
      );
    }
  }
}
