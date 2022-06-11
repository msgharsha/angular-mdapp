
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
import { UtilsModule } from "../../../../../utils/utils.module";
import { NotesComponent } from "../notes/notes.component";
import { DetailedNotesComponent } from "../notes/detailednotesmodel.component";
import { AllNotesComponent } from "../notes/allnotesmodel.component";
import { InvoicesComponent } from "../invoices/invoices.component";
import { PrescriptionsComponent } from "../prescriptions/prescriptions.component";
import { MedicalHistoryComponent } from "../medical-history/medical-history.component";
import { RequisitionComponent } from "../requisition/requisition.component";
import { DetailedRequisitionComponent } from "../requisition/detailedrequisitionmodel.component";
import { DiagnosisModule } from "../../../../../diagnosis/diagnosis.module";

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    NotesComponent,
    InvoicesComponent,
    PrescriptionsComponent,
    MedicalHistoryComponent,
    RequisitionComponent,
    DetailedNotesComponent,
    DetailedRequisitionComponent,
    AllNotesComponent
  ],
  imports: [
    UtilsModule,
    DiagnosisModule,
    FontAwesomeModule
  ],
  providers: [],
  entryComponents: [DetailedNotesComponent,DetailedRequisitionComponent,AllNotesComponent],
  exports: [NotesComponent,
    InvoicesComponent,
    PrescriptionsComponent,
    MedicalHistoryComponent,
    RequisitionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class medicalHistoryModule {}
