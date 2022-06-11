/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ManagePaymentComponent } from "./manage-payment.component";
import { ManagePaymentRoutingModule } from "./manage-payment.routing";
import { UtilsModule } from "../utils/utils.module";
import { PaymentDetailsComponent } from "./payment-details/payment-details.component";
import { NgxCsvParserModule } from "ngx-csv-parser";
import { ManagePaymentService } from "./manage-payment.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { NgxPaginationModule } from "ngx-pagination";
import { MatTabsModule } from "@angular/material/tabs";

import { ClaimModule } from '../claim-module/claim-module';

@NgModule({
  declarations: [
    ManagePaymentComponent, 
    PaymentDetailsComponent
  ],
  imports: [
    CommonModule,
    ManagePaymentRoutingModule,
    UtilsModule,
    NgxCsvParserModule,
    MatDatepickerModule,
    MatSelectModule,
    MatAutocompleteModule,
    NgxPaginationModule,
    MatTabsModule,
    ClaimModule
  ],
  providers: [ManagePaymentService],
})
export class ManagePaymentModule {}
