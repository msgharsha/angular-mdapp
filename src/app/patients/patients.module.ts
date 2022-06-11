/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
// import { PatientsRoutingModule } from './patients-routing.module';
import { PatientsComponent } from "./patients.component";
import { TranslateModule } from "@ngx-translate/core";
import { InvitePatientsComponent } from "./invite-patients/invite-patients.component";
import { PatientDetailsComponent } from "./invite-patients/patient-details.component";
import { PatientHistoryComponent } from "./invite-patients/patient-history.component";
import { PrescriptionComponent } from "./invite-patients/prescription.component";
import { UtilsModule } from "../utils/utils.module";
import { NgxCsvParserModule } from "ngx-csv-parser";
import { NgxPaginationModule } from "ngx-pagination";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { moduleRoutes } from "./patients-routing.module";
import { MatTabsModule } from "@angular/material/tabs";
import { ClaimModule } from '../claim-module/claim-module';
import { medicalHistoryModule } from '../board-features/calender/appointments/video-calls/medical-history/medical-history.module';

@NgModule({
  declarations: [PatientsComponent, InvitePatientsComponent,PatientDetailsComponent,PatientHistoryComponent,PrescriptionComponent],
  imports: [
    CommonModule,
    moduleRoutes,
    TranslateModule,
    FontAwesomeModule,
    ClaimModule,
    medicalHistoryModule,
    MatTabsModule,
    UtilsModule,
    NgxCsvParserModule,
    NgxPaginationModule ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientsModule {}
