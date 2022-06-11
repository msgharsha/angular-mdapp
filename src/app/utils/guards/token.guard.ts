/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { LocalStorageService } from "../service/localStorage.service";
import { ToasterService } from "../service/toaster.service";
import { EventService } from "../service/eventservice";

@Injectable()
export class NavigateIfTokenExist implements CanActivate {
  public userData;
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  canActivate() {
    this.userData = this.localStorageService.getItem("userData");

    if (
      this.localStorageService.getAccessToken() &&
      this.userData?.onboardStep === 4 &&
      this.userData?.isOtpVerified
    ) {
      this.router.navigateByUrl("/feature");
      return false;
    } else {
      return true;
    }
  }
}

@Injectable()
export class NavigateIfTokenDoesntExist implements CanActivate {
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}
  canActivate() {
    if (!this.localStorageService.getAccessToken()) {
      this.router.navigateByUrl("/auth/login");
      return false;
    } else {
      return true;
    }
  }
}

@Injectable()
export class SubscriptionSuspendedGuard implements CanActivate {
  constructor(
    private localStorageService: LocalStorageService,
    private eventService: EventService,
    private router: Router
  ) {}

  canActivate() {
    const userData = this.localStorageService.getItem("userData");
    console.log(userData);
    if (userData && !userData.subAccount) {
      if (
        userData.subscriptionStatus == "cancelled"
      ) {
        this.eventService.setSideNavDisableOnSubscription(true);
        this.router.navigateByUrl("accounts/subscription");

        return false;
      } 
    }
    return true;
  }
}

@Injectable()
export class OnboardToken implements CanActivate {
  public userData: any;

  constructor(
    private localStorageService: LocalStorageService,
    private toasterService: ToasterService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.userData = this.localStorageService.getItem("userData");
    if (!this.userData) {
      this.router.navigateByUrl(`/auth/login`);
      return true;
    }

    const [, requestedPath] = state.url.split("step");
    const currentOnboardStep = +this.userData["onboardStep"];
    if (+requestedPath > currentOnboardStep) {
      this.toasterService.showInfo(
        null,
        null,
        this.createStepInfoMessage(currentOnboardStep)
      );
      this.router.navigateByUrl(`/auth/onboard/step${currentOnboardStep}`);
      return false;
    } else {
      return true;
    }
  }

  createStepInfoMessage(step: string | number) {
    return `Please complete step ${step} first.`;
  }
}
