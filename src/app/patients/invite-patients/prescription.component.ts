import { Component, Input, OnInit, ViewContainerRef } from "@angular/core";
import { PatientsService } from "../patients.service";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { ToasterService } from "../../utils/service/toaster.service";
import * as _ from "lodash";
import { TranslaterService } from "../../utils/service/translater.service";
import { MatDialog } from "@angular/material/dialog";
import { FileViwerComponent } from "../../utils/component/file-viwer/file-viwer.component";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { PrescriptionService } from "../../utils/service/presciption.sevice";
import { TranslateService } from "@ngx-translate/core";
import { ErrorService } from "./../../utils/service/error.service";
import { Subscription } from "rxjs";
@Component({
  selector: "prescription",
  templateUrl: "./prescription.component.html",
  styleUrls: ["./invite-patients.component.scss"],
})
export class PrescriptionComponent implements OnInit {
  @Input() bookingId;
  public prescriptionDetails: any;
  public canView: boolean;
  public subscriptions: Subscription;
  public langSubscriptions: Subscription;
  public prescriptionData: any;

  constructor(
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private localStorageService:LocalStorageService,
    private errorHandler: ErrorService,
    private translatesService: TranslateService,
    private patientService: PatientsService,
    private prescriptionService: PrescriptionService,
  ) { }

  ngOnInit() {
    this.getPrescriptionData();
  }


  getPrescriptionData() {
    this.prescriptionService
      .getPrescriptionData(this.bookingId)
      .subscribe((res) => {
        this.prescriptionDetails = res.data;
      },
      (error) => {
        if(error.error.isError && error.error.message == "Requested Prescription not found"){
          this.prescriptionDetails = error.error.message;
        }else{
          this.errorHandler.handleError(error, this.vref);
        }
        
      });
  }

  onSend() {
    let action = "sendPrescription";
    this.prescriptionService
      .sendPrescriptionData(this.bookingId, action)
      .subscribe(
        (res) => {
          if (res) {
            this.prescriptionData.isPrescriptionSend = true;
            this.toaster.showSuccess(this.vref, "SUCCESS", "PRESCRIPTION_SEND");
          }
        },
        (error) => {
          this.errorHandler.handleError(error, this.vref);
        }
      );
  }

  ngOnDestroy() {
  }



}
