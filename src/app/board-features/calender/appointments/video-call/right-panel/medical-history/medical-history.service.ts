/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../../../../../../utils/service/http.service";

@Injectable()
export class MedicalHistoryService {
  constructor(private httpService: HttpService) {}

  getMedicalHistory(id): any {
    const header = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const headers = [header];
    return this.httpService.getRequest(
      `practice/prescription?bookingId=${id}&patientHistory=true`,
      null,
      headers
    );
  }

  getOnlineConcern(id): any {
    const header = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const headers = [header];
    return this.httpService.getRequest(
      `practice/imaging?bookingId=${id}&patientHistory=true`,
      null,
      headers
    );
  }
}
