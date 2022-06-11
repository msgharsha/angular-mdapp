/**
 * 
 * Copyright 2009-2021 Ibase it software solutions pvt Ltd.
 * @author ibaseit
 */

 import { Component, OnInit, Input, ViewContainerRef, EventEmitter, Output,Inject } from "@angular/core";
 import { ActivatedRoute, Router } from "@angular/router";
 import { MatDialog } from "@angular/material/dialog";
 import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { faCloudUploadAlt, faCheckCircle, faTimesCircle, faEdit, faTrashAlt, faFileDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

 import { TranslaterService } from "../../utils/service/translater.service";
 import { ToasterService } from "../../utils/service/toaster.service";
 import { ErrorService } from "../../utils/service/error.service";
 import { LocalStorageService } from '../../utils/service/localStorage.service';
 import { OnboardService } from '../../utils/component/details/onboard.service';
 import { DialogModalComponent } from '../../utils/component/cancel-modal/cancel-modal.component';
 import { BillingService } from '../services/billing_service';
 import { Config } from '../services/config';
 import { ExcelService } from '../services/excel_service';
 import { BillingHelper } from '../services/billing_helper';
 import {  AppointmentService } from "../../board-features/calender/appointments/appointments.service";
 import { formConfig } from '../../board-features/calender/availability/add-edit-availability/form-config';

 import * as _ from "lodash";
 import * as moment from 'moment';
 
 @Component({
     selector: "app-create-claim",
     templateUrl: "./claim-component.html",
     styleUrls: ["./claim-component.scss"]
 })
 export class CreateClaimComponent implements OnInit {
 
     @Input() patientId;
     @Input() patientName;
     @Input() bookingId;
     @Input() modelView;
     @Input() claimResponse;
     @Output() onViewMessages = new EventEmitter();
 
     billingObjectForm: FormGroup;
     public timeSlots = formConfig.timeSlots;
     public startTimeSlots = this.generateTimeSlots("00:00", "24:00", 5);
     public endTimeSlots = this.generateTimeSlots("00:00", "24:00", 5);
     public enabledStatus = { enableEndTime: false };
     userData:any = {};
     updateButton = false;
     practiceDetails: any = {};
     appointmentDetails: any = {};
 
     dataSource = [];
     isDiagnoseLoading = false;
     updateRecordId:any;
     updateRecordInfo:any = {};
     timeout: any = null;
     todayDate = new Date();
     locationsOptions = [];
     healthCardInfo = [];
     start_time = '';
     healthCardErrMsg = '';
     sectorOptions = [];
     diagnosCodesInfo = [];
     selectedDiagnosCodes = [];
     factCodesInfo = [];
 
     contextOptionsCodes = [];
     filteredOptions = [];
     measureOptionCodes = [];
 
     specialityOptions = [];
     subSpecialityOptions = [];
     ageFactorOptions = [];
 
     serviceTypesJSON = {};

     claimObject:any = {};
 
     mainObjectErrMsg:any = [];
     eventTypeOptions = Config.EVENT_TYPES;
     userType = '';
 
     fontIcons = [
         faCloudUploadAlt,
         faCheckCircle,
         faTimesCircle,
         faEdit,
         faTrashAlt,
         faFileDownload,
         faInfoCircle
     ];

     consulationTimeInfo = {};
     unitMeasureName = '';
     healthCardErrorRamq: any;
     optional: boolean = true;
 
     constructor(
         private translater: TranslaterService,
         private errorService: ErrorService,
         private vref: ViewContainerRef,
         private localStorageService: LocalStorageService,
         private onboardService: OnboardService,
         private appointmentService: AppointmentService,
         private formBuilder: FormBuilder,
         private billingService: BillingService,
         private billingHelper: BillingHelper,
         private toasterService: ToasterService,
         private matDialog: MatDialog,
         private route: ActivatedRoute,
         private excelService: ExcelService,
         private router: Router
     ) {
 
         this.billingObjectForm = this.formBuilder.group({
             location_name: ['', [Validators.required]],
             no_sect_activ: [''],
             vulnerability_type: ['Non vulnérable'],
             health_card_num: ['', [Validators.required]],
             diagnosis_code: ['', []],
             typ_evene_pers: [''],
             dat_evene_pers: [''],
             dat_entre_pers_lieu: [''],
             dat_sorti_pers_lieu: [''],
             id_elm_fact: [''],
             dat_serv_elm_fact: [''],
             timeSlot: [''],
             dhd_elm_fact: [''],
             dhf_elm_fact: [''],
             user_type: [''],
             cod_elm_contx: [''],
             categoryType: [{value:'', disabled:true}],
             specialityType: [''],
             subSpecialityType: [''],
             val_mes: [''],
             cod_elm_mesur: [''],
             refre_connu_id_prof: ['']
         });
 
     }
 
       /**
    * Function to generate time slots
    * @param startTime String  - Start time in 24hrs format
    * @param endTime String - End time in 24hrs format
    * @param diff Integer - Difference of time(minutes) in time slots
    */
     generateTimeSlots(startTime, endTime, diff) {
         let timeSlots = [];
         const start = moment(startTime, "hh:mm");
         const end = moment(endTime, "hh:mm");
         while (start.isBefore(end)) {
             timeSlots = _.concat(timeSlots, {
             name: start.format("hh:mm a"),
             id: start.format("hh:mm a"),
             });
             start.add(diff, "minutes");
         }
         return timeSlots;
     }
 
     ngOnInit(): void {
         this.translater.TranslationAsPerSelection();
         this.userData = this.localStorageService.getItem('userData');
        
         if (this.modelView == 'true') {

            if (!_.isEmpty(this.claimResponse.user_type)) {
                this.userType = this.claimResponse.user_type;
            }

            const claimRequesInfo:any = this.claimResponse?.claim_info;
            this.appointmentDetails = this.claimResponse?.consultation_info;
            this.dataSource = claimRequesInfo?.dataSource;

            if (claimRequesInfo.claimObject) {
                this.claimObject = claimRequesInfo.claimObject;
            }

            if (claimRequesInfo.healthCardInfo)
            this.healthCardInfo = claimRequesInfo.healthCardInfo;

            if (claimRequesInfo.locationsOptions) {
                this.locationsOptions = claimRequesInfo.locationsOptions;
                const findLocType = _.find(this.locationsOptions, {type: 'geo' });
                if (findLocType) {
                    this.billingObjectForm.controls['no_sect_activ'].setValue('');
                    this.billingObjectForm.controls['no_sect_activ'].disable();
                }
            }

            if (claimRequesInfo.sectorOptions) {
                this.sectorOptions = claimRequesInfo.sectorOptions;
            }

            if (claimRequesInfo.selectedDiagnosCodes) {
                this.selectedDiagnosCodes = claimRequesInfo.selectedDiagnosCodes;
                this.diagnosCodesInfo = claimRequesInfo.selectedDiagnosCodes;
            }

            const formFields = Config.CLAIM_DATA_INFO;
            formFields.forEach((key) => {
                if (key === 'diagnosis_code') {
                    this.billingObjectForm.controls[key].setValue(this.selectedDiagnosCodes.map((newMyObj) => { return newMyObj.id }));
                } else {
                    this.billingObjectForm.controls[key].setValue(claimRequesInfo[key]);
                }
                if (key === 'typ_evene_pers' && claimRequesInfo[key] === undefined) {
                    this.billingObjectForm.controls['dat_evene_pers'].disable();
                }
            });
         } else {
           this.billingObjectForm.controls['dat_evene_pers'].disable();
        }

         this.billingObjectForm.controls['cod_elm_mesur'].disable();
         this.billingObjectForm.controls['val_mes'].disable();

         this.getDoctorSpecialtyInfo();
         this.getAppointmentDetails();
 
         this.billingService.getSectorInfo().subscribe((sectorOptionsResp) => {
             if (sectorOptionsResp.status === 0) {
                 this.sectorOptions = sectorOptionsResp.data;
                 this.sectorOptions.forEach((sectorOption, index) => {
                    sectorOption['title'] = sectorOption.des_sect_activ+'('+sectorOption.no_sect_activ+')'
                 });
             }
         },(err) => this.handleError(err)
         );
         this.listenValueChanges();
     }
 
       /**
    * Function to listen to value changes
    */
     listenValueChanges() {
         _.invoke(
             this.billingObjectForm,
             "controls.dat_sorti_pers_lieu.valueChanges.subscribe",
             _.bind(this.admissionDateOutHandler, this)
         );
         _.invoke(
            this.billingObjectForm,
            "controls.dat_entre_pers_lieu.valueChanges.subscribe",
            _.bind(this.admissionDateOutHandler, this)
        );
     }
 
     /**
            * Function to handle timeSlot change
    */
     timeSlotChangeHandler() {
         this.modifyEnabledStatus();
     }
 
     /**
            * Function to handle start time change handler
    */
     startTimeChangeHandler() {
         this.billingObjectForm.controls.dhf_elm_fact.setValue(null);
         this.modifyEnabledStatus();
     }
 
     /**
            * Function to modify enabled status
    */
     modifyEnabledStatus() {
         if (
             _.get(this.billingObjectForm, "controls.dhd_elm_fact.value") &&
             _.get(this.billingObjectForm, "controls.timeSlot.value")
         ) {
             this.enabledStatus.enableEndTime = true;
             this.endTimeSlots = this.generateEndTimeSlots();
             this.billingObjectForm.get("dhf_elm_fact").setValue(null);
             this.billingObjectForm.get("dhf_elm_fact").enable();
         } else {
             this.enabledStatus.enableEndTime = false;
             this.endTimeSlots = [];
             this.billingObjectForm.get("dhf_elm_fact").setValue(null);
             this.billingObjectForm.get("dhf_elm_fact").disable();
         }
     }
 
     /**
            * Function to generate end time slots
    */
     generateEndTimeSlots() {
         let timeSlots = [];
         const startTime = moment(
             _.get(this.billingObjectForm, "controls.dhd_elm_fact.value"),
             "hh:mm a"
         ).add(
             _.defaultTo(_.get(this.billingObjectForm, "controls.timeSlot.value", 15), 15),
             "minutes"
         );
         const endTime = moment("24:00", "hh:mm a");
 
         while (startTime.isSameOrBefore(endTime)) {
             timeSlots = _.concat(timeSlots, {
                name: startTime.format("hh:mm a"),
                id: startTime.format("hh:mm a"),
             });
             startTime.add(
             _.defaultTo(_.get(this.billingObjectForm, "controls.timeSlot.value", 15), 15),
             "minutes"
             );
         }
         return timeSlots;
     }


     getDoctorSpecialtyInfo() {
         this.onboardService.getPracticeDetails(this.userData["doctorId"]).subscribe((res) => {
             this.practiceDetails = _.cloneDeep(_.get(res, "data", ""));
             if (this.practiceDetails.specialtyType === 2) {
                 this.userType = 'speciality';
             } else {
                 this.userType = 'general';
             }
             if (this.practiceDetails.claimAddress) {
                this.locationsOptions = this.practiceDetails.claimAddress.locations;
                this.locationsOptions.forEach((locationsOption, index) => {
                    let locationType = locationsOption.type === 'geo' ? 'G-' : 'PH-';
                    let locationNom = locationsOption.nom_local ? locationsOption.nom_local : locationsOption.nom_etab; 
                    locationsOption['title'] = locationType+' '+locationNom+' '+'('+locationsOption.cod_local+')'
                 });
                this.practiceDetails.claimAddress = this.locationsOptions;
                if ((this.locationsOptions.length !== 0 && !this.billingHelper.isEmptyField(this.billingObjectForm.value['location_name'])) || this.modelView === 'false') {
                    this.billingObjectForm.controls['location_name'].setValue(this.locationsOptions[0].id);
                    this.changeLocationInfoType(false);
                }
             }
             this.getContextServiceTypeInfo();
         },(err) => this.handleError(err)
         );
     }
 
     getAppointmentDetails() {
         this.appointmentService.getAppointmentById(this.bookingId).subscribe((res) => {
             this.appointmentService.getConsultationInfoById(this.bookingId).subscribe((consulationInfo) => {
                const consultationDetails = _.cloneDeep(_.get(consulationInfo, "data", ""));
                this.appointmentDetails = _.cloneDeep(_.get(res, "data", ""));
                var duration = moment.duration(moment(this.appointmentDetails?.bookingDetail?.endTime).diff(moment(this.appointmentDetails?.bookingDetail?.startTime)));
                const timeSlotDuration = duration.asMinutes();
                if (this.appointmentDetails?.patient?.healthCareNumber && this.modelView === 'false') {
                    this.billingObjectForm.get("health_card_num").setValue(this.appointmentDetails?.patient?.healthCareNumber);
                }

                if (this.appointmentDetails?.bookingDetail?.date) {
                    this.billingObjectForm.get("dat_serv_elm_fact").setValue(new Date(consultationDetails?.startTime));
                    this.appointmentDetails.bookingDetail.date = moment(new Date(consultationDetails?.startTime)).valueOf();
                    this.appointmentDetails.bookingDetail.startTime = moment(new Date(consultationDetails?.startTime)).valueOf();
                    this.appointmentDetails.bookingDetail.endTime = moment(new Date(consultationDetails?.endTime)).valueOf();
                }
                const startTime = moment(this.appointmentDetails?.bookingDetail?.startTime).format("hh:mm a");
                const endTIme = moment(this.appointmentDetails?.bookingDetail?.endTime).format("hh:mm a");
                var duration = moment.duration(moment(this.appointmentDetails?.bookingDetail?.endTime).diff(moment(this.appointmentDetails?.bookingDetail?.startTime)));
                //this.startTimeSlots = this.generateTimeSlots("00:00", "24:00", timeSlotDuration);
                this.billingObjectForm.get("timeSlot").setValue(timeSlotDuration);
                this.billingObjectForm.get("dhd_elm_fact").setValue(startTime);
                setTimeout(() => {
                   this.billingObjectForm.get("dhf_elm_fact").setValue(null);
                },1000);
                this.consulationTimeInfo = {
                    dat_serv_elm_fact: this.billingObjectForm.value['dat_serv_elm_fact'],
                    timeSlot: timeSlotDuration,
                    dhd_elm_fact: startTime,
                    dhf_elm_fact: endTIme
                };
                if ((this.claimResponse && this.claimResponse.status === 'draft') || this.healthCardInfo.length === 0) {
                    setTimeout(() => {
                        this.validateHealthCard();
                    },500);
                }
                if (this.modelView === 'false')
                this.cancelClaim();
             },(err) => this.handleError(err)
             );
         },(err) => this.handleError(err)
         );
     }

     openFromIcon(timepicker: { open: () => void }) {
          timepicker.open();
      }

    /* get context and service type info */
    getContextServiceTypeInfo() {
        this.billingService.getContextCodes({user_type: this.userType }).subscribe((contextOptionsRes) => {
            if (contextOptionsRes.status === 0) {
                this.contextOptionsCodes = contextOptionsRes.data;
                this.filteredOptions = this.contextOptionsCodes;
                //if (this.dataSource.length === 0) {
                    if (this.userType === 'general') {
                        const getContextCodes = _.find(this.filteredOptions, {cod_elm_contx: "1839" });
                        const getSecondContextCodes = _.find(this.filteredOptions, {cod_elm_contx: "1821" });
                        if (getContextCodes || getSecondContextCodes) {
                            this.billingObjectForm.controls['cod_elm_contx'].setValue([getContextCodes.id, getSecondContextCodes.id]);
                        }
                    } else {
                        const getContextCodes = _.find(this.filteredOptions, {cod_elm_contx: "1837" });
                        const getSecondContextCodes = _.find(this.filteredOptions, {cod_elm_contx: "1826" });
                        if (getContextCodes || getSecondContextCodes) {
                            this.billingObjectForm.controls['cod_elm_contx'].setValue([getContextCodes.id,getSecondContextCodes.id]);
                        }
                    }
                //}
            }
        },(err) => this.handleError(err)
        );
        this.billingService.getServiceTypeCodes({user_type: this.userType }).subscribe((serviceTypesJSON) => {
            if (serviceTypesJSON.status === 0) {
                this.serviceTypesJSON = serviceTypesJSON.data;
                if (_.size(this.serviceTypesJSON) !== 0 && this.healthCardInfo.length !== 0)
                this.billingObjectForm.controls['categoryType'].enable();
            }
        },(err) => this.handleError(err)
        );
    }
     
     handleError(err: any) {
         this.errorService.handleError(err, this.vref);
     };
 
     async getLocationsInfo(event: any) {
        let $this = this;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(async () => {
            if (this.modelView === 'true') {
                this.updateButton = true;
            }
            if (event.keyCode != 13 || event.status) {
            const location_name = event.term;//this.billingObjectForm.value['location_name'];
            if(location_name === '') {
                return;
            } else {
               if(location_name.length < 3) {
                   return;
               }
               this.billingService.getLocations({ value: location_name }).subscribe((responseInfo) => {
                   if (responseInfo.status === 0) {
                       this.locationsOptions = responseInfo.data;
                        this.locationsOptions.forEach((locationsOption, index) => {
                            let locationType = locationsOption.type === 'geo' ? 'G-' : 'PH-';
                            let locationNom = locationsOption.nom_local ? locationsOption.nom_local : locationsOption.nom_etab; 
                            locationsOption['title'] = locationType+' '+locationNom+' '+'('+locationsOption.cod_local+')'
                        });
                       if (this.practiceDetails.claimAddress && responseInfo.data.length === 0) {
                           this.locationsOptions = this.practiceDetails.claimAddress;
                           this.locationsOptions.forEach((locationsOption, index) => {
                            let locationType = locationsOption.type === 'geo' ? 'G-' : 'PH-';
                            let locationNom = locationsOption.nom_local ? locationsOption.nom_local : locationsOption.nom_etab; 
                            locationsOption['title'] = locationType+' '+locationNom+' '+'('+locationsOption.cod_local+')'
                        });
                       }
                   }
               },(err) => this.handleError(err)
               );
            }
            }
        },1000);
     };

     changeLocationInfoType(stattus) {
         //nom_local
         const requestObject = _.find(this.locationsOptions, {id: this.billingObjectForm.value['location_name'] });
         this.optional = true;
         if (requestObject.type === 'geo') {
            this.billingObjectForm.controls['no_sect_activ'].setValue('');
            this.billingObjectForm.controls['no_sect_activ'].disable();
            this.billingObjectForm.controls['no_sect_activ'].setValidators([]);
            this.billingObjectForm.controls['no_sect_activ'].updateValueAndValidity();
         } else {
            this.billingService.getPhysicallocationetab(requestObject.nom_local).subscribe((responseInfo) => {
                if (responseInfo.status === 0) {
                    console.log(responseInfo.data[0])
                    if(responseInfo.data && responseInfo.data.length > 0 && responseInfo.data[0].typ_etab == "CAB"){
                        this.billingObjectForm.controls['no_sect_activ'].setValue('');
                        this.billingObjectForm.controls['no_sect_activ'].disable();
                        this.billingObjectForm.controls['no_sect_activ'].setValidators([]);
                        this.billingObjectForm.controls['no_sect_activ'].updateValueAndValidity();
                        
                    } else if(responseInfo.data && responseInfo.data.length > 0 && responseInfo.data[0].typ_etab =="ETAB"){
                        if(responseInfo.data[0].catg_etab =="CH"){
                            this.billingObjectForm.controls['no_sect_activ'].setValue('');
                            this.billingObjectForm.controls['no_sect_activ'].enable();
                            this.billingObjectForm.controls['no_sect_activ'].setValidators([Validators.required]);
                            this.billingObjectForm.controls['no_sect_activ'].updateValueAndValidity();
                            this.optional = false
                        } else {
                            this.billingObjectForm.controls['no_sect_activ'].setValue('');
                            this.billingObjectForm.controls['no_sect_activ'].enable();
                            this.billingObjectForm.controls['no_sect_activ'].setValidators([]);
                            this.billingObjectForm.controls['no_sect_activ'].updateValueAndValidity();
                        }
                    } else {
                        this.billingObjectForm.controls['no_sect_activ'].setValue('');
                        this.billingObjectForm.controls['no_sect_activ'].enable();
                        this.billingObjectForm.controls['no_sect_activ'].setValidators([]);
                        this.billingObjectForm.controls['no_sect_activ'].updateValueAndValidity();
                    }
                    
                }
            },(err) => this.handleError(err)
            );
         }

        if (this.practiceDetails.claimAddress) {
              const findLocation = _.find(this.practiceDetails.claimAddress, {cod_local: requestObject.cod_local });
              if (findLocation) {
                return;
              }
        }
        if (!stattus)
        return;
        this.onboardService.saveClaimAddress({claimAddress: JSON.stringify(requestObject)}, this.userData["doctorId"]).subscribe((responseInfo) => {
            if (responseInfo.body.success) {
                this.practiceDetails.claimAddress = responseInfo.body.data;
            }
        },(err) => this.handleError(err)
        );
     };

     changeEventType() {
        const findValue = this.billingObjectForm.value['typ_evene_pers'];
        if (!findValue) {
            this.billingObjectForm.controls['dat_evene_pers'].setValue(undefined);
            this.billingObjectForm.controls['dat_evene_pers'].disable();
            this.billingObjectForm.controls['dat_evene_pers'].setValidators([])
            this.billingObjectForm.controls['dat_evene_pers'].updateValueAndValidity()
        } else {
            this.billingObjectForm.controls['dat_evene_pers'].enable();
            this.billingObjectForm.controls['dat_evene_pers'].setValidators([Validators.required]);
            this.billingObjectForm.controls['dat_evene_pers'].updateValueAndValidity();
        }
        if (this.modelView === 'true')
        this.enableUpdateButton();
     }

     admissionDateOutHandler() {
        setTimeout(() => {
            const findValue = this.billingObjectForm.value['dat_sorti_pers_lieu'];
            if (!findValue) {
                this.billingObjectForm.controls['dat_entre_pers_lieu'].setValidators([]);
                this.billingObjectForm.controls['dat_entre_pers_lieu'].updateValueAndValidity();
             } else {
                this.billingObjectForm.controls['dat_entre_pers_lieu'].setValidators([Validators.required]);
                this.billingObjectForm.controls['dat_entre_pers_lieu'].updateValueAndValidity();
             }
             if (this.modelView === 'true')
             this.enableUpdateButton();
        },1000);
     }
 
     displayFn(suggestion : string) : string {
         const findObject = _.find(this.locationsOptions, {id: suggestion });
         return findObject ? (findObject.nom_local ? `${findObject.nom_local}(${findObject.cod_local})`: findObject.nom_etab) : '';
     };
 
     /* validate health card number */
     async validateHealthCard() {
         this.healthCardErrMsg = '';
         let health_card_num = this.billingObjectForm.value['health_card_num'];
         if(!this.billingHelper.isEmptyField(health_card_num)) {
             return;
         }
         this.healthCardInfo = [];
         this.billingService.validateHealthCard({cardNo: health_card_num },this.userData["doctorId"]).subscribe(async (responseInfo) => {
             if (responseInfo.status === 0) {
                 if (responseInfo.rspData[0].cod_retou[0] !== '0') {
                     this.healthCardErrMsg = responseInfo.rspData[0].des_msg_retou[0];
                     this.billingObjectForm.controls['health_card_num'].setErrors({error_key: true});
                 } else {
                     const errorMsg = await this.billingHelper.getDeeperObjectByKey('sta_admis', responseInfo.rspData[0]);
                     if (errorMsg[0] === 'NON') {
                         this.healthCardErrMsg = responseInfo.rspData[0].txt_msg_inadm[0];
                         this.billingObjectForm.controls['health_card_num'].setErrors({error_key: true});
                     } else {
                         this.healthCardInfo = responseInfo.rspData;
                         if (_.size(this.serviceTypesJSON) !== 0 && this.healthCardInfo.length !== 0)
                         this.billingObjectForm.controls['categoryType'].enable();
                         if (this.healthCardInfo[0].dat_verif_admis) {
                            this.healthCardInfo[0].dat_verif_admis[0] = new Date(this.healthCardInfo[0].dat_verif_admis[0].replace('T00:00:00-04:00','T00:00:00')).toISOString();
                         }
                     }
                 }
             } else if(responseInfo.status === 1 && responseInfo.rspCode === "CREDENTIALS_WRONG"){
                //this.healthCardErrMsg = responseInfo.rspMessage;
                this.healthCardErrorRamq = responseInfo.rspMessage;
                this.billingObjectForm.controls['health_card_num'].setErrors({error_key: true});
             }
         },(err) => this.handleError(err)
         );
     };

     sendToPractice(){
        this.matDialog.closeAll();
        this.router.navigateByUrl("accounts/practice");
      }
 
     getErrorMessage() {
         return this.billingObjectForm.controls['health_card_num'].hasError('required') ? 'Required' :
         this.billingObjectForm.controls['health_card_num'].hasError('error_key') ? this.healthCardErrMsg :
         this.billingObjectForm.controls['health_card_num'].hasError('invalidFormat') ? 'Invalid Health card format' : ''
     };
 
     getDiagnosisInfo(event) {
         let $this = this;
         clearTimeout(this.timeout);
         this.timeout = setTimeout(async () => {
            if (event.keyCode != 13 || event.status) {
                const diagnosCode = event.term;
                if(diagnosCode.length < 3) {
                    return;
                } else { 
                    this.isDiagnoseLoading = true;
                    this.billingService.getDiagnoseCodes({value: diagnosCode}).subscribe((responseInfo) => {
                        if (responseInfo.status === 0) {
                            this.diagnosCodesInfo = responseInfo.data;
                        }
                        this.isDiagnoseLoading = false;
                    },(err) => this.handleError(err)
                    );
                }
            }
        }, 1000);
     };
 
     displayFnDiagnose(suggestion) {
         return '';
     };
 
     getSelectedDiagnosCode(optionId) {
         const objectInfo = _.find(this.diagnosCodesInfo, {id: optionId });
         const findExistInfo = _.find(this.selectedDiagnosCodes, {id: optionId });
         if (objectInfo && !findExistInfo) {
             this.selectedDiagnosCodes.push(objectInfo);
         }
     };
 
     removeDiagnoseCode(option, status) {
         if (!status) {
             _.remove(this.selectedDiagnosCodes, function(currentObject) {
                 return currentObject.id === option.value;
             });
         } else {
             this.selectedDiagnosCodes = [];
         }
     };
 
     async changeVulnerabilityType() {
         if (this.billingObjectForm.value['specialityType'] !== '' && this.billingObjectForm.value['subSpecialityType'] !== '') {
             await this.selectSubSpecialityType({value: this.billingObjectForm.value['subSpecialityType'] });
         }
     };
 
     async selectSubSpecialityType(event) {
         if (this.healthCardInfo.length !== 0) {
            const healthCardDOB = this.healthCardInfo;
            const requesObject = {
                user_type: this.userType,
                service_type: this.billingObjectForm.value['categoryType'],
                category_type: this.billingObjectForm.value['specialityType'],
                subcategory_type: event.value,
                patient_count: this.practiceDetails?.patientCount ? this.practiceDetails?.patientCount : 1,
                vulnerability_type: this.billingObjectForm.value['vulnerability_type'],
                dob: healthCardDOB[0].dat_naiss ? healthCardDOB[0].dat_naiss[0] : '1999-12-03'
            }
            this.billingService.getAgeFactorOptions(requesObject).subscribe((ageFactorOptions) => {
                if (ageFactorOptions.status === 0 && ageFactorOptions.data) {
                    this.ageFactorOptions = ageFactorOptions.data;
                }
            },(err) => this.handleError(err)
            );
         }
     };
 
     getCodeFactsInfo(event) {
         let $this = this;
         clearTimeout(this.timeout);
         this.timeout = setTimeout(async () => {
            if (event.keyCode != 13 || event.status) {
                const factCode = event.term;//this.billingObjectForm.value['id_elm_fact'];
                if(factCode.length === 0) {
                    return;
                } else { 
                    this.billingService.getAllFactCodes({user_type: this.userType, value: factCode}).subscribe((responseInfo) => {
                        if (responseInfo.status === 0) {
                            this.factCodesInfo = responseInfo.data;
                        }
                    },(err) => this.handleError(err)
                    );
                }
             }
         },1000);
     };
 
     /* get all measures */
     getAllMeasures() {
         this.measureOptionCodes = [];
         this.billingService.getAllMeasures({user_type: this.userType, cod_fact: this.billingObjectForm.value['id_elm_fact'] }).subscribe((respInfo) => {
             if (respInfo.status === 0 && respInfo.data.length !== 0) {
                 const findMeasureValue = respInfo.data[0].liste_attri.liste_elm_mesur ? respInfo.data[0].liste_attri.liste_elm_mesur : undefined;
                 if (findMeasureValue) {
                     if (findMeasureValue.elm_mesur instanceof Array) {
                         this.measureOptionCodes = findMeasureValue.elm_mesur;
                     } else {
                        this.measureOptionCodes.push(findMeasureValue.elm_mesur);
                     }
                     this.billingObjectForm.controls['cod_elm_mesur'].enable();
                     this.billingObjectForm.controls['cod_elm_mesur'].setValue(this.measureOptionCodes[0].cod_elm_mesur);
                     setTimeout(() => {
                        this.updateMeasureCode();
                     },100);
                 } else {
                     this.billingObjectForm.controls['cod_elm_mesur'].setValue('');
                     this.billingObjectForm.controls['val_mes'].setValue('');
                     this.billingObjectForm.controls['cod_elm_mesur'].disable();
                     this.billingObjectForm.controls['val_mes'].disable();
                 }
             }  else {
                 this.billingObjectForm.controls['cod_elm_mesur'].setValue('');
                 this.billingObjectForm.controls['val_mes'].setValue('');
                 this.billingObjectForm.controls['cod_elm_mesur'].disable();
                 this.billingObjectForm.controls['val_mes'].disable();
             }
         },(err) => this.handleError(err)
         );
     };

     updateMeasureCode() {
        this.unitMeasureName = '';
         const findCodeInfo = _.find(this.measureOptionCodes, {cod_elm_mesur: this.billingObjectForm.value['cod_elm_mesur']})
         if (findCodeInfo) {
            this.unitMeasureName = findCodeInfo.typ_unit_mes;
            this.billingObjectForm.controls['val_mes'].enable();
         } else {
            this.billingObjectForm.controls['val_mes'].disable();
            this.billingObjectForm.controls['val_mes'].setValue('');
         }
     }
 
     updateDateInfo() {
         this.billingObjectForm.controls['dhd_elm_fact'].setValue('');
         this.billingObjectForm.controls['dhf_elm_fact'].setValue('');
     };
 
     AddCodeInfo() {
        //  if (this.dataSource.length >= 1 && !this.updateRecordId)
        //  return;
         let status = false;
         const codesInfoData:any = this.dataSource;
         const findItem = _.find(this.factCodesInfo, {cod_fact: this.billingObjectForm.value['id_elm_fact'] });
         let isCodeElmValid = _.isEmpty(this.billingObjectForm.value['cod_elm_mesur']);
         let requesObjectForm: any = {
             id: codesInfoData.length === 0 ? 1 : codesInfoData[codesInfoData.length-1].id + 1,
             id_elm_fact: this.billingObjectForm.value['id_elm_fact'],
             code_elm_desc: findItem ? findItem.des_cod_fact : '',
             dat_serv_elm_fact: this.billingObjectForm.value['dat_serv_elm_fact'],
             dhd_elm_fact: this.billingObjectForm.value['dhd_elm_fact'],
             dhf_elm_fact: this.billingObjectForm.value['dhf_elm_fact'],
             refre_connu_id_prof: this.billingObjectForm.value['refre_connu_id_prof'],
             timeSlot: this.billingObjectForm.value['timeSlot'],
             cod_elm_contx: this.billingObjectForm.value['cod_elm_contx'].length !== 0 ? this.billingObjectForm.value['cod_elm_contx'].map((id) => {
                 return _.find(this.filteredOptions, {id: id })
             }) : []
         };
         for (let key in {'id_elm_fact':1, 'dat_serv_elm_fact':2}) {
             if (requesObjectForm[key] == '' || requesObjectForm[key] === undefined) {
                 this.billingObjectForm.controls[key].setErrors({required:true});
                 status = true;
             }
         }
         if (!isCodeElmValid || this.measureOptionCodes.length !== 0) {
            requesObjectForm = {
                ...requesObjectForm,
                val_mes: this.billingObjectForm.value['val_mes'],
                cod_elm_mesur: this.billingObjectForm.value['cod_elm_mesur']
            }
            if (requesObjectForm.cod_elm_mesur === '' || requesObjectForm.cod_elm_mesur === undefined) {
                this.billingObjectForm.controls['cod_elm_mesur'].setErrors({required:true});
                status = true;
            }
            if (requesObjectForm.val_mes === '' || requesObjectForm.val_mes === undefined) {
                this.billingObjectForm.controls['val_mes'].setErrors({required:true});
                status = true;
            }
        }
         if (!status) {
            this.enableUpdateButton();
            this.unitMeasureName = '';
             if (this.updateRecordId && this.updateRecordInfo.id_elm_fact === requesObjectForm.id_elm_fact) {
                 delete requesObjectForm.id;
                 requesObjectForm.id = this.updateRecordId;
                 requesObjectForm.status = undefined;
                 codesInfoData[this.updateRecordId-1] = requesObjectForm;
                 this.updateRecordId = undefined;
                 this.updateRecordInfo = {};
             } else if (this.updateRecordId && this.updateRecordInfo.id_elm_fact !== requesObjectForm.id_elm_fact) {
                 _.remove(codesInfoData, {id: this.updateRecordId});
                codesInfoData.push(requesObjectForm);
                this.updateRecordId = undefined;
                this.updateRecordInfo = {};
             } else {
                 codesInfoData.push(requesObjectForm);
             }
             this.dataSource = codesInfoData;
             requesObjectForm = _.omit(requesObjectForm, ['id', 'status', 'code_elm_desc', 'successMsg', 'errMsg', 'mnt_prel']);
             for (let key in requesObjectForm) {
                this.billingObjectForm.controls[key].setValue('');
             }
            this.endTimeSlots = this.generateTimeSlots("00:00", "24:00", 5);
             for (let key in this.consulationTimeInfo) {
                 if (key === 'dhf_elm_fact') {
                    setTimeout(() => {
                        this.billingObjectForm.get("dhf_elm_fact").setValue(this.consulationTimeInfo[key]);
                        this.startTimeChangeHandler();
                    },500);
                 } else {
                    this.billingObjectForm.controls[key].setValue(this.consulationTimeInfo[key]);
                 }
             }
             this.measureOptionCodes = [];
             this.billingObjectForm.controls['cod_elm_mesur'].disable();
             this.billingObjectForm.controls['val_mes'].disable();
         }
     };
 
     editCodeRowInfo(row) {
         this.updateRecordId = row.id;
         this.updateRecordInfo = row;
         this.mainObjectErrMsg = [];
         let requesObjectForm = _.omit(JSON.parse(JSON.stringify(row)), ['id', 'status', 'code_elm_desc', 'successMsg', 'errMsg', 'mnt_prel']);
         for (let key in requesObjectForm) {
             if (key === 'cod_elm_contx') {
                const mapKeys = requesObjectForm[key].map((info => { return info.id }));
                this.billingObjectForm.controls[key].setValue(mapKeys);
             } else {
                this.billingObjectForm.controls[key].setValue(requesObjectForm[key]);
             }
         }
         setTimeout(() => {
             this.getCodeFactsInfo({term: this.billingObjectForm.value['id_elm_fact'], status: true });
             this.getAllMeasures();
             if (requesObjectForm.dhf_elm_fact)
             this.billingObjectForm.controls['dhf_elm_fact'].setValue(requesObjectForm['dhf_elm_fact']);
         },1000);
     };
 
     removeCodeInfo(row) {
        if (this.updateRecordId === row.id) {
            return;
        }
         const dialogRef = this.matDialog.open(DialogModalComponent,{
             height: "auto",
             width: "600px",
             data: {
               message: "ARE_YOU_SURE_WANT_DELETE",
               cancelLabel: "NO",
               confirmLabel: "YES",
             },
         });
     
         dialogRef.afterClosed().subscribe((confirmed: boolean) => {
             if (confirmed) {
                 let codesInfoData = this.dataSource;
                 _.remove(codesInfoData, function(currentObject) {
                     return row.id === currentObject.id;
                 });
                 this.dataSource = codesInfoData;
             }
         });
     };

     cancelCodeInfo() {
         this.updateRecordId = undefined;
         this.unitMeasureName = '';
         let requesObjectForm = Config.DATA_INFO_TYPES;
         requesObjectForm.forEach((key, index) => {
            this.billingObjectForm.controls[key].setValue('');
         });
         this.endTimeSlots = this.generateTimeSlots("00:00", "24:00", 5);
         for (let key in this.consulationTimeInfo) {
             if (key === 'dhf_elm_fact') {
                setTimeout(() => {
                    this.billingObjectForm.get("dhf_elm_fact").setValue(this.consulationTimeInfo[key]);
                    this.startTimeChangeHandler();
                },500);
             } else {
                this.billingObjectForm.controls[key].setValue(this.consulationTimeInfo[key]);
             }
         }
         this.measureOptionCodes = [];
         this.billingObjectForm.controls['cod_elm_mesur'].disable();
         this.billingObjectForm.controls['val_mes'].disable();
     }

    addCodeOption(row) {
       // if (!this.updateRecordId || this.dataSource.length === 0) {
            this.billingObjectForm.controls['id_elm_fact'].setValue(row.code);
            setTimeout(() => {
                this.getCodeFactsInfo({term: this.billingObjectForm.value['id_elm_fact'], status: true });
            },500);
        //}
		// const codesInfoData:any = this.dataSource;
		// const requesObjectForm = {
		// 	id: codesInfoData === 0 ? 1 : codesInfoData.length + 1,
		// 	id_elm_fact: row.code,
		// 	dat_serv_elm_fact: new Date(),
		// 	dhd_elm_fact: '',
		// 	dhf_elm_fact: '',
		// 	refre_connu_id_prof: '',
		// 	cod_elm_mesur: '',
		// 	val_mes: '',
		// 	selectedOptionCodes: []
		// };
		// codesInfoData.push(requesObjectForm);
		// this.dataSource = codesInfoData;
	};

    selectCategorySec(event) {
		this.billingObjectForm.controls['specialityType'].setValue('');
        if (this.userType === 'general') {
            this.specialityOptions = Object.keys(this.serviceTypesJSON[event.value]);
            this.ageFactorOptions = [];
            this.subSpecialityOptions = [];
        } else {
            this.ageFactorOptions = this.serviceTypesJSON[event.value];
        }
	};

    selectSpecialityType(event) {
		this.billingObjectForm.controls['subSpecialityType'].setValue('');
		const subSpecialityOptions = this.serviceTypesJSON[this.billingObjectForm.value['categoryType']][event.value];
		this.subSpecialityOptions = Object.keys(subSpecialityOptions);
		this.ageFactorOptions = [];
	};
 
     async submitRamqBill() {
         if (this.dataSource.length === 0 || !this.billingObjectForm.valid || this.updateRecordId) {
            this.billingObjectForm.markAllAsTouched();
            return;
         }
         this.mainObjectErrMsg = [];
         const sectorType = this.billingObjectForm.value['no_sect_activ'];
         let sectorInfo:any = {};
         if (this.billingHelper.isEmptyField(sectorType)) {
             sectorInfo = _.find(this.sectorOptions, {no_sect_activ: this.billingObjectForm.value['no_sect_activ']});
         }
         let formObjectInfo:any = await this.billingHelper.prepareFormDataClaimInfo(this);
         formObjectInfo.healthCardInfo = this.healthCardInfo;
         let requesObjectForm = {
             ...this.billingHelper.getLocationInfoParams(this.billingObjectForm.value['location_name'], this.locationsOptions),
             no_sect_activ: sectorType === '' ? undefined : (sectorInfo ?  sectorInfo.no_sect_activ : undefined),
             id_pers: this.billingObjectForm.value['health_card_num'].replace(/-/g, ''),
             ...this.billingHelper.getDiagnocodesInfoParams(this.selectedDiagnosCodes),
             ...this.billingHelper.getServMedicalParams(this.dataSource, this.userType),
             ...this.billingHelper.getAdmissionEventInfo(this.billingObjectForm.value),
             ...this.billingHelper.getAccountInfo(this.practiceDetails, this.userData["doctorId"]),
             no_fact_ext: this.claimResponse?.id,
             no_dem_ext: this.claimResponse?.id,
             ...this.claimObject,
             formObjectInfo: formObjectInfo,
             consultationInfo: this.appointmentDetails
         };
         if (!this.claimObject.no_fact_ramq) {
             this.billingService.createNewBill(requesObjectForm, {user_type: this.userType}).subscribe((responseInfoBill) => {
                 if (responseInfoBill.status === 0) {
                     this.processResponseInfo(responseInfoBill, 'dem_paimt_recev', formObjectInfo, requesObjectForm);
                 }
             },(err) => this.handleError(err)
             );
         } else {
             this.billingService.updateClaimBill(requesObjectForm, {user_type: this.userType }).subscribe((responseInfoBill) => {
                 if (responseInfoBill.status === 0) {
                     this.processResponseInfo(responseInfoBill, 'dem_modif_recev', formObjectInfo, requesObjectForm);
                 }
             },(err) => this.handleError(err)
             );
         }
     };
 
     /**
      * processing response
      * @param {string} objectKeyName
      * @param {object} formObjectInfo
      * @param {object} requesObjectForm
    */
     async processResponseInfo (responseInfoBill, objectKeyName, formObjectInfo, requesObjectForm) {
         requesObjectForm.no_dem_ext = responseInfoBill?.rspData[objectKeyName]?.no_dem_ext[0]
         if (responseInfoBill.rspCode === 'ERR_CR_API_XSD') {
             this.mainObjectErrMsg = [
                 { txt_msg_expl_recev: responseInfoBill.rspData[0].TxtMsgFran, cod_msg_expl_recev: [], rspCode: responseInfoBill.rspCode,  xmlInfo: responseInfoBill.xmlInfo }
             ];
         } else if (responseInfoBill.rspData[objectKeyName] && responseInfoBill.rspData[objectKeyName].sta_recev[0] == '2') {
             this.mainObjectErrMsg = await this.billingHelper.getDeeperObjectByKey('msg_expl_recev', responseInfoBill.rspData);
             if (this.mainObjectErrMsg.length !== 0) {
                 this.mainObjectErrMsg[0].rspCode = 'ERR_CR_API_XSD';
                 this.mainObjectErrMsg[0].xmlInfo = responseInfoBill.xmlInfo;
             }
             const gridInfo:any = await this.billingHelper.getDeeperObjectByKey('ligne_fact_recev', responseInfoBill.rspData);
             let claimsObjectsInfo = this.dataSource;
             if (gridInfo && gridInfo instanceof Array) {
                 let index = 0;
                 gridInfo.forEach(async (element) => {
                     const findObject = _.find(claimsObjectsInfo, {id: parseInt(element.no_ligne_fact[0])});
                     const findIndex = _.findIndex(claimsObjectsInfo, {id: parseInt(element.no_ligne_fact[0])});
                     if (findObject) {
                         if (element.sta_recev[0] == '1') {
                             claimsObjectsInfo[findIndex].status = 'submitted';
                         } else {
                             claimsObjectsInfo[findIndex].status = 'rejected';
                             const getErrorMsg = await this.billingHelper.getDeeperObjectByKey('msg_expl_recev', element);
                             claimsObjectsInfo[findIndex].errMsg = `${getErrorMsg[0].cod_msg_expl_recev[0]} | ${getErrorMsg[0].txt_msg_expl_recev}`;
                         }
                     }
                     index = index + 1;
                     if (gridInfo.length === index) {
                         this.dataSource = claimsObjectsInfo;
                         formObjectInfo.dataSource = this.dataSource;
                         this.billingService.updateCliamInfo(formObjectInfo, {id: requesObjectForm.no_dem_ext }).subscribe((response) => {
                         },(err) => this.handleError(err)
                         );
                     }
                 });
             }
         } else {
             const getClaimInfo = await this.billingHelper.getDeeperObjectByKey('id_fact_ramq_recev', responseInfoBill.rspData);
             if (getClaimInfo instanceof Array) {
                 this.claimObject = {
                     no_fact_ramq: getClaimInfo[0].no_fact_ramq[0],
                     jeton_comm: getClaimInfo[0].jeton_comm[0]
                 };
             }
             const gridInfo: any = await this.billingHelper.getDeeperObjectByKey('ligne_fact_recev', responseInfoBill.rspData);
             let claimsObjectsInfo = this.dataSource;
             if (gridInfo && gridInfo instanceof Array) {
                 let index = 0;
                 gridInfo.forEach(async (element) => {
                     const findObject = _.find(claimsObjectsInfo, {id: parseInt(element.no_ligne_fact[0])});
                     const findIndex = _.findIndex(claimsObjectsInfo, {id: parseInt(element.no_ligne_fact[0])});
                     if (findObject) {
                         if (element.sta_recev[0] == '1') {
                             claimsObjectsInfo[findIndex].status = 'submitted';
                             claimsObjectsInfo[findIndex].successMsg = `${element.formu_expl[0]}`;
                             claimsObjectsInfo[findIndex].mnt_prel = element.mnt_prel[0]
                         }
                     }
                     index = index + 1;
                     if (gridInfo.length === index) {
                         this.dataSource = claimsObjectsInfo;
                         formObjectInfo.dataSource = this.dataSource;
                         this.billingService.updateCliamInfo(formObjectInfo, {id: requesObjectForm.no_dem_ext }).subscribe((response) => {
                            this.toasterService.showSuccess(this.vref, this.claimObject.no_fact_ramq, "Claim successfully created");
                            if (this.modelView === 'false') {
                                this.router.navigateByUrl("feature/calendar/appointment/detail/" + this.bookingId + "/upcoming");
                            } else {
                                this.onViewMessages.emit(true);
                            }
                         },(err) => this.handleError(err)
                         );
                     }
                 });
             }
         }
     };

    async cancelClaim() {
        if (this.modelView === 'false') {
            let formObjectInfo:any = await this.billingHelper.prepareFormDataClaimInfo(this);
            formObjectInfo.healthCardInfo = this.healthCardInfo;
            const requestObject = {
                claim_info: formObjectInfo,
                consultation_info: this.appointmentDetails
            };
            this.billingService.createInitClaim({user_type: this.userType, saveType: 'intial', booking_id: this.bookingId }, requestObject).subscribe((response) => {
                if (response.status === 0) {
                    console.log(response.rspMessage);
                } else {
                    this.handleError("An Error Occured , please try again")
                }
            },(err) => this.handleError(err)
            );
        } else {
            this.onViewMessages.emit(false);
        }
    };

    async saveAsDraftInfo() {
        if (this.modelView === 'false') {
            let formObjectInfo:any = await this.billingHelper.prepareFormDataClaimInfo(this);
            formObjectInfo.healthCardInfo = this.healthCardInfo;
            const requestObject = {
                claim_info: formObjectInfo,
                consultation_info: this.appointmentDetails
            };
            this.billingService.createInitClaim({user_type: this.userType, saveType: 'draft', booking_id: this.bookingId }, requestObject).subscribe((response) => {
                if (response.status === 0) {
                    this.router.navigateByUrl("feature/calendar/appointment/detail/" + this.bookingId + "/upcoming");
                } else {
                    this.handleError("An Error Occured , please try again")
                }
            },(err) => this.handleError(err)
            );
        }
    }
 
     getTotalamount() {
         let amount = 0;
         this.dataSource.forEach(element => {
             if (element.successMsg) {
                 amount = amount + parseFloat(element.mnt_prel)
             }
         });
         return amount;
     }
 
     downLoadDignosticCodeCSVFile() {
        this.billingService.downLoadDiagonsticeFile().subscribe((responseInfo) => {
            if (responseInfo.status === 0) {
                this.excelService.exportAsExcelFile(responseInfo.data, 'diagnostic_codes');
            }
        },(err) => this.handleError(err)
        );
     };

     downLoadCodeFactsCSVFile() {
        this.billingService.downLoadCodeFactsFile(this.userType).subscribe((responseInfo) => {
            if (responseInfo.status === 0) {
                this.excelService.exportAsExcelFile(responseInfo.data, `${this.userType}_code_facts`);
            }
        },(err) => this.handleError(err)
        );
     };

     enableUpdateButton() {
        if (this.modelView === 'true') {
            this.updateButton = true;
        }
     }

     downLoadXSDErrorFile() {
        if (this.mainObjectErrMsg.length !== 0 && this.mainObjectErrMsg[0].rspCode === 'ERR_CR_API_XSD')
         this.excelService.saveXSDFileSchema(this.mainObjectErrMsg[0].xmlInfo, `${this.bookingId}_rdp`)
     }
 
 }
 