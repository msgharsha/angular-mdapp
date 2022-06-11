/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

 import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewContainerRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToasterService } from "./../../utils/service/toaster.service";
import { ErrorService } from "./../../utils/service/error.service";
import { PrescriptionService } from "./../../utils/service/presciption.sevice";
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";
import { ExternalDialogModalComponent } from "./external/external-modal.component"
import { MatDialog } from "@angular/material/dialog";
import * as _ from "lodash";

@Component({
  selector: "app-selected-medicine",
  templateUrl: "./selected-medicine.component.html",
  styleUrls: ["./selected-medicine.component.scss"],
})
export class SelectedMedicineComponent implements OnInit, OnChanges {
  @Input() selectedMedicine = [];
  @Input() isFromPending;
  form: FormGroup;
  medicineTypeList = [];
  dosageTypeList = [];
  frequencyTypeList = [];
  durationTypeList = [];
  usageTypeList = [];
  usageFormatList = [];
  pharmacyList = [];
  bookingId = null;
  patientUserId = null;
  patientEmail = null;
  @Input() prescriptionData: any = {};
  @Output() onSuccess = new EventEmitter();
  @Output() onSaveFromList = new EventEmitter();
  prescriptionFound = false;
  isPrescriptionSend: boolean = false;
  isSaved = false;
  public formSubmitted: boolean = false;

  public isProceed = false;
  allPrescriptionData: any;
  externalEmail: any;
  saveStatus:boolean = false;
  sendPatientStatus:boolean = false;
  sendPharmacyStatus:boolean = false;
  sendExternalStatus:boolean = false;

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private route: ActivatedRoute,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private translate: TranslateService,
    private matDialog: MatDialog,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      this.bookingId = Number(params["bookingId"]);
      this.patientUserId = Number(params["patientUserId"]);
      this.patientEmail = params["patientEmail"];
    });
    this.initializeForm();
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      let url = this.router.url.split("/");
      if (url[url.length - 2] == "appointment") {
        this.getMedicineTypeList();
        this.getPharmacy();
      }
    });
    if (this.selectedMedicine.length) {
      this.getMedicineTypeList();
      this.getPharmacy();
    }
    this.getPrescriptionStatus();
  }

  getMedicineTypeList() {
    this.prescriptionService.getMedicineType().subscribe((res) => {
      this.medicineTypeList = res.data.Measure;
      this.frequencyTypeList = res.data.Frequency;
      this.durationTypeList = res.data.Duration;
      this.dosageTypeList = res.data.Dosage;
      this.usageTypeList = res.data['Usage Type'];
      this.usageFormatList = res.data['Usage Format'];
    });
  }

  getPharmacy() {
    this.prescriptionService
      .getPharmacy(this.patientUserId)
      .subscribe((res) => {
        this.pharmacyList = res.data;
        this.pharmacyList.forEach((pharmacy) => {
          if (pharmacy.isDefault) {
            this.form.controls["pharmacy"].setValue(pharmacy.id);
          }
        });
      });
  }

  getPrescriptionData() {
    if (this.prescriptionData && this.prescriptionData.prescriptionId) {
      this.prescriptionFound = true;
      this.isSaved = true;
      this.form.get("comments").patchValue(this.prescriptionData.comments);
      this.form.get("pharmacy").patchValue(this.prescriptionData.pharmacy.id);
      if (this.isFromPending) {
        this.form.disable();
      }
    }
  }

  getPrescriptionStatus(){
    if (this.prescriptionData && this.prescriptionData.prescriptionId) {
      this.prescriptionService
      .PrescriptionStatus(this.prescriptionData.prescriptionId)
      .subscribe(
        (res) => {
          let data = res.data[0]
          this.saveStatus = data.prescription_save;
          this.sendPatientStatus = data.sendtopatient;
          this.sendPharmacyStatus = data.sendtopharmacy;
          this.sendExternalStatus = data.sendtoexternal;
        },
        (error) => {
          this.errorHandler.handleError(error, this.vref);
        }
      );
    }
  }

  ngOnChanges(event) {
    if (event.selectedMedicine) {
      if (this.selectedMedicine && this.selectedMedicine.length) {
        let temp = this.fb.array([]);
        this.form.removeControl("medicine");
        this.form.addControl("medicine", temp);
        this.selectedMedicine.forEach((item) => {
          let group = this.getMedicineFormArray();
          group.get("medicineId").patchValue(item.id);
          group.get("medicineName").patchValue(item.medicineName);
          const prescribedData = (this.prescriptionData.medicine || []).filter(
            (element) => element.medicineId == item.id
          )[0];
          if (prescribedData) {
            group.patchValue(prescribedData);
          }
          temp.push(group);
          group.get("medicineTypeId").valueChanges.subscribe((value) => {
            let Item: any = this.medicineTypeList.filter((i) => i.id == +value);
            group.get("medicineTypeName").patchValue(Item[0].medicineType);
          });
          group.get("dosageId").valueChanges.subscribe((value) => {
            let Item: any = this.dosageTypeList.filter((i) => i.id == +value);
            group.get("dosageType").patchValue(Item[0].medicineType);
          });
          group.get("frequencyId").valueChanges.subscribe((value) => {
            let Item: any = this.frequencyTypeList.filter((i) => i.id == +value);
            group.get("frequency").patchValue(Item[0].medicineType);
          });
          group.get("durationId").valueChanges.subscribe((value) => {
            let Item: any = this.durationTypeList.filter((i) => i.id == +value);
            group.get("durationType").patchValue(Item[0].medicineType);
          });
          group.get("usageTypeId").valueChanges.subscribe((value) => {
            if (value == "") {
              group.get("usageType").patchValue(null);
              return
            }
            let Item: any = this.usageTypeList.filter((i) => i.id == +value);
            group.get("usageType").patchValue(Item[0].medicineType);
          });
          group.get("usageFormatId").valueChanges.subscribe((value) => {
            if (value == "") {
              group.get("usageFormat").patchValue(null);
              return
            }
            let Item: any = this.usageFormatList.filter((i) => i.id == +value);
            group.get("usageFormat").patchValue(Item[0].medicineType);
          });
        });
      }
    }

    if (event.prescriptionData) {
      this.getPrescriptionData();
    }
  }

  initializeForm() {
    this.form = this.fb.group({
      pharmacy: [""],
      comments: [null],
      medicine: this.fb.array([]),
    });
  }

  getMedicineFormArray() {
    return this.fb.group({
      medicineId: [null],
      medicineName: [null],
      medicineTypeId: [null, Validators.required],
      medicineTypeName: [null],
      dosageSchedule: [null, Validators.required],
      dosageId: [null, Validators.required],
      dosageType: [null],
      frequencyId: [null, Validators.required],
      frequency: [null],
      durationSchedule: [null, Validators.required],
      durationId: [null, Validators.required],
      durationType: [null],
      usageTypeId: [null],
      usageType: [null],
      usageSchedule: [null],
      usageFormatId: [null],
      usageFormat: [null],

    });
  }

  processBody(body) {
    body.medicine = body.medicine.map((item) => {
      item["medicineTypeId"] = +item["medicineTypeId"];
      return item;
    });
    return body;
  }




  onSave() {
    this.formSubmitted = true;
    let pharmacy = this.pharmacyList.find(
      (item) => item.id == +this.form.get("pharmacy").value
    );
    if (pharmacy && !pharmacy.email) {
      delete pharmacy.email;
    }

    if (this.form.valid) {
      let body = {
        ...this.form.getRawValue(),
        bookingId: this.bookingId,
        patientEmail: this.patientEmail,
        pharmacy: pharmacy,
        prescriptionId: this.prescriptionData.prescriptionId ? this.prescriptionData.prescriptionId : null
      };
      if (!pharmacy) {
        delete body["pharmacy"];
      }
      console.log(this.processBody(body));
      this.prescriptionService
        .savePrescriptionData(this.processBody(body))
        .subscribe(
          (res) => {
            this.getPrescriptionStatus();
            this.prescriptionFound = true;
            this.isSaved = true;
            // this.form.disable();
            this.onSaveFromList && this.onSaveFromList.emit();
            this.toaster.showSuccess(
              this.vref,
              "SUCCESS",
              "PRESCRIPTION_SAVED"
            );
          },
          (error) => {
            this.errorHandler.handleError(error, this.vref);
          }
        );
    }
  }

  sendToExternal(){
    const dialogRef = this.matDialog.open(ExternalDialogModalComponent, {
      height: "250px",
      width: "350px",
      
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.externalEmail = result;
        this.onSend('sendToExternal');
      }
    });
  }

  onSend(action) {
    this.formSubmitted = true;
    let pharmacy = this.pharmacyList.find(
      (item) => item.id == +this.form.get("pharmacy").value
    );
    if (pharmacy && !pharmacy.email) {
      delete pharmacy.email;
    }
    if(action == 'sendToPharmacy' && !pharmacy){
      this.toaster.showError(this.vref, "ERROR", "PLEASE_SELECT_PHARMACY");
      return;
    }

    if (this.form.valid) {
      let body = {
        ...this.form.getRawValue(),
        bookingId: this.bookingId,
        patientEmail: this.patientEmail,
        pharmacy: pharmacy,
        prescriptionId: this.prescriptionData.prescriptionId ? this.prescriptionData.prescriptionId : null
      };
      if (!pharmacy) {
        delete body["pharmacy"];
      }
      console.log(this.processBody(body));
      this.prescriptionService
        .savePrescriptionData(this.processBody(body))
        .subscribe(
          (res) => {
            this.prescriptionFound = true;
            this.isSaved = true;
            // this.form.disable();
            this.onSaveFromList && this.onSaveFromList.emit();

            this.prescriptionService.getPrescriptionData(this.bookingId).subscribe((res) => {
              this.allPrescriptionData = res.data;
              let prescId;
              if(this.prescriptionData.prescriptionId){
                let prescData =  this.allPrescriptionData.filter((i) => i.prescriptionId == this.prescriptionData.prescriptionId);
                prescId = prescData[0].prescriptionId;
              } else {
                prescId = Math.max(...this.allPrescriptionData.map(o => o.prescriptionId))
              }

              console.log(prescId);

              if(action == 'sendToPatient'){
                this.prescriptionService.sendPrescriptionDataToPatient(prescId.toString(), this.bookingId).subscribe(
                  (res) => {
                    if (res) {
                      this.prescriptionData.isPrescriptionSend = true;
                      this.form.disable();
                      this.onSuccess && this.onSuccess.emit();
                      this.toaster.showSuccess(this.vref, "SUCCESS", "PRESCRIPTION_SEND");
                    }
                  },
                  (error) => {
                    this.errorHandler.handleError(error, this.vref);
                  }
                );
              } else if(action == 'sendToPharmacy'){
                this.prescriptionService.sendPrescriptionDataToPharmacy(prescId.toString(), this.bookingId).subscribe(
                  (res) => {
                    if (res) {
                      this.prescriptionData.isPrescriptionSend = true;
                      this.form.disable();
                      this.onSuccess && this.onSuccess.emit();
                      this.toaster.showSuccess(this.vref, "SUCCESS", "PRESCRIPTION_SEND");
                    }
                  },
                  (error) => {
                    this.errorHandler.handleError(error, this.vref);
                  }
                );
              } else if(action == 'sendToExternal'){
                console.log(prescId.toString());
                console.log(this.bookingId);
                console.log(this.externalEmail);
                this.prescriptionService.sendPrescriptionDataToExternal(prescId.toString(), this.bookingId, this.externalEmail).subscribe(
                  (res) => {
                    if (res) {
                      this.prescriptionData.isPrescriptionSend = true;
                      this.form.disable();
                      this.onSuccess && this.onSuccess.emit();
                      this.toaster.showSuccess(this.vref, "SUCCESS", "PRESCRIPTION_SEND");
                    }
                  },
                  (error) => {
                    this.errorHandler.handleError(error, this.vref);
                  }
                );
              }
              this.getPrescriptionStatus();
            });
          },
          (error) => {
            this.errorHandler.handleError(error, this.vref);
          }
        );
    }
  }
}
