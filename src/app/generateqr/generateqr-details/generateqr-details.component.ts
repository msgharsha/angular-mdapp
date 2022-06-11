
import { Component, OnDestroy, OnInit, ViewContainerRef, ViewChild, ElementRef } from "@angular/core";
import * as _ from "lodash";
import { ErrorService } from "../../utils/service/error.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { TranslaterService } from "../../utils/service/translater.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { environment } from "../../../environments/environment";
import { GenerateqrService } from "../generateqr.service";
import { Values } from "../../constants/values";
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { jsPDF } from "jspdf";

@Component({
	selector: "generateqr-details",
	templateUrl: "./generateqr-details.component.html",
	styleUrls: ["./generateqr-details.component.scss"],
	providers: []
})
export class GenerateqrDetailsComponent implements OnInit {
	@ViewChild('content', { static: false }) el!: ElementRef;
	userData: any;
	elementType = NgxQrcodeElementTypes.URL;
	correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
	value = '';
	showRegenerateButton: boolean = false;
	clinicData:any = {};
	clinicName:any;
	doctorName:any;
	generateLink:any;

	constructor(
		private errorHandler: ErrorService,
		private toaster: ToasterService,
		private vref: ViewContainerRef,
		private translater: TranslaterService,
		private localStorageService: LocalStorageService,
		private translate: TranslateService,
		private router: Router,
		private generateqrService: GenerateqrService
	) { }

	ngOnInit() {
		this.userData = this.localStorageService.getItem("userData");
		if(this.userData.status == "Active"){
			this.getClinicData();
			this.generateLink = environment.portalURL + "auth/qrcodescanresult?"
		} else {
			this.toaster.showError(this.vref,"Error Occurred", 'QRCODE_ACTIVE');
		}
	}

	getClinicData() {
		let doctorId
		if(this.userData && this.userData.selectedDoctorData && this.userData.selectedDoctorData.parent_id){
			doctorId = this.userData.selectedDoctorData.parent_id;
			this.doctorName = this.userData.selectedDoctorData.doctorName
		} else {
			doctorId = this.userData["doctorId"];
			this.doctorName = this.userData.firstName+' '+this.userData.lastName
		}
		this.generateqrService
			.getPersonalDetails(doctorId)
			.subscribe(
				(res) => {
					this.localStorageService.setItem("language", res.data.preferredLanguage);
					this.clinicData['clinicName'] = res.data.clinicName;
					this.clinicData['postalCode'] = res.data.postalCode;
					this.clinicData['addressLine1'] = res.data.addressLine1;
					this.clinicData['addressLine2'] = res.data.addressLine2;
					this.clinicData['city'] = res.data.city;
					this.clinicData['clinicFax'] = res.data.clinicFax;
					this.clinicData['province'] = res.data.province;
					this.clinicData['lat'] = res.data.lat;
					this.clinicData['lng'] = res.data.lng;

					this.generateQrCode(Values.QR_ACTIONTYPE.READ);
				},
				(err) => this.handleError(err)
			);
	}

	handleError(err: any) {
		this.errorHandler.handleError(err, this.vref);
	}

	generateQrCode(actionTypeValue) {
		let doctorId;
		let userId;
		if(this.userData && this.userData.selectedDoctorData && this.userData.selectedDoctorData.parent_id){
			doctorId = this.userData.selectedDoctorData.parent_id;
			userId = this.userData.selectedDoctorData.user_id;
		} else {
			doctorId = this.userData["doctorId"];
			userId = this.userData["userId"];
		}

			let addressObj = {
				clinicName: this.clinicData.clinicName,
				addressLine1: this.clinicData.addressLine1,
				addressLine2: this.clinicData.addressLine2,
				city: this.clinicData.city,
				province: this.clinicData.province,
				postalCode: this.clinicData.postalCode,
				clinicFax: this.clinicData.clinicFax ? this.clinicData.clinicFax : "",
				lat: this.clinicData.lat,
				lng: this.clinicData.lng,
				doctorId: doctorId,
				userId: userId,
				doctorName:this.doctorName,
				actionType: actionTypeValue
			}
			console.log(addressObj)
			this.generateqrService.insertQrData(addressObj).subscribe((res) => {
				this.clinicName = JSON.parse(res.data.clinic_details)
				if (res && res.actionType == 0) {
					this.showRegenerateButton = true;
					this.value = `${this.generateLink}token=${res.data.qr_token}`;
				} else {
					this.showRegenerateButton = false;
					this.value = `${this.generateLink}token=${res.data.qr_token}`;
				}

			},
			(err) => {
				this.toaster.showError(
					this.vref,
					"Error Occurred",
					err?.error?.message
				);
			})

	}

	downloadPDF() {
		let pdf = new jsPDF('p', 'pt', 'a4');
		pdf.html(this.el.nativeElement, {
		  callback: (pdf) => {
			pdf.save(this.clinicName.clinicName + ".pdf");
		  }
		})
	  }
}
