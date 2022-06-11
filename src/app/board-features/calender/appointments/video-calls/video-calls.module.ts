/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
import { UtilsModule } from "../../../../utils/utils.module";
import { VideoCallsComponent } from "./video-calls.component";
import { VideoCallsRoutingModule } from "./video-calls.route";
// import { NotesComponent } from "./notes/notes.component";
// import { InvoicesComponent } from "./invoices/invoices.component";
// import { PrescriptionsComponent } from "./prescriptions/prescriptions.component";
// import { MedicalHistoryComponent } from "./medical-history/medical-history.component";
import { OpenTokCallModule } from "../../../../utils/component/open-tok-call/open-tok-call.module";
import { SessionManager } from "../../../../utils/component/open-tok-call/session-manager.service";
import { DiagnosisModule } from "../../../../diagnosis/diagnosis.module";
// import { RequisitionComponent } from "./requisition/requisition.component";
import { LeftPanelChatWrapper } from "./left-panel/left-panel-wrapper.component";
import { ChatModule } from "../chat/chat.module";
import { ClaimModule } from '../../../../claim-module/claim-module';
import { medicalHistoryModule } from './medical-history/medical-history.module';


@NgModule({
  declarations: [
    VideoCallsComponent,
    // NotesComponent,
    // InvoicesComponent,
    // PrescriptionsComponent,
    // MedicalHistoryComponent,
    // RequisitionComponent,
    LeftPanelChatWrapper,
  ],
  imports: [
    UtilsModule,
    OpenTokCallModule,
    VideoCallsRoutingModule,
    DiagnosisModule,
    ChatModule,
    ClaimModule,
    medicalHistoryModule
  ],
  providers: [SessionManager],
  exports: [medicalHistoryModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideoCallsModule {}
