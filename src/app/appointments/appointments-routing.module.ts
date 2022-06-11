/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BookAppointmentsComponent } from "./book-appointments/book-appointments.component";

const routes: Routes = [
  {
    path: "book/:id",
    data: { breadcrumb: "app-book-appointments" },
    component: BookAppointmentsComponent,
  },
  { path: "**", redirectTo: "/home" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
