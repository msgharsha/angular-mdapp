

import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../service/translater.service";

@Component({
  templateUrl: "./timezone-modal.component.html",
  styleUrls: ["./timezone-modal.component.scss"],
})
export class TimezoneModalComponent implements OnInit {
  params = {};
  constructor(
    private dialogRef: MatDialogRef<TimezoneModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translater: TranslaterService
  ) {
    if (data) {
      this.params = data;
      console.log(this.params);
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
}
