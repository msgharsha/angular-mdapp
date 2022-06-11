/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService, HeaderInterface } from "../utils/service/http.service";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { ENDPOINTS } from "./constants/endpoints";
import { HttpParams } from "@angular/common/http";
import { VERIFY_OTP_ACTION } from "./constants/auth";

@Injectable({
  providedIn: "root",
})
export class AuthorizationService {
  public allowOtpAccess: boolean = false;
  public allowWelcomeAccess: boolean = false;
  private loginUrl = ENDPOINTS.LOGIN;
  private registerUrl = "";
  private verifyEmailUrl = "";
  private resendEmailUrl = ENDPOINTS.RESEND_VERIFICATION_EMAIL;
  private verifyOtpUrl = ENDPOINTS.VERIFY_OTP;
  private verifyOtpLogin = ENDPOINTS.VERIFY_OTP_LOGIN;
  private resendOtpUrl = ENDPOINTS.RESEND_OTP;

  constructor(private httpService: HttpService, private router: Router) {}

  /**
   * Function to navigate to specified url
   */

  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }

  /**
   * Function to save signup data
   * @param bodyObj Object
   */
  essentialSignUp(bodyObj: any): Observable<any> {
    return this.httpService.postRequest(ENDPOINTS.ESSENTIAL_SIGNUP, bodyObj);
  }

  /**
   * Function to login user
   */

  login(bodyObj: any): Observable<any> {
    return this.httpService.postRequest(
      this.loginUrl,
      bodyObj,
      null,
      null,
      true
    );
  }
/**
   * Function to verify Introduction Tour Status of user
   */
  getTourStatus(userId) {
    return this.httpService.getRequest(`v1/provider/global/practice/introtour/${userId}`);
  }

  getProfileManagerData(userId) {
    return this.httpService.getRequest(`practice/getprofilemanagerdata/${userId}`);
  }

  getSubscriptionStatus(userId) {
    return this.httpService.getRequest(`subscription/Subscription-status/${userId}`);
  }

  /**
   * Function to verify email address of user
   */
  verifyEmail(paramsObj: any): Observable<any> {
    return this.httpService.getRequest(this.verifyEmailUrl, paramsObj);
  }

  /**
   * Function to resend email
   */
  resendEmail(bodyObj: any) {
    return this.httpService.postRequest(this.resendEmailUrl, bodyObj);
  }

  /**
   * Function to verify otp of user
   */
  verifyOtp(bodyObj: any, token): Observable<any> {
    token = "Bearer " + token;
    let Header: Array<HeaderInterface> = [
      {
        key: "Authorization",
        value: token,
      },
    ];
    return this.httpService.postRequest(
      this.verifyOtpUrl,
      bodyObj,
      Header,
      new HttpParams({}),
      true
    );
  }

  /**
   * Function to resend otp
   */
  resendOtp(token, action?) {
    token = "Bearer " + token;
    let Header: Array<HeaderInterface> = [
      {
        key: "Authorization",
        value: token,
      },
    ];

    let params = new HttpParams();
    if (action == VERIFY_OTP_ACTION.FORGOT_PASSWORD)
      params = params.append("twoFA", "true");
    return this.httpService.getRequest(this.resendOtpUrl, params, Header);
  }

  /**
   * @param  {string} email
   */
  forgotPassword(email: string) {
    let bodyObj = {
      email: email,
      user: 2,
    };
    return this.httpService.postRequest(
      `${ENDPOINTS.FORGOT_PASSWORD}`,
      bodyObj,
      null,
      null,
      true
    );
  }

  /**
   * Function to reset password
   * @param bodyObj Object
   */
  resetPassword(bodyObj: Object): Observable<any> {
    return this.httpService.postRequest(ENDPOINTS.RESET_PASSWORD, bodyObj);
  }

  saveWebcamImage(bodyObj: Object): Observable<any> {
    return this.httpService.postRequest("v1/provider/global/imageresponseinfo", bodyObj);
  }

  getLongUrl(token): Observable<any> {
    return this.httpService.getRequest(`v1/provider/global/geturl/${token}`);
  }

  validateToken(token): Observable<any>{
    return this.httpService.getRequest( `v1/provider/global/validateQrToken/${token}` );
  }

  /**
   * Function to check for null field
   */

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

  getTermsCondition() {
    return this.httpService.getRequest(
      "consultation/public/organisation/policy-url"
    );
  }

  getPatients(queryParams) {
    return this.httpService.getRequest(
      `patient/public/search-healthCard`,queryParams
    );
  }

  getAppointments(queryParams,obj){
    let paramsToSend;
    let selectedDoc = JSON.stringify(obj)

    if (queryParams) {
      paramsToSend = `?from=${queryParams.from}&to=${queryParams.to}&offset=${queryParams.offset}&sort={"date": false}&skip=${queryParams.skip}&limit=${queryParams.limit}&status=confirmed&selectedDoctorData=${selectedDoc}`;

      if (queryParams.type) {
        paramsToSend += `&type=${queryParams.type}`;
      }
      if (!queryParams.list) {
        paramsToSend += `&list=false`;
      } else {
        paramsToSend += `&list=true`;
      }

    }

    return this.httpService.getRequest(`practice/public/qrCodeByAppointment${paramsToSend}`);
  }

}
