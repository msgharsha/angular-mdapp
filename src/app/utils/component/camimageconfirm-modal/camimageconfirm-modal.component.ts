
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../service/translater.service";

@Component({
  templateUrl: "./camimageconfirm-modal.component.html",
  styleUrls: ["./camimageconfirm-modal.component.scss"],
})
export class CamImageConfirmComponent implements OnInit {
  params = {};
  constructor(
    private dialogRef: MatDialogRef<CamImageConfirmComponent>,
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

}
