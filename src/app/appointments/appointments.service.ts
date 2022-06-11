/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";
import { Subject } from "rxjs/Subject";

@Injectable()
export class AppointmentsService {
  public statusChange = new Subject<any>();
  public showPresriptionView = new Subject<boolean>();

  constructor(private httpService: HttpService) {}

  /**
   * Function to fetch an appointment by id
   */
  getAppointmentById(id: string) {
    return this.httpService.getRequest("patient/appointment/" + id);
  }

  saveAppointment(data) {
    data['timeZoneName'] = String(String(new Date()).split("(")[1]).split(")")[0];
    return this.httpService.postRequest("practice/booking", data);
  }

  managerSaveAppointment(data) {
    data['timeZoneName'] = String(String(new Date()).split("(")[1]).split(")")[0];
    return this.httpService.postRequest("practice/managerBooking", data);
  }

  qrCodeSaveAppointment(data) {
    data['timeZoneName'] = String(String(new Date()).split("(")[1]).split(")")[0];
    return this.httpService.postRequest("practice/public/qrCodeBooking", data);
  }
  /**
   * Function to get master data
   */
  getAppointmentList(params) {
    return this.httpService.getRequest("patient/appointment", params);
  }

  // getSessionToken(id: number) {
  //   return this.httpService.getRequest("patient/session/" + id, {
  //     requireChatAccess: true,
  //   });
  // }

  cancelAppointment(bookingId, reason) {
    return this.httpService
      .putRequest("patient/booking", { bookingId, cancelReason: reason })
      .map((res) => res.json());
  }

  // public getChatSessionToken(id, revokedChatAccess?) {
  //   return this.httpService.getRequest(
  //     `chat-auth/${id}`,
  //     { revokedChatAccess },
  //     null,
  //     false
  //   );
  // }

  // getAppointmentCancelReason() {
  //   return this.httpService
  //     .getRequest("master-data", {
  //       table: "cancel_reason",
  //       reasonFor: Values.PATIENT,
  //     })
  //     .map((res) => res.json());
  // }

  updateAppointment(id, procedureId) {
    return this.httpService
      .putRequest(`patient/appointment/${id}`, { procedureId })
      .map((res) => res.json());
  }

  createOpenTokSession() {
    return this.httpService.postRequest(
      "v1/provider/global/practice/booking",
      {}
    );
  }

  getOpenTokSession() {
    return this.httpService.getRequest("v1/provider/global/video-call/session");
  }
}
