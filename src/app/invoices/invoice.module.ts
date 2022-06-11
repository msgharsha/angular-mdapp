
 import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { SubscriptionInvoiceComponent } from './subscriptioninvoice/subscriptioninvoice.component';
 import { InvoiceRoutingModule } from "./invoice.routing";
 import { NgxPaginationModule } from "ngx-pagination";
 
 @NgModule({
   declarations: [ SubscriptionInvoiceComponent],
   imports: [CommonModule, UtilsModule, InvoiceRoutingModule,NgxPaginationModule],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
 })
 export class InvoiceModule {}
 