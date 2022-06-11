/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { UtilsModule } from "../../utils/utils.module";
import { routes } from "./onboard.route";
import { AuthorizationService } from "../authorization.service";
import { OnboardComponent } from "./onboard.component";
import { Step1Component } from "./step1/step1.component";
import { Step2Component } from "./step2/step2.component";
import { Step3Component } from "./step3/step3.component";
import { OnboardSidebarComponent } from "./onboard-sidebar/onboard-sidebar.component";

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    routes,
    CommonModule,
    MatCheckboxModule,
    MatSelectModule,
    UtilsModule,
  ],
  declarations: [
    OnboardComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    OnboardSidebarComponent,
  ],
  providers: [AuthorizationService],
})
export class OnboardModule {}
