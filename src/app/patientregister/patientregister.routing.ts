
 import { NgModule } from "@angular/core";
 import { RouterModule, Routes } from "@angular/router";
 import { PatientRegisterDetailsComponent } from './patientregister-details/patientregister-details.component';
 
 const routes: Routes = [
    {
        path: "",
        component: PatientRegisterDetailsComponent
    },
 ];
 
 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
 })
 export class PatientRegisterRoutingModule {}
 