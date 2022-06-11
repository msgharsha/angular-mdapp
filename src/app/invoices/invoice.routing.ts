
 import { NgModule } from "@angular/core";
 import { RouterModule, Routes } from "@angular/router";
 import { SubscriptionInvoiceComponent } from './subscriptioninvoice/subscriptioninvoice.component';
 
 const routes: Routes = [
    {
        path: "",
        component: SubscriptionInvoiceComponent
    },
 ];
 
 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
 })
 export class InvoiceRoutingModule {}
 