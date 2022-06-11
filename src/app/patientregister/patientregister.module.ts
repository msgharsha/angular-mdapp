
 import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { PatientRegisterDetailsComponent } from './patientregister-details/patientregister-details.component';
 import { PatientRegisterRoutingModule } from "./patientregister.routing";
 import { NgxPaginationModule } from "ngx-pagination";
 import { NgxMaskModule } from "ngx-mask";
 
 @NgModule({
   declarations: [ PatientRegisterDetailsComponent],
   imports: [CommonModule, UtilsModule, PatientRegisterRoutingModule,NgxPaginationModule,NgxMaskModule.forRoot()],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
 })
 export class PatientRegisterModule {}
 