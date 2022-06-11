/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AccountSettingsComponent } from "./account-settings.component";
import { DefaultComponent } from "./default.component";

const routes: Routes = [
  { path: "", component: DefaultComponent },
  {
    path: "",
    component: AccountSettingsComponent,
    children: [
      {
        path: "settings",
        loadChildren: () =>
          import("./settings/settings.module").then((m) => m.SettingsModule),
      },
    ],
  },
  { path: ":type", component: AccountSettingsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountSettingsRoutingModule {}
