/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { TranslaterService } from "../utils/service/translater.service";
@Component({
  selector: "app-patients",
  templateUrl: "./patients.component.html",
  styleUrls: ["./patients.component.scss"],
})
export class PatientsComponent implements OnInit {
  public selectedTab = 1;
  public routeEvent: any;
  constructor(
    private _router: Router,
    private translater: TranslaterService,
    private activatedRoute: ActivatedRoute
  ) {
    this.subscribeRouteChangeEvents();
  }

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
  }

  subscribeRouteChangeEvents() {
    this.routeEvent = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleTabSelection(event);
      }
    });
  }

  handleTabSelection(event) {
    if (event.url.includes("patient-list")) {
      this.moveToSelectedTab(1);
    } else if (event.url.includes("invite-patient")) {
      this.moveToSelectedTab(2);
    } else if (event.url.includes("accept-patient")) {
      this.moveToSelectedTab(3);
    }
  }

  moveToSelectedTab(index: number) {
    if (index === 1) {
      this._router.navigate(["patients/patient-list"]);
      this.selectedTab = 1;
    } else if (index === 2) {
      this._router.navigate(["patients/invite-patients"]);
      this.selectedTab = 2;
    } else if (index === 3) {
      this._router.navigate(["patients/accept-patients"]);
      this.selectedTab = 3;
    }
  }

  ngOnDestroy() {
    this.routeEvent.unsubscribe();
  }
}
