/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { TranslaterService } from "../../utils/service/translater.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  public selectedTab: number = 1;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translater: TranslaterService
  ) {
    this.handleTabSelection(this.router);
  }

  ngOnInit(): void {
    this.subscribeRouteChangeEvents();
    this.translater.TranslationAsPerSelection();
  }

  subscribeRouteChangeEvents() {
    this.router.events.subscribe((event) => {
      // console.log(event)
      if (event instanceof NavigationEnd) {
        this.handleTabSelection(event);
      }
    });
  }

  handleTabSelection(event) {
    if (event.url.includes("notifications")) {
      this.moveToSelectedTab(1);
    } else if (event.url.includes("change-password")) {
      this.moveToSelectedTab(2);
    }
  }

  moveToSelectedTab(index: number) {
    if (index === 1) {
      this.selectedTab = 1;
      this.router.navigateByUrl("accounts/settings/notifications");
    } else if (index === 2) {
      this.selectedTab = 2;
      this.router.navigateByUrl("accounts/settings/change-password");
    }
  }
}
