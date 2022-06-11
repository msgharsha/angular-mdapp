
import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";
import { Observable } from "rxjs/Observable";

@Injectable({
    providedIn: "root",
})
export class PatientRegisterService {

  constructor(private httpService: HttpService) { }

  getMasterData() {
      return this.httpService.getRequest(`patient/public/province`);
  }

  patientRegister(body) {
      return this.httpService.postRequest(`v1/provider/auth/managerPatientRegister`,body);
  }

    /**
   * @param  {string} phoneNumber
   */
  uniquePhoneNo(phoneNumber: string) {
    return this.httpService.getRequest(
      `patient/public/phoneNumber?phone=${phoneNumber}`
    );
  }

  uniqueHealthCareNo({ healthInsuranceNumber, healthCareNumber }) {
    return this.httpService.getRequest(`patient/public/unique/health-card?healthInsuranceNumber=${healthInsuranceNumber}&healthCareNumber=${healthCareNumber}`
    );
  }

  sendOtp(bodyObj): Observable<any> {
    return this.httpService.getRequest(`v1/provider/global/practice/managerresend-otp`,bodyObj);
  }
  
  qrCodeSendOtp(bodyObj): Observable<any> {
    return this.httpService.getRequest(`v1/provider/global/practice/qrcoderesend-otp`,bodyObj);
  }

  sendOtponPhoneNo(bodyObj): Observable<any> {
    return this.httpService.getRequest(`patient/manager-send-otp`,bodyObj);
  }

  qrCodeSendOtponPhoneNo(bodyObj): Observable<any> {
    return this.httpService.getRequest(`patient/public/qrcode-send-otp`,bodyObj);
  }

  saveMedicalHistory(medicalHistoryBody) {
    return this.httpService.postRequest(`patient/medical-historyByManager`,medicalHistoryBody);
  }

  saveMedicalHistoryByQrCode(medicalHistoryBody) {
    return this.httpService.postRequest(`patient/public/qrCodemedical-history`,medicalHistoryBody);
  }

  getDentistById(id: string) {
    return this.httpService.getRequest("practice/profile/" + id);
  }
  generateTempEmail(firstName){
    return this.httpService.getRequest(`patient/public/generatetempemail/?firstName=${firstName}`);
  }

  generateTempPhoneNumber(){
    return this.httpService.getRequest(`patient/public/generatetempphonenumber`);
  }

}
