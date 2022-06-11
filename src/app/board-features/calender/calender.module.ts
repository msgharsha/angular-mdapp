/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { UtilsModule } from "../../utils/utils.module";
import { AppointmentService } from "./appointments/appointments.service";
import { CalenderComponent } from "./calender.component";
import { CalenderRoutingModule } from "./calender.route";
import { CancelAppointmentModalComponent } from "./utils/cancel-appointment-modal/cancel-appointment-modal.component";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { CommonModule, registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { CalendarService } from "./calendar.service";
import { AvailabilityComponent } from "./availability/availability.component";
import { AddEditAvailabilityComponent } from "./availability/add-edit-availability/add-edit-availability.component";
import { AvailabilityPracticeDateTemplateComponent } from "./availability/availability-practice-date-template/availability-practice-date-template.component";
import { AvailabilityProviderDateTemplateComponent } from "./availability/availability-provider-date-template/availability-provider-date-template.component";
import { CalendarAvailabilityComponent } from "./availability/calendar-availability/calendar-availability.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MomentModule } from "ngx-moment";
import { MedicalHistoryModalComponent } from "./medical-history-modal/medical-history-modal.component";
import { VideoCallsModule } from "./appointments/video-calls/video-calls.module";

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    CalenderComponent,
    AvailabilityComponent,
    AddEditAvailabilityComponent,
    CalendarAvailabilityComponent,
    CancelAppointmentModalComponent,
    AvailabilityProviderDateTemplateComponent,
    AvailabilityPracticeDateTemplateComponent,
    MedicalHistoryModalComponent,
  ],
  imports: [
    UtilsModule,
    CommonModule,
    CalenderRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgbModule,
    MomentModule,
    VideoCallsModule,
  ],
  providers: [AppointmentService, CalendarService],
  entryComponents: [MedicalHistoryModalComponent],
})
export class CalenderModule {}
