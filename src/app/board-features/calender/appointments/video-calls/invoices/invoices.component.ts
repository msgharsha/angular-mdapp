/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Input, OnInit, ViewContainerRef } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { AppointmentService } from "../../appointments.service";
import { ActivatedRoute } from "@angular/router";
import { ErrorService } from "../../../../../utils/service/error.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { LocalStorageService } from "../../../../../utils/service/localStorage.service";
import { MatDialog } from "@angular/material/dialog";
import { DialogModalComponent } from "../../../../../utils/component/cancel-modal/cancel-modal.component";
import * as moment from "moment";
@Component({
  selector: "app-invoices",
  templateUrl: "./invoices.component.html",
  styleUrls: ["./invoices.component.scss"],
})
export class InvoicesComponent implements OnInit {
  @Input() invitePatientStatus;
  // public invoiceReviewForm: FormGroup;
  public bookingId;
  public invoiceData;
  public appointmentDetail;
  public newSelectedService;
  public newSelectedFee;
  public selectedServices = [];
  public notSelectedServices = [];
  public serviceid = "";
  public subTotal;
  public total;
  public provinceIdExist: boolean = false;
  public includeTaxValue: boolean = false;
  public isSend: boolean = false;
  public isSave: boolean = false;
  public newDate = new Date();
  public invoiceNumber = Math.round(this.newDate.getTime() / 1000);
  public invoiceDate = moment(this.newDate).format("MMMM Do, YYYY");
  public gstPercentage;
  public qstPercentage;
  constructor(
    private builder: FormBuilder,
    private translater: TranslaterService,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private appointmentService: AppointmentService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private localStorage: LocalStorageService
  ) {
    this.route.queryParams.subscribe((param) => {
      if (param?.bookingId) {
        this.bookingId = param.bookingId;
      }
    });
  }

  ngOnInit(): void {
    this.getInvoiceValue();
    this.translater.TranslationAsPerSelection();
  }

  getInvoiceValue() {
    this.appointmentService.getInvoiceValue(this.bookingId).subscribe(
      async (res: any) => {
        this.invoiceData = await res.data;
        if (this.invoiceData.invoiceId) {
          this.provinceIdExist = true;
          this.isSend = res.data?.isInvoiceSend;
        }
        this.getInvoiceServices();
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  getInvoiceServices() {
    this.appointmentService.getInvoiceServices(this.bookingId).subscribe(
      (res) => {
        let allServices = res.data.doctorServices;
        let selectedServices
        if (this.invoiceData && this.invoiceData.invoiceId) {
          selectedServices = this.invoiceData.services;
        }else{
          selectedServices = this.localStorage.getItem("selectedService")
          ? this.localStorage.getItem("selectedService")
          : res.data.selectedServices;
        }
        
        let notSelectedServices = [];
        //filter selected and notSelectedServices
        let find = 0,
          index = 0;
        allServices.forEach(function (item1) {
          find = 0;
          selectedServices.forEach(function (item2) {
            if (item1.id === item2.id) {
              find = 1;
            }
          });
          if (find == 0) {
            notSelectedServices[index++] = item1;
          }
        });
        // initialize
        this.selectedServices = selectedServices;
        this.notSelectedServices = notSelectedServices;
        this.calculateSubtotal();
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }
  ngOnDestroy() {
    this.localStorage.removeItem("selectedService")
  }

  isNumber(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || charCode == 46) {
      return true;
    }
    return false;
  }

  onSelection() {
    this.newSelectedFee = this.newSelectedService.consultationFee;
    this.includeTaxValue = this.newSelectedService.includeTax
  }

  
  includeTaxChange(e){
    this.includeTaxValue = e.target.checked;
  }

  calculateSubtotal() {
    let subTotal = 0,
      taxableAmount = 0,
      calculate;
    this.selectedServices.forEach(function (item) {
      subTotal = subTotal + parseFloat(item.consultationFee);
      if(item.includeTax){
        taxableAmount = taxableAmount + parseFloat(item.consultationFee);
      }
    });
    this.subTotal = subTotal.toFixed(2);
    this.gstPercentage = (
      taxableAmount *
      ((parseFloat(this.invoiceData?.gst) || 0) / 100)
    ).toFixed(2);
    this.qstPercentage = (
      taxableAmount *
      ((parseFloat(this.invoiceData?.qst) || 0) / 100)
    ).toFixed(2);
    calculate = parseFloat(this.gstPercentage) + parseFloat(this.qstPercentage);
    this.total = (parseFloat(this.subTotal) + parseFloat(calculate)).toFixed(2);
  }

  savePrivateService() {
    if (!this.newSelectedService || !this.newSelectedFee) {
      return false;
    }

    //remove selected service from notSelectedServices array
    const index = this.notSelectedServices.indexOf(this.newSelectedService);
    if (index > -1) {
      this.notSelectedServices.splice(index, 1);
    }
    // add updated service to selectedServices array
    this.newSelectedService.consultationFee = this.newSelectedFee;
    this.newSelectedService.includeTax =  this.includeTaxValue,
    this.selectedServices = [this.newSelectedService].concat(
      this.selectedServices
    );
    this.saveInLocalStorage();
    this.newSelectedService = "";
    this.newSelectedFee = "";
    this.includeTaxValue = false;
    this.serviceid = "";

    this.calculateSubtotal();
  }

  saveInLocalStorage() {
    this.localStorage.setItem("selectedService", this.selectedServices);
  }

  updatePrivateService(id) {
    if (this.newSelectedService) {
      return;
    }
    // remove from selected array
    this.selectedServices.forEach((item) => {
      if (item.id == id) {
        this.newSelectedService = item;
      }
    });
    const index = this.selectedServices.indexOf(this.newSelectedService);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    }
    // add to non selected array
    this.notSelectedServices = [this.newSelectedService].concat(
      this.notSelectedServices
    );
    this.newSelectedFee = this.newSelectedService.consultationFee;
    this.includeTaxValue = this.newSelectedService.includeTax;
    this.serviceid = this.newSelectedService.id;
    this.calculateSubtotal();
  }

  deletePrivateService(id) {
    let deletedItem;
    // remove from selected array
    this.selectedServices.forEach((item) => {
      if (item.id == id) {
        deletedItem = item;
      }
    });
    const index = this.selectedServices.indexOf(deletedItem);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    }
    // add to non selected array
    this.notSelectedServices = [deletedItem].concat(this.notSelectedServices);
    this.calculateSubtotal();
    this.saveInLocalStorage();
  }

  saveInvoice() {
    let body = {};
    let index = 0;
    body["bookingId"] = parseInt(this.bookingId);
    body["invoiceNumber"] = this.invoiceNumber.toString();
    body["date"] = this.newDate;
    body["gstNumber"] = this.invoiceData.gstNumber;
    body["qstNumber"] = this.invoiceData.qstNumber;
    body["subTotal"] = this.subTotal.toString();
    body["gst"] = this.invoiceData?.gst;
    body["qst"] = this.invoiceData?.qst;
    body["gstValue"] = parseFloat(this.gstPercentage).toString();
    body["qstValue"] = parseFloat(this.qstPercentage).toString();
    body["total"] = this.total.toString();
    body["services"] = [];
    this.selectedServices.forEach(function (item) {
      body["services"][index++] = {
        serviceName: item.serviceName,
        consultationFee: item.consultationFee.toString(),
        id:item.id,
        includeTax:item.includeTax
      };
    });
    this.appointmentService.saveInvoice(body).subscribe(
      (res) => {
        this.provinceIdExist = true;
        this.isSave = true;
        this.toaster.showSuccess(
          this.vref,
          "Invoice",
          "INVOICE_SAVE_SUCCESSFULLY"
        );
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  sendInvoice() {
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      height: "auto",
      width: "600px",
      data: {
        message: "Click confirm to send payment automatically",
        cancelLabel: "CANCEL",
        confirmLabel: "CONFIRM",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appointmentService.sendInvoice(this.bookingId).subscribe(
          (res) => {
            this.provinceIdExist = true;
            this.isSend = true;
            this.toaster.showSuccess(
              this.vref,
              "Invoice",
              "INVOICE_SEND_SUCCESSFULLY"
            );
          },
          (err) => this.errorService.handleError(err, this.vref)
        );
      }
    });
    
  }
}
