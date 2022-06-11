/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
//import { RepositoryService } from "../../repository.service";
import { ToasterService } from "../../../utils/service/toaster.service";
import { ErrorService } from "../../../utils/service/error.service";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { AccountService } from "../../account.service";
import { RepositoryService } from "../../../repository/repository.service";
import { Router } from "@angular/router";
import { AddEditManagerComponent } from "../add-edit-manager/add-edit-manager.component";
import { AvailableSecretaryComponent } from "../add-edit-manager/available-secretary.component";
import { DialogModalComponent } from "../../../utils/component/cancel-modal/cancel-modal.component";
import * as _ from "lodash";

@Component({
	selector: "app-profilemanager",
	templateUrl: "./profilemanager.component.html",
	styleUrls: ["./profilemanager.component.scss"],
})
export class ProfileManagerComponent implements OnInit {
	public profileManagerList: any = [];
	public headersBind = ['name', 'email', 'phone_number'];
	public headers: any = [];
	userData: any;
	constructor(
		private matDialog: MatDialog,
		private repositoryService: RepositoryService,
		private errorService: ErrorService,
		private vref: ViewContainerRef,
		private toaster: ToasterService,
		private traslate: TranslateService,
		private localStorageService: LocalStorageService,
		private accountService: AccountService,
		private router: Router,
	) { }

	ngOnInit(): void {
		this.userData = this.localStorageService.getItem("userData") || {};
		this.getManagerList();
		this.headers = ['NAME', 'EMAIL', 'PHONE_NUMBER', 'ROLE', 'BILLING_MODULE.STATUS', 'WORKING_FOR_DOCTOR',]
	}

	inviteAgain(managerData){
		let obj = {};
		obj['id'] = managerData.id;
		obj['email'] = managerData.email;
		obj['first_name'] = managerData.first_name;
		obj['last_name'] = managerData.last_name;
		this.accountService.inviteManagerAgain(obj).subscribe(
			(res) => {
				if (res && res.success) {
					this.toaster.showSuccess(this.vref, "Success", "MAIL_SEND_SUCCESSFULLY");
				}
			},
			(err) => {
				this.toaster.showError(
					this.vref,
					"Error Occurred",
					err?.error?.message
				);
			}
		);
	}

	getManagerList() {
		this.accountService.getProfileMngrList(this.userData).subscribe((res) => {
			if (res) {
				this.profileManagerList = res.data.list;
				this.profileManagerList.forEach(function (profileManager) {
					profileManager.speciality = profileManager.role == 4 ? 'SECRETARY' : 'BILLING_AGENT';
					profileManager.statusType = profileManager.userStatus == 1 ? 'EMAIL_VERIFICATION_PENDING' : (profileManager.userStatus == 2 ? 'ACTIVE' : (profileManager.userStatus == 3 ? 'INACTIVE' : 'REJECTED'));
					profileManager.name = profileManager.first_name+' '+profileManager.last_name;
					let doctorsList = JSON.parse(profileManager.parent_id)
					if(doctorsList.length > 0){
						let doctorName = []
						doctorsList.forEach(doctorDetail => {
							let doctorIndex = "Dr.";
							let nameOfDoctor = doctorDetail.doctorName;
							let result = doctorIndex.concat(nameOfDoctor);
							doctorName.push(result)
						})
						profileManager['doctorNames'] = doctorName;
					} else {
						profileManager['doctorNames'] = 'NON_WORKING_PROFILE_MANAGER';
					}

				});
			}
		});
	}

	addManager() {
		let reqBody = {};
		reqBody['clinic_name'] = this.userData.clinicName;
		reqBody['postal_code'] = this.userData.postalCode;
		this.accountService.getAvailableProfileMngrByClinicName(reqBody).subscribe((res) => {
			if (res) {
				let availableManagerList = res.data;
				this.profileManagerList.forEach(element => {
					let result = _.find(availableManagerList.list, { id: element.id });
					if(result){
						availableManagerList.list = _.filter(availableManagerList.list, function (f) { return f.id !== result.id; });
					}
				});
				availableManagerList.list = _.filter(availableManagerList.list, function (f) { return f.is_sub_account_active; });
				if (availableManagerList.list.length == 0) {
					const dialogRef = this.matDialog.open(AddEditManagerComponent, {
					});
					dialogRef.afterClosed().subscribe((data) => {
						if (typeof data == "object") {
							this.accountService.saveMyManagerDetails(data).subscribe(
								(res) => {
									if (res && res.success) {
										this.toaster.showSuccess(this.vref, "Success", "MANAGER_ADDED_SUCCESSFULLY");
										this.getManagerList();
									}
								},
								(err) => {
									this.toaster.showError(
										this.vref,
										"Error Occurred",
										err?.error?.message
									);
								}
							);
						}
					});
				} else {
					const dialogRef = this.matDialog.open(AvailableSecretaryComponent, {
						data: availableManagerList,
						height: "600px"
						
					});
					dialogRef.afterClosed().subscribe((selectedManager) => {
						if (selectedManager == 'newManager') {
							const dialogRef = this.matDialog.open(AddEditManagerComponent, {
							});
							dialogRef.afterClosed().subscribe((data) => {
								if (typeof data == "object") {
									this.accountService.saveMyManagerDetails(data).subscribe(
										(res) => {
											if (res && res.success) {
												this.toaster.showSuccess(this.vref, "Success", "MANAGER_ADDED_SUCCESSFULLY");
												this.getManagerList();
											}
										},
										(err) => {
											this.toaster.showError(
												this.vref,
												"Error Occurred",
												err?.error?.message
											);
										}
									);
								}
							});
						} else if(selectedManager && selectedManager.length > 0){
							let parentDetails = JSON.parse(selectedManager[0].parent_id)
							let parentObj = {};
							parentObj['parent_id'] = this.userData["doctorId"];
							parentObj['user_id'] = this.userData["userId"];
							parentObj['doctorName'] = this.userData["firstName"]+" "+this.userData["lastName"];
							parentDetails.push(parentObj)
							selectedManager[0].parent_id = JSON.stringify(parentDetails);
							delete selectedManager[0].doctorNames;
							delete selectedManager[0].roleName;
							this.accountService.addExistingManager(selectedManager[0].id, selectedManager).subscribe(
								(res) => {
									if (res && res.success) {
										this.toaster.showSuccess(this.vref, "Success", "MANAGER_ADDED_SUCCESSFULLY");
										this.getManagerList();
									}
								},
								(err) => {
									this.toaster.showError(
										this.vref,
										"Error Occurred",
										err?.error?.message
									);
								}
							);
						}
					
					});
				}
			}
		});


	}

	editMyManager(managerId) {
		const selectedManager = this.profileManagerList.filter((obj) => {
			return obj.id === managerId;
		});
		const dialogRef = this.matDialog.open(AddEditManagerComponent, {
			data: selectedManager,
		});
		dialogRef.afterClosed().subscribe((data) => {
			if (typeof data == "object") {
				data.id = managerId.toString();
				data.user_id = selectedManager[0].user_id;
				this.accountService.updateMyManagerDetails(data).subscribe(
					(res) => {
						if (res && res.message == "Updated Successfully") {
							this.toaster.showSuccess(this.vref, "Success", "MANAGER_UPDATED_SUCCESSFULLY");
							this.getManagerList();
						}
					},
					(err) => {
						this.toaster.showError(
							this.vref,
							"Error Occurred",
							"ERROR_OCCURED"
						);
					}
				);
			}
		});
	}

	deleteMyManager(managerData) {
		this.matDialog.open(DialogModalComponent, {
			height: "auto",
			width: "350px",
			data: {	message: "CONFIRM_DELETE_MANAGER"},
		})
		.afterClosed()
		.subscribe((val) => {
			if (val) {
				if(managerData.status == 1){
					let data = {};
					data['managerId'] = managerData.id
					data['userId'] = managerData.user_id
					this.accountService.deleteManagerPermanently(data).subscribe(
						(res) => {
							if (res && res.success) {
								this.toaster.showSuccess(this.vref, "Success", "MANAGER_REMOVED_SUCCESSFULLY");
								this.getManagerList();
							}
						},
						(err) => {
							this.toaster.showError(
								this.vref,
								"Error Occurred",
								"ERROR_OCCURED"
							);
						}
					);
				} else {
					let data = {};
					data['managerId'] = managerData.id
					data['parentId'] = this.userData.doctorId
					this.accountService.deleteExistingManager(data).subscribe(
						(res) => {
							if (res && res.success) {
								this.toaster.showSuccess(this.vref, "Success", "MANAGER_REMOVED_SUCCESSFULLY");
								this.getManagerList();
							}
						},
						(err) => {
							this.toaster.showError(
								this.vref,
								"Error Occurred",
								"ERROR_OCCURED"
							);
						}
					);
				} 
			}
		});

	}
}
