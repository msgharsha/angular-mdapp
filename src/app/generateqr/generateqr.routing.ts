
 import { NgModule } from "@angular/core";
 import { RouterModule, Routes } from "@angular/router";
 import { GenerateqrDetailsComponent } from './generateqr-details/generateqr-details.component';
 
 const routes: Routes = [
    {
        path: "",
        component: GenerateqrDetailsComponent
    },
 ];
 
 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule],
 })
 export class GenerateqrRoutingModule {}
 