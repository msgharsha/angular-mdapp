/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { LocalStorageService } from "./localStorage.service";
import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import * as _ from "lodash";
import {
  Prescription,
  PrescriptionItem,
  UploadPrescription,
} from "../../diagnosis/prescribe-medicines/prescription.model";
import { Observable } from "rxjs";
import { of } from "rxjs/internal/observable/of";

@Injectable()
export class PrescriptionService {
  private medicine: Array<any> = [];
  private transformMedicine: Array<any> = [];

  constructor(
    private _http: HttpService,
    private localStr: LocalStorageService
  ) {}

  getFormulation() {
    // let authHeader = {
    //   key: "Authorization",
    //   value: localStorage.getItem('token')
    // }
    // return this._http.getRequest('master-data', {table: 'medication_type'}, [authHeader]);
    return of("{}");
  }

  deleteSingleMedicine(prescription: object, bookingId: number) {
    // let authHeader = {
    //   key: "Authorization",
    //   value: localStorage.getItem('token')
    // }
    // return this._http.deleteRequest(`practice/prescription/item/${prescription['id']}`, '', [authHeader]);
    return of("{}");
  }

  addSingleMedicine(
    prescription: object,
    bookingId: number,
    prescriptionId: number
  ) {
    let authHeader = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    return this._http.postRequest(
      `practice/prescription/item`,
      this.transformPrescriptionToSave(prescription, bookingId, prescriptionId),
      [authHeader]
    );
  }

  updateSingleMedicine(
    prescription: object,
    bookingId: number,
    prescriptionId: number
  ) {
    // let authHeader = {
    //   key: "Authorization",
    //   value: localStorage.getItem('token')
    // };
    // return this._http.putRequest(`practice/prescription/item/${prescription['id']}`, (this.transformPrescriptionToSave(prescription, bookingId, prescriptionId)), '', [authHeader]);
    return of("{}");
  }

  updatePrescription(diagnosis: object, prescriptionId: string, bookingId) {
    // let authHeader = {
    //   key: "Authorization",
    //   value: localStorage.getItem('token')
    // }
    // tslint:disable-next-line: max-line-length
    // return this._http.putRequest(`practice/prescription/${prescriptionId}`, {
    //   presentComplaints: diagnosis[0],
    //   findings: diagnosis[1],
    //   diagnosis: diagnosis[2],
    //   prescriptionUrl: '',
    //   prescriptionTitle: '',
    //   bookingId
    // }, '', [authHeader]);
    return of("{}");
  }

  transformPrescriptionToSave(
    prescription: object,
    bookingId: number,
    prescriptionId?: number
  ) {
    let timings = {};
    if (
      prescription["medicationTypeId"] === 1 ||
      prescription["medicationTypeId"] === 3
    ) {
      const timingsMappingKey = ["morning", "noon", "evening"];
      timingsMappingKey.forEach((attributeName, index) => {
        if (
          prescription["medicationTimeAndQuantity"][index].time &&
          prescription["medicationTimeAndQuantity"][index].quantity
        ) {
          timings[attributeName] = {
            time: prescription["medicationTimeAndQuantity"][index].time,
            quantity: prescription["medicationTimeAndQuantity"][index].quantity,
          };
        }
      });
    }

    if (prescriptionId) {
      if (_.isEmpty(timings)) {
        return Object.assign({
          name: prescription["name"],
          medicationTypeId: prescription["medicationTypeId"],
          notes: prescription["notes"],
          prescriptionId: prescriptionId,
        });
      } else {
        return Object.assign(
          { timings },
          {
            name: prescription["name"],
            medicationTypeId: prescription["medicationTypeId"],
            notes: prescription["notes"],
            prescriptionId: prescriptionId,
          }
        );
      }
    } else {
      if (_.isEmpty(timings)) {
        return Object.assign({
          name: prescription["name"],
          medicationTypeId: prescription["medicationTypeId"],
          notes: prescription["notes"],
        });
      } else {
        return Object.assign(
          { timings },
          {
            name: prescription["name"],
            medicationTypeId: prescription["medicationTypeId"],
            notes: prescription["notes"],
          }
        );
      }
    }
  }

  transformPrescriptionAfterGet(response: any) {
    let responseJSON: { data: Array<Prescription> } = response.json();
    const prescriptionArray: Array<PrescriptionItem> =
      responseJSON.data[0].prescriptionItem;
    return prescriptionArray.map((prescriptionObject, i) => {
      prescriptionObject.medicationTimeAndQuantity = [
        { time: "", quantity: "" },
        { time: "", quantity: "" },
        {
          time: "",
          quantity: "",
        },
      ];
      if (prescriptionObject["timings"]) {
        const timingsMappingKey = ["morning", "noon", "evening"];
        timingsMappingKey.forEach((attributeName, index) => {
          if (
            prescriptionObject["timings"][attributeName] &&
            prescriptionObject["timings"][attributeName].time &&
            prescriptionObject["timings"][attributeName].quantity
          ) {
            prescriptionObject.medicationTimeAndQuantity[index] = {
              time: prescriptionObject["timings"][attributeName].time,
              quantity: prescriptionObject["timings"][attributeName].quantity,
            };
          }
        });
      }
      delete prescriptionObject["timings"];
      delete prescriptionObject["medicationType"];
      return prescriptionObject;
    });
  }

  storeLocalData(medicineData: any, bookingId: number) {
    this.medicine.push(medicineData);
    this.localStr.setItem("medicine", this.medicine);
  }

  loadMedicineDataLocal() {
    if (this.localStr.getItem("medicine")) {
      this.medicine = this.localStr.getItem("medicine");
    }
  }

  updateMedicineData(id: number, medicineData: any, bookingId: number) {
    this.medicine[id] = medicineData;
    this.localStr.setItem("medicine", this.medicine);
  }

  deleteMedicineData(id: number) {
    this.medicine.splice(id, 1);
    this.localStr.setItem("medicine", this.medicine);
  }

  getMedicineData() {
    return this.medicine;
  }

  saveCompletePrescription(diagnosis: string[], bookingId: number) {
    this.transformMedicine = [];
    this.medicine.forEach((e) => {
      this.transformMedicine.push(
        this.transformPrescriptionToSave(e, bookingId)
      );
    });
    let authHeader = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const dataToSend = {
      prescriptionItems: this.transformMedicine,
      presentComplaints: diagnosis[0],
      findings: diagnosis[1],
      diagnosis: diagnosis[2],
      bookingId: bookingId,
    };
    return this._http.postRequest("practice/prescription", dataToSend, [
      authHeader,
    ]);
  }

  saveDiagnosis(diagnosis) {
    this.localStr.setItem("diagnosis", diagnosis);
  }

  getDiagnosis(d?) {
    if (!this.localStr.getItem("diagnosis")) {
      this.localStr.setItem("diagnosis", d || ["", "", ""]);
    }
    return this.localStr.getItem("diagnosis");
  }

  getPrescriptionById(bookingId: number) {
    // let authHeader = {
    //   key: "Authorization",
    //   value: localStorage.getItem('token')
    // }
    // return this._http.getRequest("practice/prescription", {bookingId: bookingId}, [authHeader]);
    return of("{}");
  }

  getPrescription(
    bookingId: number
  ): Observable<Prescription | UploadPrescription> {
    // return this.getPrescriptionById(bookingId).map(res=>(res.json().data[0]));
    return of();
  }

  saveUploadedPrescription(data: UploadPrescription, bookingId: number) {
    let authHeader = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    const dataToSend = {
      ...data,
      bookingId,
    };
    return this._http
      .postRequest("practice/prescription", dataToSend, [authHeader])
      .map((res) => res.json());
  }

  updateUploadedPrescription(
    data: UploadPrescription,
    prescriptionId: number,
    bookingId: number
  ) {
    // let authHeader = {
    //   key: "Authorization",
    //   value: localStorage.getItem('token')
    // };

    // return this._http.putRequest(`practice/prescription/${prescriptionId}`, {...data, bookingId}, '', [authHeader]).map(res=>res.json());
    return of("{}");
  }

  /**
   * saves API data to localStorage
   * @param prescription
   */
  saveDataToLocalStorage(prescription: UploadPrescription) {
    this.localStr.setItem("prescription", {
      prescriptionUrl: {
        url: prescription.prescriptionUrl,
        originalFileName: prescription.prescriptionUrl,
      },
      prescriptionTitle: prescription.prescriptionTitle,
      bookingId: prescription.bookingId,
    });
    let diagnosis = {
      presentComplaints: prescription.presentComplaints,
      findings: prescription.findings,
      diagnosis: prescription.diagnosis,
      bookingId: prescription.bookingId,
    };
    this.localStr.setItem("diagnosis", diagnosis);
  }

  /*clear localStorage*/
  public clearLocalStorage() {
    this.localStr.removeItem("prescription");
    this.localStr.removeItem("diagnosis");
    this.localStr.removeItem("crntdignsMethod");
    this.localStr.removeItem("medicine");
  }

  public getLocallySavedMethodForBooking(bookingId) {
    var locallySavedmethod = this.localStr.getItem("crntdignsMethod");
    if (locallySavedmethod && locallySavedmethod.bookingId === bookingId)
      return locallySavedmethod.crntdignsMethod;
    else return null;
  }

  deletePrescription(prescriptionId: number) {
    let authHeader = {
      key: "Authorization",
      value: localStorage.getItem("token"),
    };
    return this._http
      .deleteRequest(`practice/prescription/${prescriptionId}`, null, [
        authHeader,
      ])
      .map((res) => res.json());
  }

  getMedicineList(params?) {
    return this._http.getRequest("consultation/master-data/medicine", params);
  }

  getMedicineType() {
    return this._http.getRequest(
      "consultation/master-data/medicine-type"
    );
  }

  getPharmacy(id, params?) {
    return this._http.getRequest(`patient/pharmacy/${id}`, params);
  }

  sendPrescriptionData(bookingId, action) {
    return this._http.getRequest(`consultation/send/${bookingId}/${action}`);
  }

  getPrescriptionData(id, params?) {
    return this._http.getRequest(`consultation/prescription/${id}`, params);
  }

  savePrescriptionData(body?) {
    return this._http.postRequest(`consultation/prescription`, body);
  }

  addDrug(dataBody) {
    return this._http.postRequest("consultation/drug", dataBody);
  }

  getPrescriptionhistory(patientId){
    return this._http.getRequest(`consultation/prescriptionHistory/${patientId}`);
  }

  sendPrescriptionDataToPatient(prescriptionId, bookingId){
    return this._http.getRequest(`consultation/sendToPatient/${prescriptionId}/${bookingId}`);
  }

  sendPrescriptionDataToPharmacy(prescriptionId, bookingId){
    return this._http.getRequest(`consultation/sendToPharmacy/${prescriptionId}/${bookingId}`);
  }
  sendPrescriptionDataToExternal(prescriptionId, bookingId, externalEmail){
    return this._http.getRequest(`consultation/sendToExternal/${prescriptionId}/${bookingId}/${externalEmail}`);
  }

  PrescriptionStatus(prescriptionId){
    return this._http.getRequest(`consultation/prescriptionStatus/${prescriptionId}`);
  }

}
