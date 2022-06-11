/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { DiagnosisModule } from "./../../../../diagnosis/diagnosis.module";
import { NgModule } from "@angular/core";
import { OpenTokCallModule } from "../../../../utils/component/open-tok-call/open-tok-call.module";
import { UtilsModule } from "../../../../utils/utils.module";
import { LeftPanelChatWrapper } from "./left-panel/left-panel-wrapper.component";
import { DetailComponent } from "./right-panel/medical-history/detail/detail.component";
import { MedicalHistoryComponent } from "./right-panel/medical-history/medical-history.component";
import { MedicalHistoryService } from "./right-panel/medical-history/medical-history.service";
import { MedicalReportComponent } from "./right-panel/medical-report/medical-report.component";
import { MedicalReportService } from "./right-panel/medical-report/medical-report.service";
import { RightPanelComponent } from "./right-panel/right-panel.component";
import { VideoCallVerificationComponent } from "./verification/video-call-verification.component";
import { VideoCallComponent } from "./video-call.component";
import { VideoCallRoutingModule } from "./video-call.routing";
import { MatTabsModule } from "@angular/material/tabs";

@NgModule({
  declarations: [
    VideoCallComponent,
    VideoCallVerificationComponent,
    RightPanelComponent,
    MedicalHistoryComponent,
    DetailComponent,
    MedicalReportComponent,
    LeftPanelChatWrapper,
  ],
  imports: [
    UtilsModule,
    MatTabsModule,
    VideoCallRoutingModule,
    OpenTokCallModule,
    DiagnosisModule,
  ],
  providers: [MedicalHistoryService, MedicalReportService],
})
export class VideoCallModule {}
