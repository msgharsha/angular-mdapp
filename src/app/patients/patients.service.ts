/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";

@Injectable({
  providedIn: "root",
})
export class PatientsService {
  constructor(private httpService: HttpService) {}

  invitePatient(body) {
    return this.httpService.postRequest("practice/invite-patients", body);
  }

  getInvitedPatients(queryParams) {
    return this.httpService.getRequest(
      `practice/invite-patients`,queryParams
    );
  }

  getPatients(queryParams) {
    return this.httpService.getRequest(
      `practice/getallpatientsbydoctor`,queryParams
    );
  }
  
  getPatientDetails(queryParams) {
    return this.httpService.getRequest(
      `practice/getallbookingsforpatient`,queryParams
    );
  }
}
