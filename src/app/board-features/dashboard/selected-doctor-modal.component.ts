/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DashboardService } from "../../utils/service/dashboard.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { ErrorService } from "../../utils/service/error.service";
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
		this.userData = this.localStorageService.getItem("userData");
		this.availableDoctors = JSON.parse(this.userData.parentId);
	}

	ngOnInit(): void { }

	selectedDoctor() {
		if(this.selectedOption){
			const result = this.availableDoctors.find( ({ parent_id }) => parent_id == this.selectedOption );
			this.dashboardService.getSelectedDoctorData(result.parent_id).subscribe(
				(res) => {
				  result['lat'] = res.data.lat;
				  result['lng'] = res.data.lng;
				  this.dialogRef.close(result);
				},
				(err) => {
				  this.toasterService.showError(this.vref, "Error", err.error.message);
				}
			  );
			
		}
	}



}
