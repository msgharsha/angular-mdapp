/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../../../../../../utils/service/http.service";

@Injectable()
export class MedicalReportService {
  constructor(private httpService: HttpService) {}

  getMedicalReport(id): any {
    const header = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const headers = [header];
    return this.httpService.getRequest(
      `practice/report?bookingId=${id}&patientHistory=true`,
      null,
      headers
    );
  }

  postSharedVideos(bodyObj: Object): any {
    const header = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const headers = [header];
    return this.httpService.postRequest(
      "practice/educational-videos/share",
      bodyObj,
      headers
    );
  }

  getEducationalVideos(id, isShared): any {
    const header = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const headers = [header];
    return this.httpService.getRequest(
      `practice/educational-videos/share?bookingId=${id}&isShared=${isShared}`,
      null,
      headers
    );
  }

  getSharedEducationalVideos(id, isShared): any {
    const header = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const headers = [header];
    return this.httpService.getRequest(
      `practice/educational-videos/share?bookingId=${id}&isShared=${isShared}`,
      null,
      headers
    );
  }
}
