/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

 import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
 import { CommonModule } from "@angular/common";
 import { UtilsModule } from "../utils/utils.module";
 import { MatIconModule } from '@angular/material/icon';
 import { MatTableModule } from "@angular/material/table";
 import { MatDialogModule } from "@angular/material/dialog";
 import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Daterangepicker } from "ng2-daterangepicker";

 import { ClaimDetailsComponent } from './claim-details/claim-details.component';
 import { ClaimModelComponent } from './claim-details/claim-model.component';
 import { CreateClaimComponent } from './create-claim/claim-component';
 import {NgxMatTimepickerModule} from 'ngx-mat-timepicker';

 import { NumberDirective } from './services/numbers-only.directive';
 
 @NgModule({
   declarations: [
    ClaimDetailsComponent,
    CreateClaimComponent,
    ClaimModelComponent,
    NumberDirective
   ],
   imports: [
    MatTableModule,
    CommonModule,
    UtilsModule,
    NgSelectModule,
    NgbModule,
    FontAwesomeModule,
    NgxMatTimepickerModule,
    MatIconModule,
    Daterangepicker,
    MatDialogModule
   ],
   exports: [
    ClaimDetailsComponent,
    CreateClaimComponent
   ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
   entryComponents: [
    ClaimModelComponent
   ],
   providers: [],
 })
 export class ClaimModule {}
 