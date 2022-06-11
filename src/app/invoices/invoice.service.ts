
import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";

@Injectable({
    providedIn: "root",
})
export class InvoiceService {

    constructor(private httpService: HttpService) { }

    getSubscriptionList(data) {
        return this.httpService.postRequest("subscription/subscriber/transactions/"+data.userId, data);
    }

    previewFileInfo(data) {
        const token = btoa(JSON.stringify(data));
        return this.httpService.previewFileInfo(`subscription/public/subscriber/invoice/${data.invoice.passRef}?filenme=${data.invoice.passRef}&token=${token}`);
      }
}
