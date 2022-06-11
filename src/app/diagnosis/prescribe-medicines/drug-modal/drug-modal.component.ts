/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslaterService } from "../../../utils/service/translater.service";

@Component({
  selector: "app-drug-modal",
  templateUrl: "./drug-modal.component.html",
  styleUrls: ["./drug-modal.component.scss"],
})
export class DrugModalComponent implements OnInit {
  public drugForm: FormGroup;
  public formSubmitted: boolean;

  constructor(
    private dialogRef: MatDialogRef<DrugModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translator: TranslaterService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.translator.TranslationAsPerSelection();
    this.initializeForm();
  }

  initializeForm() {
    this.drugForm = this.fb.group({
      drugEng: ["", [Validators.required]],
      drugFrench: ["", [Validators.required]],
    });
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.drugForm.hasError(type, [key]);
  }

  drugAdd() {
    this.formSubmitted = true;
    if (this.drugForm.invalid) {
      return false;
    }
    let drug = [
      {
        french_values: this.drugForm.controls.drugFrench.value,
        english_values: this.drugForm.controls.drugEng.value,
      },
    ];
    if (this.data) {
      this.dialogRef.close(drug[0]);
    } else {
      this.dialogRef.close({ drug });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
