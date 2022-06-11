/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserRoleService } from "../utils/service/user_role.service";
import { AccountService } from "./account.service";
import { ErrorService } from "../utils/service/error.service";
import { EventService } from "../utils/service/eventservice";
import * as _ from "lodash";

@Component({
  selector: "app-account-settings",
  templateUrl: "./account-settings.component.html",
  styleUrls: ["./account-settings.component.scss"],
})
export class AccountSettingsComponent implements OnInit {
  type = "profile";
  public profileManager = [];
  public UnApprovedDoctor: boolean = false;
  isSideNavDisabled:any;

  constructor(
    private routeInfo: ActivatedRoute, 
    private router: Router,
    private vref: ViewContainerRef,
    private errorHandler: ErrorService,
    private accountService: AccountService, 
    private userRoleService: UserRoleService,
    public eventService: EventService
    ) {
      this.routeInfo.params.subscribe((param) => {
      this.type = this.router.url || "profile";
    });
  }

  ngOnInit(): void {
    this.eventService.SideNavDisableOnSubscription.subscribe(data => {
      this.isSideNavDisabled = data;
    })
    this.getDoctorStatus();
    this.getSubscriptionPlans();
  }

  getSubscriptionPlans() {
    this.accountService.getSubscriptionPlans().subscribe(
      (res) => {
        this.profileManager = JSON.parse(_.get(res, "data[0].user_profile_list", {}));
      },
      (err) => {
        this.errorHandler.handleError(err, this.vref);
      }
    );
  }

  getDoctorStatus() {
    this.accountService.getDoctorStatus().subscribe((res: any) => {
      if (res.data.status != "active") {
        this.UnApprovedDoctor = true;
      }
    });
  }

  checkPermission(state) {
    return this.userRoleService.checkPermission(state);
  }

  navigateTo(type) {
    this.type = type;
    this.router.navigateByUrl("accounts/" + type);
  }

}
