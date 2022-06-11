/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, ViewContainerRef, ChangeDetectorRef, AfterContentChecked } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { LoaderService } from "./utils/component/loader/loader.service";
import { ToasterService } from "./utils/service/toaster.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements AfterContentChecked {
  title = "app";
  showLoader: boolean;
  isLoggedIn: boolean = false;
  headerDisplay: boolean;
  sideBar: boolean;

  constructor(
    private loaderService: LoaderService,
    private router: Router,
    private toast: ToasterService,
    private cdr: ChangeDetectorRef,
    vref: ViewContainerRef
  ) {
   
    this.routeChangeSubscribe();
    this.toast.viewContainerRef = vref;
    this.loaderService.status.subscribe((val: boolean) => {
      this.showLoader = val;
    });
  }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }


  routeChangeSubscribe() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.hideHeaderAndSide(event);
    });
  }

  hideHeaderAndSide(event) {
    if (event.url.includes("onboard")) {
      this.headerDisplay = true;
      this.sideBar = false;
      return;
    }

    if (
      event.url == "/" ||
      event.url.includes("auth") ||
      (event.url.includes("/video-call") &&
        !event.url.includes("/appointment/video-call"))
    ) {
      this.headerDisplay = false;
      this.sideBar = false;
    } else {
      this.headerDisplay = true;
      this.sideBar = true;
    }
  }
}
