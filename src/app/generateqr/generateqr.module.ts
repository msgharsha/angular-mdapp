
 import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { GenerateqrDetailsComponent } from './generateqr-details/generateqr-details.component';
 import { GenerateqrRoutingModule } from "./generateqr.routing";
 import { NgxPaginationModule } from "ngx-pagination";
 import { NgxMaskModule } from "ngx-mask";
 import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
 
 @NgModule({
   declarations: [ GenerateqrDetailsComponent],
   imports: [CommonModule, UtilsModule, GenerateqrRoutingModule,NgxPaginationModule,NgxQRCodeModule,NgxMaskModule.forRoot()],
   schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
 })
 export class GenerateqrModule {}
 