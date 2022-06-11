/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { MessagingService } from "../../utils/service/messaging.service";
import { ErrorService } from "../../utils/service/error.service";
import { TranslaterService } from "../../utils/service/translater.service";
import * as moment from "moment";

@Component({
  selector: "app-inbox-notification",
  templateUrl: "./inbox-notification.component.html",
  styleUrls: ["./inbox-notification.component.scss"],
})
export class InboxNotificationComponent implements OnInit {
  public inboxList;
  public lastInboxList;
  public count;
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  selector: string = ".main-panel";

  constructor(
    public messagingService: MessagingService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private translater: TranslaterService
  ) {}

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
    this.getInboxListing(this.currentPage);
  }

  getInboxListing(pageNo) {
    let params = {
      skip: (pageNo - 1) * this.itemsPerPage,
      limit: this.itemsPerPage,
    };
    this.messagingService.getInboxListing(params).subscribe(
      (res) => {
        this.count = res.data.count;
        res.data.messages.forEach((element) => {
          element.timestamp = moment(element.timestamp).format(
            "MMMM Do YYYY, hh:mm a"
          );
        });
        if (this.currentPage == 1) {
          this.inboxList = res.data ? res.data.messages : [];
        } else {
          this.inboxList = [
            ...this.inboxList,
            ...(res.data ? res.data.messages : []),
          ];
        }
      },
      (err) => this.errorHandler.handleError(err, this.vref)
    );
  }

  onScrollDown(event) {
    if (this.currentPage * this.itemsPerPage < this.count) {
      this.currentPage = this.currentPage + 1;
      this.getInboxListing(this.currentPage);
    }
  }
}
