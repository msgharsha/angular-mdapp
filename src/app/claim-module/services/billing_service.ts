import { Injectable } from '@angular/core';
import { LocalStorageService } from '../../utils/service/localStorage.service';
import { HttpService } from "../../utils/service/http.service";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

@Injectable({ providedIn: 'root' })
export class BillingService {

    constructor(
        private apiService: HttpService,
        private localStorageService: LocalStorageService
    ) {

    }

    serializeURLParams(obj) {
        var str = [];
        for (var p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return str.join("&");
    };

    getLocations(data) {
        return this.apiService.getRequest(`billing/locations?${this.serializeURLParams(data)}`);
    };

    getPhysicallocationetab(data) {
        return this.apiService.getRequest(`billing/physicallocationetab?value=${data}`);
    };

    getSectorInfo() {
        return this.apiService.getRequest(`billing/sectors`);
    };

    validateHealthCard(data,doctorId) {
        return this.apiService.postRequest(`billing/validatehealthcard/${doctorId}`, data);
    };

    getDiagnoseCodes(data) {
        return this.apiService.getRequest(`billing/diagnostics?${this.serializeURLParams(data)}`);
    };

    getContextCodes(data) {
        return this.apiService.getRequest(`billing/contexts?${this.serializeURLParams(data)}`);
    };

    getServiceTypeCodes(data) {
        return this.apiService.getRequest(`billing/servicecodes?${this.serializeURLParams(data)}`);
    };

    getAgeFactorOptions(data) {
        return this.apiService.getRequest(`billing/categorytypes?${this.serializeURLParams(data)}`);
    };

    /* create claim init */
    createInitClaim(queryInfo, data) {
        return this.apiService.postRequest(`billing/saveinitclaim?${this.serializeURLParams(queryInfo)}`, data);
    };

    /* create new bill */
    createNewBill(data,userInfo) {
        return this.apiService.postRequest(`billing/createbill?${this.serializeURLParams(userInfo)}`, data);
    };

    /* update bill */
    updateClaimBill(data,userInfo) {
        return this.apiService.postRequest(`billing/updatebill?${this.serializeURLParams(userInfo)}`, data);
    };

    /* cancel bill */
    cancelBillInfo(data, queryInfo) {
        return this.apiService.postRequest(`billing/cancelbill?${this.serializeURLParams(queryInfo)}`, data);
    };

    /* get all measures */
    getAllMeasures(data) {
        return this.apiService.getRequest(`billing/measures?${this.serializeURLParams(data)}`);
    };

    /* get all fact codes */
    getAllFactCodes(data) {
        return this.apiService.getRequest(`billing/getallfactcodes?${this.serializeURLParams(data)}`);
    };

    /* get claims */
    getCliamsInfo(doctorInfo, data) {
        return this.apiService.postRequest(`billing/getclaimsinfo?${this.serializeURLParams(doctorInfo)}`, data);
    };

    /* update claim info */
    updateCliamInfo(data, queryInfo) {
        return this.apiService.postRequest(`billing/updateclaiminfo?${this.serializeURLParams(queryInfo)}`, data);
    };

    /* download csv file */
    downLoadDiagonsticeFile() {
        return this.apiService.getRequest(`billing/downloaddiagnostics`);
    }

    /* down load code facts csv file */
    downLoadCodeFactsFile(user_type) {
        return this.apiService.getRequest(`billing/downloadcodefacts?user_type=${user_type}`);
    }

    /* download xml files */
    async downLoadRDXmlFiles(id, fileType, respFileType) {
        const urls = [
            `${this.apiService.getBaseUrl(`billing/downloadclaimxml?id=${id}&fileType=${fileType}&authorization=${'Bearer ' + this.localStorageService.getAccessToken()}`)}`,
            `${this.apiService.getBaseUrl(`billing/downloadclaimxml?id=${id}&fileType=${respFileType}&authorization=${'Bearer ' + this.localStorageService.getAccessToken()}`)}`
        ];
        let index = 0;
        for (const url of urls) {    
            index = index + 1;
            await delay(index * 1000);
            this.download(url);
        }
    }

    downLoadRDPXmlFiles(id) {
        // let popout_1 = window.open(this.apiService.makeFullUrl(`/billing/downloadclaimxml?id=${id}&fileType=rdp&authorization=${'JWT ' + localStorage.getItem('id_token')}`));
        // window.setTimeout(function(){
        //     popout_1.close();
        // }, 1000);
    }

    async download(url) {
        const a = document.createElement('a');
        a.download = 'xml_file';
        a.href = url;
        a.style.display = 'none';
        document.body.append(a);
        a.click();

        // Chrome requires the timeout
        await delay(100);
        a.remove();
    };

}
