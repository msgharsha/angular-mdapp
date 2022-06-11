
 import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { AppointmentDetailsComponent } from './appointment-details/appointment-details.component';
 import { BookAppointmentRoutingModule } from "./book-appointments.routing";
 import { NgxPaginationModule } from "ngx-pagination";
 
 @NgModule({
   declarations: [ AppointmentDetailsComponent],
   imports: [CommonModule, UtilsModule, BookAppointmentRoutingModule,NgxPaginationModule],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
 })
 export class BookAppointmentModule {}
 