/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { InboxNotificationComponent } from "./inbox-notification/inbox-notification.component";

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  {
    path: "calendar",
    loadChildren: () =>
      import("./calender/calender.module").then((m) => m.CalenderModule),
  },
  { path: "inbox", component: InboxNotificationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoardFeatureRoutingModule {}
