/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from "@angular/material/icon";
import { NgxPaginationModule } from "ngx-pagination";
// import { BookAppointmentFormComponent } from "../../appointment/utils/component/book-appointment-form/book-appointment-form.component";
import { UtilsModule } from "../../utils/utils.module";
import { DoctorDetailsComponent } from "./components/doctor-details/doctor-details.component";

@NgModule({
  declarations: [DoctorDetailsComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    UtilsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
})
export class AppointmentsUtilsModule {}
