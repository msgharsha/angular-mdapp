/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AccountSettingsComponent } from "./account-settings.component";
import { ProfileManagerComponent } from "./profilemanager/profilemanager/profilemanager.component";
import { AddEditManagerComponent } from "./profilemanager/add-edit-manager/add-edit-manager.component";
import { AvailableSecretaryComponent } from "./profilemanager/add-edit-manager/available-secretary.component";
import { DefaultComponent } from "./default.component";
import { AccountSettingsRoutingModule } from "./account-settings.routing";
import { UtilsModule } from "../utils/utils.module";
import { NgxMaskModule } from "ngx-mask";

@NgModule({
  declarations: [AccountSettingsComponent,DefaultComponent,ProfileManagerComponent,AddEditManagerComponent,AvailableSecretaryComponent],
  imports: [CommonModule, AccountSettingsRoutingModule,NgxMaskModule.forRoot(), UtilsModule],
  entryComponents: [AddEditManagerComponent,AvailableSecretaryComponent],
})
export class AccountSettingsModule {}
