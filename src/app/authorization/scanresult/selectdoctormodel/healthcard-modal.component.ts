/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToasterService } from "../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorService } from "../../../utils/service/error.service";
import * as _ from "lodash";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

@Component({
	selector: "healthcard-modal",
	templateUrl: "./healthcard-modal.component.html",
	styleUrls: ["./selected-doctor-modal.component.scss"],
})
export class healthcardModelComponent implements OnInit {
	healthCardData: any;
	public healthCardForm: FormGroup;
	public formSubmitted: boolean = false;
	clinicDetails:any;
	constructor(
		private formBuilder: FormBuilder,
		private localStorageService: LocalStorageService,
		private translate: TranslateService,
		private errorHandler: ErrorService,
		private toasterService: ToasterService,
		private vref: ViewContainerRef,
		private dialogRef: MatDialogRef<healthcardModelComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.clinicDetails = this.data.clinicAddress;
	}

	ngOnInit(): void { 
		this.healthCardForm = this.formBuilder.group({
			healthCareNumber: [null, [Validators.required,Validators.minLength(12)]],
			
		});
	}

	isValidForm() {
		return _.get(this.healthCardForm, "invalid");
	}

	hasError(errorType: string, key: string) {
		return (
			this.formSubmitted && this.healthCardForm.hasError(errorType, [key])
		);
	}

	saveForm() {
		this.formSubmitted = true;
		if (this.isValidForm()) {
			return false;
		}
		console.log(_.get(this.healthCardForm, "controls.healthCareNumber.value"))
		this.healthCardData = _.get(this.healthCardForm, "controls.healthCareNumber.value");
		this.dialogRef.close(this.healthCardData);
	}



}
