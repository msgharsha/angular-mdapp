/**
 * 
 * Copyright 2009-2021 Ibaseit software solutions pvt ltd.
 * @author ibaseit
 */

import { Component, OnInit, ViewContainerRef, ViewChild } from "@angular/core";
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as moment from "moment";
import * as _ from 'lodash';
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource} from '@angular/material/table';
import { faCloudUploadAlt, faCheckCircle, faTimesCircle, faEdit, faTrashAlt, faPrint, faDownload,faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

import { ClaimModelComponent } from './claim-model.component';
import { DialogModalComponent } from '../../utils/component/cancel-modal/cancel-modal.component';

import { BillingService } from '../services/billing_service';
import { OnboardService } from '../../utils/component/details/onboard.service';
import { BillingHelper } from '../services/billing_helper';
import { ExcelService } from '../services/excel_service';
import { ToasterService } from "../../utils/service/toaster.service";
import { LocalStorageService } from '../../utils/service/localStorage.service';
import { ErrorService } from "../../utils/service/error.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";

import * as IntroJs from 'intro.js';

@Component({
    selector: "app-claim-details",
    templateUrl: "./claim-details.component.html",
    styleUrls: ["./claim-details.component.scss"],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ]
})
export class ClaimDetailsComponent implements OnInit {

    dataSource;
    public lang;
    public introTour;
    userData;
    columnsToDisplay = [ 'healthcardNumber', 'claimNumber', 'patientName', 'user_type', 'createdAt', 'updatedAt', 'status', 'actions', 'expandaction' ];
    expandedElement: null;
    activeItem = 'all';
    filterClaimsInfo = [];

    @ViewChild(MatPaginator) 
    set paginator(value: MatPaginator) {
      if (this.dataSource)
      this.dataSource.paginator = value;
    }

    fontIcons = [
        faCloudUploadAlt,
        faCheckCircle,
        faTimesCircle,
        faEdit,
        faTrashAlt,
        faPrint,
        faDownload,
        faCalendarAlt
    ]

    public chosenDate: any = {
        startDate: moment().subtract(30, 'days').set({hours: 0, minutes: 0}),
        endDate: moment().subtract(0, 'days').set({hours: 23, minutes: 59})
    };
    
    public picker1 = {
        opens: 'left',
        startDate: moment().subtract(5, 'day'),
        endDate: moment(),
        isInvalidDate: function (date: any) {
          if (date.isSame('2017-09-26', 'day'))
            return 'mystyle';
          return false;
        }
    }

    constructor(
        private toasterService: ToasterService,
        private onboardService: OnboardService,
        private billingService: BillingService,
        private router: Router,
        private billingHelper: BillingHelper,
        private errorService: ErrorService,
        private vref: ViewContainerRef,
        private matDialog: MatDialog,
        private translate: TranslateService,
        private localStorageService: LocalStorageService,
        private excelService: ExcelService,
        private daterangepickerOptions: DaterangepickerConfig) {

        this.daterangepickerOptions.settings = {
            locale: { format: 'YYYY-MM-DD' },
            alwaysShowCalendars: false,
            "opens": "right",
            ranges: {
                'Last Month': [moment().subtract(1, 'month'), moment()],
                'Last 3 Months': [moment().subtract(4, 'month'), moment()],
                'Last 6 Months': [moment().subtract(6, 'month'), moment()],
                'Last 12 Months': [moment().subtract(12, 'month'), moment()],
            }
        };

    }

    public selectedDate(value: any, dateInput: any): void {
        this.activeItem = '';
        dateInput.startDate = value.start;
        dateInput.endDate = value.end;
        this.getClaimsInfo(this.chosenDate);
    }
    
    public calendarEventsHandler(e: any): void {
    }
    
    public applyDatepicker(e: any) {
    }
    
    public updateSettings(): void {
        this.daterangepickerOptions.settings.locale = { format: 'YYYY/MM/DD' };
        this.daterangepickerOptions.settings.ranges = {
          '30 days ago': [moment().subtract(1, 'month'), moment()],
          '3 months ago': [moment().subtract(4, 'month'), moment()],
          '6 months ago': [moment().subtract(6, 'month'), moment()],
          '7 months ago': [moment().subtract(12, 'month'), moment()],
        };
    }

    ngOnInit() {
        this.introTour = this.localStorageService.getItem("tourFlag");
        this.lang = this.localStorageService.getItem("language");
        this.translate.onLangChange.subscribe(() => {
        });
        this.userData = this.localStorageService.getItem('userData');
        this.getClaimsInfo(this.chosenDate);
    }

    getClaimsInfo(requestObject) {
        requestObject.offset = moment(requestObject["startDate"]).format("Z");
        requestObject.startDate = requestObject["startDate"].startOf('day');
        requestObject.endDate = requestObject["endDate"].endOf('day');
        this.billingService.getCliamsInfo({doctorId: this.userData["doctorId"]}, requestObject).subscribe(async (responseInfo) => {
            if (responseInfo.status === 0) {
                if (responseInfo.status == 0) {
                    const claimsInfo:any = responseInfo.rspData.length === 0 ? [] : await this.billingHelper.processClaimsInfo(responseInfo.rspData);
                    this.dataSource = new MatTableDataSource(claimsInfo);
                    this.dataSource.paginator = this.paginator;
                    this.filterClaimsInfo = JSON.parse(JSON.stringify(claimsInfo));
                }
            }
        },(err) => this.handleError(err)
        );
    };

    filterHealthCards(value) {
		this.activeItem = value;
		let filterClaimsInfo;
		if (value === 'all') {
			filterClaimsInfo = this.filterClaimsInfo;
		} else {
			filterClaimsInfo = _.filter(this.filterClaimsInfo, {status: value });
		}
        this.dataSource = new MatTableDataSource(filterClaimsInfo);
        this.dataSource.paginator = this.paginator;
	};

    handleError(err: any) {
        this.errorService.handleError(err, this.vref);
    };

    editClaimInfo(row) {
        const dialogRef = this.matDialog.open(ClaimModelComponent,{
            height: "100%",
            width: "100%",
            disableClose: true,
            autoFocus: false,
            data: row,
        });
    
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if(confirmed) {
                this.ngOnInit();
            } else {
                this.dataSource = new MatTableDataSource(JSON.parse(JSON.stringify(this.filterClaimsInfo)));
                this.dataSource.paginator = this.paginator;
            }
        });
    };

    cancelClaimInfo(row) {
		const dialogRef = this.matDialog.open(DialogModalComponent, {
            height: "auto",
            width: "600px",
            data: {
              message: "CANCEL_CLAIM_CONFIRM_TEXT",
              cancelLabel: "NO",
              confirmLabel: "YES",
            },
		});
		dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
			if (confirmed) {
                this.onboardService.getPracticeDetails(this.userData["doctorId"]).subscribe((res) => {
                    const practiceDetails = _.cloneDeep(_.get(res, "data", ""));
                    const doctorAccountInfo = this.billingHelper.getAccountInfo(practiceDetails, this.userData["doctorId"]);
                    let requesObject = {
                        ...row.claim_info.claimObject,
                        ...doctorAccountInfo
                    };
                    this.billingService.cancelBillInfo(requesObject, {id: row.id, user_type: row.user_type }).subscribe(async (claimRespInfo) => {
                        if (claimRespInfo.status === 0) {
                            let statusInfo = await this.billingHelper.getDeeperObjectByKey('sta_recev', claimRespInfo.rspData);
                            if (statusInfo[0] === '1') {
                                this.toasterService.showSuccess(this.vref, row?.claim_info?.claimObject.no_fact_ramq, "Successfully Cancelled claim");
                                this.ngOnInit();
                            } else {
                                let getErrMsg = await this.billingHelper.getDeeperObjectByKey('txt_msg_expl_recev', claimRespInfo.rspData);
                                if (getErrMsg) {
                                    this.toasterService.showError(this.vref, row?.claim_info?.claimObject.no_fact_ramq, getErrMsg[0]);
                                }
                            }
                        }
                    },(err) => this.handleError(err)
                    );
                },(err) => this.handleError(err)
                );
			}
		});
    };

    downLoadClaim(option) {
        if (option.status === 'cancelled')
        this.billingService.downLoadRDXmlFiles(option.id, 'da', 'rda');
        else if (option.status === 're-submitted')
        this.billingService.downLoadRDXmlFiles(option.id, 'dm', 'rdm');
        else
        this.billingService.downLoadRDXmlFiles(option.id, 'dp', 'rdp');
    };

    public doFilter = (value: string) => {
        this.dataSource.filter = value.trim().toLocaleLowerCase();
    };

    /**
     * Down load claims csv file
     */
    downLoadClaimsCSVFile() {

        const getRetriveMsg = function (data) {
            let message = '';
            if (data?.claim_info?.dataSource.length !== 0 && data?.claim_info?.dataSource[0].successMsg) {
                message = data.claim_info?.dataSource[0].successMsg;
            } else if (data?.claim_info?.dataSource.length !== 0 && data.claim_info?.dataSource[0].errMsg) {
                message = data.claim_info?.dataSource[0].errMsg;
            }
            return message.replace(/,/g, ' ');
        };

        const getLocationName = function (data) {
            let locationName = '';
            if (data?.claim_info?.locationsOptions.length === 0) {
                return '';
            }
            if (data?.claim_info?.locationsOptions[0]?.cod_local) {
                locationName = `${data?.claim_info?.locationsOptions[0]?.nom_local}(${data?.claim_info?.locationsOptions[0]?.cod_local})`
            } else if (data?.claim_info?.locationsOptions) {
                locationName = `${data?.claim_info?.locationsOptions[0]?.nom_etab}(${data?.claim_info?.locationsOptions[0]?.cod_local})`
            }
            return locationName;
        };

        const getDiagnoseCodes = function (data) {
            let diagnoseName = '';
            if (data?.claim_info?.selectedDiagnosCodes) {
                data?.claim_info?.selectedDiagnosCodes.forEach((element, index) => {
                    diagnoseName = diagnoseName + `${element.des_abr_diagn_mdcal} (${element.cod_diagn_mdcal}) - `
                });
            }
            return diagnoseName;
        };

        const requestObjectDownLoadFile = [];
        this.dataSource.data.forEach(element => {
            const prepareObject = {
                'Healthcard Number': element?.healthcardNumber,
                'Claim Number': element?.claim_info?.claimObject?.no_fact_ramq,
                'Patient Name': element.patientName,
                'Status': element?.status,
                'Message': getRetriveMsg(element),
                'Code': element.claim_info?.dataSource[0]?.id_elm_fact,
                'Amount($)': `${element.claim_info?.dataSource[0]?.mnt_prel}`,
                'Location Name': getLocationName(element),
                'Diagnose Codes': getDiagnoseCodes(element),
                'Date': moment(element?.createdAt).format('DD-MM-YYYY hh:mm a'),
                'Booking Info': '',
                'Consultation Date': moment(new Date(element?.consultation_info?.bookingDetail?.date)).format('DD-MM-YYYY'),
                'Consulation Start Time': moment(new Date(element?.consultation_info?.bookingDetail?.startTime)).format('hh:mm a'),
                'Consulation End Time': moment(new Date(element?.consultation_info?.bookingDetail?.endTime)).format('hh:mm a'),
                'Scheduled Consultation Time': element.claim_info?.dataSource[0]?.timeSlot,
                'Consulation Visit': element?.consultation_info?.bookingDetail?.reasonForVisit,
                'Patient Info': '',
                'Address': element?.consultation_info?.patient?.addressLine1,
                'Age': element?.consultation_info?.patient?.age,
                'Date Of Birth': element?.consultation_info?.patient?.dob,
                'Gender': element?.consultation_info?.patient?.gender,
                'Phone Number': element?.consultation_info?.patient?.patientPhoneNumber,
                'Postal Code': element?.consultation_info?.patient?.postalCode
            };
            for (let key in prepareObject) {
                if (prepareObject[key] === undefined || prepareObject[key] === 'undefined') {
                    prepareObject[key] = ''
                }
            }
            requestObjectDownLoadFile.push(prepareObject);
        });
        this.excelService.exportAsExcelFile(requestObjectDownLoadFile, 'claims');
    };

    ngAfterViewInit() {
        setTimeout(() => {
          if(!this.introTour){
            this.startTour();
          }
        },2000)
      }
    
    
      startTour() {
        let self = this;
        console.log("Starting tour");
        let intro = IntroJs();
        let stepsContent
        if (this.lang == 'en') {
          intro.setOption("doneLabel", "Next");
          intro.setOption("nextLabel", "Next");
          intro.setOption("prevLabel", "Back");
          stepsContent = {
            steps: [
              
              {
                element: '#payment_step3',
                intro: "When closing a public consultation, your claim to public health care will be brought to Draft status until it gets submitted. A Returned status means you will need to correct your claim and submit again for acceptance.",
                position: 'right',
              },
              {
                element: '#payment_step4',
                intro: "Use the date filtering to review your statement against your submitted claims.",
                position: 'right',
              },
              {
                element: '#payment_step5',
                intro: "Use this download button to get your report.",
                position: 'right',
              }
            ]
          }
        } else {
          intro.setOption("doneLabel", "Prochaine");
          intro.setOption("nextLabel", "Prochaine");
          intro.setOption("prevLabel", "Arrière");
          stepsContent = {
            steps: [
              
              {
                element: '#payment_step3',
                intro: "Lorsqu'une consultation publique terminée, votre réclamation sera mise en statut Brouillon jusqu'à sa transmission au systémede santé public. Un statut Retour signifie que vous aurez à corriger votre réclamation et soumettre à nouveau pour une acceptation.",
                position: 'right',
              },
              {
                element: '#payment_step4',
                intro: "Utilisez le filtre par date pour revoir votre relevé selon les réclamations soumises.",
                position: 'right',
              },
              {
                element: '#payment_step5',
                intro: "Utiliser ce bouton pour téléchargement votre rapport.",
                position: 'right',
              }
            ]
          }
        }
    
        // Initialize steps
        intro.setOptions(stepsContent);
        
        intro.oncomplete(function () {
          self.router.navigateByUrl('accounts');
        });
    
        intro.onexit(function () {
          console.log("complete")
          //self.selectedTab = 1;
        });
    
        intro.setOptions({
          exitOnOverlayClick: false,
          showBullets: false
        });
    
        // Start tutorial
        intro.start();
      }


}