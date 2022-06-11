/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Routes, RouterModule } from "@angular/router";
import { TermsAndConditionComponent } from "./terms-and-condition/terms-condition.component";
import {
  NavigateIfTokenDoesntExist,
  NavigateIfTokenExist,
  SubscriptionSuspendedGuard
} from "./utils/guards/token.guard";

const appRoutes: Routes = [
  { path: "", redirectTo: "auth", pathMatch: "prefix" },
  {
    path: "auth",
    loadChildren: () =>
      import("./authorization/authorization.module").then(
        (m) => m.AuthorizationModule
      ),
    canActivate: [NavigateIfTokenExist,SubscriptionSuspendedGuard],
  },
  {
    path: "feature",
    loadChildren: () =>
      import("./board-features/board-features.module").then(
        (m) => m.BoardFeatureModule
      ),
    canActivate: [NavigateIfTokenDoesntExist,SubscriptionSuspendedGuard],
  },
  {
    path: "accounts",
    loadChildren: () =>
      import("./account-settings/account-settings.module").then(
        (m) => m.AccountSettingsModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "repository",
    loadChildren: () =>
      import("./repository/repository.module").then((m) => m.RepositoryModule),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "video-call",
    loadChildren: () =>
      import(
        "./board-features/calender/appointments/video-call/video-call.module"
      ).then((m) => m.VideoCallModule),
  },
  {
    path: "patients",
    loadChildren: () =>
      import("./patients/patients.module").then((m) => m.PatientsModule),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  { path: "terms-and-conditions", component: TermsAndConditionComponent },
  {
    path: "payments",
    loadChildren: () =>
      import("./manage-payments/manage-payment.module").then(
        (m) => m.ManagePaymentModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "invoices",
    loadChildren: () =>
      import("./invoices/invoice.module").then(
        (m) => m.InvoiceModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "manage-forms",
    loadChildren: () =>
      import("./manage-forms/manage-forms.module").then(
        (m) => m.ManageFormsModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "form-editor",
    loadChildren: () =>
      import("./pdf-forms/pdf-forms.module").then(
        (m) => m.PDFFormsModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "bookappointment",
    loadChildren: () =>
      import("./book-appointment/book-appointments.module").then(
        (m) => m.BookAppointmentModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "doctor",
    loadChildren: () =>
      import("./doctor/doctor.module").then((m) => m.DoctorModule),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "appointments",
    loadChildren: () =>
      import("./appointments/appointments.module").then(
        (m) => m.AppointmentsModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "patientregister",
    loadChildren: () =>
      import("./patientregister/patientregister.module").then(
        (m) => m.PatientRegisterModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  {
    path: "generateqr",
    loadChildren: () =>
      import("./generateqr/generateqr.module").then(
        (m) => m.GenerateqrModule
      ),
    canActivate: [NavigateIfTokenDoesntExist],
  },
  { path: "**", redirectTo: "" },
];
export const routing = RouterModule.forRoot(appRoutes);
