/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewContainerRef,
} from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { environment } from "./../../../../../../../environments/environment";
import { ToasterService } from "./../../../../../../utils/service/toaster.service";
import { MedicalHistoryService } from "./medical-history.service";
import { TranslaterService } from "../../../../../../utils/service/translater.service";

@Component({
  selector: "medical-history",
  templateUrl: "./medical-history.component.html",
  styleUrls: ["./medical-history.component.scss"],
})
export class MedicalHistoryComponent implements OnInit {
  public showDetails: boolean = false;
  public selectedIndex: number = 0;
  public maxNumberOfTabs: number = 1;
  public loading: boolean = false;
  bookingId: number;
  myPresciptions: any[] = [];
  onlineConcerns: any[] = [];
  prescriptionFor = {};
  public selectedPrescriptionDetail: any;
  countryCode = environment.countryCode;

  @Output() closePanel = new EventEmitter();

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private toaster: ToasterService,
    private vcr: ViewContainerRef,
    private route: ActivatedRoute,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.bookingId = Number(params["bookingId"]);
      // this.getMedicalHistory();
      // this.getOnlineConcern();
    });
    this.translater.TranslationAsPerSelection();
  }

  public showPrescriptionDetails(prescriptionDetails) {
    this.selectedPrescriptionDetail = prescriptionDetails;
    this.showDetails = true;
  }

  public closeDetailsPage(event) {
    this.showDetails = false;
  }

  public closeHistoryPage() {
    this.closePanel.emit();
  }

  public navigateToNext() {
    if (this.selectedIndex !== this.maxNumberOfTabs) {
      this.selectedIndex = this.selectedIndex + 1;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedIndex = tabChangeEvent.index;
  }

  private getMedicalHistory() {
    this.loading = true;
    this.medicalHistoryService.getMedicalHistory(this.bookingId).subscribe(
      (res: any) => this.successHandler(res),
      (err: any) => this.handleError(err)
    );
  }

  private getOnlineConcern() {
    this.loading = true;
    this.medicalHistoryService.getOnlineConcern(this.bookingId).subscribe(
      (res: any) => {
        this.onlineConcernsuccessHandler(res);
      },
      (err: any) => this.handleError(err)
    );
  }

  private handleError(error: any) {
    this.loading = false;
    let errorJson = error;
    let ERROR_MESSAGE =
      errorJson.detail || "Some Error Occurred, Please Try Again Later";
    this.toaster.showError(this.vcr, ERROR_MESSAGE, "Error Occurred");
  }

  private successHandler(res: any) {
    this.loading = false;
    this.onlineConcerns = _.get(JSON.parse(res._body), "data", []);
    this.prescriptionFor = _.get(
      this.onlineConcerns,
      "[0].prescriptionFor",
      {}
    );
  }

  private onlineConcernsuccessHandler(res: any) {
    this.loading = false;
    this.myPresciptions = _.get(JSON.parse(res._body), "data", []);
  }
}
