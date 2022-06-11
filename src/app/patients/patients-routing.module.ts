/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Routes, RouterModule } from "@angular/router";
import { PatientsComponent } from "./patients.component";
import { InvitePatientsComponent } from "./invite-patients/invite-patients.component";
import { PatientDetailsComponent } from "./invite-patients/patient-details.component";
import { PatientHistoryComponent } from "./invite-patients/patient-history.component";

const routes: Routes = [
  {
    path: "",
    component: PatientsComponent,
    pathMatch: "prefix",
    children: [
      { path: "", redirectTo: "invite-patients", pathMatch: "full" },
      // { path: 'patient-list', component: PatientsListComponent },
      { path: "invite-patients", component: InvitePatientsComponent },
      { path: "detailed-patient", component: PatientDetailsComponent },
      { path: "patient-history", component: PatientHistoryComponent },
      
      // { path: 'accept-patients', component: AcceptPatientsComponent }
    ],
  },
];

export const moduleRoutes = RouterModule.forChild(routes);
