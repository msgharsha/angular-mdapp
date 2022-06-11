/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
export interface HeaderInterface {
  key: string;
  value: string;
}

@Injectable()
export class UploadFileService {
  constructor(private _http: HttpService) {}

  upload(body: FormData, type): any {
    return this._http.fileUpload(`v1/provider/uploadfile`, body);
  }

  deleteFile(type, fileURL): any {
    return this._http.fileDelete(
      "v1/provider/uploadfile/remove?imageUrl=" + fileURL + "&fileType=" + type
    );
  }

  imageNotification(body) {
    return this._http.postRequest("v1/provider/global/imageprocessinfo",body);
  }

  signatureNotification(body) {
    return this._http.postRequest("v1/provider/global/signature",body);
  }
} //UploadFileService-closes
