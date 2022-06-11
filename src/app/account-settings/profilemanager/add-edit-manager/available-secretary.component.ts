
import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AccountService } from "../../account.service";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import * as _ from "lodash";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

@Component({
	selector: "available-secretary",
	templateUrl: "./available-secretary.component.html",
	styleUrls: ["./add-edit-manager.component.scss"],
})
export class AvailableSecretaryComponent implements OnInit {

	public userData: {};
	public secretaryCount: any;
	public secretaryList: any;
	//public headersBind = ['first_name', 'email', 'phone_number'];
	public headers: any = [];

	constructor(
		private accountService: AccountService,
		private localStorageService: LocalStorageService,
		private translate: TranslateService,
		private dialogRef: MatDialogRef<AvailableSecretaryComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
	}

	ngOnInit(): void {
		if (this.data && this.data.count > 0) {
			this.secretaryCount = this.data.count;
			this.secretaryList = this.data.list;
			this.secretaryList.forEach(element => {
				element['roleName'] = element.role == '4' ? 'SECRETARY' : 'BILLING_AGENT'
				let doctorsList = JSON.parse(element.parent_id)
				if(doctorsList.length > 0){
					let doctorName = []
					doctorsList.forEach(doctorDetail => {
						let doctorIndex = "Dr.";
						let nameOfDoctor = doctorDetail.doctorName;
						let result = doctorIndex.concat(nameOfDoctor);
						doctorName.push(result)
					})
					element['doctorNames'] = doctorName;
				} else {
					element['doctorNames'] = 'NON_WORKING_PROFILE_MANAGER';
				}
			});
		}
		this.headers = ['NAME', 'EMAIL', 'PHONE_NUMBER', 'GENDER', 'CLINIC_NAME', 'ROLE', 'WORKING_FOR_DOCTOR']
		this.userData = this.localStorageService.getItem("userData") || {};
	}

	autoFillManager(id){
		const selectedManager = this.secretaryList .filter((obj) => {
			return obj.id === id;
		  });
		  this.dialogRef.close(selectedManager);
		  
	}

	onReset() {
		this.dialogRef.close();
	}

	addNewManager(){
		this.dialogRef.close('newManager');
	}



}
