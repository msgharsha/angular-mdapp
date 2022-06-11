/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { TranslaterService } from "../../../utils/service/translater.service";
import { AccountService } from "../../account.service";
import { ToasterService } from "../../../utils/service/toaster.service";
import { ErrorService } from "../../../utils/service/error.service";
import { MSG } from "../../../constants/messages";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.scss"],
})
export class NotificationsComponent implements OnInit {
  public isEmailCheck: boolean;
  public isSmsCheck: boolean;
  public preferredLanguage;
  constructor(
    private translater: TranslaterService,
    private accountService: AccountService,
    private toaster: ToasterService,
    private vref: ViewContainerRef,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
    this.NotificationToggleValue();
  }
  NotificationToggleValue() {
    this.accountService.getNotificationToggleValue().subscribe(
      (res: any) => {
        if (res.data) {
          this.isEmailCheck = res.data.isEmailEnabled;
          this.isSmsCheck = res.data.isSMSEnabled;
          this.preferredLanguage = res.data.preferredLanguage
        }
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  onToggleChange() {
    let body = {
      isEmailEnabled: this.isEmailCheck,
      isSMSEnabled: this.isSmsCheck,
      preferredLanguage: this.preferredLanguage
    };
    this.accountService.updateNotificationToggleValue(body).subscribe(
      (res: any) => {
        this.toaster.showSuccess(
          this.vref,
          "SUCCESS",
          MSG.NOTIFICATION_SETTINGS_UPDATED_SUCCESSFULLY
        );
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }
}
