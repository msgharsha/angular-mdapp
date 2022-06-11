/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { DialogModalComponent } from "./component/cancel-modal/cancel-modal.component";
import { CamImageConfirmComponent } from "./component/camimageconfirm-modal/camimageconfirm-modal.component";
import { ViewInvitationModalComponent } from "./component/view-invitation/view-invitation.component";
import { PrescriptionService } from "./service/presciption.sevice";
import { UserService } from "./service/user.service";
import { NgModule, ModuleWithProviders } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatPaginatorModule } from "@angular/material/paginator"; 
import { MatDatepickerModule } from "@angular/material/datepicker";
import { HttpService } from "./service/http.service";
import { ErrorService } from "./service/error.service";
import { ToasterService } from "./service/toaster.service";
import { LocalStorageService } from "./service/localStorage.service";
import { TranslaterService } from "./service/translater.service";
import { DynamicOtpService } from "./service/dynamic-otp.service";
import { MessagingService } from "./service/messaging.service";
import {
  NavigateIfTokenExist,
  NavigateIfTokenDoesntExist,
  SubscriptionSuspendedGuard,
  OnboardToken,
} from "./guards/token.guard";
import { LoaderComponent } from "./component/loader/loader.component";
import { LoaderService } from "./component/loader/loader.service";
import { RouterModule } from "@angular/router";
import { HomeSidebarComponent } from "./component/home-sidebar/home-sidebar.component";
import { ImageCropModalComponent } from "./component/file-upload/image-crop-modal/image-crop-modal.component";
import { FileUploadComponent } from "./component/file-upload/file-upload.component";
import { FileViwerComponent } from "./component/file-viwer/file-viwer.component";
import { TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { TranslaterComponent } from "./component/translater/translater.component";
import { MoveNextByMaxLengthDirective } from "./directives/moveNextInput";
import { PersonalDetailsComponent } from "./component/details/personal-details/personal-details.component";
import { PracticeDetailsComponent } from "./component/details/practice-details/practice-details.component";
import { SubscriptionDetailsComponent } from "./component/details/subscription-details/subscription-details.component";
import { OnboardService } from "./component/details/onboard.service";
import { AccountService } from "../account-settings/account.service";
import { ImageViewerModule } from "./component/image-viewer/image-viewer.module";
import { NgxMaskModule } from "ngx-mask";
import { PopoverModule } from "ngx-smart-popover";
import { AutoCompleteComponent } from "./component/autocomplete/autoComplete.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { EditorModule } from "@tinymce/tinymce-angular";
import { HelperService } from "./service/helper.service";
import { DobConversionIntoAgePipe } from "./pipe/dob-conversion-into-age.pipe";
import { DynamicOtpComponent } from "./component/dynamic-otp/dynamic-otp.component";
import { DynamicPatientOtpComponent } from "./component/dynamic-patientotp/dynamic-patientotp.component";
import { DynamicPatientEmailOtpComponent } from "./component/dynamic-patientemailotp/dynamic-patientemailotp.component";
import { CalendarHeaderComponent } from "../board-features/calender/utils/calendar-header/calendar-header.component";
import { AppointmentListingComponent } from "../board-features/calender/appointments/appointment-listing/appointment-listing.component";
import { NgxPaginationModule } from "ngx-pagination";
import { MatIconModule } from "@angular/material/icon";
import { OtpTimePipe } from "./pipe/time.pipe";
import { InterceptorService } from "./interceptor/http-interceptor.service";
import { BreadcrumbComponent } from "./component/breadcrumb/breadcrumb.component";
import { TableComponent } from "./component/table/table.component";
import { CommonTableComponent } from "./component/common-table/common.table.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { CountdownModule } from "ngx-countdown";
import { ConfirmModalComponent } from "./component/details/subscription-details/confirmation-modal/confirmation-modal.component";
import { AlertModalComponent } from "./component/confirm-modal/confirm-modal.component";
import { DashboardService } from "./service/dashboard.service";
import { FaxTableComponent } from "./component/details/practice-details/fax-table/fax-table.component";
import { FaxModalComponent } from "./component/details/practice-details/fax-modal/fax-modal.component";
import { OtpModalComponent } from "./component/details/practice-details/otp-modal/otp-modal.component";
import { FilterComponent } from "./component/filter/filter.component";
import { TermsAndPolicyComponent } from "./component/terms-and-policy/terms-and-policy.component";
import { DatePickerComponent } from "./component/date-picker/date-picker.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RadioBtnComponent } from "./component/radio-btn/radio-btn.component";
import { TermAndConditionComponent } from "./component/term-and-condition/term-and-condition.component";
import { TimezoneModalComponent } from "./component/timezone-modal/timezone-modal.component";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
const sharedModule = [
  RouterModule,
  HttpClientModule,
  FormsModule,
  CommonModule,
  ReactiveFormsModule,
  EditorModule,
  InfiniteScrollModule,
];

const sharedComponents = [
  HomeSidebarComponent,
  ImageCropModalComponent,
  FileUploadComponent,
  FileViwerComponent,
  TranslaterComponent,
  MoveNextByMaxLengthDirective,
  PersonalDetailsComponent,
  PracticeDetailsComponent,
  SubscriptionDetailsComponent,
  AutoCompleteComponent,
  DobConversionIntoAgePipe,
  DynamicOtpComponent,
  DynamicPatientOtpComponent,
  DynamicPatientEmailOtpComponent,
  CalendarHeaderComponent,
  AppointmentListingComponent,
  OtpTimePipe,
  FilterComponent,
  DatePickerComponent,
  CommonTableComponent
];

@NgModule({
  imports: [
    ...sharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxDocViewerModule,
    TranslateModule,
    ImageViewerModule,
    NgbModule,
    NgxMaskModule.forRoot(),
    PopoverModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxPaginationModule,
    MatIconModule,
    CountdownModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatPaginatorModule
  ],
  declarations: [
    ...sharedComponents,
    LoaderComponent,
    DialogModalComponent,
    CamImageConfirmComponent,
    ViewInvitationModalComponent,
    ConfirmModalComponent,
    AlertModalComponent,
    TranslaterComponent,
    DynamicOtpComponent,
    DynamicPatientOtpComponent,
    DynamicPatientEmailOtpComponent,
    BreadcrumbComponent,
    TableComponent,
    FaxTableComponent,
    FaxModalComponent,
    OtpModalComponent,
    TermsAndPolicyComponent,
    RadioBtnComponent,
    CommonTableComponent,
    TermAndConditionComponent,
    TimezoneModalComponent
  ],
  providers: [
    HttpService,
    ErrorService,
    ToasterService,
    LocalStorageService,
    NavigateIfTokenExist,
    SubscriptionSuspendedGuard,
    NavigateIfTokenDoesntExist,
    OnboardToken,
    UserService,
    PrescriptionService,
    TranslaterService,
    MessagingService,
    DynamicOtpService,
    HelperService,
    OnboardService,
    AccountService,
    DashboardService,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
  ],
  entryComponents: [DialogModalComponent, CamImageConfirmComponent, ViewInvitationModalComponent, ConfirmModalComponent,AlertModalComponent,TimezoneModalComponent],
  exports: [
    ...sharedModule,
    ...sharedComponents,
    LoaderComponent,
    TranslateModule,
    NgMultiSelectDropDownModule,
    TableComponent,
    RadioBtnComponent,
    MatPaginatorModule
  ],
})
export class UtilsModule {
  static forRoot(): ModuleWithProviders<UtilsModule> {
    return {
      ngModule: UtilsModule,
      providers: [HttpService, LoaderService],
    };
  }
}
