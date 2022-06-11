/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { HttpService } from "./../../../utils/service/http.service";
import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
@Injectable({
  providedIn: "root",
})
export class AppointmentService {
  public isCalendarView = true;
  public deleteAppointmentData = new BehaviorSubject<any>([]);
  public deleteSubscription = new Subject<any>();
  public isDefaultChatOpen = new Subject<any>();
  public userData = null;
  // public routeType = new Subject<any>();

  constructor(private httpService: HttpService, private localStorageService: LocalStorageService) {}
  setAppointmentData(value) {
    this.deleteAppointmentData.next(value);
  }

  getVideoCallSession(appointmentId) {
    return this.httpService.getRequest(
      "consultation/session-token/" + appointmentId
    );
  }

  updateVideoCallSession(appointmentId, requestBody) {
    return this.httpService.putRequest(`consultation/session-token/${appointmentId}/update`, requestBody);
  }

  getAppointmentToggleView() {
    return this.isCalendarView;
  }

  setAppointmentToggleView(isCalView) {
    this.isCalendarView = isCalView;
  }

  getAllAppointments(queryParams) {
    let paramsToSend;

    if (queryParams) {
      paramsToSend = `?from=${queryParams.from}&to=${queryParams.to}&offset=${queryParams.offset}&sort={"date": false}&skip=${queryParams.skip}&limit=${queryParams.limit}&status=confirmed`;

      if (queryParams.type) {
        paramsToSend += `&type=${queryParams.type}`;
      }
      if (!queryParams.list) {
        paramsToSend += `&list=false`;
      } else {
        paramsToSend += `&list=true`;
      }

      //paramsToSend += `&list=false`;
    }

    return this.httpService.getRequest(`practice/appointment${paramsToSend}`);
  }

  getAllAppointmentsByManager(queryParams,selectedDoctorData){
    let paramsToSend;
    let selectedDoc = JSON.stringify(selectedDoctorData)

    if (queryParams) {
      paramsToSend = `?from=${queryParams.from}&to=${queryParams.to}&offset=${queryParams.offset}&sort={"date": false}&skip=${queryParams.skip}&limit=${queryParams.limit}&status=confirmed&selectedDoctorData=${selectedDoc}`;

      if (queryParams.type) {
        paramsToSend += `&type=${queryParams.type}`;
      }
      if (!queryParams.list) {
        paramsToSend += `&list=false`;
      } else {
        paramsToSend += `&list=true`;
      }

      //paramsToSend += `&list=false`;
    }

    return this.httpService.getRequest(`practice/managerByAppointment${paramsToSend}`);
  }

  getPendingData() {
    return this.httpService.getRequest(`consultation/pending-appointment`);
  }

  managerGetPendingData(selectedDoctorData) {
    return this.httpService.getRequest(`consultation/managerpending-appointment`,selectedDoctorData);
  }

  getAppointmentById(appointmentId) {
    this.userData = this.localStorageService.getItem("userData");
    if(this.userData.subAccount){
      return this.httpService.getRequest(
        "practice/managerAppointment/" + +appointmentId, this.userData.selectedDoctorData
      );
    }else{
      return this.httpService.getRequest(
        "practice/appointment/" + +appointmentId
      );
    }
  }

  getConsultationInfoById(appointmentId) {
    return this.httpService.getRequest(`consultation/session-token/${appointmentId}/info`);
  }

  getAppointmentNotes(appointmentId) {
    this.userData = this.localStorageService.getItem("userData");
    if(this.userData.subAccount){
      return this.httpService.getRequest("consultation/managerByNotes/" + +appointmentId, this.userData.selectedDoctorData);
    }else{
      return this.httpService.getRequest("consultation/notes/" + +appointmentId);
    }

  }

  validateHealthCard(data,doctorId) {
    return this.httpService.postRequest(`billing/validatehealthcard/${doctorId}`, data);
  };

  cancelAppointment(body) {
    return this.httpService.putRequest("practice/appointment/cancel", body);
  }

  managerCancelAppointment(body,selectedDoctorData) {
    body['selectedDoctorData'] = selectedDoctorData;
    return this.httpService.putRequest("practice/appointment/managerCancel", body);
  }

  saveRequisitions(bodyObj) {
    return this.httpService.postRequest("consultation/requisition", bodyObj);
  }

  getRequisitions(bookingID) {
    return this.httpService.getRequest("consultation/requisition/" + bookingID);
  }
  getTemplatesValue() {
    return this.httpService.getRequest(`practice/notes`);
  }
  saveTemplate(body) {
    return this.httpService.postRequest("consultation/notes", body);
  }

  getInvoiceValue(id) {
    return this.httpService.getRequest("consultation/invoice/" + +id);
  }

  saveInvoice(body) {
    return this.httpService.postRequest("consultation/invoice", body);
  }

  getMedicalHistory(bookingId, patientId) {
    return this.httpService.getRequest(
      `consultation/medical-history/${bookingId}?patientUserId=${patientId}`
    );
  }

  getMedicalHistoryMasterData() {
    return this.httpService.getRequest(
      `patient/medical-history/master-data`
    );
  }

  getMedicineType() {
    return this.httpService.getRequest(
      "consultation/master-data/medicine-type"
    );
  }

  sendRequisition(bookingId) {
    return this.httpService.getRequest(
      `consultation/send/${bookingId}/sendRequisition`
    );
  }

  sendInvoice(bookingId) {
    return this.httpService.getRequest(
      "consultation/send/" + `${bookingId}` + "/sendInvoice"
    );
  }

  getInvoiceServices(bookingId) {
    return this.httpService.getRequest(
      "practice/booking/services/" + bookingId
    );
  }
  
  notesHistory(patientId){
    return this.httpService.getRequest(`consultation/notesHistory/${patientId}`);
  }

  requisitionHistory(patientId){
    return this.httpService.getRequest(`consultation/requisitionHistory/${patientId}`);
  }
}
