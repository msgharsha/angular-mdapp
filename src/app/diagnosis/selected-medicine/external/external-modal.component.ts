/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../../utils/service/translater.service";

@Component({
  templateUrl: "./external-modal.component.html",
  styleUrls: ["./external-modal.component.scss"],
})
export class ExternalDialogModalComponent implements OnInit {
  params = {};
  externalemail:any;
  constructor(
    private dialogRef: MatDialogRef<ExternalDialogModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translater: TranslaterService
  ) {
    if (data) {
      this.params = data.params;
    }
  }

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
  }

  confirm() {
    this.dialogRef.close(this.externalemail);
  }

  cancel() {
    this.dialogRef.close();
  }
}
