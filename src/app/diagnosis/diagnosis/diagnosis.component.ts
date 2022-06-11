/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, ViewContainerRef } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { PrescriptionService } from "./../../utils/service/presciption.sevice";
import { ToasterService } from "./../../utils/service/toaster.service";
import { TranslaterService } from "../../utils/service/translater.service";

@Component({
  selector: "app-diagnosis",
  templateUrl: "diagnosis.component.html",
  styleUrls: ["diagnosis.component.scss"],
})
export class DiagnosisComponent {
  public isProceed = false;
  // diagnosisForm: FormGroup;
  // formSubmitted: boolean;
  // defaultDiagnosisState: Diagnosis = {
  //   presentComplaints: ' ',
  //   findings: '',
  //   diagnosis: ''
  // };
  // @Input() bookingId;

  // @Output("saveEvent") saveEvent: EventEmitter<any> = new EventEmitter();
  // @Output("backEvent") backEvent: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private prescriptionService: PrescriptionService,
    private _toastService: ToasterService,
    private vcr: ViewContainerRef,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    // let defaultStateWithBooking = {...this.defaultDiagnosisState, bookingId: this.bookingId};
    // this.diagnosisForm = this.formBuilder.group(defaultStateWithBooking);
    // let savedDiagnosis = this.prescriptionService.getDiagnosis(defaultStateWithBooking);

    // if (this.bookingId === savedDiagnosis.bookingId)this.diagnosisForm.setValue(savedDiagnosis);
    // this.diagnosisForm.valueChanges.subscribe((value)=> {
    //   this.prescriptionService.saveDiagnosis({...value})
    // })
    this.translater.TranslationAsPerSelection();
  }

  save() {
    // this.formSubmitted = true;
    // if (this.diagnosisForm.invalid) {
    //   this._toastService.showError(this.vcr, "Please fill all the required fields to proceed", "Incomplete Form");
    //   return
    // }
    // this.saveEvent.emit(this.diagnosisForm.value);
    this.isProceed = !this.isProceed;
  }

  closeDiagnosis() {
    // this.backEvent.emit(true)
  }
}
