/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppointmentsRoutingModule } from "./appointments-routing.module";
import { BookAppointmentsComponent } from "./book-appointments/book-appointments.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UtilsModule } from "../utils/utils.module";
import { AppointmentsService } from "./appointments.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { BookedAppointmentDialogComponent } from "./booked-appointment-dialog/booked-appointment-dialog.component";
import { DoctorModule } from "../doctor/doctor.module";

@NgModule({
  declarations: [BookAppointmentsComponent, BookedAppointmentDialogComponent],
  imports: [
    CommonModule,
    AppointmentsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    UtilsModule,
    DoctorModule,
    MatDatepickerModule,
    NgMultiSelectDropDownModule,
  ],
  entryComponents: [BookedAppointmentDialogComponent],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
