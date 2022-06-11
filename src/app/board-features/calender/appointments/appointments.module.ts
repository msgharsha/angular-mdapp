/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { AppointmentService } from "./appointments.service";
import { NgModule } from "@angular/core";
import { UtilsModule } from "../../../utils/utils.module";
import { AppointmentDetailComponent } from "./appointment-detail/appointment-detail.component";
import { AppointmentsComponent } from "./appointments.component";
import { AppointmentsRoutingModule } from "./appointments.route";
import { CalendarAppointmentComponent } from "./calendar-appointment/calendar-appointment.component";
import { AppointmentProviderDateTemplateComponent } from "./appointment-provider-date-template/appointment-provider-date-template.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DateAdapter } from "@angular/material/core";
import { CalendarModule } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { MomentModule } from "ngx-moment";
import { NgxPaginationModule } from "ngx-pagination";
import { MatTabsModule } from "@angular/material/tabs";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    AppointmentsComponent,
    AppointmentDetailComponent,
    CalendarAppointmentComponent,
    AppointmentProviderDateTemplateComponent,
  ],
  imports: [
    UtilsModule,
    CommonModule,
    AppointmentsRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgbModule,
    MomentModule,
    NgxPaginationModule,
    MatTabsModule,
  ],
  providers: [AppointmentService],
})
export class AppointmentModule {}
