/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Routes, RouterModule } from "@angular/router";
import { NavigateIfTokenDoesntExist } from "../../utils/guards/token.guard";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { NotificationsComponent } from "./notifications/notifications.component";
import { SettingsComponent } from "./settings.component";

const childRoutes: Routes = [
  { path: "", redirectTo: "notifications", pathMatch: "full" },
  {
    path: "notifications",
    component: NotificationsComponent,
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "change-password",
    component: ChangePasswordComponent,
    canActivate: [NavigateIfTokenDoesntExist],
  },
];

const SettingsRoute: Routes = [
  { path: "", component: SettingsComponent, children: childRoutes },
  { path: "**", redirectTo: "", pathMatch: "full" },
];

export const moduleRoutes = RouterModule.forChild(SettingsRoute);
