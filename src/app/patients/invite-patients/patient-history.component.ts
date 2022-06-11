import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { PatientsService } from "../patients.service";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { ToasterService } from "../../utils/service/toaster.service";
import * as _ from "lodash";
@Component({
  selector: "patient-history",
  templateUrl: "./patient-history.component.html",
  styleUrls: ["./invite-patients.component.scss"],
})
export class PatientHistoryComponent implements OnInit {
  public patientId:any;
  public patientName:any;
  public bookingId:any;
  public consultDate:any;
  public selectedTab = 1;
  isFromPending = false;
  public invitePatientStatus:boolean = true;
  constructor(
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientsService,
  ) { }

  ngOnInit(): void {
    
    this.route.queryParams.subscribe((params: any) => {
        this.bookingId = params.bookingId;
        this.patientId = params.patientUserId;
        this.patientName = params.patientName;
        this.consultDate = params.date;
    });
  }

  onTabSelection(tabIndex) {
    this.selectedTab = tabIndex;
  }

}
