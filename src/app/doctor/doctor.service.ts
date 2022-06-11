
import { Injectable, EventEmitter } from "@angular/core";
import { HttpService } from "../utils/service/http.service";
import * as _ from "lodash";

declare var moment;
@Injectable()
export class DoctorService {
  public dentistSearchEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private httpService: HttpService,
  ) { }

  /**
   * Function to fetch a dentist profile by id
   */
  getDentistById(id: string) {
    return this.httpService.getRequest("practice/profile/" + id);
  }

  getQrCodeDentistById(obj) {
    return this.httpService.getRequest("practice/public/qrCodedoctorprofile", obj);
  }

  /**
   * Function to get dentist slots by procedure and date
   */
  getDentistSlots(params: any) {
    return this.httpService.getRequest(
      "practice/managerbydoctor/" +
      params.doctorId +
      "/slots/" +
      params.slotTime +
      `?endTime=${params.endTime}`
    );
  }

   /**
   * Function to get dentist slots by procedure and date
   */
    getDentistSlotsByQrCode(params: any) {
      return this.httpService.getRequest(
        "practice/public/QrCodebydoctorslots/" +
        params.doctorId +
        "/slots/" +
        params.slotTime +
        `?endTime=${params.endTime}`
      );
    }

  /**
   * Function to mark a dentist favourite or unfavourite
   */
  markFavouriteOrUnfavourite(body) {
    return this.httpService.postRequest(
      "patient/favourite",
      body,
      null,
      null,
      false
    );
  }

  getFamilyData(patientId) {
    return this.httpService.getRequest("patient/managerFamilyMember/"+ patientId);
  }

  getQrCodeFamilyData(patientId) {
    return this.httpService.getRequest("patient/public/qrCodeFamilyMember/"+ patientId);
  }
  
}
