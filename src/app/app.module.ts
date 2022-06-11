/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { HeaderChatWrapper } from "./header/left-panel/left-panel-wrapper.component"
import { routing } from "./app.route";
import { UtilsModule } from "./utils/utils.module";
import { ToastrModule } from "ngx-toastr";
import { TermsAndConditionComponent } from "./terms-and-condition/terms-condition.component";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { HelperService } from "./utils/service/helper.service";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireModule } from "@angular/fire";
import { AsyncPipe } from "../../node_modules/@angular/common";
import { environment } from "../environments/environment";
import { RepositoryModule } from "./repository/repository.module";
import { HeaderChatModule } from "./header/chat/chat.module"

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    TermsAndConditionComponent,
    HeaderChatWrapper
  ],
  imports: [
    BrowserModule,
    routing,
    UtilsModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 9000}),
    BrowserAnimationsModule,
    HttpClientModule,
    HeaderChatModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    RepositoryModule,
  ],
  providers: [HelperService, AsyncPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
