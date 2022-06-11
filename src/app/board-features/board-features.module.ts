/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { UtilsModule } from "../utils/utils.module";
import { BoardFeaturesComponent } from "./board-features.component";
import { BoardFeatureRoutingModule } from "./board-features.route";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { InboxNotificationComponent } from "./inbox-notification/inbox-notification.component";
import { selectDoctorModelComponent } from "./dashboard/selected-doctor-modal.component";
import { ChartsModule } from "ng2-charts";

@NgModule({
  declarations: [
    BoardFeaturesComponent,
    DashboardComponent,
    selectDoctorModelComponent,
    InboxNotificationComponent,
  ],
  imports: [UtilsModule, BoardFeatureRoutingModule, ChartsModule],
  entryComponents: [selectDoctorModelComponent],
})
export class BoardFeatureModule {}
