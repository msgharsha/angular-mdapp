/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { URL } from "../constants/url";
import { HttpParams } from "@angular/common/http";
import { HttpService } from "../utils/service/http.service";

@Injectable({
  providedIn: "root",
})
export class ManagePaymentService {
  constructor(private httpService: HttpService) {}

  getPaymentList(params) {
    return this.httpService.getRequest(URL.PAYMENT, params);
  }

  getDoctorList(searchText) {
    let params = new HttpParams();
    params = params.append("search", searchText);
    return this.httpService.getRequest(URL.DOCTOR, params);
  }

  changeStatus(body) {
    return this.httpService.putRequest(URL.PAYMENT_STATUS, body);
  }
}
