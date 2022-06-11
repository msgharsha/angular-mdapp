/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject } from "@angular/core";
import { TranslaterService } from "../../utils/service/translater.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as moment from "moment";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../utils/service/localStorage.service";

@Component({
  selector: "app-booked-appointment-dialog",
  templateUrl: "./booked-appointment-dialog.component.html",
  styleUrls: ["./booked-appointment-dialog.component.scss"],
})
export class BookedAppointmentDialogComponent implements OnInit {
  details: any;
  lang: string = "en";

  constructor(
    private dialogRef: MatDialogRef<BookedAppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translater: TranslaterService,
    private translate: TranslateService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.details = this.data;
    this.translater.TranslationAsPerSelection();
    this.lang = this.localStorageService.getItem("language");

    this.translate.onLangChange.subscribe(() => {
      this.lang = this.localStorageService.getItem("language");
    });
  }

  confirm() {
    this.dialogRef.close(true);
  }

  getDate(startTime) {
    return moment(new Date(startTime))
      .locale(this.lang)
      .format("ddd, MMM D [at] h:mm a");
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
