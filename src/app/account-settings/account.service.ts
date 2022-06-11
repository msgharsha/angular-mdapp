/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";
import { ErrorService } from "../utils/service/error.service";
import { LocalStorageService } from "../utils/service/localStorage.service";
import { Observable } from "rxjs";
import * as _ from "lodash";

const API_ENDPOINTS = {
  province: "v1/provider/global/practice/province",
  profile: "patient/profile",
};

@Injectable({
  providedIn: "root",
})
export class AccountService {
  public memberData;
  public report;

  constructor(
    private httpService: HttpService,
    private errorHandler: ErrorService,
    private localStorageService: LocalStorageService
  ) {}

  /**
   * Function to get master data
   */
  getMasterData(tablesArr: Array<string>) {
    if (tablesArr.includes("provinces")) {
      return this.httpService.getRequest(API_ENDPOINTS.province);
    }
  }

  getSubscriptionPlans() {
    return this.httpService.getRequest('subscription/master-data/plans');
  }

  getDoctorStatus() {
    return this.httpService.getRequest(`practice/status`);
  }

  getProfileInfo(infoType: string) {
    return this.httpService.getRequest(
      `${API_ENDPOINTS.profile}?infoType=${infoType}`
    );
  }

  updateBasicProfile(profileData) {
    profileData.infoType = "basic";
    return this.httpService.putRequest(API_ENDPOINTS.profile, profileData);
  }

  updateOtherProfileInfo(profileData) {
    profileData.infoType = "other";
    return this.httpService.putRequest(API_ENDPOINTS.profile, profileData);
  }

  /**
   * Function to change password
   * @param bodyObj Object
   */
  getFamilyMembersList(parentId) {
    return this.httpService.getRequest(
      `patient/familymember?parent_id=${parentId}`
    );
  }

  changePassword(bodyObj: Object): Observable<any> {
    return this.httpService.postRequest(
      "v1/provider/auth/changepassword",
      bodyObj
    );
  }

  updateLocalStorageInfo(profileData) {
    let userData = this.localStorageService.getItem("userData");

    userData = Object.assign(userData, {
      profile_image: profileData.profileImage,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
    });

    this.localStorageService.setItem("userData", userData);
  }

  /**
   * Function to save family member profile
   */
  saveMemberProfile(body) {
    return this.httpService.postRequest("patient/familymember", body);
  }
  
  signatureNotification(body) {
    return this.httpService.postRequest("v1/provider/global/signature",body);
  }

  verifiySign(body) {
    return this.httpService.getRequest("v1/provider/global/image",body);
  }


  /**
   * Function to save/update report
   */
  saveOrUpdateReport(body, reportId: number) {
    if (!reportId)
      return this.httpService
        .postRequest("patient/report", body)
        .map((res) => res.json());

    return this.httpService
      .putRequest(`patient/report/${reportId}`, body)
      .map((res) => res.json());
  }

  /**
   * save edited profile information
   */
  updateProfile(body) {
    return this.httpService.postRequest("patient/profile", body.profile);
  }

  updateFamilyMemberProfile(body) {
    return this.httpService.putRequest("patient/familymember", body);
  }

  getAllRelation(): Observable<any> {
    return this.httpService.getRequest("v1/provider/global/practice/relation");
  }

  getNotificationToggleValue(): Observable<any> {
    return this.httpService.getRequest("notification/settings");
  }

  updateNotificationToggleValue(body): Observable<any> {
    return this.httpService.putRequest("notification/settings", body);
  }

  getEmailTemplate() {
    return this.httpService.getRequest("notification/template/19");
  }

  saveMyManagerDetails(body) {
    return this.httpService.postRequest("v1/provider/auth/profilemanagersignUp", body);
  }

  updateMyManagerDetails(body) {
    return this.httpService.putRequest("v1/provider/auth/profilemanagersignUp", body);
  }

  addExistingManager(id, body){
    return this.httpService.putRequest("practice/addExistingManager" + `/${id}`, body);
  }

  deleteExistingManager(body){
    return this.httpService.putRequest("practice/deleteExistingManager", body);
  }

  deleteManagerPermanently(body){
    return this.httpService.putRequest("practice/deleteUnverifiedManager", body);
  }

  getProfileMngrList(userData) {
    return this.httpService.getRequest("practice/profilemngrbydoctor" + `/${userData['doctorId']}`+ `/${userData['userId']}`);
  }

  getAvailableProfileMngrByClinicName(body) {
    return this.httpService.getRequest("practice/getAvailableProfileMngrByClinicName", body);
  }

  inviteManagerAgain(body){
    return this.httpService.postRequest("v1/provider/auth/inviteprofilemanager", body);
  }
  
  trimEmptyCheck() {
    return (input: any) => {
      return _.trim(input.value)
        ? null
        : {
            required: {
              valid: false,
            },
          };
    };
  }
  
}
