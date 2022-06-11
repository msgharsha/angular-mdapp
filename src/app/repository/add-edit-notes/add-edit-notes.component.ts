/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { environment } from "../../../../src/environments/environment";
import { common } from "../../../../src/app/constants/common";
import { FIELD_LENGTH } from "../constant";
@Component({
  selector: "app-add-edit-notes",
  templateUrl: "./add-edit-notes.component.html",
  styleUrls: ["./add-edit-notes.component.scss"],
})
export class AddEditNotesComponent implements OnInit {
  notesForm: FormGroup;
  public formSubmitted: boolean;
  public editorApiKey = environment.editorApiKey;
  public editorConfig = common.editorConifg;
  public maxNoteTitleLength = FIELD_LENGTH.maxNoteTitleLen;
  public contentLength = FIELD_LENGTH.contentLength;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditNotesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }
  initializeForm() {
    this.notesForm = this.fb.group({
      template_name: [
        null,
        [
          Validators.required,
          Validators.maxLength(FIELD_LENGTH.maxNoteTitleLen),
        ],
      ],
      description: [null, [Validators.required]],
    });
    if (this.data) {
      this.fillForm();
    }
  }

  fillForm() {
    this.notesForm.controls["template_name"].patchValue(
      this.data[0].templateName
    );
    this.notesForm.controls["description"].patchValue(this.data[0].content);
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.notesForm.hasError(type, [key]);
  }

  saveForm() {
    this.formSubmitted = true;
    if (!this.notesForm.valid) {
      return false;
    }

    let body = {
      templateName: this.notesForm.value.template_name,
      content: this.notesForm.value.description,
    };
    this.dialogRef.close(body);
  }

  onReset() {
    this.dialogRef.close();
  }
}
