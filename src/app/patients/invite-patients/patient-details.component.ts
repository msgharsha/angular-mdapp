import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { PatientsService } from "../patients.service";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { ToasterService } from "../../utils/service/toaster.service";
import { faCloudUploadAlt, faCheckCircle, faTimesCircle, faEdit, faTrashAlt, faPrint, faDownload, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import * as _ from "lodash";
import * as moment from "moment";
@Component({
  selector: "detailed-patient",
  templateUrl: "./patient-details.component.html",
  styleUrls: ["./invite-patients.component.scss"],
})
export class PatientDetailsComponent implements OnInit {
  public itemsPerPage = 10;
  public count;
  public currentPage = 1;
  public patientId: any;
  public patientName: any;
  public doctorId: any;
  showLoader: boolean;
  public PatientDetailsList = [];
  fontIcons = [faEdit];
  selectedDate: any = '';
  filterList = [
    {
      label: "DATE",
      type: "date",
      selectedDate: "",
      showInfoIcon: true,
      toolTipContent: "",
      translateParams: { duration: 2 },
      select: (event) => {
        this.selectedDate = event;
        this.getDetailedPatientList(this.patientId, this.doctorId);
      },
    },
  ];
  constructor(
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private _router: Router,
    private route: ActivatedRoute,
    private patientService: PatientsService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.patientId = params.id;
      this.doctorId = params.doctorId;
      //this.selectedDate =  moment(params.date).valueOf();
      this.selectedDate = params.date ? moment(params.date).toISOString() : "";
      this.filterList[0].selectedDate = this.selectedDate;
      this.getDetailedPatientList(this.patientId, this.doctorId);
  });
  }

  getDetailedPatientList(id, doctorId) {
    this.showLoader = true;
    this.patientService.getPatientDetails({
      patientId:this.patientId,
      doctorId:this.doctorId,
      skip: (this.currentPage - 1) * this.itemsPerPage,
      limit: this.itemsPerPage,
      offset: moment().format("Z"),
      ...(this.selectedDate ? { date: moment(this.selectedDate).valueOf() } : ""),
    }).subscribe(
      (res) => {
        this.showLoader = false;
        this.count = res.data.count;
        this.PatientDetailsList = res.data.patients;
        this.patientName = res.data.patients[0].patientinfo.patientName
      },
      (err) => {
        this.showLoader = false;
        this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
      }
    );
  }

  pageChangedEvent(pageNo) {
    this.currentPage = pageNo;
    this.getDetailedPatientList(this.patientId, this.doctorId);
  }

  patientGetDetails(patient) {
    let id = patient.appointmentId
    this._router.navigate(["patients/patient-history"], {
      queryParams: {
        bookingId: id,
        patientUserId: patient.patientUserId,
        patientName: patient.patientinfo.patientName,
        patientEmail:patient.patientinfo.patientEmail,
        patientId:this.patientId,
        date:patient.startTime
      },
    });
  }

}
