/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { HostListener, ViewContainerRef } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { ErrorService } from "../../service/error.service";
import { LocalStorageService } from "../../service/localStorage.service";
import { ToasterService } from "../../service/toaster.service";
import { OnboardService } from "../details/onboard.service";
import { AccountService } from "../../../account-settings/account.service";

@Component({
  selector: "app-translater",
  templateUrl: "./translater.component.html",
  styleUrls: ["./translater.component.scss"],
})
export class TranslaterComponent implements OnInit {
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  public lang: string;
  public dropdown_open: boolean = false;
  public innerWidth;
  public notificationData;
  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private onboardService: OnboardService,
    private accountService: AccountService,
    private toaster: ToasterService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    const langInLocal = this.localStorageService.getItem("language");
    if (langInLocal) {
      this.lang = langInLocal;
    } else {
      this.lang = "en";
      this.localStorageService.setItem("language", "en");
    }
    this.translate.use(this.lang);
  }

  /**
   * @param  {any} res
   */
   handleSuccess(res: any,language) {
    this.NotificationToggleValue(language);
    this.toaster.showSuccess(
      this.vref,
      "Success",
      "Your Prefered Language Also Changed"
    );
  }

  changeLang(language: string) {
    const userData = this.localStorageService.getItem("userData");
    if(userData){
      this.getPersonalDetails(language);
    }
    this.localStorageService.setItem("language", language);
    this.lang = language;
    this.translate.use(this.lang);
    this.dropdown_open = false;
  }

  getPersonalDetails(language) {
    let langList = [];
    let userData = this.localStorageService.getItem("userData") || {};
    if (userData["doctorId"]) {
      this.onboardService
        .getPersonalDetails(userData["doctorId"])
        .subscribe(
          (res) => {
             const profileData = res.data;
              profileData['languages'].forEach(element => {
                langList.push(element.id)
              });
              profileData['addressLine2'] = profileData['addressLine2'] ? profileData['addressLine2'] : "";
              profileData['preferredLanguage'] = language;
              profileData['userId'] = userData.userId;
              profileData['profileImage'] = profileData['profileImage'] ? profileData['profileImage'] : "";
              profileData['clinicPhoneNumber'] = profileData['clinicPhoneNumber'] ? profileData['clinicPhoneNumber'] : "";
              profileData['signature'] = profileData['signature'] ? profileData['signature'] : "";
              delete profileData.doctorId;
              delete profileData.phoneVerified;
              profileData.languages = langList;
             
              this.onboardService
              .updatePersonalDetails(profileData, userData["doctorId"])
              .subscribe(
                (res: any) => this.handleSuccess(res,language),
                (err: any) => this.errorHandler.handleError(err, this.vref)
              );
          },
          (err) => this.errorHandler.handleError(err, this.vref)
        );
    }
  }

  NotificationToggleValue(language) {
    this.accountService.getNotificationToggleValue().subscribe(
      (res: any) => {
        this.notificationData = res.data;
        this.setNotificationData(language);
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  } 

  setNotificationData(language: string){
    let body = {
      isEmailEnabled: this.notificationData.isEmailEnabled,
      isSMSEnabled: this.notificationData.isSMSEnabled,
      preferredLanguage:language
    };
    this.accountService.updateNotificationToggleValue(body).subscribe(
      (res: any) => {
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  dropdownOpen() {
    this.dropdown_open = !this.dropdown_open;
  }
}
