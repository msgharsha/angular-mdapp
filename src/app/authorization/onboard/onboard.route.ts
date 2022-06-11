/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Routes, RouterModule } from "@angular/router";
import { OnboardToken } from "../../utils/guards/token.guard";
import { OnboardComponent } from "./onboard.component";
import { Step1Component } from "./step1/step1.component";
import { Step2Component } from "./step2/step2.component";
import { Step3Component } from "./step3/step3.component";

const onboardRoutes: Routes = [
  {
    path: "",
    component: OnboardComponent,
    children: [
      { path: "", redirectTo: "step1", pathMatch: "full" },
      { path: "step1", component: Step1Component, canActivate: [OnboardToken] },
      { path: "step2", component: Step2Component, canActivate: [OnboardToken] },
      { path: "step3", component: Step3Component, canActivate: [OnboardToken] },
      { path: "**", redirectTo: "step1", pathMatch: "prefix" },
    ],
  },
];

export const routes = RouterModule.forChild(onboardRoutes);
