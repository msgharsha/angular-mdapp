/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { EssentialSignUpComponent } from "./register/essential-signup/essential-signup.component";
import { routes } from "./authorization.route";
import { AuthorizationService } from "./authorization.service";
import { OnboardService } from "../utils/component/details/onboard.service";
import { AuthorizationComponent } from "./authorization.component";
import { UtilsModule } from "../utils/utils.module";
import { WelcomeComponent } from "./register/welcome/welcome.component";
import { OtpComponent } from "./otp/otp.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { CountdownModule } from "ngx-countdown";
import { SignaturePadModule } from 'angular2-signaturepad';
import { WebcamComponent } from "./webcam/webcam.component";
import { SignatureFieldComponent } from "./signpad/signature-field/signature-field.component";
import { SignPadComponent } from "./signpad/signpad.component";
import {WebcamModule} from 'ngx-webcam';
import { NgxUploaderModule } from 'ngx-uploader';
import { NgxUploadModule } from '@wkoza/ngx-upload';
import { ScanResultComponent } from "./scanresult/scanresult.component";
import { selectDoctorModelComponent } from "./scanresult/selectdoctormodel/selected-doctor-modal.component";
import { selectLanguageModelComponent } from "./scanresult/selectdoctormodel/selected-language-modal.component";
import { healthcardModelComponent } from "./scanresult/selectdoctormodel/healthcard-modal.component";
import { ScanPatientRegisterDetailsComponent } from "./scanresult/patientregister/scanpatientregister-details.component";
import { DoctorService } from "../doctor/doctor.service";
import { AppointmentsService } from "../appointments/appointments.service";
import { NgxMaskModule } from "ngx-mask";


@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    routes,
    CommonModule,
    MatCheckboxModule,
    WebcamModule,
    NgxUploaderModule,
    NgxUploadModule.forRoot(),
    SignaturePadModule,
    MatSelectModule,
    UtilsModule,
    CountdownModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    EssentialSignUpComponent,
    AuthorizationComponent,
    WelcomeComponent,
    OtpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    WebcamComponent,
    SignatureFieldComponent,
    SignPadComponent,
    ScanResultComponent,
    selectDoctorModelComponent,
    selectLanguageModelComponent,
    healthcardModelComponent,
    ScanPatientRegisterDetailsComponent
  ],
  providers: [AuthorizationService,OnboardService,DoctorService,AppointmentsService],
  entryComponents: [selectDoctorModelComponent,healthcardModelComponent,selectLanguageModelComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AuthorizationModule {}
