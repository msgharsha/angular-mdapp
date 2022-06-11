/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

 import { Injectable } from "@angular/core";
 import * as _ from "lodash";
 import { LocalStorageService } from "./localStorage.service";
 
 @Injectable({
     providedIn: 'root'
 })
 export class UserRoleService {

    public userPermissions = {
        "DASHBOARD_GRAPH":true,
        "MEDICAL_HISTORY":true,
        "MY_PAYMENTS":true,
        "PATIENTS":true,
        "MANAGE_AUTO_FORMS":true,
        "MY_PREFERENCES":true,
        "INVOICES":true,
        "MANAGE_PROFILE":true,
        "SUBSCRIPTION_DETAILS":true,
        "PRACTICE_DETAILS":true,
        "MY_PROFILE":true,
        "JOIN_CALL":true,
        "HEALTHCARD_VALIDLINK":true
    };
 
   constructor(
     private localStorageService: LocalStorageService
   ) {
   }
 
   checkPermission(state) {
    let hasPermission = false;
    const userInfo = this.localStorageService.getItem('userData');
    for (let key in this.userPermissions) {
        if (userInfo && userInfo.subAccount && state === key && this.userPermissions[key]) {
            hasPermission = true;
        }
    }
    return hasPermission;
   }
 
  
}
 