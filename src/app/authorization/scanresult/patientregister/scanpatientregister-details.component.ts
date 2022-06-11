
import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ErrorService } from "../../../utils/service/error.service";
import { ToasterService } from "../../../utils/service/toaster.service";
import { RESPONSE } from "./response";
import { TranslaterService } from "../../../utils/service/translater.service";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { DialogModalComponent } from "../../../utils/component/cancel-modal/cancel-modal.component";
import { DynamicPatientOtpComponent } from "../../../utils/component/dynamic-patientotp/dynamic-patientotp.component";
import { DynamicPatientEmailOtpComponent } from "../../../utils/component/dynamic-patientemailotp/dynamic-patientemailotp.component";
import { UserRoleService } from "../../../utils/service/user_role.service";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { PatientRegisterService } from "../../../patientregister/patientregister.service";
import { selectDoctorModelComponent } from "../selectdoctormodel/selected-doctor-modal.component";
import { environment } from "../../../../environments/environment";

@Component({
	selector: "scanpatientregister-details",
	templateUrl: "./scanpatientregister-details.component.html",
	styleUrls: ["./scanpatientregister-details.component.scss"],
	providers: []
})
export class ScanPatientRegisterDetailsComponent implements OnInit {


	public basicProfileForm: FormGroup;
	public formSubmitted: boolean = false;
	public fileUploading: boolean = false;
	public userData: any;
	public updateMessage: string = RESPONSE.PICTURE_UPDATE_SUCCESS;
	public removedMessage: string = RESPONSE.PICTURE_DELETE_SUCCESS;
	public addMessage: string = RESPONSE.PICTURE_ADD_SUCCESS;
	public languages;
	public measuringUnit;
	public provinces: any;
	public uniquePhoneSubs: Subscription;
	public today = new Date();
	public maxDate = moment(this.today.setFullYear(this.today.getFullYear() - 14))
		.startOf("day")
		.format();
	public minDate = moment(
		this.today.setFullYear(this.today.getFullYear() - 100)
	).format();
	public provinceId: any;
	public practice: any;
	public docId: any;
	public lat: any;
	public lng: any;
	isQrcodeScanPage: any;

	constructor(
		private activatedRoute: ActivatedRoute,
		private errorHandler: ErrorService,
		private formBuilder: FormBuilder,
		private toaster: ToasterService,
		private vref: ViewContainerRef,
		private translater: TranslaterService,
		private localStorageService: LocalStorageService,
		private matDialog: MatDialog,
		private translate: TranslateService,
		private router: Router,
		private userRoleService: UserRoleService,
		private patientRegisterService: PatientRegisterService
	) {
		this.languages = [{ "id": "en", "name": "ENGLISH" }, { "id": "fr", "name": "FRENCH" }];
		this.measuringUnit = [{ "id": 4, "name": "feet/inches" }, { "id": 5, "name": "meter" }];
		this.userData = this.localStorageService.getItem("userData");
	}

	ngOnInit() {
		this.isQrcodeScanPage = this.localStorageService.getItem("isQrcodeScanPage");
		// this.activatedRoute.queryParams.subscribe((params: any) => {
		// 	this.provinceId = params.provinceId;
		// 	this.practice = params.practice
		// 	this.docId = params.dId,
		// 	this.lat = params.lat,
		// 	this.lng = params.lng
		// });
		this.getProvinces();
		this.initForm();
		this.translater.TranslationAsPerSelection();
		this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
			let url = this.router.url.split("/");
			if (url[url.length - 1] == "profile") {
				//this.getMasterData();
			}
		});
	}

	getProvinces() {
		this.patientRegisterService.getMasterData().subscribe((res) => {
			this.provinces = _.get(_.cloneDeep(res), "data", []);
		});
	}

	initForm() {
		const emailRegEx = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
		this.basicProfileForm = this.formBuilder.group({
			firstName: [null, [Validators.required, Validators.maxLength(20)]],
			middleName: [null, [Validators.maxLength(10)]],
			lastName: [null, [Validators.required, Validators.maxLength(20)]],
			email: [null, [Validators.required, Validators.pattern(emailRegEx)]],
			phoneNumber: [null, [Validators.required, Validators.minLength(10)]],
			homeNumber: [null, []],
			healthCareNumber: [null, [Validators.required, Validators.minLength(12)]],
			profileImage: [null, []],
			dob: [null, [Validators.required]],
			preferredLanguage: [null, [Validators.required]],
			gender: ["male", [Validators.required]],
			provinceId: [null, [Validators.required]],
			address: ["", [Validators.required]],
			height: [null, [Validators.required]],
			heightUnit: [null, [Validators.required]],
			weight: [null, [Validators.required]]
		});
	}

	onReset() {

	}

	createBodyObject() {
		return {
			firstName: _.trim(_.get(this.basicProfileForm, "controls.firstName.value")),
			middleName: _.trim(_.get(this.basicProfileForm, "controls.middleName.value")),
			lastName: _.trim(_.get(this.basicProfileForm, "controls.lastName.value")),
			email: _.trim(_.get(this.basicProfileForm, "controls.email.value")),
			phoneNumber: _.trim(_.get(this.basicProfileForm, "controls.phoneNumber.value")),
			profileImage: _.get(this.basicProfileForm, "controls.profileImage.value.url"),
			dob: _.get(this.basicProfileForm, "controls.dob.value"),
			preferredLanguage: _.get(this.basicProfileForm, "controls.preferredLanguage.value"),
			provinceId: _.get(this.basicProfileForm, "controls.provinceId.value"),
			gender: _.get(this.basicProfileForm, "controls.gender.value", "male"),
			homeNumber: _.get(this.basicProfileForm, "controls.homeNumber.value"),
			healthCareNumber: _.get(this.basicProfileForm, "controls.healthCareNumber.value"),
			height: _.get(this.basicProfileForm, "controls.height.value"),
			heightUnit: _.get(this.basicProfileForm, "controls.heightUnit.value"),
			weight: _.get(this.basicProfileForm, "controls.weight.value"),
			..._.get(this.basicProfileForm.get("address"), "value"),
		};
	}

	/**
	 * @param  {Error} err
	 */
	handleError(err) {
		this.errorHandler.handleError(err, this.vref);
	}

	/**
	 * @param  {string} type
	 * @param  {string} key
	 */
	hasError(errorType: string, key: string) {
		return (
			this.formSubmitted && this.basicProfileForm.hasError(errorType, [key])
		);
	}

	/**
	 * @param  {} status
	 */
	uploadingStart(status) {
		this.fileUploading = status;
	}

	isValidForm() {
		return _.get(this.basicProfileForm, "invalid");
	}

	isValidAddressForm(address, notRequired: string[]) {
		let isInvalid = false;
		if (!address) {
			isInvalid = true;
		}

		_.forEach(_.omit(address, notRequired), (value, key) => {
			if (!value || value == "null") {
				isInvalid = true;
			}
		});

		if (isInvalid) {
			return false;
		}
		return true;
	}

	saveForm() {

		this.formSubmitted = true;
		if (this.isValidForm()) {
			return false;
		}

		const body = this.createBodyObject();
		this.checkUniquePhone(body, body.phoneNumber);

	}

	checkUniquePhone(body, phoneNo: string) {
		this.uniquePhoneSubs = this.patientRegisterService.uniquePhoneNo(phoneNo).subscribe(
			(res: any) => {
				const isUniquePhoneNo = _.get(res, "isUnique", true);
				if (!isUniquePhoneNo) {
					this.toaster.showError(
						this.vref,
						"Error",
						_.get(res, "message", 'PHONE_NUMBER_ALREADY_EXIST')
					);
					return;
				}
				this.saveOnUniquePhoneNo(body);
			},
			(error) => this.errorHandler.handleError(error, this.vref)
		);
	}

	saveOnUniquePhoneNo(body) {
		let reqObj = {
			"register": {},
			"personalDetails": {},
			"address": {},
			"otherDetails": {},
		}

		const date = new Date(body.dob);
		let year = date.getFullYear();
		let password = body.lastName.charAt(0).toUpperCase() + body.lastName.slice(1) + '@' + year;
		reqObj.register['email'] = body.email;
		reqObj.register['password'] = password;
		reqObj.personalDetails['firstName'] = body.firstName;
		reqObj.personalDetails['middleName'] = body.middleName;
		reqObj.personalDetails['lastName'] = body.lastName;
		reqObj.personalDetails['phoneNumber'] = body.phoneNumber;
		reqObj.personalDetails['profileImage'] = body.profileImage ? body.profileImage : '';
		reqObj.personalDetails['dob'] = body.dob;
		reqObj.personalDetails['preferredLanguage'] = body.preferredLanguage;
		reqObj.personalDetails['gender'] = body.gender;
		reqObj.address['street1'] = body.addressLine1;
		reqObj.address['zipcode'] = body.postalCode;
		reqObj.address['city'] = body.city;
		reqObj.address['province'] = body.province;
		reqObj.address['lat'] = body.lat;
		reqObj.address['lng'] = body.lng;
		reqObj.otherDetails['provinceId'] = body.provinceId;
		reqObj.otherDetails['healthInsuranceNumber'] = body.healthInsuranceNumber ? body.healthInsuranceNumber : '';
		reqObj.otherDetails['healthCareNumber'] = body.healthCareNumber;
		reqObj.otherDetails['expirationDate'] = body.expirationDate ? body.expirationDate : '';
		reqObj.otherDetails['healthCardFrontImage'] = body.healthCardFrontImage ? body.healthCardFrontImage : '';
		reqObj.otherDetails['healthCardBackImage'] = body.healthCardBackImage ? body.healthCardBackImage : '';
		const queryParams = {
			healthInsuranceNumber: body.healthInsuranceNumber ? body.healthInsuranceNumber : '',
			healthCareNumber: body.healthCareNumber
		};
		this.patientRegisterService.uniqueHealthCareNo(queryParams).subscribe((response) => {
			if (response.isUnique) {
				this.patientRegisterService.patientRegister(reqObj).subscribe((res) => {
					if(res && !res.success){
						this.toaster.showError(this.vref,"Error Occurred",res?.message);
					} else {
						this.saveMedicalHistory(body,res.data[0]);
					}
				},(err) => {
						this.toaster.showError(this.vref, "Error Occurred", err?.error?.message);
					});
			} else {
				this.toaster.showError(this.vref, "Error Occurred", response.message);
			}
		},
			(err) => {
				this.toaster.showError(this.vref, "Error Occurred", err?.error?.message);
			});
	}

	saveMedicalHistory(reqBody, patientData) {
		let body = {};
		body["memberId"] = null;
		body["height"] = reqBody.height
		body["heightUnit"] = reqBody.heightUnit;
		body["weight"] = reqBody.weight;
		body["currentMedications"] = [];
		body["allergies"] = [];
		body["countries"] = [];
		body["alcoholFrequency"] = "";
		body["smokeFrequency"] = "";
		body["lastDoctorVisit"] = "";
		body["healthProblems"] = [];
		body["specifyProblem"] = "";
		body["familyHealthProblems"] = [];
		body["specifyFamilyHealthProblems"] = "";
		body["userId"] = patientData.userId;
		if (this.isQrcodeScanPage) {
			this.patientRegisterService.saveMedicalHistoryByQrCode(body).subscribe(
				(res) => {
					if (patientData.emailVerified && patientData.phoneVerified) {
						this.bookAppointment(patientData);
					} else if (!patientData.emailVerified && !patientData.phoneVerified) {
						this.verifyPhoneNo(patientData, false);
					} else if (!patientData.emailVerified && patientData.phoneVerified) {
						this.verifyEmail(patientData)
					} else if (patientData.emailVerified && !patientData.phoneVerified) {
						this.verifyPhoneNo(patientData, true);
					}
				},
				(err: any) => this.errorHandler.handleError(err, this.vref)
			);
		} else {
			this.patientRegisterService.saveMedicalHistory(body).subscribe(
				(res) => {
					if (patientData.emailVerified && patientData.phoneVerified) {
						this.bookAppointment(patientData);
					} else if (!patientData.emailVerified && !patientData.phoneVerified) {
						this.verifyPhoneNo(patientData, false);
					} else if (!patientData.emailVerified && patientData.phoneVerified) {
						this.verifyEmail(patientData)
					} else if (patientData.emailVerified && !patientData.phoneVerified) {
						this.verifyPhoneNo(patientData, true);
					}
				},
				(err: any) => this.errorHandler.handleError(err, this.vref)
			);
		}
	}

	verifyPhoneNo(patientData, isEmailverified) {
		this.patientRegisterService.qrCodeSendOtponPhoneNo({ userId: patientData.userId }).subscribe(
			(res) => {
				this.toaster.showSuccess(
					this.vref,
					"Verification Code Sent",
					"VERIFICATION_CODE_SENT_TO_YOUR_REGISTERED_PHONE_NUMBER"
				);
				const dialogRef = this.matDialog.open(DynamicPatientOtpComponent, {
					height: "auto",
					width: "350px",
					data: {
						patientData: patientData,
					},
				});
				dialogRef.afterClosed().subscribe((result) => {
					if (result) {
						if (!isEmailverified) {
							this.verifyEmail(patientData);
						} else {
							this.bookAppointment(patientData);
						}
					}
				});
			},

			(err: any) => this.errorHandler.handleError(err, this.vref)
		);
	}

	verifyEmail(patientData) {
		this.patientRegisterService.qrCodeSendOtp({ userId: patientData.userId }).subscribe(
			(res) => {
				this.toaster.showSuccess(
					this.vref,
					"Verification Code Sent",
					"VERIFICATION_CODE_SENT_TO_YOUR_REGISTERED_EMAIL"
				);
				const dialogRef = this.matDialog.open(DynamicPatientEmailOtpComponent, {
					height: "auto",
					width: "350px",
					data: {
						patientData: patientData,
					},
				});
				dialogRef.afterClosed().subscribe((result) => {
					if (result) {
						this.bookAppointment(patientData);
					}
				});
			},

			(err: any) => this.errorHandler.handleError(err, this.vref)
		);
	}
	selectedDoctorData: any;
	validateData: any;
	bookAppointment(patientData) {
		let patientId = patientData.userId;
		const dialogRef = this.matDialog.open(DialogModalComponent, {
			height: "auto",
			width: "350px",
			data: {
				message: "PATIENT_SUCCESS_MSG",
			},
		});
		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.validateData = this.localStorageService.getItem('v_c_d')
				let obj = {}
				obj['clinicAddress'] = JSON.parse(this.validateData.clinic_details);
				obj['availableDoctors'] = JSON.parse(this.validateData.doctors_list);
				if (obj['availableDoctors'].length) {
					const dialogRef = this.matDialog.open(selectDoctorModelComponent, {
						height: "250px",
						width: "600px",
						disableClose: true,
						data: obj
					});
					dialogRef.afterClosed().subscribe((data) => {
						this.selectedDoctorData = data
						this.localStorageService.setItem("selectedDoctorData", data);
						if (patientData.guest && (this.selectedDoctorData.province_id != patientData.provinceId)) {
							this.toaster.showError(this.vref, "Error Occurred", "PROVINCE_NOT_MATCHED");
							this.localStorageService.clearLocalStorage();
							window.location.replace(environment.portalURL);
						} else if (patientData.guest && this.selectedDoctorData.practice == "1") {
							this.toaster.showError(this.vref, "Error Occurred", "DOCTOR_NOT_PROVIDE_PUBLIC_SERVICE");
							this.localStorageService.clearLocalStorage();
							window.location.replace(environment.portalURL);
						} else {
							this.router.navigateByUrl(
								`auth/profile/${this.selectedDoctorData.doctorId}?lat=${this.selectedDoctorData.lat}&lng=${this.selectedDoctorData.lng}&date=${moment().toISOString()}&selectedId=${patientData.userId}`
							);
						}
					});
				} else {
					this.toaster.showError(this.vref, "Error Occurred", "NO_DOCTORS_AVAILABLE");
				}

			} else {
				this.localStorageService.clearLocalStorage();
				window.location.replace(environment.portalURL);
			}
		});
	}

	isFloat(event) {
		const charCode = event.which ? event.which : event.keyCode;
		if ((charCode >= 48 && charCode <= 57) || charCode == 46) {
			return true;
		}
		return false;
	}

	ngOnDestroy() {
		if (this.uniquePhoneSubs) {
			this.uniquePhoneSubs.unsubscribe();
		}
	}

}
