/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { NavigationEnd } from "@angular/router";
import { Router } from "@angular/router";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import * as _ from "lodash";

@Component({
  selector: "app-onboard-sidebar",
  templateUrl: "./onboard-sidebar.component.html",
  styleUrls: ["./onboard-sidebar.component.scss"],
})
export class OnboardSidebarComponent implements OnInit {
  public selectedTab = 1;
  public currentOnboardStep = 1;
  public userData: any;
  public isTabSelected: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCurrentOnboardStep();
    this.routeChangeSubscribe();
  }

  getCurrentOnboardStep() {
    this.userData = this.localStorageService.getItem("userData");
    this.currentOnboardStep = +this.userData["onboardStep"];
    this.selectedTab = this.currentOnboardStep;
    const path = window.location.pathname;
    const step = +path[path.length - 1];
    if (!_.isNaN(step)) {
      this.selectedTab = step;
    }
  }

  routeChangeSubscribe() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getCurrentOnboardStep();
      }
    });
  }

  setSelectedTab(index) {
    if (index > this.currentOnboardStep) {
      return;
    }
    this.isTabSelected = true;
    this.selectedTab = index;
    this.router.navigateByUrl(`auth/onboard/step${this.selectedTab}`);
  }
}
