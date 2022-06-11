
 import { NgModule } from "@angular/core";
 import { RouterModule, Routes } from "@angular/router";
 import { AppointmentDetailsComponent } from './appointment-details/appointment-details.component';
 
 const routes: Routes = [
    {
        path: "",
        component: AppointmentDetailsComponent
    },
 ];
 
 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
 })
 export class BookAppointmentRoutingModule {}
 