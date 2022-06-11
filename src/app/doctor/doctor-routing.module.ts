/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DoctorProfileComponent } from "./doctor-profile/doctor-profile.component";

const routes: Routes = [
  { path: "profile/:id", component: DoctorProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DoctorRoutingModule {}
