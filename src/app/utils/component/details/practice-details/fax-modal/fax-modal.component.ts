/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../../../service/translater.service";

@Component({
  selector: "app-fax-modal",
  templateUrl: "./fax-modal.component.html",
  styleUrls: ["./fax-modal.component.scss"],
})
export class FaxModalComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<FaxModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translater: TranslaterService
  ) {}

  ngOnInit(): void {}

  cancel() {
    this.dialogRef.close(false);
  }

  acceptTerm() {
    this.dialogRef.close(true);
  }
}
