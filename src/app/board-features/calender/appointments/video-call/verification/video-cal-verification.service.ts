import { Injectable } from "@angular/core";
import { HttpService } from "../../../../../utils/service/http.service";

@Injectable()
export class VideoCallVerificationService {
  constructor(private httpService: HttpService) {}

  getSessionToken(bookingId): any {
    return this.httpService.getRequest(`session/${bookingId}`, null, [
      { key: "accept-version", value: "1.0.0" },
    ]);
  }
}
