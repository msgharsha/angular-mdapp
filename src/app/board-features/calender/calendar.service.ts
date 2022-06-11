import { Injectable } from "@angular/core";
import { HttpService } from "../../utils/service/http.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ENDPOINTS } from "./constants/endpoints";

interface HeaderInterface {
  key: string;
  value: string;
}

@Injectable()
export class CalendarService {
  public allowAvailabilityAccess: boolean = false;
  public calendarObject: any;
  public currentView: any;
  public updateName: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(private _http: HttpService) {}

  getAvailabilityByDates(query: any) {
    const queryParams = `?to=${query.to}&from=${query.from}&offset=${query.offset} &doctorId=${query.doctorId}`;

    return this._http.getRequest(ENDPOINTS.AVAILABILITY + queryParams);
  }

  getManagerAvailabilityByDates(query: any) {
    const queryParams = `?to=${query.to}&from=${query.from}&offset=${query.offset} &doctorId=${query.doctorId}&userId=${query.userId}`;

    return this._http.getRequest(`practice/managerAvailability` + queryParams);
  }

  getAvailabilityById(id: string | number) {
    return this._http.getRequest(ENDPOINTS.AVAILABILITY + `/${id}`);
  }

  getManagerAvailabilityById(id: string | number, selectedDoctorData) {
    return this._http.getRequest(`practice/ManagerAvailability` + `/${id}`, selectedDoctorData);
  }

  addAvailability(body: any) {
    return this._http.postRequest(ENDPOINTS.AVAILABILITY, body);
  }

  managerAddAvailability(body: any) {
    return this._http.postRequest('practice/ManagerAvailability', body);
  }

  public deleteAvailability(timeId) {
    return this._http.deleteRequest(ENDPOINTS.AVAILABILITY + `/${timeId}`);
  }

  public managerDeleteAvailability(timeId,selectedDoctorData) {
    return this._http.deleteRequest(`practice/ManagerAvailability` + `/${timeId}`, selectedDoctorData);
  }

  getPersonalDetails(doctorId: string | number) {
    return this._http.getRequest(`practice/onboard/step1/${doctorId}`
    );
  }

  DeleteAllSlots(query,selectedDoctorData){
    let selectedDoc = JSON.stringify(selectedDoctorData)
    const queryParams = `?to=${query.to}&from=${query.from}&offset=${query.offset}&sort={"date": false}&status=confirmed&list=true&doctorId=${query.doctorId}&userId=${query.userId}&behaviour=${query.type}&selectedDoctorData=${selectedDoc}`;
    return this._http.deleteRequest(`practice/deleteAllSlots/` + queryParams);
  }


  /**
   * Function to parse hierarchical data
   */
  // parseHierarchicalData(dataArr, keyName) {
  //     let transformedArr = [];
  //     _.forEach(dataArr, (data: any) => {
  //         transformedArr = _.concat(transformedArr, [_.assign({ id: data.id, type: "parent", parentId: null }, _.set({}, keyName, _.get(data, keyName)))], _.map(_.get(data, "child", []), (obj: any) => _.assign(obj, { type: "child", parentId: data.id })));
  //     });
  //     return transformedArr;
  // }

  // sendReminder(body) {
  //     const header: HeaderInterface = {
  //         key: 'Authorization',
  //         value: localStorage.getItem('token')
  //     };
  //     const headers: Array<HeaderInterface> = [header];
  //     return this._http.postRequest('practice/appointment/send-reminder', body, headers);
  // }
  //send-reminder-closes

  /**
   * this methods return sthe expert name
   */
  // getExpert(filterKey, expertId?) {
  //     try {
  //         let filter = localStorage.getItem(filterKey);
  //         if (filter) {
  //             filter = JSON.parse(filter);
  //            if(filter['expertId']) return {id:filter['expertId'],name:filter['expertName']};
  //         }
  //         let userData = JSON.parse(localStorage.getItem('userData'));
  //         let name = (userData['salutation'] + ' ' + userData['name']);
  //         return {id: null, name: expertId? name:userData['practiceName']};
  //     }
  //     catch (exe) {
  //         return {id:null,name:"Not available"};
  //     }
  // }

  /**
   * this methods sets the filter
   * if it is required.
   * set filters for appointment.
   * this is the defalut state for
   * experts login
   */
  // initExpertStateInFilter(filter?) {
  //     // let filterKey = filter || LOCAL_VAL.CALENDAR.FILTER.APPOINTMENT;
  //     let filterKey = filter
  //     let expertId = JSON.parse(localStorage.getItem('expertId'));
  //     let existingFilter= JSON.parse(localStorage.getItem(filterKey));
  //     if (expertId&&(!existingFilter|| !existingFilter.expertId)) {
  //         let userData = JSON.parse(localStorage.getItem('userData'));
  //         let newFilter: any = existingFilter?{...existingFilter}:{};
  //         newFilter['expertId'] = expertId;
  //         newFilter['offset'] = encodeURIComponent(moment().format('Z'));
  //         newFilter['expertName'] = 'Dr. ' + userData.name;
  //         localStorage.setItem(filterKey, JSON.stringify(newFilter));
  //     }
  // }
  //setFiltersIfReq

  /**
   * this methods update the headers name
   * @param name
   */

  // public updateHeader() {
  //     this.updateName.next(true);
  // }
} //calendar service closes
