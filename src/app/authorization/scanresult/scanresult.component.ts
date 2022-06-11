import { Component, ViewContainerRef, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthorizationService } from "../authorization.service";
import { ErrorService } from "../../utils/service/error.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { MatDialog } from "@angular/material/dialog";
import { selectDoctorModelComponent } from "./selectdoctormodel/selected-doctor-modal.component";
import { selectLanguageModelComponent } from "./selectdoctormodel/selected-language-modal.component";
import { healthcardModelComponent } from "./selectdoctormodel/healthcard-modal.component";
import * as moment from "moment";
import { environment } from "../../../environments/environment";
import { DialogModalComponent } from "../../utils/component/cancel-modal/cancel-modal.component";
import { ChatService } from "../../header/left-panel/chat.auth-service";
import { ChatManagerService } from "../../header/chat/services/chat-manager.service";
import { PubnubWrapperService } from "../../header/chat/services/pubnub-wrapper/pubnub-wrapper.service";


@Component({
	templateUrl: "./scanresult.component.html",
	styleUrls: ["./scanresult.component.scss"],
	providers: [ChatService,ChatManagerService,PubnubWrapperService]
})

export class ScanResultComponent implements OnInit {
	public token: any;
	public lang: string;
	selectedDoctorData: any;
	public languages;
	public clinicData: any;
	public validateData: any;
	public chatId:any;

	constructor(
		private vref: ViewContainerRef,
		private router: Router,
		private route: ActivatedRoute,
		private matDialog: MatDialog,
		private translate: TranslateService,
		private authService: AuthorizationService,
		private localStorageService: LocalStorageService,
		private errorService: ErrorService,
		private toaster: ToasterService,
		private chatService: ChatService,
		private chatManager: ChatManagerService,
	) {
		this.route.queryParams.subscribe((params: any) => {
			this.token = params.token;
		});
		this.languages = [{ "id": "en", "name": "ENGLISH" }, { "id": "fr", "name": "FRENCH" }];
	}
	ngOnInit(): void {
		const langInLocal = this.localStorageService.getItem("language");
		this.localStorageService.setItem("isQrcodeScanPage", "true");
		if (langInLocal) {
			this.lang = langInLocal;
		} else {
			this.lang = "en";
			this.localStorageService.setItem("language", "en");
		}
		this.translate.use(this.lang);

		this.authService.validateToken(this.token).subscribe((res) => {
			if (res.data.length) {
				this.validateData = res.data[0]
				this.localStorageService.setItem('v_c_d',this.validateData)
				this.clinicData = JSON.parse(res.data[0].clinic_details);
				this.displayDoctorsList(res.data[0]);
			} else {
				this.toaster.showError(this.vref, "Error Occurred", "INVALID_TOKEN");
			}
		}, (err) => {
			if (err.error.message == 'invalid signature') {
				this.toaster.showError(this.vref, "Error Occurred", "INVALID_TOKEN");
			} else {
				this.toaster.showError(this.vref, "Error Occurred", err?.error?.message);
			}
		})
	}

	displayDoctorsList(data) {
		let obj = {}
		obj['clinicAddress'] = JSON.parse(data.clinic_details);
		obj['availableDoctors'] = JSON.parse(data.doctors_list);
		obj['availableLanguages'] = this.languages;
		const dialogRef = this.matDialog.open(selectLanguageModelComponent, {
			height: "250px",
			width: "600px",
			disableClose: true,
			data: obj
		});
		dialogRef.afterClosed().subscribe(() => {
			let doctorCount = JSON.parse(this.validateData.doctors_list);
			if(doctorCount.length == 0){
				this.localStorageService.clearLocalStorage();
				this.toaster.showError(this.vref, "Error Occurred", "NO_DOCTORS_AVAILABLE");
			} else {
				const dialogRef = this.matDialog.open(healthcardModelComponent, {
					height: "270px",
					width: "600px",
					disableClose: true,
					data: obj
				});
				dialogRef.afterClosed().subscribe((data) => {
					this.searchPatients(data);
				});
			}
		});
	}
	public itemsPerPage = 10;
	public count;
	public patientListCount;
	public currentPage = 1;
	public patientList = [];
	public patientName: any;
	public doctorName: any;
	public appointments: any;

	searchPatients(healthCardData) {
		this.patientList = [];
		this.patientListCount = 0;
		this.authService.getPatients({
			skip: (this.currentPage - 1) * this.itemsPerPage,
			limit: this.itemsPerPage,
			...(healthCardData ? { healthCardNumber: healthCardData } : {}),
		}).subscribe(
			(res) => {
				if (res.data.Patients.length) {
					this.patientListCount = res.data.count;
					this.patientList = res.data.Patients;
					this.patientName = this.patientList[0].first_name + ' ' + this.patientList[0].last_name;
					this.patientList = this.patientList.filter(
						(entry) =>
						entry.guest || (!entry.guest && entry.subscription_status == 'active') || (!entry.guest && entry.subscription_status == null && entry.subscription_plan == "" && entry.sub_account)
					);
					this.patientList.forEach(element => {
						element['type'] = element.guest == true ? 'GUEST_PATIENT' : 'SUBSCRIBED_PATIENT'
					});
					this.featureAppointments(this.patientList[0]);
				} else {
					this.matDialog.open(DialogModalComponent, {
						height: "auto",
						width: "350px",
						disableClose: true,
						data: { message: "HEALTHCARD_DETAILS_NOT_FOUND" },
					})
						.afterClosed()
						.subscribe((val) => {
							if (val) {
								this.router.navigateByUrl(`auth/qrcodepatientregister`);
							} else {
								this.localStorageService.clearLocalStorage();
								window.location.replace(environment.portalURL);
							}
						});
				}

			},
			(err) => {
				this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
			}
		);
	}

	featureAppointments(patientData) {

		const queryParams = {};
		queryParams["list"] = true;
		queryParams["type"] = 'upcoming';

		this.authService.getAppointments(queryParams, { 'user_id': patientData.userId,'patientId': patientData.id  }).subscribe(
			(res) => {
				if (res.data.count > 0) {
					this.appointments = res.data.appointments;
					this.doctorName = this.appointments[0].doctor.firstName + ' ' + this.appointments[0].doctor.lastName;
					console.log(this.appointments[0].bookingDetail.startTime)
					this.get_time_diff(this.appointments[0].bookingDetail.startTime);
				} else {
					this.appointments = [];
				}
			},
			(err) => {
				this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
			});
	}
	proceedButtonHide:any;
	 get_time_diff(time ){
		var date1 = new Date();
		var date2 = new Date(time);
		var diff = date2.getTime() - date1.getTime();
		var msec = diff;
		var mm = Math.floor(msec / 1000 / 60);
		if (mm >= -60 && mm <= 15) {
			this.proceedButtonHide = false
		} else {
			this.proceedButtonHide = true
		}
	}

	startChat(){
		this.chatId = this.appointments[0].bookingDetail.doctorUserId+'_'+this.appointments[0].doctor.doctorId;
		this.getChatAccess(this.chatId)
	}

	chatToken:any;
	channelId:any;
	uuid:any;
	getChatAccess(chatId) {
		this.chatService.getChatSessionToken(chatId).subscribe(
		  (res) => {
			const sessionData = res.data;
			if (sessionData && sessionData.token) {
					this.chatToken = sessionData.token;
					this.channelId = sessionData.channelNames[0];
					const getuserid = this.channelId.split("_");
					this.uuid = getuserid[0]
				
				if (this.chatToken && this.channelId && this.uuid) {
					this.chatManager.channelId = this.channelId;
					this.chatManager.chatToken = this.chatToken;
					this.chatManager.uuid = this.uuid;
					this.chatManager.initializepatientSession();
					setTimeout(() => {
						this.sendMessage()
					}, 1000);
					
				  }
			} else {
			  this.toaster.showError(
				this.vref,
				sessionData.message,
				"Error Occurred"
			  );
			}
		  },
		  (err) => {
			let errObj = JSON.parse(err.body);
			let errMessage =
			  errObj.detail || "Some Error Occurred, Please Try Again Later";
			this.toaster.showError(this.vref, errMessage, "Error Occurred");
		  }
		);
	  }

	  sendMessage() {
		let langInLocal = this.localStorageService.getItem("language");
		var myDateVariable= moment(this.appointments[0].bookingDetail.startTime).format("MMM DD, YYYY")
		var myTimeVariable= moment(this.appointments[0].bookingDetail.startTime).format("hh:mm a")
		  let msg;
		  let file;
		  if(langInLocal == "en"){

			  msg = `Hello Doctor, Patient ${this.patientName} is at your clinic for his/her appointment on 
			  ${myDateVariable} at ${myTimeVariable} `;
		  } else {
				msg = `Bonjour docteur, le patient ${this.patientName} est à votre clinique pour son rendez-vous le 
				${myDateVariable} à ${myTimeVariable} `;
		  }
		  if (msg || file) {
			  this.chatManager.sendMessage(msg, file);
			  this.toaster.showSuccess(this.vref, "Success", "CONFIRM_PRESENCE_MSG");
		  }
		
	  }

	bookAppointment(row) {
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
				if (row.type == "GUEST_PATIENT" && (this.selectedDoctorData.province_id != row.province_id)) {
					this.toaster.showError(this.vref, "Error Occurred", "PROVINCE_NOT_MATCHED");
					this.localStorageService.clearLocalStorage();
					window.location.replace(environment.portalURL);
				} else if (row.type == "GUEST_PATIENT" && this.selectedDoctorData.practice == "1") {
					this.toaster.showError(this.vref, "Error Occurred", "DOCTOR_NOT_PROVIDE_PUBLIC_SERVICE");
					this.localStorageService.clearLocalStorage();
					window.location.replace(environment.portalURL);
				} else {
					this.router.navigateByUrl(
						`auth/profile/${this.selectedDoctorData.doctorId}?lat=${this.selectedDoctorData.lat}&lng=${this.selectedDoctorData.lng}&date=${moment().toISOString()}&selectedId=${row.userId}`
					);
				}
			});
		} else {
			this.toaster.showError(this.vref, "Error Occurred", "NO_DOCTORS_AVAILABLE");
		}
		

	}

}
