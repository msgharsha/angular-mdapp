/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import * as moment from "moment";
import { ManagePaymentService } from "../manage-payment.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import * as IntroJs from 'intro.js';
@Component({
  selector: "app-payment-details",
  templateUrl: "./payment-details.component.html",
  styleUrls: ["./payment-details.component.scss"],
})
export class PaymentDetailsComponent implements OnInit {
  patientPaymentStatusList: any = ["APPROVED", "DECLINED"];
  public lang;
  public introTour;
  consultationPaymentStatusList: any = [
    "PENDING",
    "APPROVED",
    "PAID",
    "REJECTED",
  ];
  filterList = [
    {
      label: "PAYMENT_STATUS",
      type: "select",
      translate: true,
      data: this.patientPaymentStatusList,
      select: (event) => {
        this.patientPaymentStatus = event;
        this.selectedAction = "";
        this.getPaymentList();
      },
      renderHTML: (event) => {
        return event;
      },
      renderValue: (event) => {
        return event;
      },
    },
    {
      label: "BILLING_STATUS",
      type: "select",
      translate: true,
      data: this.consultationPaymentStatusList,
      select: (event) => {
        this.consultationPaymentStatus = event;
        this.selectedAction = "";
        this.getPaymentList();
      },
      renderHTML: (event) => {
        return event;
      },
      renderValue: (event) => {
        return event;
      },
    },
    {
      label: "DATE",
      type: "date",
      selectedDate: "",
      showInfoIcon: true,
      toolTipContent: "PAST_WEEK_RECORDS_ON_DATE_SELECT",
      translateParams: { duration: 2 },
      select: (event) => {
        this.selectedDate = event;
        this.getPaymentList();
      },
    },
  ];

  totalCount = 0;
  selectedTab = 0;
  pageInfo = {
    page: 1,
    limit: 10,
    skip: 0,
  };
  paymentList: any = [];
  selectedDate: any = "";
  patientPaymentStatus: any = null;
  consultationPaymentStatus: any = null;
  selectedAction: string = "";
  totalRevenue: number;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  constructor(
    private toaster: ToasterService,
    private router: Router,
    private vref: ViewContainerRef,
    private localStorageService: LocalStorageService,
    private paymentService: ManagePaymentService,
    private translate: TranslateService
  ) {
    this.getPaymentList();
  }

  ngOnInit(): void {
    this.introTour = this.localStorageService.getItem("tourFlag");
    this.lang = this.localStorageService.getItem("language");
    this.translate.onLangChange.subscribe(() => {
      this.getPaymentList();
    });
  }

  getPaymentList() {
    const filters = {
      date: moment(this.selectedDate).valueOf(),
    };
    if (this.patientPaymentStatus) {
      filters["patientPaymentStatus"] = this.patientPaymentStatus.toLowerCase();
    }
    if (this.consultationPaymentStatus) {
      filters[
        "consultationPaymentStatus"
      ] = this.consultationPaymentStatus.toLowerCase();
    }
    this.paymentService
      .getPaymentList({
        skip: this.pageInfo.skip,
        limit: this.pageInfo.limit,
        offset: moment().format("Z"),
        ...filters,
      })
      .subscribe(
        (res) => {
          if (res && res.data) {
            this.paymentList = res.data.paymentList;
            this.paymentList.forEach((item) => {
              item.name = item.firstname + " " + item.lastname;
              item.consultationPaymentStatus = this.modifyPaymentStatus(
                item.consultationPaymentStatus
              );
              item.patientPaymentStatus = this.modifyPaymentStatus(
                item.patientPaymentStatus
              );
            });
            this.totalCount = +res.data.count;
            this.totalRevenue = +res.data.totalAmount;
          } else {
            this.toaster.showError(
              this.vref,
              "Error Occurred",
              "ERROR_OCCURED"
            );
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

  pageChangedEvent(pageNo) {
    this.currentPage = pageNo;
    this.pageInfo["skip"] = (this.currentPage - 1) * this.itemsPerPage;
    this.pageInfo["limit"] = this.itemsPerPage;
    this.getPaymentList();
  }

  modifyPaymentStatus(status) {
    if (status) {
      return this.translate.instant(status.toUpperCase());
    }
  }

  onTabSelection(tabIndex) {
    this.selectedTab = tabIndex.index;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if(!this.introTour){
        this.startTour();
      }
    },1000)
  }


  startTour() {
    let self = this;
    console.log("Starting tour");
    let intro = IntroJs();
    let stepsContent
    if (this.lang == 'en') {
      intro.setOption("doneLabel", "Next");
      intro.setOption("nextLabel", "Next");
      intro.setOption("prevLabel", "Back");
      stepsContent = {
        steps: [
          {
            element: '#mat-tab-label-0-0',
            intro: "Navigate between your Private billing consultation under Payments and Public consultations under Claims.",
            position: 'right'
          },
          {
            element: '#payment_step2',
            intro: "Use the filters you need.",
            position: 'right',
          }
        ]
      }
    } else {
      intro.setOption("doneLabel", "Prochaine");
      intro.setOption("nextLabel", "Prochaine");
      intro.setOption("prevLabel", "Arrière");
      stepsContent = {
        steps: [
          {
            element: '#mat-tab-label-0-0',
            intro: "Naviguez entre vos Paiements de Consultations privées et vos Réclamations de Consultations publiques.",
            position: 'right'
          },
          {
            element: '#payment_step2',
            intro: "Utilisez les filtres qui vous conviennent.",
            position: 'right',
            onchange: function () {
              alert("Do whatever you want on this callback.");
            }
          }
        ]
      }
    }

    // Initialize steps
    intro.setOptions(stepsContent);
    
    intro.oncomplete(function () {
      self.selectedTab = 1;
    });

    intro.onexit(function () {
      console.log("complete")
    });

    intro.setOptions({
      exitOnOverlayClick: false,
      showBullets: false
    });

    // Start tutorial
    intro.start();
  }
}
