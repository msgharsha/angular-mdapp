/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { HttpService } from "../utils/service/http.service";

@Injectable({
    providedIn: "root",
})
export class ManageAutoFormService {
    baseUrl = "practice";

    constructor(private httpService: HttpService) { }

    getAutomatedForms(data) {
        return this.httpService.getRequest(`consultation/automated_forms`, data);
    }

    previewFileInfo(fileName, fileURL, fileType) {
        const url = fileURL.split("/");
        let filename =
          url[url.length - 3] + "/" + url[url.length - 2] + "/" + url[url.length - 1];
        return this.httpService.previewFileInfo("v1/provider/uploadfile/previewfile/"+fileName+"?imageUrl="+filename+"&fileType="+fileType)
    }

    previewPDFFileInfo(fileName, fileURL, fileType) {
        return this.httpService.previewFileInfo("v1/provider/uploadfile/previewfile/"+fileName+"?fileType="+fileType+"&imageUrl="+fileURL)
    }

}
