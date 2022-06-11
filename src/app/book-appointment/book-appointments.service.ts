
import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";

@Injectable({
    providedIn: "root",
})
export class BookAppointmentService {

    constructor(private httpService: HttpService) { }

    getPatients(queryParams) {
      return this.httpService.getRequest(
        `patient/search-patient`,queryParams
      );
    }

    getDentistById(id: string) {
      return this.httpService.getRequest("practice/profile/" + id);
    }

}
