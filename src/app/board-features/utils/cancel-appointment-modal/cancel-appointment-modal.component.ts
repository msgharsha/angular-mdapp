/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AppointmentService } from "../../appointments/appointments.service";
import * as _ from "lodash";

@Component({
  selector: "app-cancel-appointment-modal",
  templateUrl: "cancel-appointment-modal.component.html",
  styleUrls: ["cancel-appointment-modal.component.scss"],
})
export class CancelAppointmentModalComponent {
  formSubmitted: boolean;

  constructor(
    private dialogRef: MatDialogRef<CancelAppointmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService
  ) {}

  confirm() {
    this.formSubmitted = true;
    let body;
    if (!Array.isArray(this.data.appointmentId)) {
      body = {
        appointmentIds: [_.toNumber(this.data.appointmentId)],
      };
    } else {
      body = {
        appointmentIds: this.data.appointmentId,
      };
    }
    this.appointmentService.cancelAppointment(body).subscribe(
      (response) => {
        this.dialogRef.close(response);
      },
      (err) => {
        this.dialogRef.close(JSON.parse(err._body));
      }
    );
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
