/**
 * 
 * Copyright 2009-2021 Ibaseit software solutions pvt ltd.
 * @author ibaseit
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'app-claim-model',
    templateUrl: "./claim-model.component.html",
})

export class ClaimModelComponent {

    params = {};

    patientId: number;
    bookingId: number;
    patientName: string;

    constructor(private dialogRef: MatDialogRef<ClaimModelComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        if (data) {
            this.params = data;
            this.bookingId = data?.consultation_info?.id;
            this.patientName = data?.consultation_info?.patient?.patientName;
            this.patientId = data?.consultation_info?.patient?.id;
        }
    }

    handleOnViewMessages(event) {
        this.dialogRef.close(event);
    }

}