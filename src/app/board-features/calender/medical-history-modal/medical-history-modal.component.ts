/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-medical-history-modal",
  templateUrl: "./medical-history-modal.component.html",
  styleUrls: ["./medical-history-modal.component.scss"],
})
export class MedicalHistoryModalComponent implements OnInit {
  public patientUserId: any;
  public bookingId: any;
  constructor(
    private dialogRef: MatDialogRef<MedicalHistoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public medicalHistoryData: any
  ) {}

  ngOnInit(): void {
    this.patientUserId = this.medicalHistoryData.patientUserId;
    this.bookingId = this.medicalHistoryData.bookingId;
  }
  
  medicalDialogClose(event){
    if(event == 'close'){
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
