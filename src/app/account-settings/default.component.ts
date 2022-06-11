
import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "./account.service";
import { ErrorService } from "../utils/service/error.service";
import { LocalStorageService } from "../utils/service/localStorage.service";
import * as _ from "lodash";

@Component({
  selector: "app-default",
  templateUrl: "./default.component.html",
})
export class DefaultComponent implements OnInit {
  userData: any;

  constructor(
    private routeInfo: ActivatedRoute, 
    private router: Router,
    private vref: ViewContainerRef,
    private errorHandler: ErrorService,
    private accountService: AccountService, 
    private localStorageService: LocalStorageService
    ) {

  }

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem("userData");
    if(this.userData.subAccount){
      this.router.navigateByUrl("accounts/settings/notifications");
    }else{
      this.router.navigateByUrl("accounts/profile");
    }
  }

  // navigateTo(type) {
  //   this.router.navigateByUrl("accounts/" + type);
  // }

}
