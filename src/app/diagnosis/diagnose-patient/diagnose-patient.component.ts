/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { DialogModalComponent } from "./../../utils/component/cancel-modal/cancel-modal.component";
import { PrescriptionService } from "./../../utils/service/presciption.sevice";
import { ToasterService } from "./../../utils/service/toaster.service";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewContainerRef,
  Input,
  Optional,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
  Prescription,
  UploadPrescription,
  Diagnosis,
} from "../prescribe-medicines/prescription.model";
import { ErrorService } from "../../utils/service/error.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { SessionManager } from "../../utils/component/open-tok-call/session-manager.service";
import { TranslaterService } from "../../utils/service/translater.service";

enum DiagnosisMethods {
  FILE_UPLOAD = 1,
  MANUAL = 2,
}
const VIDEO_CALL_EVENTS = { DISCARD_PRESCRIPTION: "DISCARD_PRESCRIPTION" };

@Component({
  selector: "app-diagnose-patient",
  templateUrl: "diagnose-patient.component.html",
  styleUrls: ["diagnose-patient.component.scss"],
})
export class DiagnosePatientComponent implements OnInit {
  diagnosisMethods = DiagnosisMethods;
  crntdignsMethod: DiagnosisMethods;
  showDiagnosis: boolean;
  prescriptionData: UploadPrescription | Prescription;
  @Input() bookingId: number;
  prescriptionId: number;
  loading: boolean;
  @Output() closePanel = new EventEmitter();
  @Output() onPrescriptionSave = new EventEmitter();

  constructor(
    private prescriptionService: PrescriptionService,
    private route: ActivatedRoute,
    @Optional() private sessionManager: SessionManager,
    private localStr: LocalStorageService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private matDialog: MatDialog,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    if (!this.bookingId)
      this.route.queryParams.subscribe((params) => {
        this.bookingId = Number(params["bookingId"]);
        this.getPrescription();
      });
    else {
      this.getPrescription();
    }
    this.translater.TranslationAsPerSelection();
  }

  private getPrescription() {
    this.loading = true;
    this.prescriptionService.getPrescription(this.bookingId).subscribe(
      (prescription: Prescription | UploadPrescription) => {
        this.loading = false;
        this.evaluateDiagnosisMethod(prescription);
        if (prescription) this.prescriptionId = prescription.prescriptionId;
        if (this.crntdignsMethod === DiagnosisMethods.FILE_UPLOAD) {
          this.prescriptionId = prescription.prescriptionId;
          this.prescriptionService.saveDataToLocalStorage(
            <UploadPrescription>prescription
          );
        }
      },
      (error) => {
        this.loading = false;
        this.crntdignsMethod = this.prescriptionService.getLocallySavedMethodForBooking(
          this.bookingId
        );
      }
    );
  }

  /*evaluate which diagnosis method is currently being used*/
  private evaluateDiagnosisMethod(
    prescription: Prescription | UploadPrescription
  ) {
    var locallySavedMethodForBooking = this.prescriptionService.getLocallySavedMethodForBooking(
      this.bookingId
    );
    if (!locallySavedMethodForBooking) {
      this.startDiagnosis(this.getDiagnosisType(prescription));
    } else {
      this.crntdignsMethod = locallySavedMethodForBooking;
    }
  }

  /*start a diagnosis */
  startDiagnosis(diagnosisMethod: DiagnosisMethods, event?) {
    if (event) {
      event.stopPropagation();
    }
    this.crntdignsMethod = diagnosisMethod;
    this.localStr.setItem("crntdignsMethod", {
      crntdignsMethod: this.crntdignsMethod,
      bookingId: this.bookingId,
    });
  }

  /* close disgnosis view*/
  closeDiagnosis() {
    this.closePanel.emit();
  }

  proceedFurther(data: UploadPrescription) {
    this.showDiagnosis = true;
    this.prescriptionData = data;
  }

  savePrescription(diagnosisData: Diagnosis) {
    let data: UploadPrescription = <UploadPrescription>{
      ...this.prescriptionData,
      ...diagnosisData,
    };
    this.getAPIObservable(data).subscribe(
      (prescriptionData) => {
        this.onPrescriptionUpdate({
          ...data,
          prescriptionId: prescriptionData.data.prescriptionId.id,
        });
      },
      (error) => {
        this.errorHandler.handleError(error, this.vref);
      }
    );
  }

  /*gets Prescription API */
  private getAPIObservable(data) {
    if (this.prescriptionId) {
      return this.prescriptionService.updateUploadedPrescription(
        data,
        this.prescriptionId,
        this.bookingId
      );
    }
    return this.prescriptionService.saveUploadedPrescription(
      data,
      this.bookingId
    );
  }

  /*on save or update success*/
  private onPrescriptionUpdate(prescriptionData) {
    if (this.sessionManager)
      this.sessionManager.sendPrescriptionSignal(this.bookingId);
    this.prescriptionService.clearLocalStorage();
    this.closeDiagnosis();
    this.onPrescriptionSave.emit(prescriptionData);
  }

  /*Identifies the prescription's diagnosis type*/
  private getDiagnosisType(
    prescription: UploadPrescription | Prescription
  ): DiagnosisMethods {
    if (!prescription) return undefined;
    if ((<UploadPrescription>prescription).prescriptionUrl) {
      return this.diagnosisMethods.FILE_UPLOAD;
    }
    return this.diagnosisMethods.MANUAL;
  }

  deletePrescription() {
    this.confirmRemoveFile();
  }

  confirmRemoveFile() {
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      height: "250px",
      width: "350px",
      data: {
        message: `Are you sure you want to delete this prescription?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.prescriptionId)
          this.prescriptionService
            .deletePrescription(this.prescriptionId)
            .subscribe(
              (data) => {
                this.toaster.showSuccess(this.vref, "Success", data.message);
                this.clearCurrentStateOfDiagnosis();
                if (this.sessionManager)
                  this.sessionManager.sendSignal({
                    type: VIDEO_CALL_EVENTS.DISCARD_PRESCRIPTION,
                    bookingId: this.bookingId,
                  });
              },
              (err) => {
                this.errorHandler.handleError(err, this.vref);
              }
            );
        else {
          this.clearCurrentStateOfDiagnosis();
        }
      }
    });
  }

  private clearCurrentStateOfDiagnosis() {
    this.crntdignsMethod = null;
    this.showDiagnosis = null;
    this.prescriptionId = null;
    this.prescriptionService.clearLocalStorage();
  }

  onManualPrescriptionSave(prescriptionId: number) {
    this.prescriptionId = prescriptionId;
  }
}
