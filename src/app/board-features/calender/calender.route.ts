/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddEditAvailabilityComponent } from "./availability/add-edit-availability/add-edit-availability.component";
import { AvailabilityComponent } from "./availability/availability.component";
import { CalendarAvailabilityComponent } from "./availability/calendar-availability/calendar-availability.component";

const calendarChildRoutes = [
  { path: "", component: CalendarAvailabilityComponent },
  { path: "add", component: AddEditAvailabilityComponent },
  { path: "edit/:id", component: AddEditAvailabilityComponent },
];

const routes: Routes = [
  { path: "", redirectTo: "availability", pathMatch: "full" },
  {
    path: "availability",
    component: AvailabilityComponent,
    children: calendarChildRoutes,
  },
  {
    path: "appointment",
    loadChildren: () =>
      import("./appointments/appointments.module").then(
        (m) => m.AppointmentModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalenderRoutingModule {}
