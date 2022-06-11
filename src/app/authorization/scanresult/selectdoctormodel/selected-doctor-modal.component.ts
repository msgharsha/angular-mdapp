/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DashboardService } from "../../../utils/service/dashboard.service";
import { ToasterService } from "../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { ErrorService } from "../../../utils/service/error.service";
import * as moment from "moment";
import * as _ from "lodash";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

@Component({
	selector: "selected-doctor-modal",
	templateUrl: "./selected-doctor-modal.component.html",
	styleUrls: ["./selected-doctor-modal.component.scss"],
})
export class selectDoctorModelComponent implements OnInit {
	userData: any;
	selectedOption: any;
	availableDoctors: any;
	clinicDetails:any;
	constructor(
		private localStorageService: LocalStorageService,
		private translate: TranslateService,
		private errorHandler: ErrorService,
		private dashboardService: DashboardService,
		private toasterService: ToasterService,
		private vref: ViewContainerRef,
		private dialogRef: MatDialogRef<selectDoctorModelComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.availableDoctors = this.data.availableDoctors;
		this.clinicDetails = this.data.clinicAddress;
	}

	ngOnInit(): void { }

	selectedDoctor() {
		if(this.selectedOption){
			const result = this.availableDoctors.find( ({ doctorId }) => doctorId == this.selectedOption );
			this.dashboardService.getDoctorData(result.doctorId).subscribe(
				(res) => {
				  result['lat'] = res.data.lat;
				  result['lng'] = res.data.lng;
				  result['province_id'] = res.data.province_id;
				  result['practice'] = res.data.practice_method;
				  this.dialogRef.close(result);
				},
				(err) => {
				  this.toasterService.showError(this.vref, "Error", err.error.message);
				}
			  );
			
		}
	}



}
