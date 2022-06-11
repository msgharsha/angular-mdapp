/**
 * 
 * Copyright 2009-2021 Ibase it software solution pvt ltd.
 * @author ibaseitinc
 */

 import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { FormEditorComponent } from './editor/form-editor.component';
 import { PDFFormsRoutingModule } from "./pdf-forms.routing";
 
 @NgModule({
   declarations: [ FormEditorComponent],
   imports: [CommonModule, UtilsModule, PDFFormsRoutingModule],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
 })
 export class PDFFormsModule {}
 