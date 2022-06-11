/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { ToasterService } from "./../../../utils/service/toaster.service";
import {
  Component,
  OnInit,
  ViewContainerRef,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { TranslaterService } from "../../../utils/service/translater.service";

@Component({
  selector: "app-upload-prescription",
  templateUrl: "upload-prescription.component.html",
  styleUrls: ["upload-prescription.component.scss"],
})
export class UploadPrescriptionComponent implements OnInit {
  prescriptionForm: FormGroup;
  formSubmitted: boolean;
  isDisableSave;
  pdfUploadingFlag;
  @Input() bookingId;
  @Output() showDiagnosis = new EventEmitter();
  @Output() onDiscard = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private _toastService: ToasterService,
    private vcr: ViewContainerRef,
    private localStr: LocalStorageService,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.prescriptionForm.valueChanges.subscribe((value) => {
      this.localStr.setItem("prescription", {
        ...value,
        bookingId: this.bookingId,
      });
    });
    this.translater.TranslationAsPerSelection();
  }

  hasError(type, path) {
    return this.formSubmitted && this.prescriptionForm.hasError(type, [path]);
  }

  initializeForm() {
    this.prescriptionForm = this.formBuilder.group({
      prescriptionTitle: [null, Validators.required],
      prescriptionUrl: [null, Validators.required],
      bookingId: [this.bookingId, Validators.required],
    });
    let savedPrescription = this.localStr.getItem("prescription");
    if (savedPrescription && savedPrescription.bookingId == this.bookingId) {
      this.prescriptionForm.setValue(savedPrescription);
    }
  }

  saveButtonEnablity(value) {
    this.isDisableSave = value;
  }

  /**
   * Function to detect pdf upload event
   */
  pdfUploading(status) {
    this.pdfUploadingFlag = status;
  }

  proceedFurther() {
    this.formSubmitted = true;
    let value = { ...this.prescriptionForm.value };
    if (this.prescriptionForm.invalid) {
      this._toastService.showError(
        this.vcr,
        "Please fill all the required fields to proceed",
        "Incomplete Form"
      );
      return;
    }
    this.showDiagnosis.emit({
      ...value,
      prescriptionUrl: value.prescriptionUrl.url,
    });
  }

  discardCrntPrescriptionMethod() {
    this.onDiscard.emit();
  }
}
