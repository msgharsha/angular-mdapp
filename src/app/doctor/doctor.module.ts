/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DoctorRoutingModule } from "./doctor-routing.module";
import { UtilsModule } from "../utils/utils.module";
import { DocUtilsModule } from "./doc-utils/doc-utils.module";
import { DoctorProfileComponent } from "./doctor-profile/doctor-profile.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { NgxPaginationModule } from "ngx-pagination";
import { DoctorComponent } from "./doctor.component";
import { DoctorService } from "./doctor.service";

@NgModule({
  declarations: [
    DoctorComponent,
    DoctorProfileComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DoctorRoutingModule,
    UtilsModule,
    DocUtilsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatCheckboxModule,
  ],
  providers: [DoctorService],
  exports: [],
})
export class DoctorModule {}
