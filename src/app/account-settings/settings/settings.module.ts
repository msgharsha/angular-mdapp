/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { UtilsModule } from "../../utils/utils.module";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { SettingsComponent } from "./settings.component";
import { moduleRoutes } from "./settings.route";
import { NotificationsComponent } from "./notifications/notifications.component";

@NgModule({
  imports: [moduleRoutes, UtilsModule],
  declarations: [
    SettingsComponent,
    ChangePasswordComponent,
    NotificationsComponent,
  ],
  providers: [],
  bootstrap: [],
  exports: [SettingsComponent, ChangePasswordComponent, NotificationsComponent],
})
export class SettingsModule {}
