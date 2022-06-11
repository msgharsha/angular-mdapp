/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { DiagnosePatientComponent } from "./diagnose-patient/diagnose-patient.component";
import { UploadPrescriptionComponent } from "./diagnose-patient/upload-prescription/upload-prescription.component";
import { PrescribeMedicinesComponent } from "./prescribe-medicines/prescribe-medicines.component";
import { DrugModalComponent } from "../diagnosis/prescribe-medicines/drug-modal/drug-modal.component";
import { DiagnosisComponent } from "./diagnosis/diagnosis.component";
import { UtilsModule } from "../utils/utils.module";
import { CommonModule } from "@angular/common";
import { SelectedMedicineComponent } from "./selected-medicine/selected-medicine.component";
import { ExternalDialogModalComponent } from "./selected-medicine/external/external-modal.component";
import { PrescribeTestsComponent } from "./prescribe-tests/prescribe-tests.component";
import { DetailedPrescriptionComponent } from "./prescribe-medicines/detailedprescriptionmodel.component";

@NgModule({
  declarations: [
    DiagnosisComponent,
    PrescribeMedicinesComponent,
    DiagnosePatientComponent,
    UploadPrescriptionComponent,
    DrugModalComponent,
    SelectedMedicineComponent,
    ExternalDialogModalComponent,
    PrescribeTestsComponent,
    DetailedPrescriptionComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UtilsModule],
  exports: [DiagnosePatientComponent, PrescribeMedicinesComponent],
  entryComponents: [DrugModalComponent,DetailedPrescriptionComponent,ExternalDialogModalComponent],
})
export class DiagnosisModule {}
