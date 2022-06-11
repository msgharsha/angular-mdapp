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
	selector: "selected-language-modal",
	templateUrl: "./selected-language-modal.component.html",
	styleUrls: ["./selected-doctor-modal.component.scss"],
})
export class selectLanguageModelComponent implements OnInit {
	userData: any;
	selectedOption: any;
	availableLanguages: any;
	clinicDetails:any;

	constructor(
		private localStorageService: LocalStorageService,
		private translate: TranslateService,
		private errorHandler: ErrorService,
		private dashboardService: DashboardService,
		private toasterService: ToasterService,
		private vref: ViewContainerRef,
		private dialogRef: MatDialogRef<selectLanguageModelComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.availableLanguages = this.data.availableLanguages;
		this.clinicDetails = this.data.clinicAddress;
	}

	ngOnInit(): void { }

	selectedLanguage() {
		if(this.selectedOption){
			this.localStorageService.setItem("language", this.selectedOption);
			this.translate.use(this.selectedOption);
			this.dialogRef.close();
		}
	}



}
