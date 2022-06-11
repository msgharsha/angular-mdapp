/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoaderService } from "../component/loader/loader.service";
import { LocalStorageService } from "../service/localStorage.service";
import { environment } from "../../../environments/environment";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import { UserService } from "./user.service";

export interface HeaderInterface {
  key: string;
  value: string;
}

@Injectable()
export class HttpService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private loaderService: LoaderService,
    private localStorageService: LocalStorageService,
    private userService: UserService
  ) {}


  /**
   * 
   * @returns base url string
   */
   getBaseUrl(url) {
    const sub_url = url.split('/');
    const configurationInfo:any = environment;
    if (!configurationInfo.production) {
      if (sub_url[0] === 'consultation') {
        return `${configurationInfo.consultationUrl}/${url}`;
      } else if (sub_url[0] === 'patient') {
        return `${configurationInfo.patientUrl}/${url}`;
      } else if(sub_url[0] === 'practice') {
        return `${configurationInfo.schedulingUrl}/${url}`;
      } else if (sub_url[0] === 'subscription') {
        return `${configurationInfo.subscriptionUrl}/${url}`;
      } else if (sub_url[0] === 'notification') {
        return `${configurationInfo.notificationUrl}/${url}`;
      } else if(sub_url[0] === 'billing') {
        return `${configurationInfo.billingUrl}/${url}`; 
      } else {
        return `${configurationInfo.baseUrl}/${url}`;
      }
    } else {
      return `${configurationInfo.baseUrl}/${url}`;
    }
  }
  /**
   * Function to return common headers
   * @return headers Object
   */
  getCommonHeaders() {
    let headers = new HttpHeaders();
    headers = headers.append("Content-Type", "application/json");
    headers = headers.append("accept-version", "1.0.0");
    if (this.localStorageService.getAccessToken())
      headers = headers.append(
        "Authorization",
        "Bearer " + this.localStorageService.getAccessToken()
      );
    return headers;
  }

  /**
   * Function to Add Custom Headers and return it
   * @param headerArr Array<Object>
   * @return headers Object
   */
  getHeaders(headerArr?: Array<HeaderInterface>) {
    let headers = this.getCommonHeaders();
    const lang = this.localStorageService.getItem("language") || "en";
    if (headerArr)
      headerArr.forEach((headerObj) => {
        let key = headerObj["key"];
        let value = headerObj["value"];
        headers = headers.set(key, value);
      });
    headers = headers.set("lang", lang);
    return headers;
  }

  getRequest(
    url: string,
    params?: HttpParams,
    headerArr?: Array<HeaderInterface>
  ): any {
    this.loaderService.showLoader();
    let headers = this.getHeaders(headerArr);
    let reqOps = {
      headers: headers,
      params: params,
    };
    return this.http.get(`${this.getBaseUrl(url)}`, reqOps).do(
      (res) => {
        this.loaderService.hideLoader();
      },
      (err) => {
        if (!err.status || err.status == 401 || err.status == 403) {
          this.loaderService.hideLoader(true);
        } else {
          this.loaderService.hideLoader();
        }
      }
    );
  }

  putRequest(
    url: string,
    body: any,
    params?: HttpParams,
    headerArr?: Array<HeaderInterface>,
    observe?
  ): any {
    this.loaderService.showLoader();
    let headers = this.getHeaders(headerArr);
    let reqOps = {
      headers: headers,
      params: params,
    };
    if (observe) {
      reqOps["observe"] = "response";
    }
    return this.http.put(`${this.getBaseUrl(url)}`, body, reqOps).do(
      (res) => {
        this.loaderService.hideLoader();
      },
      (err) => {
        if (!err.status || err.status == 401 || err.status == 403) {
          this.loaderService.hideLoader(true);
        } else {
          this.loaderService.hideLoader();
        }
      }
    );
  }

  postRequest(
    url: string,
    body: any,
    headerArr?: Array<HeaderInterface>,
    params?: any,
    observe?
  ): any {
    this.loaderService.showLoader();
    let headers = this.getHeaders(headerArr);
    let reqOps = {
      headers: headers,
      params: params,
    };
    if (observe) {
      reqOps["observe"] = "response";
      reqOps.headers.append("Authorization", "");
    }
    return this.http.post(`${this.getBaseUrl(url)}`, body, reqOps).do(
      (res) => {
        this.loaderService.hideLoader();
      },
      (err) => {
        if (!err.status || err.status == 401 || err.status == 403) {
          this.loaderService.hideLoader(true);
        } else {
          this.loaderService.hideLoader();
        }
      }
    );
  }

  patchRequest(
    url: string,
    body: any,
    headerArr?: Array<HeaderInterface>,
    params?: HttpParams
  ): any {
    this.loaderService.showLoader();
    let headers = this.getHeaders(headerArr);
    let reqOps = {
      headers: headers,
      params: params,
    };
    return this.http.patch(`${this.getBaseUrl(url)}`, body, reqOps).do(
      (res) => {
        this.loaderService.hideLoader();
      },
      (err) => {
        if (!err.status || err.status == 401 || err.status == 403) {
          this.loaderService.hideLoader(true);
        } else {
          this.loaderService.hideLoader();
        }
      }
    );
  }

  deleteRequest(
    url: string,
    params?: HttpParams,
    headerArr?: Array<HeaderInterface>
  ): any {
    this.loaderService.showLoader();
    let headers = this.getHeaders(headerArr);
    let reqOps = {
      headers: headers,
      params: params,
    };
    return this.http.delete(`${this.getBaseUrl(url)}`, reqOps).do(
      (res) => {
        this.loaderService.hideLoader();
      },
      (err) => {
        if (!err.status || err.status == 401 || err.status == 403) {
          this.loaderService.hideLoader(true);
        } else {
          this.loaderService.hideLoader();
        }
      }
    );
  }

  fileUpload(url: string, body: FormData): any {
    const headerOptions = {
      "accept-version": "1.0.0",
    };
    if (this.userService.userToken) {
      headerOptions["Authorization"] = this.userService.userToken;
    }

    let headers = new HttpHeaders(headerOptions);
    let reqOps = {
      headers: headers,
    };
    return this.http.post(`${this.getBaseUrl(url)}`, body, reqOps);
  }

  fileDelete(url: string): any {
    const headerOptions = {
      "accept-version": "1.0.0",
    };
    if (this.userService.userToken) {
      headerOptions["Authorization"] = this.userService.userToken;
    }

    let headers = new HttpHeaders(headerOptions);
    let reqOps = {
      headers: headers,
    };
    return this.http.delete(`${this.getBaseUrl(url)}`, reqOps);
  }

  previewFileInfo(url: String): any {
    return `${this.getBaseUrl(url)}`
  }
  
}
