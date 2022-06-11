/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { RouterModule, Routes } from "@angular/router";
import { EssentialSignUpComponent } from "./register/essential-signup/essential-signup.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { OtpComponent } from "./otp/otp.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { WebcamComponent } from "./webcam/webcam.component";
import { SignPadComponent } from "./signpad/signpad.component";
import { ShortlinkComponent } from "./shortlink/shortlink.component";
import { ScanResultComponent } from "./scanresult/scanresult.component";
import { ScanPatientRegisterDetailsComponent } from "./scanresult/patientregister/scanpatientregister-details.component";
import { DoctorProfileComponent } from "../doctor/doctor-profile/doctor-profile.component";
import { BookAppointmentsComponent } from "../appointments/book-appointments/book-appointments.component"

const registerRoutes: Routes = [
  { path: "", component: EssentialSignUpComponent },
  { path: "**", redirectTo: "" },
];

const authRoutes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "prefix" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent, children: registerRoutes },
  { path: "verify-otp", component: OtpComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password", component: ResetPasswordComponent },
  { path: "webcam", component: WebcamComponent },
  { path: "signpad", component: SignPadComponent },
  { path: "cactusLink", component: ShortlinkComponent },
  { path: "qrcodescanresult", component: ScanResultComponent },
  { path: "qrcodepatientregister", component: ScanPatientRegisterDetailsComponent },
  { path: "profile/:id", component: DoctorProfileComponent },
  { path: "book/:id", component: BookAppointmentsComponent},
  {
    path: "onboard",
    loadChildren: () =>
      import("./onboard/onboard.module").then((m) => m.OnboardModule),
  },
];

export const routes = RouterModule.forChild(authRoutes);
