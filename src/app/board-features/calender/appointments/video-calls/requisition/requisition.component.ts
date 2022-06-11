/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ElementRef,
  Input,
} from "@angular/core";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../../../src/app/utils/service/localStorage.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AppointmentService } from "../../appointments.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { RepositoryService } from "../../../../../repository/repository.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { MatDialog } from "@angular/material/dialog";
import { FileViwerComponent } from "../../../../../utils/component/file-viwer/file-viwer.component";
import { DetailedRequisitionComponent } from './detailedrequisitionmodel.component';
import { Values } from '../../../../../constants/values';
import { ManageAutoFormService } from '../../../../../manage-forms/manage-forms.service';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import * as _ from 'lodash';

@Component({
  selector: "app-requisition",
  templateUrl: "./requisition.component.html",
  styleUrls: ["./requisition.component.scss"],
})
export class RequisitionComponent implements OnInit {

  provinceType = Values.PROVINCE_FORM.province_id;
  pageInfo = {
    page: 1,
    limit: 1000,
    skip: 0,
  };

  fontIcons = [
    faFileDownload
];

  public fileUploading: boolean = false;
  public requistionForm: FormGroup;
  public requistionFormList: FormArray;
  public states = [];
  public testData = [];
  public formsList = [];
  public bookingId;
  public patientId;
  public selectedFormId;
  public isReadMode = false;
  public formSubmitted: boolean;
  public showNameError: boolean;
  public showFileError: boolean;
  public deleteImageSubscription;
  public isSend: boolean;
  public userData: {};
  public addressList: any;
  // public disableSend:boolean
  @Input() isFromPending;
  @Input() invitePatientStatus;
  isRequisitionSend = false;
  public isSaved: boolean;
  @ViewChild("file") redel: ElementRef;
  constructor(
    private translater: TranslaterService,
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private repositoryService: RepositoryService,
    private router: Router,
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private toaster: ToasterService,
    private vref: ViewContainerRef,
    private matDialog: MatDialog,
    private errorService: ErrorService,
    private manageAutoFormService: ManageAutoFormService
  ) { }

  ngOnInit(): void {
    this.localStorage.removeItem("test-data");
    this.translater.TranslationAsPerSelection();
    this.initializeForm();
    this.initializeFormArray();
    this.getAutomatedForms();
    this.userData = this.localStorage.getItem("userData") || {};
    this.route.queryParams.subscribe((params) => {
      this.bookingId = params["bookingId"];
      this.patientId = params.patientId;
    });
    this.getPreviousRequisitions();
    this.requistionForm.get("testName").valueChanges.subscribe((value) => {
      if (value != "") this.showNameError = false;
    });
    this.requistionForm.get("testUrl").valueChanges.subscribe((value) => {
      if (value != null) this.showFileError = false;
    });
    this.getLabAddress();
    if(this.invitePatientStatus) {
      this.requistionForm.get('lab').disable();
    } else {
      this.requistionForm.get('lab').enable();
    }

    // this.isSaved=this.localStorage.getItem('isSaved');
  }

  downloadFile(url) {
    window.open(url, "_blank");
  }

  changeSelectedFile(event) {
    this.selectedFormId = event.target.value;
  }

  printFile() {
    const findFileInfo = _.find(this.formsList, {id: parseInt(this.selectedFormId) });
    if (findFileInfo && findFileInfo.pdfPreviewUrl) {
        if (['XR-formulaire', 'Laboratories-requisition-Adult-patients'].includes(findFileInfo.name)) {
          const url = findFileInfo.url_path.split("/");
          let filename =
            url[url.length - 3] + "/" + url[url.length - 2] + "/" + url[url.length - 1];
          window.open('/form-editor?imageUrl='+ filename+`&name=${findFileInfo.name}&bookingId=${this.bookingId}`);
        } else {
          window.open(findFileInfo.pdfPreviewUrl, "_blank");
        }
    }
  }

  viewFile(url) {
    this.matDialog
      .open(FileViwerComponent, { data: url })
      .afterClosed()
      .subscribe(() => { });
  }

  getAutomatedForms() {
    const requestObject = {
        provice_id: this.provinceType,
        formType: JSON.stringify([ Values.PROVINCE_FORM.formTypes[2]]),
        current_page: this.pageInfo.page,
        page_limit: this.pageInfo.limit
    };
    this.manageAutoFormService.getAutomatedForms(requestObject).subscribe((res) => {
        res.data.forEach((element, index) => {
            if (element.url_path && element.url_path !== '') {
               const getBaseUrl = this.manageAutoFormService.previewFileInfo(element.name, element.url_path, 'doc');
                res.data[index].pdfPreviewUrl = getBaseUrl;   
            }
        });
       this.formsList = res.data;
    });
  };

  getLabAddress() {
    this.repositoryService.getLabDetails(this.userData["doctorId"]).subscribe((res) => {
      if (res) {
        this.addressList = res.data.addressBok;
        console.log(this.addressList);
      }
    });
  }

  initializeForm() {
    this.requistionForm = this.fb.group({
      testName: ["", [Validators.required]],
      testUrl: ["", [Validators.required]],
      remarks: ["", [Validators.maxLength(150)]],
      lab: [""],
    });
  }

  initializeFormArray() {
    this.requistionFormList = this.fb.array([]);
  }

  getFormArrayRow() {
    return this.fb.group({
      testName: ["", [Validators.required]],
      testUrl: ["", [Validators.required]],
    });
  }

  deletedFiles(e, group?, i?) {
    if (!group) {
      this.requistionForm.controls["testUrl"].reset();
    } else {
      group.controls["testUrl"].reset();
      const updatedTest = this.localStorage.getItem("test-data").map((test) => {
        if (test.id == i + 1) {
          test.testName = group.value.testName;
          test.testUrl = group.value.testUrl;
        }
        return test;
      });
      this.localStorage.setItem("test-data", JSON.stringify(updatedTest));
    }
  }

  getPreviousRequisitions() {
    this.appointmentService.getRequisitions(this.bookingId).subscribe((res) => {
      if (res && res.data) {
        this.isRequisitionSend = res?.data?.isRequisitionSend;
        this.requistionForm.controls["remarks"].patchValue(res?.data?.remarks);
        this.requistionForm.controls["lab"].patchValue(res?.data?.addressBook.id);

        if (
          !this.localStorage.getItem("test-data") &&
          !this.requistionForm.valid
        ) {
          let count = 0;
          const testData = res.data.tests.map((item) => {
            return {
              testName: item.testName,
              testUrl: item.testUrl,
              id: ++count,
            };
          });
          if (!this.isRequisitionSend) {
            this.localStorage.setItem("test-data", JSON.stringify(testData));
          }
          const test = res.data.tests.map((item) => {
            return { testName: item.testName, testUrl: { url: item.testUrl } };
          });
          this.patchPreviousRequisitionList(test, res.data.isRequisitionSend);
        } else if (
          this.localStorage.getItem("test-data") &&
          this.localStorage.getItem("test-data").length > 0
        ) {
          this.patchPreviousRequisitionList(
            this.localStorage.getItem("test-data"),
            res.data.isRequisitionSend
          );
        } else {
          this.localStorage.removeItem("test-data");
          return false;
        }
      }
    });
  }

  uploadingStart(status) {
    this.fileUploading = status;
  }

  addToList(file) {
    this.requistionForm.controls["testName"].setValidators([
      Validators.required,
    ]);
    this.requistionForm.controls["testName"].updateValueAndValidity();
    this.requistionForm.controls["testUrl"].setValidators([
      Validators.required,
    ]);
    this.requistionForm.controls["testUrl"].updateValueAndValidity();
    if (
      this.requistionForm.controls["testName"].valid &&
      this.requistionForm.controls["testUrl"].valid
    ) {
      this.testData = this.localStorage.getItem("test-data")
        ? this.localStorage.getItem("test-data")
        : [];
      this.testData.push({
        testName: this.requistionForm.get("testName").value,
        testUrl: this.requistionForm.get("testUrl").value,
        id: this.testData.length + 1,
      });
      this.localStorage.setItem("test-data", JSON.stringify(this.testData));
      this.fillForm();
      this.redel["pdfForm"].reset();
      this.requistionForm.controls["testName"].reset();
      this.states.push(0);
      this.showFileError = false;
      this.showNameError = false;
      this.requistionForm.controls["testName"].clearValidators();
      this.requistionForm.controls["testName"].updateValueAndValidity();
      this.requistionForm.controls["testUrl"].clearValidators();
      this.requistionForm.controls["testUrl"].updateValueAndValidity();

      return;
    } else if (
      this.requistionForm.controls["testName"].valid &&
      this.requistionForm.controls["testUrl"].invalid
    ) {
      this.showFileError = true;
      this.showNameError = false;
      return;
    } else if (
      this.requistionForm.controls["testName"].invalid &&
      this.requistionForm.controls["testUrl"].valid
    ) {
      this.showFileError = false;
      this.showNameError = true;
      return;
    } else {
      this.showNameError = true;
      this.showFileError = true;
      return;
    }
  }

  fillForm() {
    let temp = this.getFormArrayRow();
    temp.patchValue({
      testName: this.requistionForm.controls["testName"].value,
      testUrl: this.requistionForm.controls["testUrl"].value,
    });
    this.requistionFormList.push(temp);
    temp.disable();
  }

  hasError(type: string, key: string) {
    return this.formSubmitted && this.requistionForm.hasError(type, [key]);
  }

  updateTest(group: FormGroup, i) {
    group.enable();
    this.states[i] = 1;
  }

  disableGroup(group, i) {
    if (!group.value.testName || !group.value.testUrl.url) {
      return;
    }

    const updatedTest = this.localStorage.getItem("test-data").map((test) => {
      if (test.id == i + 1) {
        test.testName = group.value.testName;
        test.testUrl = group.value.testUrl;
      }
      return test;
    });
    this.localStorage.setItem("test-data", JSON.stringify(updatedTest));
    this.states[i] = 0;
    group.disable();
  }

  patchPreviousRequisitionList(testData, isTrue?) {
    this.isRequisitionSend = isTrue;
    testData.forEach((ele, index) => {
      this.requistionFormList.push(this.getFormArrayRow());
      this.requistionFormList.controls[index].patchValue({
        testName: ele.testName,
        testUrl: ele.testUrl,
      });
      if (isTrue) {
        this.isReadMode = true;
        this.requistionFormList.controls[index].disable();

        return;
      }

      if (this.requistionFormList.controls[index].get("testUrl").invalid) {
        this.requistionFormList.controls[index].enable();
        this.states[index] = 1;
      } else {
        this.requistionFormList.controls[index].disable();
      }

      if (this.isFromPending) {
        this.requistionForm.disable();
        this.isReadMode = true;
      }
    });
  }

  deleteTest(id) {
    this.requistionFormList.removeAt(id);
    if (this.requistionFormList.length < 1) {
      this.localStorage.removeItem("test-data");
      this.showFileError = true;
      this.showNameError = true;
      return;
    }
    this.states.splice(id, 1);
    this.requistionForm.controls["testName"].reset();
    this.localStorage.setItem("test-data", this.requistionFormList.value);
  }

  onSave() {
    let labDetails = this.addressList.find(
      (item) => item.id == +this.requistionForm.get("lab").value
    );
    this.formSubmitted = true;
    if (
      this.requistionFormList.valid &&
      this.localStorage.getItem("test-data")
    ) {
      this.toaster.showError(this.vref, "Error Occurred", "MARK_CHECK");
      return;
    }
    if (!this.localStorage.getItem("test-data")) {
      this.toaster.showError(this.vref, "Error Occurred", "ENTER_TEST");
      return false;
    }
    if (this.localStorage.getItem("test-data")) {
      this.showNameError = false;
      this.showFileError = false;
      this.requistionForm.controls["testName"].clearValidators();
      this.requistionForm.controls["testName"].updateValueAndValidity();
      this.requistionForm.controls["testUrl"].clearValidators();
      this.requistionForm.controls["testUrl"].updateValueAndValidity();
    }

    let tests = this.localStorage.getItem("test-data").map((test) => {
      return {
        testName: test.testName,
        testUrl: test.testUrl.url ? test.testUrl.url : test.testUrl,
      };
    });
    let bodyObj = {
      bookingId: this.bookingId,
      remarks: this.requistionForm.controls["remarks"].value,
      tests: tests,
      addressBook: labDetails
    };
    this.appointmentService.saveRequisitions(bodyObj).subscribe(
      (res) => {
        this.isSend = true;
        this.localStorage.setItem("isSaved", true);
        this.toaster.showSuccess(this.vref, "Success", "REQUISITION_ADDED");
      },
      (err) => {
        this.errorService.handleError(err, this.vref);
      }
    );
  }

  onSend() {
    this.appointmentService.sendRequisition(this.bookingId).subscribe(
      (res) => {
        this.localStorage.removeItem("test-data");
        this.isReadMode = true;
        this.isRequisitionSend = true;
        this.toaster.showSuccess(this.vref, "Success", "REQUISITION_SEND");
      },
      (err) => {
        this.errorService.handleError(err, this.vref);
      }
    );
  }

  detailedRequisitions(){
    let requisitionHistoryData;
    this.appointmentService.requisitionHistory(this.patientId).subscribe(
      (res: any) => {
        requisitionHistoryData = res.data
        this.matDialog
        .open(DetailedRequisitionComponent, {
          height: "700px",
          width: "1000px",
          data: {
            requisitionData: requisitionHistoryData,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
        },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

}
