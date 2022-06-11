/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

 import { NgModule } from "@angular/core";
 import { RouterModule, Routes } from "@angular/router";
 import { FormDetailsComponent } from './form-details/form-details.component';
 
 const routes: Routes = [
    {
        path: "",
        component: FormDetailsComponent
    },
 ];
 
 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
 })
 export class ManageFormsRoutingModule {}
 