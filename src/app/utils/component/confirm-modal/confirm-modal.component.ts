
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../service/translater.service";

@Component({
  templateUrl: "./confirm-modal.component.html",
  styleUrls: ["./confirm-modal.component.scss"],
})
export class AlertModalComponent implements OnInit {
  params = {};
  constructor(
    private dialogRef: MatDialogRef<AlertModalComponent>,
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
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}
