/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppointmentDetailComponent } from "./appointment-detail/appointment-detail.component";
import { AppointmentListingComponent } from "./appointment-listing/appointment-listing.component";
import { AppointmentsComponent } from "./appointments.component";
import { CalendarAppointmentComponent } from "./calendar-appointment/calendar-appointment.component";

const routes: Routes = [
  {
    path: "",
    component: AppointmentsComponent,
    children: [
      { path: "", component: CalendarAppointmentComponent },
      { path: "list", component: AppointmentListingComponent },
      {
        path: "detail/:appointmentId/:type",
        component: AppointmentDetailComponent,
      },
      {
        path: "video-call",
        loadChildren: () =>
          import("./video-calls/video-calls.module").then(
            (m) => m.VideoCallsModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsRoutingModule {}
