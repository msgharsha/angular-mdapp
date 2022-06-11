/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { UserService } from "../../service/user.service";
import { TranslaterService } from "../../service/translater.service";
import { HelperService } from "../../service/helper.service";
import { HostListener } from "@angular/core";
import { LocalStorageService } from "../../service/localStorage.service";
import { MessagingService } from "../../service/messaging.service";
import { EventService } from "../../service/eventservice";
import { UserRoleService } from "../../service/user_role.service";

@Component({
  selector: "app-home-sidebar",
  templateUrl: "./home-sidebar.component.html",
  styleUrls: ["./home-sidebar.component.scss"],
})
export class HomeSidebarComponent implements OnInit {
  screenFreeze: any;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  sideBarDisplay: boolean;
  selectedTab = 1;
  innerWidth;
  isSideNavDisabled:any;
  public userData;

  constructor(
    private userService: UserService,
    private router: Router,
    private translater: TranslaterService,
    private helperService: HelperService,
    private localstorage: LocalStorageService,
    public messagingService: MessagingService,
    private userRoleService: UserRoleService,
    public eventService: EventService
  ) {
    this.userData = this.localstorage.getItem("userData");
  }

  ngOnInit(): void {
    this.screenFreeze = false;
    this.innerWidth = window.innerWidth;
    this.routeChangeSubscribe();
    this.translater.TranslationAsPerSelection();
    this.eventService.sideNavOnConsultation.subscribe(data => {
      this.isSideNavDisabled = data;
    })
    this.eventService.SideNavDisableOnSubscription.subscribe(data => {
      this.isSideNavDisabled = data;
    })
    this.eventService.StatusOnActiveDocor.subscribe(data => {
      this.screenFreeze = data;
    })
    this.eventService.reloadUserData.subscribe(data => {
      this.userData = this.localstorage.getItem("userData");
    })
  }

  checkPermission(state) {
    return this.userRoleService.checkPermission(state);
  }

  routeChangeSubscribe() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.HideSiideBar(event);
        this.checkForTab(event);
      }
    });
  }

  checkForTab(event) {
    if (this.isCalendarTab(event.url)) {
      this.selectedTab = 2;
    } else if (event.url.includes("accounts")) {
      this.selectedTab = 5;
    } else if (event.url.includes("repository")) {
      this.selectedTab = 6;
    } else if (event.url.includes("patients")) {
      this.selectedTab = 4;
    } else if (event.url.includes("manage-forms")) {
      this.selectedTab = 7;
    } else if (event.url.includes("payment")) {
      this.selectedTab = 3;
    } else if (event.url.includes("invoices")) {
      this.selectedTab = 8;
    } else if (event.url.includes("bookappointment")) {
      this.selectedTab = 9;
    } else if (event.url.includes("patientregister")) {
      this.selectedTab = 10;
    }else if (event.url.includes("generateqr")) {
      this.selectedTab = 11;
    } else {
      this.selectedTab = 1;
    }
  }

  isCalendarTab(url) {
    return (
      url.includes("feature/calendar") ||
      url.includes("/calendar/appointment/video-call") ||
      url.includes("/calendar/availability")
    );
  }

  onTabSelection(index) {
    this.selectedTab = +index;
    if (index == 1) {
      this.router.navigateByUrl("feature/dashboard");
    } else if (index == 2) {
      this.router.navigateByUrl("feature/calendar/availability");
    } else if (index == 3) {
      this.router.navigateByUrl("payments");
    } else if (index == 4) {
      this.router.navigateByUrl("patients");
    } else if (index == 5) {
      this.router.navigateByUrl("accounts");
    } else if (index == 6) {
      this.router.navigateByUrl("repository");
    } else if (index == 7) {
      this.router.navigateByUrl("manage-forms")
    } else if (index == 8) {
      this.router.navigateByUrl("invoices")
    } else if (index == 9) {
      this.router.navigateByUrl("bookappointment")
    } else if (index == 10) {
      this.router.navigateByUrl("patientregister")
    } else if (index == 11) {
      this.router.navigateByUrl("generateqr")
    }
  }

  HideSiideBar(event) {
    if (
      event.url.includes("/login") ||
      event.url.includes("/register") ||
      event.url.includes("/onboard")
    ) {
      this.sideBarDisplay = false;
    } else {
      this.sideBarDisplay = true;
    }
  }

  toggleSidebar() {
    this.helperService.toggleSidebar();
  }

  changePassword() {
    this.router.navigateByUrl("accounts/settings/change-password");
  }

  /**
   * Function to logout
   */
  logout() {
    this.messagingService.deleteFcmToken();
    this.userService.logout();
    this.router.navigateByUrl("/auth/login");
  }
}
