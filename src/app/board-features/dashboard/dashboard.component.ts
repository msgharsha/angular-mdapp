/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";
import { ChartType, ChartOptions } from "chart.js";
import { Label } from "ng2-charts";
import { MatDialog } from "@angular/material/dialog";
import { DashboardService } from "../../utils/service/dashboard.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { ErrorService } from "../../utils/service/error.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { TranslaterService } from "../../utils/service/translater.service";
import { UserRoleService } from "../../utils/service/user_role.service";
import { UserService } from "../../utils/service/user.service";
import { EventService } from "../../utils/service/eventservice";
import { selectDoctorModelComponent } from "./selected-doctor-modal.component";
import * as moment from "moment";
import { TranslateService } from "@ngx-translate/core";
import { Values } from "../../constants/values";

import * as IntroJs from 'intro.js';
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  fromCalendarView: boolean = false;
  userData = null;
  userName = null;
  todaysCount = 0;
  weekStart: any;
  weekEND: any;
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            fontStyle: "bold",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontStyle: "bold",
          },
        },
      ],
    },
  };

  public barChartLabels: any = {
    en: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ],
    fr: [
      "Janv",
      "Févr",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sept",
      "Oct",
      "Nov",
      "Déc",
    ],
  };
  public barChartColors: any [] =[
    {
        backgroundColor:'#5daf41',
    }
  ]
  public barChartType: ChartType = "bar";
  public barChartLegend = false;
  public barChartPlugins = [];
  public barChartData = [];
  public revenueData = [];
  public consulatationData = [];
  public revenue: boolean = true;
  public showUnApprovedDoctorMessage: boolean = false;
  public lang;
  public introTour;

  pieChartOptions = {
    responsive: true,
  };

  public pieChartColors: any[] = [
    {
      backgroundColor: [
        '#5daf41', //green
        '#0074a3', //blue
      ]
    }
  ];
  public pieChartLabels = [];
  public pieChartType: ChartType = "pie";
  pieChartData = [0, 0];
  pieChartLegend = true;
  pieChartPlugins = [];
  patientCount: any = 0;
  totalBookings: any = 0;
  availableDoctors: any;
  selectedDoctorId: any;
  selectedDoctorData: any;
  showRegenerateButton: boolean;
  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private translater: TranslaterService,
    private localStorageService: LocalStorageService,
    private dashboardService: DashboardService,
    private toasterService: ToasterService,
    private userRoleService: UserRoleService,
    private translateService: TranslateService,
    private errorHandler: ErrorService,
    public eventService: EventService,
    private userService: UserService,
    private vref: ViewContainerRef
  ) {
    this.userData = this.localStorageService.getItem("userData") || {};
    this.dashboardService.getProfileManagerData(this.userData.userId).subscribe((res) => {
      this.userData.parentId = res.data.parentId
      this.localStorageService.setItem("userData", this.userData);
      this.eventService.loadUserData(true);
      this.getUserData();
    });
  }

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
    this.getConsultationBookingData();
    this.getPatientCount();
    this.subscriberLangChangeEvent();
    this.lang = this.localStorageService.getItem("language");
    this.introTour = this.localStorageService.getItem("tourFlag");
    this.setWeekDate();
    this.getDoctorStatus();
  }

  

  startTour() {
    let self = this;
    let intro = IntroJs();
    let stepsContent
    if (this.lang == 'en') {
      intro.setOption("doneLabel", "Next");
      intro.setOption("nextLabel", "Next");
      intro.setOption("prevLabel", "Back");
      stepsContent = {
        steps: [
          {
            element: '#header',
            intro: "Welcome to your CactusMD portal. You can review your practice details here.",
            position: 'right'
          },
          {
            element: '#sidenav',
            intro: "Use the side bar ment to navigate on your portal.",
            position: 'right',
          },
          {
            element: '#calander_tour',
            intro: "Next step is to post your availability on your calender for your patients. Let's go there!",
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
            element: '#header',
            intro: "Bienvenue sur votre portail CactusMD. Vous pouvez y trouver les détails de votre pratique ici-méme",
            position: 'right'
          },
          {
            element: '#sidenav',
            intro: "Utilisez la barre de menu latérale pour naviguer sur votre portail.",
            position: 'right',
            onchange: function () {
              alert("Do whatever you want on this callback.");
            }
          },
          {
            element: '#calander_tour',
            intro: "La prochaine étape est de publier vos disponibilités sur votre calendrier pour vos patients. Allons-y!",
            position: 'right',
          }
        ]
      }
    }

    // Initialize steps
    intro.setOptions(stepsContent);

    intro.oncomplete(function () {
      self.router.navigateByUrl('feature/calendar/availability');
    });

    intro.onexit(function () {
      console.log("complete")
    });

    intro.setOptions({
      exitOnOverlayClick: false,
      showBullets: false
    });

    // Start tutorial
    //intro.start();
    intro.start().onbeforechange(function () {

      if (intro._currentStep == "1" || intro._currentStep == "2") {
        window.scroll(0, 0);
      } 
  });
  }

  ngAfterViewInit(): void {
    window.scroll(0, 0);
    this.introTour = this.localStorageService.getItem("tourFlag");
    setTimeout(() => {
      if(!this.introTour){
        this.startTour();
      }
    }, 2000)
  }

  subscriberLangChangeEvent() {
    this.translateService.onLangChange.subscribe(() => {
      this.getConsultationBookingData();
      this.lang = this.localStorageService.getItem("language");
      this.setWeekDate();
    });
  }

  setWeekDate() {
    this.weekStart = moment()
      .locale(this.lang)
      .startOf("isoWeek")
      .format("Do MMM");
    this.weekEND = moment()
      .locale(this.lang)
      .endOf("isoWeek")
      .format("Do MMM YYYY");
  }

  getUserData() {
    if (this.localStorageService.getItem("userData")) {
      this.userData = this.localStorageService.getItem("userData");
      this.eventService.loadUserData(true);
      if(this.userData.parentId){
        this.availableDoctors = JSON.parse(this.userData.parentId);
      }
      if(this.userData.selectedDoctorData){
        this.eventService.setSelectedDocorName(this.userData.selectedDoctorData.doctorName);
      }
      if (this.userData["firstName"] && +this.userData["onboardStep"] === 4) {
        this.userName = `${this.userData["firstName"]} ${this.userData["lastName"]}`;
      } else if (this.userData["email"]) {
        this.userName = this.userData["email"];
      }
      if(this.userData.subAccount && this.availableDoctors.length > 0 && !this.userData.selectedDoctorId){
        this.changeDoctor()
      }
    }
  }

  changeDoctor(){
    const dialogRef = this.matDialog.open(selectDoctorModelComponent, {
      height: "250px",
      width: "600px",
      disableClose: true 
    });
    dialogRef.afterClosed().subscribe((data) => {
        this.selectedDoctorId = data.user_id;
        this.selectedDoctorData = data
        this.eventService.setSelectedDocorName(data.doctorName);
        this.userData = this.localStorageService.getItem("userData");
        this.userData["selectedDoctorId"] = this.selectedDoctorId;
        this.userData["selectedDoctorData"] = this.selectedDoctorData;
        this.localStorageService.setItem("userData", this.userData);
        this.doctorName = data.doctorName;
        window.location.reload();
        this.reGenerateQrStatus(this.selectedDoctorData.parent_id,this.selectedDoctorData.user_id);
      
    });
  }

  getAppointmentCount(count) {
    this.todaysCount = count;
  }

  getConsultationBookingData() {
    this.dashboardService.getRevenueConsultantData().subscribe(
      (res) => {
        this.pieChartData = [res.data.private, res.data.public];
        this.pieChartLabels = [
          this.translateService.instant("PRIVATE"),
          this.translateService.instant("PUBLIC"),
        ];
        this.revenueData.push(...res.data.revenue);
        this.consulatationData.push(...res.data.bookings);
        this.barChartData = [...this.revenueData];
        this.totalBookings = res.data.totalBookings;
      },
      (err) => {
        this.toasterService.showError(this.vref, "Error", err.error.message);
      }
    );
  }

  getPatientCount() {
    this.dashboardService.getPatientCount().subscribe((res) => {
      this.patientCount = res.data.count;
    });
  }

  public counter = 10;
  public timeout;
  public screenFreeze:boolean = false;
  getDoctorStatus() {
    this.dashboardService.getDoctorStatus().subscribe((res: any) => {
      this.userData['doctorStatus'] = res.data.status;
      this.localStorageService.setItem("userData", this.userData);
      if (res.data.status != "active") {
        this.showUnApprovedDoctorMessage = true;
        if(this.userData && this.userData.doctorRole == 4){
          this.screenFreeze = true;
          this.eventService.setStatusOnActiveDocor(true);
          this.toasterService.toastClear();
          this.timeout = setInterval(() => {
            if (this.counter > 0) {
              this.counter -= 1;
            } 
          }, 1000);
          setTimeout(() => {
            this.eventService.setStatusOnActiveDocor(false);
            this.userService.logout();
            this.router.navigateByUrl("/auth/login");
          }, 1000 * this.counter);
          
        }
      } else {
        if(this.userData && !this.userData.subAccount){
          let doctorId = this.userData["doctorId"];
          let userId = this.userData["userId"];
          this.doctorName = this.userData.firstName+' '+this.userData.lastName
          this.reGenerateQrStatus(doctorId,userId);
        }
      }
    });
  }

  doctorName: string;
  reGenerateQrStatus(doctorId,userId){
		this.dashboardService
			.getPersonalDetails(doctorId)
			.subscribe(
				(res) => {
					let addressObj = {
            clinicName: res.data.clinicName,
            addressLine1: res.data.addressLine1,
            addressLine2: res.data.addressLine2,
            city: res.data.city,
            province: res.data.province,
            postalCode: res.data.postalCode,
            clinicFax: res.data.clinicFax ? res.data.clinicFax : "",
            lat: res.data.lat,
            lng: res.data.lng,
            doctorId: doctorId,
            doctorName:this.doctorName,
            userId: userId,
            actionType: Values.QR_ACTIONTYPE.READ
          }
          this.dashboardService.insertQrData(addressObj).subscribe((res) => {
            if (res && res.actionType == 0) {
              this.showRegenerateButton = true;
            } else {
              this.showRegenerateButton = false;
            }
    
          },
          (err) => {
            this.toasterService.showError(
              this.vref,
              "Error Occurred",
              err?.error?.message
            );
          })
				},
				(err) => {this.errorHandler.handleError(err, this.vref);}
			);
  }

  valueChange(type) {
    if (type == "revenue") {
      this.barChartData = [...this.revenueData];
    } else {
      this.barChartData = [...this.consulatationData];
    }
  }

  checkPermission(state) {
    return this.userRoleService.checkPermission(state);
  }

}
