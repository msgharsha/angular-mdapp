/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { PrescriptionService } from "../../utils/service/presciption.sevice";
import { ToasterService } from "../../utils/service/toaster.service";
import {
  Component,
  OnInit,
  ViewContainerRef,
  Output,
  EventEmitter,
  Optional,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { MatDialog } from "@angular/material/dialog";
import { PrescriptionItem } from "./prescription.model";
import { ErrorService } from "../../utils/service/error.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { SessionManager } from "../../utils/component/open-tok-call/session-manager.service";
import { TranslaterService } from "../../utils/service/translater.service";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { DrugModalComponent } from "../prescribe-medicines/drug-modal/drug-modal.component"
import { DetailedPrescriptionComponent } from "./detailedprescriptionmodel.component"

@Component({
  selector: "prescribe-medicines",
  templateUrl: "prescribe-medicines.component.html",
  styleUrls: ["prescribe-medicines.component.scss"],
})
export class PrescribeMedicinesComponent implements OnInit {
  public isProceed = false;
  public backButton = true;

  private prescriptionForm: FormGroup;
  private prescriptionFormArray: FormArray;
  private isOpen: boolean;
  showSavedPrescription: boolean;
  private updateFormAtIndex?: number;
  private medicationTypes: Array<any> = [];
  private bookingId: number;
  private timeAndQuanitiyState: Array<boolean>;
  showDiagnosis = false;
  isFromPending = false;
  public medicinesCount;
  private prescriptionId;
  public diagnosis: Array<string> = ["", "", ""];
  @Output() toggleOpen = new EventEmitter();
  @Output() onDiscard = new EventEmitter();
  @Output() onSave = new EventEmitter();

  medicineList = [];
  selectedMedicine = [];
  selectedMedicineIDs = {};
  currentPage = 0;
  itemsPerPage = 10;
  searchValue = "";
  prescriptionData: any = {};
  prescriptionFound = false;
  allPrescriptionData: any;

  constructor(
    private formBuilder: FormBuilder,
    private prescriptionService: PrescriptionService,
    private route: ActivatedRoute,
    private errorHandler: ErrorService,
    private matDialog: MatDialog,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private localStr: LocalStorageService,
    private translater: TranslaterService,
    @Optional() private sessionManager: SessionManager,
    private translate: TranslateService,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      this.bookingId = Number(params["bookingId"]);
      this.isFromPending = params["isFromPending"] === "true" ? true : false;
    });
    this.getMedicineList();
    this.getPrescriptionData();
  }

  ngOnInit() {
    this.isOpen = false;
    this.displaySavedPrescription(true);
    this.updateFormAtIndex = null;
    this.prescriptionFormArray = this.formBuilder.array([]);
    this.timeAndQuanitiyState = [false, false, false];
    this.initializePrescriptionForm();
    this.prescriptionService.getFormulation().subscribe(
      (response) => {
        // this.medicationTypes = response.json().data.medicationType;
        this.onFormulationClick(0);
        this.medicineform();
      },
      (error) => {
        this.errorHandler.handleError(error, this.vref);
      }
    );

    this.prescriptionService.getPrescriptionById(this.bookingId).subscribe(
      (response) => {
        // let prescription: Prescription = response.json().data[0];
        // if (prescription.prescriptionItem[0].id) {
        //   const prescriptionData: Array<PrescriptionItem> = this.prescriptionService.transformPrescriptionAfterGet(response);
        //   const transformedPrescriptionFormArray = this.initializePrescriptionFormArray(prescriptionData);
        //   transformedPrescriptionFormArray.forEach((e) => {
        //     this.prescriptionFormArray.push(e);
        //   });
        // }
        // this.prescriptionId = prescription.prescriptionId;
        // this.diagnosis[0] = prescription.presentComplaints;
        // this.diagnosis[1] = prescription.findings;
        // this.diagnosis[2] = prescription.diagnosis;
      },
      (error) => {
        // this.errorHandler.handleError(error, this.vref);
      }
    );

    if (!this.prescriptionId) {
      this.prescriptionService.loadMedicineDataLocal();
    }
    this.translater.TranslationAsPerSelection();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      let url = this.router.url.split("/");
      if (url[url.length - 2] == "appointment") {
        this.getMedicineList();
      }
    });
  }

  getMedicineList() {
    let params = {
      ...(this.searchValue ? { search: this.searchValue } : {}),
      limit: this.itemsPerPage,
      skip: this.itemsPerPage * this.currentPage,
    };
    this.prescriptionService.getMedicineList(params).subscribe((res) => {
      if (this.currentPage == 0) {
        this.medicineList = res.data ? res.data.medicine : [];
      } else {
        this.medicineList = [
          ...this.medicineList,
          ...(res.data ? res.data.medicine : []),
        ];
      }
    });
  }

  getPrescriptionData(fromList?) {
    if (fromList) {
      this.addPrescription();
    }
    this.prescriptionService
      .getPrescriptionData(this.bookingId)
      .subscribe((res) => {
        this.allPrescriptionData = res.data;
        if(this.allPrescriptionData && this.allPrescriptionData.length == 0){
          this.prescriptionFound = true;
        }
        // if (this.prescriptionData && this.prescriptionData.prescriptionId) {
        //   this.prescriptionFound = true;
        //   this.prescriptionData.medicine.forEach((item) => {
        //     this.selectedMedicine.push({ ...item, id: item.medicineId });
        //     this.selectedMedicineIDs[item.medicineId] = true;
        //   });
        // }
      });
  }

  viewPrescription(prescriptionId){
    this.selectedMedicine = [];
      this.selectedMedicineIDs = {};
    this.prescriptionData = _.find(this.allPrescriptionData, {prescriptionId});
    console.log(this.prescriptionData)
    if (this.prescriptionData && this.prescriptionData['prescriptionId']) {
      this.prescriptionFound = true;
      this.isProceed =false;
      this.prescriptionData['medicine'].forEach((item) => {
        this.selectedMedicine.push({ ...item, id: item.medicineId });
        this.selectedMedicineIDs[item.medicineId] = true;
      });
    }
  }

  addPrescription(){
    this.prescriptionData = {};
    this.selectedMedicine = [];
    this.selectedMedicineIDs = {};
    this.prescriptionFound = true;
    this.isProceed =false;
  }

  transform(value: string) {
    let first = value.substr(0, 1).toUpperCase();
    return first + value.substr(1);
  }

  onMedicineSelect(medicine) {
    let selected = this.selectedMedicine.findIndex(
      (item) => item.id == medicine.id
    );
    if (selected > -1) {
      this.selectedMedicine.splice(selected, 1);
      delete this.selectedMedicineIDs[medicine.id];
    } else {
      this.selectedMedicine.push(medicine);
      this.selectedMedicineIDs[medicine.id] = true;
    }
  }

  onSearch(event) {
    this.currentPage = 0;
    this.searchValue = event.target.value;
    const searches = _.debounce(this.getMedicineList.bind(this), 500);
    searches();
  }

  onScroll(event) {
    this.currentPage++;
    this.getMedicineList();
  }

  initializePrescriptionFormArray(prescriptionArray: Array<PrescriptionItem>) {
    return prescriptionArray.map((e) => {
      const formObject = this.formBuilder.group({
        id: [],
        name: [null, Validators.required],
        notes: [""],
        medicationTimeAndQuantity: this.formBuilder.array([
          this.formBuilder.group({
            time: [null],
            quantity: [null],
          }),
          this.formBuilder.group({
            time: [null],
            quantity: [null],
          }),
          this.formBuilder.group({
            time: [null],
            quantity: [null],
          }),
        ]),
        medicationTypeId: [null, Validators.required],
      });
      formObject.setValue(e);
      return formObject;
    });
  }

  initializePrescriptionForm(prescribedForm?: Object) {
    this.prescriptionForm = this.formBuilder.group({
      id: [],
      name: [null, Validators.required],
      notes: [""],
      medicationTimeAndQuantity: this.formBuilder.array([
        this.formBuilder.group({
          time: [null],
          quantity: [null],
        }),
        this.formBuilder.group({
          time: [null],
          quantity: [null],
        }),
        this.formBuilder.group({
          time: [null],
          quantity: [null],
        }),
      ]),
      medicationTypeId: [1, Validators.required],
    });

    if (prescribedForm) {
      this.prescriptionForm.setValue(prescribedForm);
    }
  }

  get formControl() {
    return {
      name: this.prescriptionForm.get("name"),
      quantity: this.prescriptionForm.get("quantity"),
      notes: this.prescriptionForm.get("notes"),
      time: this.prescriptionForm.get("time"),
      medicationTimeAndQuantity: this.prescriptionForm.get(
        "medicationTimeAndQuantity"
      ),
      medicationTypeId: this.prescriptionForm.get("medicationTypeId"),
    };
  }

  get prescriptionFormArrayValue() {
    return this.prescriptionFormArray.value;
  }

  hasError(formControlName: string) {
    let formControl = this.prescriptionForm.get(formControlName);
    return formControl.invalid && (formControl.dirty || formControl.touched);
  }

  removeFormControl(name: string) {
    this.prescriptionForm.removeControl(name);
  }

  onFormulationClick(medicationNumber) {
    if (this.medicationTypes[medicationNumber])
      this.prescriptionForm.controls["medicationTypeId"].setValue(
        this.medicationTypes[medicationNumber].id
      );
  }

  isFormulationActive(medicationNumber) {
    if (
      !(
        this.medicationTypes &&
        this.medicationTypes[medicationNumber] &&
        this.medicationTypes[medicationNumber].id
      )
    ) {
      return false;
    }
    return (
      this.prescriptionForm.controls["medicationTypeId"].value ===
      this.medicationTypes[medicationNumber].id
    );
  }

  cancel() {
    this.displaySavedPrescription(true);
    this.prescriptionForm.reset();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleOpen.emit({ isOpen: this.isOpen });
  }

  displaySavedPrescription(show: boolean) {
    this.showSavedPrescription = show;
  }

  openPrescribedForm(prescribedForm: Object, index: number) {
    this.updateFormAtIndex = index;
    this.initializePrescriptionForm(prescribedForm);
    this.displaySavedPrescription(false);
  }

  addNewPrescriptionItem() {
    this.prescriptionForm.controls["medicationTypeId"].setValue(1);
    this.updateFormAtIndex = null;
    this.displaySavedPrescription(false);
    this.showDiagnosis = false;
  }

  deletePrescribedForm(index: number, prescription: Object) {
    if (!this.prescriptionId) {
      this.prescriptionFormArray.removeAt(index);
      this.prescriptionService.deleteMedicineData(index);
    } else {
      return this.prescriptionService
        .deleteSingleMedicine(prescription, this.bookingId)
        .subscribe(
          () => {
            this.prescriptionFormArray.removeAt(index);
          },
          (error) => {
            this.errorHandler.handleError(error, this.vref);
          }
        );
    }
  }

  toggleMedicationTimeAndQuantity(index: number) {
    this.timeAndQuanitiyState[index] = !this.timeAndQuanitiyState[index];
  }

  showDiagnosisPage() {
    this.showSavedPrescription = false;
    this.showDiagnosis = true;
    if (!this.prescriptionId && this.diagnosis) {
      // tslint:disable-next-line: max-line-length
      this.medicinesCount = _.chain(this.prescriptionService.getMedicineData())
        .groupBy("medicationTypeId")
        .map((medicine, medicationTypeId) => ({
          medicine,
          type: this.medicationTypes[+medicationTypeId - 1].name,
        }))
        .value();
      this.diagnosis = this.prescriptionService.getDiagnosis();
    } else {
      this.medicinesCount = _.chain(this.prescriptionFormArray.value)
        .groupBy("medicationTypeId")
        .map((medicine, medicationTypeId) => ({
          medicine,
          type: this.medicationTypes[+medicationTypeId - 1].name,
        }))
        .value();
    }
  }

  closeDiagnosis() {
    this.showSavedPrescription = true;
    this.showDiagnosis = false;
    if (!this.prescriptionId) {
      this.prescriptionService.saveDiagnosis(this.diagnosis);
    }
  }

  addNewPrescription() {
    this.showSavedPrescription = true;
    this.showDiagnosis = false;
    if (!this.prescriptionId) {
      this.prescriptionService
        .saveCompletePrescription(this.diagnosis, this.bookingId)
        .subscribe(
          (prescriptionData) => {
            if (this.sessionManager)
              this.sessionManager.sendSignal(
                { bookingId: this.bookingId },
                () => {
                  this.toaster.showSuccess(
                    this.vref,
                    "Notified to the patient.",
                    "Prescription saved."
                  );
                },
                () => {
                  this.toaster.showSuccess(
                    this.vref,
                    "Prescription saved.",
                    "Success"
                  );
                }
              );
            this.prescriptionId = prescriptionData.json().data.prescriptionId.id;
            const itemsData = prescriptionData.json().data.itemsId;
            itemsData.forEach((item, i) => {
              this.prescriptionFormArray.value[i].id = item.id;
            });
            this.onSave.emit(this.prescriptionId);
            this.localStr.removeItem("medicine");
            this.localStr.removeItem("diagnosis");
          },
          (err) => {
            this.errorHandler.handleError(err, this.vref);
          }
        );
    } else {
      this.prescriptionService
        .updatePrescription(this.diagnosis, this.prescriptionId, this.bookingId)
        .subscribe(
          (response) => {
            if (this.sessionManager)
              this.sessionManager.sendSignal(
                { bookingId: this.bookingId },
                () => {
                  this.toaster.showSuccess(
                    this.vref,
                    "Notified to the patient.",
                    "Prescription saved."
                  );
                },
                () => {
                  this.toaster.showSuccess(
                    this.vref,
                    "Prescription saved.",
                    "Success"
                  );
                }
              );
          },
          (err) => {
            this.errorHandler.handleError(err, this.vref);
          }
        );
    }
  }

  storeMedicineData() {
    let flag = false;
    if (this.prescriptionForm.invalid) {
      this.toaster.showError(this.vref, "", "Fill in the required details");
      return;
    }
    this.prescriptionForm.value.medicationTimeAndQuantity.map((e) => {
      if ((e.time && !e.quantity) || (e.quantity && !e.time)) {
        flag = true;
        this.toaster.showError(this.vref, "", "Fill in the required details");
      }
    });
    if (flag) {
      return;
    }
    if (this.updateFormAtIndex !== null) {
      if (!this.prescriptionId) {
        this.prescriptionService.updateMedicineData(
          this.updateFormAtIndex,
          this.prescriptionForm.value,
          this.bookingId
        );
        this.prescriptionFormArray.controls[this.updateFormAtIndex].setValue(
          this.prescriptionForm.value
        );
        this.prescriptionFormArray[
          this.updateFormAtIndex
        ] = this.prescriptionForm;
        this.initializePrescriptionForm();
      } else {
        this.prescriptionService
          .updateSingleMedicine(
            this.prescriptionForm.value,
            this.bookingId,
            this.prescriptionId
          )
          .subscribe((response) => {
            this.prescriptionFormArray.controls[
              this.updateFormAtIndex
            ].setValue(this.prescriptionForm.value);
            this.prescriptionFormArray[
              this.updateFormAtIndex
            ] = this.prescriptionForm;
            this.initializePrescriptionForm();
          });
      }
    } else {
      if (!this.prescriptionId) {
        this.prescriptionService.storeLocalData(
          this.prescriptionForm.value,
          this.bookingId
        );
        this.prescriptionFormArray.push(this.prescriptionForm);
        this.initializePrescriptionForm();
      } else {
        this.prescriptionService
          .addSingleMedicine(
            this.prescriptionForm.value,
            this.bookingId,
            this.prescriptionId
          )
          .subscribe((item) => {
            const itemId = item.json().data.item[0].id;
            this.prescriptionForm.patchValue({ id: itemId });
            this.prescriptionFormArray.push(this.prescriptionForm);
            this.initializePrescriptionForm();
          });
      }
    }
    this.showSavedPrescription = true;
    this.showDiagnosis = false;
  }

  medicineform() {
    const medicineData = this.prescriptionService.getMedicineData();
    const transformedPrescriptionFormArray = this.initializePrescriptionFormArray(
      medicineData
    );
    transformedPrescriptionFormArray.forEach((e) => {
      this.prescriptionFormArray.push(e);
    });
    this.medicinesCount = _.chain(medicineData)
      .groupBy("medicationTypeId")
      .map((medicine, medicationTypeId) => ({
        medicine,
        type: this.medicationTypes[+medicationTypeId - 1].name,
      }))
      .value();
  }

  discardCrntPrescriptionMethod(e) {
    this.onDiscard.emit(e);
  }

  save() {
    this.isProceed = !this.isProceed;
  }

 
  addDrug() {
    const dialogRef = this.matDialog.open(DrugModalComponent, {
      height: "auto",
      width: "653px",
    });
    dialogRef.afterClosed().subscribe((bodyObj) => {
      if (typeof bodyObj == "object") {
        this.initiateAddDrugDetails(bodyObj);
      }
    });
  }

  initiateAddDrugDetails(bodyObj: any) {
    console.log(bodyObj);
    this.prescriptionService.addDrug(bodyObj).subscribe(
      (res) => {
        if (res.success) {
          this.toaster.showSuccess(this.vref, "Success", "DRUG_ADDED");
          this.getMedicineList();
        } else {
          this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
        }
      },
      (err) => {
        this.toaster.showError(
          this.vref,
          "Error Occurred",
          err.error.message || "ERROR_OCCURED"
        );
      }
    );
  }

  detailedPrescriptions(){
    this.matDialog
      .open(DetailedPrescriptionComponent, {
        height: "700px",
        width: "1000px",
        data: {
        
        },
      })
      .afterClosed()
      .subscribe((res) => {});
  }
}
