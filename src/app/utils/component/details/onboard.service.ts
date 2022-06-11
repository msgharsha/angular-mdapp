/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable, OnInit } from "@angular/core";
import * as _ from "lodash";
import { forkJoin } from "rxjs";
import { catchError } from "rxjs/operators";
import { HttpService } from "../../service/http.service";
import { ENDPOINTS } from "./constants/endpoints";

@Injectable({
  providedIn: "root",
})
export class OnboardService implements OnInit {
  constructor(private httpService: HttpService) {}

  ngOnInit() {}

  getMasterData(tableName: string) {
    return this.httpService.getRequest(
      `${ENDPOINTS.MASTER_DATA}?tableName=${tableName}`
    );
  }

  isUniqueKey(keys: any, id) {
    return forkJoin([
      this.httpService
        .postRequest(ENDPOINTS.UNIQUE_KEY, { key: keys[0], id })
        .pipe(catchError((err: any) => err)),
      this.httpService
        .postRequest(ENDPOINTS.UNIQUE_KEY, { key: keys[1], id })
        .pipe(catchError((err: any) => err)),
    ]);
  }

  imageNotification(body) {
    return this.httpService.postRequest("v1/provider/global/imageprocessinfo",body);
  }

  verifiyImage(body) {
    return this.httpService.getRequest("v1/provider/global/image",body);
  }

  savePersonalDetails(bodyObj: any) {
    return this.httpService.postRequest(ENDPOINTS.ONBOARD_STEP1, bodyObj);
  }

  getPersonalDetails(doctorId: string | number) {
    return this.httpService.getRequest(
      ENDPOINTS.ONBOARD_STEP1 + `/${doctorId}`
    );
  }

  updatePersonalDetails(bodyObj: any, doctorId: string | number) {
    delete bodyObj.email;
    return this.httpService.putRequest(
      ENDPOINTS.ONBOARD_STEP1 + `/${doctorId}`,
      bodyObj
    );
  }

  getPracticeDetails(doctorId: string | number) {
    return this.httpService.getRequest(
      ENDPOINTS.ONBOARD_STEP2 + `/${doctorId}`
    );
  }

  savePracticeDetails(bodyObj: any, doctorId: string | number) {
    return this.httpService.putRequest(
      ENDPOINTS.ONBOARD_STEP2 + `/${doctorId}`,
      bodyObj,
      null,
      null,
      true
    );
  }

  saveClaimAddress(bodyObj: any, doctorId: string | number) {
    return this.httpService.putRequest(ENDPOINTS.SAVE_CLAIM_ADD + `/${doctorId}`,bodyObj, null, null,true);
  }

  saveSubscriptionDetails(
    bodyObj: any,
    doctorId: string | number,
    userId: string | number
  ) {
    return forkJoin([
      this.httpService
        .putRequest(ENDPOINTS.ONBOARD_STEP3 + `/${doctorId}`, bodyObj)
        .pipe(catchError((err: any) => err)),
      this.httpService
        .getRequest(ENDPOINTS.AUTH_TOKEN + `?userId=${userId}`)
        .pipe(catchError((err: any) => err)),
    ]);
  }

  getAllPracticeMasterData() {
    return forkJoin([
      this.httpService
        .getRequest(`${ENDPOINTS.MASTER_DATA}?tableName=specialty_type`)
        .pipe(catchError((err: any) => err)),
      this.httpService
        .getRequest(`${ENDPOINTS.MASTER_DATA}?tableName=practice_methods`)
        .pipe(catchError((err: any) => err)),
      this.httpService
        .getRequest(`${ENDPOINTS.MASTER_DATA}?tableName=speciality`)
        .pipe(catchError((err: any) => err)),
      this.httpService
        .getRequest(ENDPOINTS.PROVINCE)
        .pipe(catchError((err: any) => err)),
    ]);
  }

  updateCreditCard() {
    return this.httpService.putRequest(ENDPOINTS.UPDATE_CRED_CARD, {});
  }

  getCharacterCountfromHtml(text) {
    if (text) {
      let decodedStripped = text.replace(/(<([^>]+)>)/gi, "").trim(); // Html entities
      decodedStripped = decodedStripped.replace(/\&nbsp;/g, "").trim(); // line breaks html nbsps
      const characterCount = decodedStripped.length;
      return characterCount;
    }
    return 0;
  }

  sendOtponPhoneNo() {
    return this.httpService.getRequest(ENDPOINTS.SEND_OTP_ON_PHONENUMBER);
  }

  sendOtponRamq() {
    return this.httpService.getRequest(ENDPOINTS.SEND_OTP_ON_RAMQ);
  }

  generateMachinePwd() {
    return this.httpService.getRequest(ENDPOINTS.GENERATE_MACHINEPWD);
  }

  verifyOtponPhoneNo(bodyObj) {
    return this.httpService.postRequest(
      ENDPOINTS.VERIFY_OTP_ON_PHONENUMBER,
      bodyObj
    );
  }

  sendOtponManagerPhoneNo(bodyObj) {
    return this.httpService.getRequest(`patient/manager-send-otp`,bodyObj);
  }

  managerVerifyOtponPhoneNo(bodyObj) {
    return this.httpService.postRequest(
      `patient/public/manager-verify-otp`,
      bodyObj
    );
  }

  sendOtp(bodyObj){
    return this.httpService.getRequest(`v1/provider/global/practice/managerresend-otp`,bodyObj);
  }

  managerVerifyOtpEmail(bodyObj){
    return this.httpService.postRequest(
      "v1/provider/global/practice/managerverify-otp",
      bodyObj
    );
  }

  getSubscriptionPlans() {
    return this.httpService.getRequest(ENDPOINTS.SUBSCRIPTION_PLANS);
  }

  getPaymentLink(body) {
    return this.httpService.postRequest(ENDPOINTS.RECURRING_PAYMENT, body);
  }

  getSubscriptionDetails(doctorId) {
    return this.httpService.getRequest(
      ENDPOINTS.ONBOARD_STEP3 + `/${doctorId}`
    );
  }

  getCardDetails() {
    return this.httpService.getRequest(ENDPOINTS.CARD_DETAILS);
  }

  getselectedPlan() {
    return this.httpService.getRequest(ENDPOINTS.SELECTED_PLAN);
  }

  cancelSubscription() {
    return this.httpService.deleteRequest(ENDPOINTS.CANCEL_SUBSCRIPTION);
  }

  reactivateSubscription() {
    let body = {};
    return this.httpService.postRequest(
      ENDPOINTS.REACTIVATE_SUBSCRIPTION,
      body
    );
  }

  getTermsCondition() {
    return this.httpService.getRequest(ENDPOINTS.TERMS_AND_POLICY);
  }

  insertQrData(clinicData){
    return this.httpService.postRequest("v1/provider/global/clinicDataInfo",clinicData);
  }

  isValidAddressForm(address: any, notRequired: string[]) {
    let isInvalid = false;
    if (!address) {
      isInvalid = true;
    }

    _.forEach(_.omit(address, notRequired), (value, key) => {
      if (!value || value == "null") {
        isInvalid = true;
      }
    });

    if (isInvalid) {
      return false;
    }
    return true;
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
