/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../service/translater.service";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-term-and-condition",
  templateUrl: "./term-and-condition.component.html",
  styleUrls: ["./term-and-condition.component.scss"],
})
export class TermAndConditionComponent implements OnInit {
  params = {};
  constructor(
    private dialogRef: MatDialogRef<TermAndConditionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translater: TranslaterService,
    public sanitizer: DomSanitizer
  ) {
    if (data) {
      this.params = data.params;
    }
  }

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
  }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  close() {
    this.dialogRef.close(null);
  }
}
