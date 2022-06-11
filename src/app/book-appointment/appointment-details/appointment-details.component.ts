
import { Component, OnInit, ViewContainerRef } from "@angular/core";
import * as _ from "lodash";
import { ToasterService } from "../../utils/service/toaster.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { BookAppointmentService } from '../book-appointments.service';
import { ErrorService } from "../../utils/service/error.service";
import { AlertModalComponent } from "../../utils/component/confirm-modal/confirm-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import * as moment from "moment";

@Component({
    selector: "appointment-details",
    templateUrl: "./appointment-details.component.html",
    styleUrls: ["./appointment-details.component.scss"],
    providers: []
})
export class AppointmentDetailsComponent implements OnInit {
    public itemsPerPage = 10;
    public count;
    public patientListCount;
    public currentPage = 1;
    public invitedPatientList = [];
    public patientList = [];
    public userData: any;
    searchFName = "";
    searchemail = "";
    searchPhone = "";
    searchHealthcareNumber = "";

    filterList = [
        {
            label: "PATIENT_NAME",
            type: "search",
            search: (event) => {
                this.searchFName = event;
                if(this.searchFName.length >= 3){
                    this.getPatientList();
                }
                if(this.searchFName.length == 0){
                    this.getPatientList();
                }
            },
        },
        {
            label: "EMAIL",
            type: "search",
            search: (event) => {
                this.searchemail = event;
                if(this.searchemail.length >= 3){
                    this.getPatientList();
                }
                if(this.searchemail.length == 0){
                    this.getPatientList();
                }
            },
        },
        {
            label: "PHONE_NUMBER",
            type: "search",
            search: (event) => {
                this.searchPhone = event;
                if(this.searchPhone.length >= 3){
                    this.getPatientList();
                }
                if(this.searchPhone.length == 0){
                    this.getPatientList();
                }
            },
        },
        {
            label: "HEALTH_CARD_NUMBER",
            type: "search",
            search: (event) => {
                this.searchHealthcareNumber = event.replace(/\s+/g, '');
                if(this.searchHealthcareNumber.length >= 3){
                    this.getPatientList();
                }
                if(this.searchHealthcareNumber.length == 0){
                    this.getPatientList();
                }
            },
        },
    ];

    constructor(
        private toaster: ToasterService,
        private vref: ViewContainerRef,
        private bookAppointmentService: BookAppointmentService,
        private localStorageService: LocalStorageService,
        private translate: TranslateService,
        private errorService: ErrorService,
        private matDialog: MatDialog,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.userData = this.localStorageService.getItem("userData");
    }

    getPatientList() {
        this.patientList = [];
        this.patientListCount = 0;
        this.bookAppointmentService.getPatients({
            skip: (this.currentPage - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            ...(this.searchFName ? { patientName: this.searchFName } : {}),
            ...(this.searchemail ? { email: this.searchemail } : {}),
            ...(this.searchPhone ? { phoneNumber: this.searchPhone } : {}),
            ...(this.searchHealthcareNumber ? { healthCardNumber: this.searchHealthcareNumber } : {}),
        }).subscribe(
            (res) => {
                this.patientListCount = res.data.count;
                this.patientList = res.data.Patients;
                this.patientList = this.patientList.filter(
                    (entry) =>
                    entry.guest || (!entry.guest && entry.subscription_status == 'active') || (!entry.guest && entry.subscription_status == null && entry.subscription_plan == "" && entry.sub_account)
                      //!(entry.guest == false && entry.subscription_plan == "")
                  );
                this.patientList.forEach(element => {
                    element['type'] = element.guest == true ? 'GUEST_PATIENT' : 'SUBSCRIBED_PATIENT'
                });
            },
            (err) => {
                this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
            }
        );
    }

    patientPageChangedEvent(pageNo) {
        this.currentPage = pageNo;
        this.getPatientList();
    }

    bookAppointment(row){
        this.bookAppointmentService.getDentistById(this.userData.selectedDoctorData.parent_id).subscribe(
            (res) => {
                if(row.type == "GUEST_PATIENT" && (res.data.provinceId != row.province_id)){
                    this.confirmModal('PROVINCE_NOT_MATCHED')
                } else if(row.type == "GUEST_PATIENT" && res.data.practiceMethod == "Private"){
                    this.confirmModal('DOCTOR_NOT_PROVIDE_PUBLIC_SERVICE')
                } else {
                    this.router.navigateByUrl(
                        `doctor/profile/${this.userData.selectedDoctorData.parent_id}?lat=${this.userData.selectedDoctorData.lat}&lng=${this.userData.selectedDoctorData.lng}&date=${moment().toISOString()}&selectedId=${row.userId}`
                    );
                }
            },
            (err) => {
              this.errorService.handleError(err, this.vref);
            },
          );
    }

    confirmModal(message){
        const dialogRef = this.matDialog.open(AlertModalComponent, {
            height: "auto",
            width: "350px",
            data: {
              message: message,
            },
        });
    }
}
