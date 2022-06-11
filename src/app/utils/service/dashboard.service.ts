/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { LocalStorageService } from "./localStorage.service";
import { LoaderService } from "../component/loader/loader.service";
import { HttpService } from "./http.service";
import { URL } from "../../constants/url";

@Injectable()
export class DashboardService {
  constructor(
    private localStorageService: LocalStorageService,
    private loader: LoaderService,
    private httpService: HttpService
  ) {}

  getRevenueConsultantData() {
    return this.httpService.getRequest(URL.CONSULTATION_BOOKING);
  }

  getBookingCountData() {
    return this.httpService.getRequest(URL.PRACTICE_BOOKING);
  }

  getPatientCount() {
    return this.httpService.getRequest(URL.PATIENT_COUNT);
  }

  getDoctorStatus() {
    return this.httpService.getRequest(URL.STATUS);
  }

  getProfileManagerData(userId) {
    return this.httpService.getRequest(`practice/getprofilemanagerdata/${userId}`);
  }

  getSelectedDoctorData(id: string) {
    return this.httpService.getRequest("practice/profile/" + id);
  }

  getPersonalDetails(doctorId: string | number) {
    return this.httpService.getRequest( `practice/onboard/step1/${doctorId}`
    );
  }

  insertQrData(clinicData){
    return this.httpService.postRequest("v1/provider/global/clinicDataInfo",clinicData);
  }

  getDoctorData(id: string) {
    return this.httpService.getRequest("v1/provider/global/doctorprofileData/" + id);
  }

}
