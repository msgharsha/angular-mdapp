import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class BillingHelper {

	constructor() {

	}

    serializeURLParams(obj) {
        var str = [];
        for (var p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return str.join("&");
    };

	/**
	 * 
	 * @param value 
	 * @param objectInfo 
	 * @returns 
	 */

	getLocationInfoParams(value, objectInfo) {
		const findLocation:any = _.find(objectInfo, {id: value });
		if (findLocation.type === 'geo') {
			return {
				typ_id_lieu_geo: 3,
				id_lieu_geo: findLocation ? findLocation.cod_local :  value,
				typ_lieu_geo: "C"
			}
		} else {
			return {
				typ_id_lieu_phys: 1,
				id_lieu_phys: findLocation ? findLocation.cod_local :  value,
				no_sect_activ: ""
			}
		}
	};

	getDiagnocodesInfoParams(codesInfo) {
		let requestObjectForm = {
			typ_situ_consi: 1,
			typ_id_pers: 1
		}
		// if (codesInfo.length === 1) {
		// 	return {
		// 		...requestObjectForm,
		// 		no_seq_sys_cla: codesInfo[0].no_seq_sys_cla,
		// 		cod_diagn_mdcal: codesInfo[0].cod_diagn_mdcal
		// 	};
		// } else {
			let diagonseCodes = [];
			codesInfo.forEach(element => {
				diagonseCodes.push({diagn_mdcal: {no_seq_sys_cla: element.no_seq_sys_cla, cod_diagn_mdcal: element.cod_diagn_mdcal }});
			});
			return {
				...requestObjectForm,
				liste_diagn_mdcal: diagonseCodes
			}
		//}
	};

	convertStringTimeToDate(dateStr, timeStr) {

		let date  = moment(dateStr),
			time  = moment(timeStr, 'HH:mm A');
		date.set({
			hour:   time.get('hour'),
			minute: time.get('minute'),
			second: time.get('second')
		});

		return date.toISOString().replace(/.\d+Z$/g, "");
	}

	convertEpochTime(selectedEpocTime, time) {
		selectedEpocTime = moment(selectedEpocTime).format('YYYY-MM-DD');
		let timeArray = time.split(":");
	
		if (timeArray[0] == 12) {
		  timeArray[0] = 0;
		}
	
		let result;
	
		if (time.includes("am")) {
		  result = moment(selectedEpocTime).add(parseInt(timeArray[0]), "hours");
		} else {
		  result = moment(selectedEpocTime).add(
			parseInt(timeArray[0]) + 12,
			"hours"
		  );
		}
	
		let timeMin = timeArray[1].split(" ");
		result = moment(result).add(parseInt(timeMin), "minutes").valueOf();
	
		return moment(new Date(result)).format('YYYY-MM-DDTHH:mm:ss').replace(/.\d+Z$/g, "");
		//new Date(result).toISOString().replace(/.\d+Z$/g, "");
	}

	formatDate(date) {
		var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

		if (month.length < 2) 
			month = '0' + month;
		if (day.length < 2) 
			day = '0' + day;

		return [year, month, day].join('-');
	}
	
	/**
	 * 
	 * @param objectInfo format patient adminssion date info
	 */
	getAdmissionEventInfo(objectInfo) {
		const requesObject = {
			typ_evene_pers: _.isEmpty(objectInfo?.typ_evene_pers) ? undefined : objectInfo.typ_evene_pers,
			dat_evene_pers: this.isEmptyField(objectInfo?.dat_evene_pers) ? moment(objectInfo.dat_evene_pers).format('YYYY-MM-DD') : undefined,
			dat_entre_pers_lieu: this.isEmptyField(objectInfo?.dat_entre_pers_lieu) ? moment(objectInfo.dat_entre_pers_lieu).format('YYYY-MM-DD') : undefined,
			dat_sorti_pers_lieu: this.isEmptyField(objectInfo?.dat_sorti_pers_lieu) ? moment(objectInfo.dat_sorti_pers_lieu).format('YYYY-MM-DD') : undefined
		}
		return requesObject;
	}

	/**
	 * 
	 * @param practiceDetails 
	 */
	getAccountInfo(practiceDetails, doctorId) {
		const requesObject = {
			id_intvn_ex: practiceDetails?.machineId.replace(/\D/g,''),
			machineId: practiceDetails?.machineId,
			machinePwd: practiceDetails?.machinePwd,
			typ_moda_paimt: practiceDetails?.accountType,
			no_cpte_admin: practiceDetails?.accountType == 2 ? practiceDetails?.adminAccNo : undefined,
			id_intvn: practiceDetails?.practiceNumber,
			typ_id_prof: 1,
			id_prof: practiceDetails?.practiceNumber,
		};
		return requesObject;
	}

	isEmptyField(value) {
		if (value === undefined || value === '' || value === null) {
			return false;
		}
		return true;
 	}

	getServMedicalParams(dataSource, userType) {
		const requesObject = [];
		dataSource.forEach(sourceObject => {
			let element_conxt = [];
			sourceObject.cod_elm_contx.forEach(element => {
				element_conxt.push({elm_contx: {cod_elm_contx: element.cod_elm_contx}});
			});
			if (sourceObject.refre_connu_id_prof == null || sourceObject.refre_connu_id_prof === '') {
				sourceObject.refre_connu_id_prof = undefined;
			}
			const formObject = {
				no_ligne_fact: sourceObject.id,
				typ_id_elm_fact: 1,
				id_elm_fact: sourceObject.id_elm_fact,
				dat_serv_elm_fact: sourceObject.dat_serv_elm_fact ?  moment(sourceObject.dat_serv_elm_fact).format('YYYY-MM-DD') : undefined,
				cod_role: 1,
				dhd_elm_fact: sourceObject.dhd_elm_fact ? this.convertEpochTime(sourceObject.dat_serv_elm_fact, sourceObject.dhd_elm_fact) : undefined,
				dhf_elm_fact: this.isEmptyField(sourceObject.dhf_elm_fact) ? this.convertEpochTime(sourceObject.dat_serv_elm_fact, sourceObject.dhf_elm_fact) : undefined,
				cod_elm_mesur: sourceObject.cod_elm_mesur,
				val_mes: sourceObject.val_mes,
				liste_elm_mesur: {
					elm_mesur: {
						cod_elm_mesur: sourceObject.cod_elm_mesur,
						val_mes: sourceObject.val_mes
					}
				},
				refre_connu_id_prof: sourceObject.refre_connu_id_prof,
				refre_connu_typ_id_prof: sourceObject.refre_connu_id_prof ? 1 : undefined,
				typ_refre_autre_prof: sourceObject.refre_connu_id_prof ? 1 : undefined,
				liste_elm_contx: element_conxt
			}
			requesObject.push((userType == 'general' ? {ligne_fact_serv_mdcal_omni: formObject } : {ligne_fact_serv_mdcal_spec: formObject }));
		});
		if (userType === 'general') {
			return {
				liste_ligne_fact_serv_mdcal_omni: requesObject
			}
		} else {
			return {
				liste_ligne_fact_serv_mdcal_spec: requesObject
			}
		}
	};

	/* check if value exist in nested objects */
	async checkDeeperObjectKey(keyName, originalObject) {
		let status = false;
		const deepObjectKey = (keyName, ObjectInfo) => {
			const objKeys = Object.keys(ObjectInfo);
			for (let key of objKeys) {
				if (key === keyName) {
					status = true;
					return;
				} else if (ObjectInfo[key] instanceof Array) {
					ObjectInfo[key].forEach(element => {
						deepObjectKey(keyName, element);
					});
				} else if (typeof ObjectInfo[key] === 'object') {
					deepObjectKey(keyName, ObjectInfo[key]);
				}
			}
		}
		deepObjectKey(keyName, originalObject);
		return status;
	};

	/* get object in nested objects */
	async getDeeperObjectByKey (keyName, originalObject) {
		let value = {};
		const deepObjectKey = (keyName, ObjectInfo) => {
			const objKeys = Object.keys(ObjectInfo);
			for (let key of objKeys) {
				if (key === keyName) {
					value = ObjectInfo[key];
					return;
				} else if (ObjectInfo[key] instanceof Array) {
					ObjectInfo[key].forEach(element => {
						deepObjectKey(keyName, element);
					});
				} else if (typeof ObjectInfo[key] === 'object') {
					deepObjectKey(keyName, ObjectInfo[key]);
				}
			}
		}
		deepObjectKey(keyName, originalObject);
		return value; 
	};

	async processClaimsInfo(claimsInfo) {
		return new Promise(async (resolve, reject) => {
			let responseInfo = [];
			let indexValue = 0;
			for (let key in claimsInfo) {
				let objectInfo = claimsInfo[key];
				indexValue = indexValue + 1;
				if (objectInfo.status === "draft") {
					let requestObject:any = {
						id: objectInfo.id,
						createdAt: objectInfo.createdAt,
						updatedAt: objectInfo.updatedAt,
						user_type: objectInfo.user_type,
						status: objectInfo.status,
						healthcardNumber: objectInfo?.claim_info?.health_card_num,
						patientName: objectInfo?.consultation_info?.patient?.patientName,
						claim_info: objectInfo.claim_info,
						consultation_info: objectInfo.consultation_info,
						claimsInfo: [{
							id: 1,
							dat_serv_elm_fact: moment(objectInfo?.consultation_info?.bookingDetail?.date),
							dhd_elm_fact: moment(objectInfo?.consultation_info?.bookingDetail?.startTime).format("hh:mm a"),
							dhf_elm_fact: moment(objectInfo?.consultation_info?.bookingDetail?.endTime).format("hh:mm a"),
						}]
					};
					responseInfo.push(requestObject);
				} else {
					let objectMainKey;
					const findKey = await this.checkDeeperObjectKey('dem_paimt', objectInfo.form_object);
					if (findKey)
					objectMainKey = 'dem_paimt';
					else
					objectMainKey = 'dem_modif';
					const healthcardNumber = await this.getDeeperObjectByKey('id_pers', objectInfo.form_object[objectMainKey]);
					let requestObject:any = {
						id: objectInfo.id,
						createdAt: objectInfo.createdAt,
						updatedAt: objectInfo.updatedAt,
						user_type: objectInfo.user_type,
						status: objectInfo.status,
						healthcardNumber: healthcardNumber ? healthcardNumber[0] : '',
						patientName: objectInfo?.consultation_info?.patient?.patientName,
						claim_info: objectInfo.claim_info,
						consultation_info: objectInfo.consultation_info,
						claimsInfo: []
					};
					let objectKeyName;
					const findKeyName = await this.checkDeeperObjectKey('dem_paimt_recev', objectInfo.claims_response.form_object);
					if (findKeyName) {
						objectKeyName = 'dem_paimt_recev';
					} else {
						objectKeyName = 'dem_modif_recev';
					}
					//const getClaimsInfo:any = await this.getDeeperObjectByKey('ligne_fact_serv_mdcal_omni', objectInfo.form_object.dem_paimt);
					const getClaimInfo = await this.getDeeperObjectByKey('id_fact_ramq_recev', objectInfo.claims_response.form_object[objectKeyName]);
					if (getClaimInfo instanceof Array) {
						requestObject.claim_info.claimObject = {
							no_fact_ramq: objectInfo.claims_response.no_fact_ramq ? objectInfo.claims_response.no_fact_ramq : getClaimInfo[0].no_fact_ramq[0],
							jeton_comm: objectInfo.claims_response.jeton_comm ? objectInfo.claims_response.jeton_comm : getClaimInfo[0].jeton_comm[0]
						}
					} else if (objectInfo?.claims_response && objectInfo.status === 'cancelled') {
						requestObject.claim_info.claimObject = {
							no_fact_ramq: objectInfo.claims_response.no_fact_ramq,
							jeton_comm: objectInfo.claims_response.jeton_comm
						}
					}
					objectInfo.claim_info.dataSource.forEach(async (dataInfo) => {
						const getCodeFactInfo:any = await this.getDeeperObjectByKey('ligne_fact_recev', objectInfo.claims_response.form_object[objectKeyName]);
						let claimsObject:any = dataInfo;
						if (getCodeFactInfo instanceof Array) {
							getCodeFactInfo.forEach(async (element) => {
								if (claimsObject.id == parseInt(element.no_ligne_fact[0])) {
									if (element.sta_recev[0] == '1') {
										claimsObject.status = 'submitted';
										claimsObject.successMsg = element.formu_expl ? `${element.formu_expl[0]}` : '';
										claimsObject.mnt_prel = element.mnt_prel ? element.mnt_prel[0] : '';
									} else {
										claimsObject.status = 'rejected';
										const getErrorMsg = await this.getDeeperObjectByKey('msg_expl_recev', element);
										claimsObject.errMsg = `${getErrorMsg[0].cod_msg_expl_recev[0]} | ${getErrorMsg[0].txt_msg_expl_recev}`;
									}
								}
							});
						}
						requestObject.claimsInfo.push(claimsObject);
					});
					responseInfo.push(requestObject);	
				}
				if (claimsInfo.length === indexValue) {
					resolve(responseInfo);
				}
			}
		});
	};

	async prepareFormDataClaimInfo(self) {
		return new Promise(async (resolve, reject) => {
			const formData = self.billingObjectForm.value;
			let prepareObjectInfo = {
				location_name: formData?.location_name,
				locationsOptions: _.filter(self.locationsOptions, {id: formData?.location_name }),
				no_sect_activ: formData?.no_sect_activ,
				sectorOptions: _.filter(self.sectorOptions, {no_sect_activ: formData.no_sect_activ }),
				health_card_num: formData.health_card_num,
				selectedDiagnosCodes: self.selectedDiagnosCodes,
				typ_evene_pers: formData.typ_evene_pers,
				dat_evene_pers: formData.dat_evene_pers,
				dat_entre_pers_lieu: formData.dat_entre_pers_lieu,
				dat_sorti_pers_lieu: formData.dat_sorti_pers_lieu,
				dataSource: self.dataSource
			};
			resolve(prepareObjectInfo);
		});
	};

	downloadFile(data, filename='data') {
        let csvData = this.ConvertToCSV(data, [
			{
				header: 'Healthcard Number',
				key: 'healthcardNumber'
			},
			{
				header: 'Claim Number',
				key: 'claimNumber'
			},
			{
				header: 'Patient Name',
				key: 'patientName'
			},
			{
				header: 'Status',
				key: 'status'
			},
			{
				header: 'Message',
				key: 'message'
			},
			{
				header: 'Code',
				key: 'id_elm_fact'
			},
			{
				header: 'Amount($)',
				key: 'amount'
			},
			{
				header: 'Location Name',
				key: 'location'
			},
			{
				header: 'Diagnose Codes',
				key: 'diagnoseCodes'
			},
			{
				header: 'Date',
				key: 'createdAt'
			},
			{
				header: 'Booking Info',
				key: 'booking_info'
			},
			{
				header: 'Consultation Date',
				key: 'bk_date'
			},
			{
				header: 'Consulation Start Time',
				key: 'bk_start_time'
			},
			{
				header: 'Consulation End Time',
				key: 'bk_end_time'
			},
			{
				header: 'Scheduled Consultation Time',
				key: 'bk_timeSlot'
			},
			{
				header: 'Consulation Visit',
				key: 'bk_reasonForVisit'
			},
			{
				header: 'Patient Info',
				key: 'patinet_info'
			},
			{
				header: 'Address',
				key: 'pat_address'
			},
			{
				header: 'Age',
				key: 'pat_age'
			},
			{
				header: 'Date Of Birth',
				key: 'pat_dob'
			},
			{
				header: 'Gender',
				key: 'pat_gender'
			},
			{
				header: 'Phone Number',
				key: 'pat_patientPhoneNumber'
			},
			{
				header: 'Postal Code',
				key: 'pat_postalCode'
			}
		]);
        console.log(csvData)
        let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(blob);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", filename + ".csv");
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

	ConvertToCSV(objArray, headerList) {
		let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		let str = '';
		let row = 'S.No,';
		for (let index in headerList) {
			row += headerList[index].header + ',';
		}
		row = row.slice(0, -1);
		str += row + '\r\n';
		for (let i = 0; i < array.length; i++) {
			let line = (i+1)+'';
			for (let index in headerList) {
				let head = headerList[index].key;
				line += ',' + (array[i][head] === undefined ? '' : (array[i][head] === 'undefined' ? '' : array[i][head]));
			}
			str += line + '\r\n';
		}
		return str;
	}

}
