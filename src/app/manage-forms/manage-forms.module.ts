/**
 * 
 * Copyright 2009-2021 Ibase it software solution pvt ltd.
 * @author ibaseitinc
 */

 import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { FormDetailsComponent } from './form-details/form-details.component';
 import { ManageFormsRoutingModule } from "./manage-forms.routing";
 
 @NgModule({
   declarations: [ FormDetailsComponent],
   imports: [CommonModule, UtilsModule, ManageFormsRoutingModule],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
 })
 export class ManageFormsModule {}
 