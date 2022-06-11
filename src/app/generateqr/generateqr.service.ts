
import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";
import { Observable } from "rxjs/Observable";

@Injectable({
    providedIn: "root",
})
export class GenerateqrService {

  constructor(private httpService: HttpService) { }


  insertQrData(clinicData){
    return this.httpService.postRequest("v1/provider/global/clinicDataInfo",clinicData);
  }

  getPersonalDetails(doctorId: string | number) {
    return this.httpService.getRequest( `practice/onboard/step1/${doctorId}`
    );
  }

}
