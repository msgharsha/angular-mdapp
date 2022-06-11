/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { NgxPaginationModule } from "ngx-pagination";
import { UtilsModule } from "../../utils/utils.module";
import { GeoLocationComponent } from "./components/geo-location/geo-location.component";
import { MapComponent } from "./components/map/map.component";
import { TimingsPipe } from "./pipes/timings.pipe";

const sharedComponent = [
  GeoLocationComponent,
  MapComponent,
];

@NgModule({
  declarations: [...sharedComponent, TimingsPipe],
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    UtilsModule,
  ],
  exports: [...sharedComponent],
})
export class DocUtilsModule {}
