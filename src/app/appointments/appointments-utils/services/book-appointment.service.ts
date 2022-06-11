/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../../../utils/service/http.service";
import { forkJoin } from "rxjs/observable/forkJoin";

@Injectable()
export class BookAppointmentService {
  constructor(private _http: HttpService) {}

  /**
   * get the expert procedures.
   * @param dentistId
   */
  getExpertsProcedure(dentistId) {
    return this._http.getRequest(`patient/expert/${dentistId}/procedure`);
  }

  /**
   * get the patient member.
   */
  getPatientMember() {
    return this._http.getRequest("patient/member");
  }

  getBookAppointmentsData(dentistId) {
    return forkJoin([
      this.getExpertsProcedure(dentistId).map((res: any) => res.json()), //get experts procedures
      this.getPatientMember().map((res: any) => res.json()), //get patient family member data
    ]).map((data: any[]) => {
      let proceduresData: any = data[0].data;
      let patientFamilyData: any[] = data[1].data;
      return { proceduresData, patientFamilyData };
    });
  }

  /**
   * Function to get dentist slots by procedure and date
   */
  getExpertSlots(params: any) {
    return this._http
      .getRequest(
        "patient/expert/" +
          params.expertId +
          "/slot/" +
          params.date +
          "/" +
          params.procedureId +
          "/" +
          params.offset,
        null,
        null,
        false
      )
      .map((res) => res.json());
  }

  /**
   * creates the slot accorrding to template requirement.
   * @param slots
   */
  parseSlot(slots: Array<object> = []) {
    let newSlots = [];
    slots.forEach((slot) => {
      let newSlot = {
        time: slot["time"],
      };
      newSlots.push(newSlot);
    });
    return newSlots;
  }

  /**
   * parse family member create object.
   * @param members
   */
  parseFamily(members: Array<object> = []) {
    let newMembers = [];
    members.forEach((member) => {
      let newMember = {
        id: member["id"],
        name: member["firstName"] + " " + member["lastName"],
        isFamilyMember: member["isFamilyMember"],
      };
      newMembers.push(newMember);
    });
    return newMembers;
  }

  /**
   * book the appointment slot for patient
   * or patient family member.
   * @param body
   */
  bookSlot(body) {
    return this._http
      .postRequest("patient/booking", body)
      .map((res) => res.json());
  }

  /**
   * get the dentist data
   * @param expertId
   */
  getExpertDetail(expertId) {
    return this._http
      .getRequest("patient/expert/" + expertId)
      .map((res) => res.json());
  }

  getBookingDetails(bookingId: number) {
    return this._http.getRequest("patient/appointment/" + bookingId);
  }
} //service-closes
