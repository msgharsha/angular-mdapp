/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

 import { NgModule } from "@angular/core";
 import { RouterModule, Routes } from "@angular/router";
 import { FormEditorComponent } from './editor/form-editor.component';
 
 const routes: Routes = [
    {
      path: "",
      component: FormEditorComponent
    }
 ];
 
 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
 })
 export class PDFFormsRoutingModule {}
 