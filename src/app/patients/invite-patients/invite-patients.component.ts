/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef, Compiler } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { PatientsService } from "../patients.service";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from "@angular/forms";
import { NgxCsvParser } from "ngx-csv-parser";
import { NgxCSVParserError } from "ngx-csv-parser";
import { ToasterService } from "../../utils/service/toaster.service";
import { REGEX } from "../../authorization/constants/regex";
import { MatDialog } from "@angular/material/dialog";
import { ViewInvitationModalComponent } from "../../utils/component/view-invitation/view-invitation.component";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { faCloudUploadAlt, faCheckCircle, faTimesCircle, faEdit, faTrashAlt, faPrint, faDownload,faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import * as _ from "lodash";
import * as moment from "moment";
@Component({
  selector: "app-invite-patients",
  templateUrl: "./invite-patients.component.html",
  styleUrls: ["./invite-patients.component.scss"],
})
export class InvitePatientsComponent implements OnInit {
  public inviteForm: FormGroup;
  public formSubmitted: boolean;
  public header = true;
  public file: any;
  public patients: [];
  public itemsPerPage = 10;
  public count;
  public patientListCount;
  public currentPage = 1;
  public invitedPatientList = [];
  public patientListByDoctor = [];
  public isSend: boolean;
  public fileName: string;
  public userData:any;
  searchValue = "";
  searchedName = "";
  public showUploadIcon: boolean = true;
  public uploadfileError: boolean = false;
  fontIcons = [faEdit]
  selectedTab = 0;
  selectedDate: any;
  filterList = [
    {
      label: "PATIENT_NAME",
      type: "search",
      search: (event) => {
        this.searchValue = event;
        this.getPatientList();
      },
    },
    {
      label: "DATE",
      type: "date",
      selectedDate: "",
      showInfoIcon: true,
      toolTipContent: "",
      translateParams: { duration: 2 },
      select: (event) => {
        this.selectedDate = event;
        this.getPatientList();
      },
    },
  ];
  invitePatientFilterList = [
    {
      label: "NAME",
      type: "search",
      search: (event) => {
        this.searchedName = event;
        this.getInvitedPatientList();
      },
    },
  ];
  // public result:[];
  constructor(
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private ngxCsvParser: NgxCsvParser,
    private translate: TranslateService,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private patientService: PatientsService,
    private localStorageService: LocalStorageService,
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private _complier: Compiler
  ) {}

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem("userData");
    this.selectedDate = "";
    this.getPatientList();
  }

  onTabSelection(tabIndex) {
    this.selectedTab = tabIndex.index;
    if(tabIndex.index == 0){
      this.currentPage = 1;
      this.selectedDate = "";
      this.getPatientList();
    }else{
      this.currentPage = 1;
      this.initializeForm()
    }
  }
  
  initializeForm() {
    this.inviteForm = this.fb.group({
      csvFile: [""],
    });
    this.getInvitedPatientList();
  }

  getInvitedPatientList() {
    this.patientService.getInvitedPatients({
      skip: (this.currentPage - 1) * this.itemsPerPage,
      limit: this.itemsPerPage,
      ...(this.searchedName ? { name: this.searchedName } : {}),
    }).subscribe(
      (res) => {
        this.count = res.data.count;
        this.invitedPatientList = res.data.patients;
      },
      (err) => {
        this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
      }
    );
  }
  getPatientList() {
    this.patientListByDoctor = [];
    this.patientListCount = 0;
    this.patientService.getPatients({
      id:this.userData["doctorId"],
      skip: (this.currentPage - 1) * this.itemsPerPage,
      limit: this.itemsPerPage,
      offset: moment().format("Z"),
      ...(this.searchValue ? { patientName: this.searchValue } : {}),
      ...(this.selectedDate ? { date: moment(this.selectedDate).valueOf() } : ""),
    }).subscribe(
      (res) => {
        this.patientListCount = res.data.count;
        this.patientListByDoctor = res.data.patients;
      },
      (err) => {
        this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
      }
    );

  }
  patientGetDetails(patient){
    let id = patient.patientId
    //this._router.navigateByUrl(`/patients/detailed-patient/${id}/${this.userData["doctorId"]}`)
    this._router.navigate(["patients/detailed-patient"], {
      queryParams: {
        id: id,
        doctorId: this.userData["doctorId"],
        date:this.selectedDate
      },
    });

  }

  notNullUrl(control: FormControl) {
    return control.value && control.value.url ? null : { nullURL: true };
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.inviteForm.hasError(type, [key]);
  }

  fileChangeEvent(e) {
    if (e.srcElement.files[0].name.split(".").pop() != "csv") {
      this.toaster.showError(this.vref, "Error Occurred", "FILE_NOT_SUPPORTED");

      return false;
    } else {
      this.isSend = false;
      this.showUploadIcon = false;
      this.file = e.srcElement.files;
      this.fileName = e.srcElement.files[0].name;
      this.uploadfileError = false;
    }
  }

  sendInvitation(templateData) {
    this.ngxCsvParser
      .parse(this.file[0], { header: this.header, delimiter: "," })
      .pipe()
      .subscribe(
        (parsedResult: Array<any>) => {
          let result = parsedResult.filter(
            (entry) =>
              !(_.isArray(entry) && entry.length == 1 && entry[0] == "")
          );

          if (result.length > 1) {
            if (
              !result[0].name ||
              !result[0].email ||
              !result[0].language
            ) {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                "WRONG_EMAIL_AND_NAME"
              );
              return;
            }
          }
          if (!this.isEmailValid(result) || result.length < 1) {
            this.toaster.showError(
              this.vref,
              "Error Occurred",
              "DATA_NOT_VALID"
            );
            this.inviteForm.reset();
            return;
          }
          if (!this.isLanguageValid(result) || result.length < 1) {
            this.toaster.showError(
              this.vref,
              "Error Occurred",
              "DATA_NOT_VALID"
            );
            this.inviteForm.reset();
            return;
          }
          result.forEach(element => {
            if(element.language == 'en'){
              element.content = templateData.enEmailBody
              element.subject = templateData.enSubject
            } else if(element.language == 'fr') {
              element.content = templateData.frEmailBody
              element.subject = templateData.frSubject
            }
            
          });
         
          let bodyObj = {
            patients:  this.createObject(result),
          };
          console.log(bodyObj)
          this.patientService.invitePatient(bodyObj).subscribe(
            (res: any) => {
              this.toaster.showSuccess(
                this.vref,
                "Success",
                "INVITE_SEND_SUCCESS"
              );
              this.isSend = true;
              this.showUploadIcon = true;
              this.inviteForm.controls["csvFile"].reset();
              this.getInvitedPatientList();
            },
            (err) => {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                "ERROR_OCCURED"
              );
            }
          );
        },
        (error: NgxCSVParserError) => {
          this.toaster.showError(this.vref, "Error Occurred", "FILE_ERROR");
        }
      );
  }

  createObject(result){
    let finalArray = []
    result.forEach(element => {
      let tempObj = {}
      tempObj['name'] = element.name;
      tempObj['email'] = element.email;
      tempObj['language'] = element.language;
      tempObj['content'] = element.content;
      tempObj['subject'] = element.subject;
      finalArray.push(tempObj)
    });
    return finalArray;
  }

  viewInvitation(){
    const dialogRef = this.matDialog.open(ViewInvitationModalComponent, {
      height: "600px",
      width: "1000px",
      data: {
        message: "ARE_YOU_SURE_YOU_WANT_TO_CANCEL_APPOINTMENT",
        cancelLabel: "NO_KEEP_APPOINTMENT",
        confirmLabel: "CONFIRM_CANCELLATION",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if(this.file){
          this.sendInvitation(result);
        }else{
          this.uploadfileError = true;
          this.toaster.showError(this.vref, "Error Occurred", "You need to upload csv file");
          
        }
        
      }
    });
  }

  isEmailValid(fileData) {
    let regexp = new RegExp(REGEX.EMAIL);
    let isEmailValid = true;
    fileData.forEach((element) => {
      if (false === regexp.test(element.email)) {
        isEmailValid = false;
      }
    });
    return isEmailValid;
  }

  isLanguageValid(fileData) {
    let isLanguageValid = false;
    fileData.forEach((element) => {
      if (element.language == 'en' || element.language == 'fr') {
        isLanguageValid = true;
      }
    });
    return isLanguageValid;
  }

  reSendInvitation(patient){
    let patientDate = [];
    delete patient.updated_at;
    patientDate.push(patient)
    let bodyObj = {
      patients: patientDate,
    };
    this.patientService.invitePatient(bodyObj).subscribe(
      (res: any) => {
        this.toaster.showSuccess(
          this.vref,
          "Success",
          "INVITE_SEND_SUCCESS"
        );
        this.getInvitedPatientList();
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

  pageChangedEvent(pageNo) {
    this.currentPage = pageNo;
    this.getInvitedPatientList();
  }
  patientPageChangedEvent(pageNo) {
    this.currentPage = pageNo;
    this.getPatientList();
  }
}
