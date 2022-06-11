/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ManagePaymentComponent } from "./manage-payment.component";
import { PaymentDetailsComponent } from "./payment-details/payment-details.component";

const routes: Routes = [
  {
    path: "",
    component: ManagePaymentComponent,
    children: [
      { path: "", redirectTo: "payment-details", pathMatch: "full" },
      { path: "payment-details", component: PaymentDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagePaymentRoutingModule {}
