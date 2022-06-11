/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { ToasterService } from "./../../../../../../utils/service/toaster.service";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewContainerRef,
} from "@angular/core";
import { MedicalReportService } from "./medical-report.service";
import { ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { FormBuilder } from "@angular/forms";
import { environment } from "../../../../../../../environments/environment";
import { TranslaterService } from "../../../../../../utils/service/translater.service";

@Component({
  selector: "app-medical-report",
  templateUrl: "./medical-report.component.html",
  styleUrls: ["./medical-report.component.scss"],
})
export class MedicalReportComponent implements OnInit {
  @Output() closePanel = new EventEmitter();
  bookingId: number;
  public medicalReportData: Array<any> = [];
  public loading: boolean = false;
  public medicalReportFor: any = {};
  countryCode = environment.countryCode;
  public count = 0;
  public selectedIndex: number = 0;
  public myEducationalVideos: any;
  public mySharedEducationalVideos: any;

  constructor(
    private medicalReportService: MedicalReportService,
    private toaster: ToasterService,
    private vcr: ViewContainerRef,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.bookingId = Number(params["bookingId"]);
      this.getSharedEducationalVideos();
      this.getEducationalVideos();
    });
    this.translater.TranslationAsPerSelection();
  }

  getEducationalVideos() {
    this.loading = true;
    this.medicalReportService
      .getEducationalVideos(this.bookingId, false)
      .subscribe(
        (res: any) => {
          this.myEducationalVideos = _.get(JSON.parse(res._body), "data", []);
          this.loading = false;
        },
        (err: any) => this.handleError(err)
      );
  }

  getSharedEducationalVideos() {
    this.loading = true;
    this.medicalReportService
      .getSharedEducationalVideos(this.bookingId, true)
      .subscribe(
        (res: any) => {
          this.mySharedEducationalVideos = _.get(
            JSON.parse(res._body),
            "data",
            []
          );
          this.loading = false;
        },
        (err: any) => this.handleError(err)
      );
  }

  public closeReportPage() {
    this.closePanel.emit();
  }

  private handleError(error: any) {
    this.loading = false;
    let errorJson = error.json();
    let ERROR_MESSAGE =
      errorJson.detail || "Some Error Occurred, Please Try Again Later";
    this.toaster.showError(this.vcr, ERROR_MESSAGE, "Error Occurred");
  }

  private handlerSuccess(res: any) {
    this.loading = false;
    this.medicalReportData = _.get(JSON.parse(res._body), "data", []);
    this.medicalReportFor = _.get(this.medicalReportData, "[0].reportFor", {});
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedIndex = tabChangeEvent.index;
  }

  onShare(id) {
    this.loading = true;
    const bodyObj = {
      bookingId: this.bookingId,
      linkId: id,
    };
    this.medicalReportService.postSharedVideos(bodyObj).subscribe(
      (res: any) => {
        this.loading = false;
        let message = _.get(JSON.parse(res._body), "message", []);
        this.toaster.showSuccess(this.vcr, message, "SUCCESS");
        this.getSharedEducationalVideos();
        this.getEducationalVideos();
      },
      (err: any) => {
        this.loading = false;
        let errorJson = err ? err._body : "Error";
        let ERROR_MESSAGE =
          errorJson.detail || "Some Error Occurred, Please Try Again Later";
        this.toaster.showError(this.vcr, ERROR_MESSAGE, "Error Occurred");
      }
    );
  }
}
