/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { UserService } from "../utils/service/user.service";
import { TranslaterService } from "../utils/service/translater.service";
import { LocalStorageService } from "../utils/service/localStorage.service";
import { HelperService } from "../utils/service/helper.service";
import { MessagingService } from "../utils/service/messaging.service";
import { EventService } from "../utils/service/eventservice";
import { AppointmentService } from "../board-features/calender/appointments/appointments.service";

const ONBOARDING_STEP = 3;

@Component({
  selector: "header-component",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  public headerDisplay: boolean = false;
  public selectedTab: number = 0;
  public isLoggedIn: boolean = false;
  // public dentistURL: string = environment.dentistUrl;
  public isVideoCall: boolean = false;
  public hideHeader: boolean = false;
  public removeHeader: boolean;
  public hideDentistSearch: boolean;
  public showBreaderCrumb: boolean;
  public enableShow: boolean;
  public userData: any;
  public userName: any;
  public chatId: any;
  availableDoctors: any;
  isProfilemanager: boolean = false;
  screenFreeze: any;
  public addFullWidthClass: boolean = false;
  selectedDocorName: string;
  constructor(
    private router: Router,
    private userService: UserService,
    private translater: TranslaterService,
    private localStorageService: LocalStorageService,
    private helperService: HelperService,
    public messagingService: MessagingService,
    public eventService: EventService,
    private appointmentService: AppointmentService
  ) {}
  lang;
  ngOnInit() {
    this.screenFreeze = false;
    this.setHeaderData();
    this.routeChangeSubscribe();
    // this._authBookingService.hideHeader.subscribe( result => {
    //   this.hideHeader = result;
    // } );
    this.translater.TranslationAsPerSelection();
    this.messagingService.receiveMessage();
    this.eventService.StatusOnActiveDocor.subscribe(data => {
      this.screenFreeze = data;
    })
    this.eventService.SelectedDocorName.subscribe(data => {
      this.selectedDocorName = data;
    })
    this.appointmentService.isDefaultChatOpen.next(false);
  }

  /**
   * Function to check for route change
   */

  routeChangeSubscribe() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleRouteChange(event);
        this.setHeaderData();
      }
    });
  }

  setHeaderData() {
    if (this.localStorageService.getItem("userData")) {
      this.userData = this.localStorageService.getItem("userData");
      if (
        this.userData["firstName"] &&
        +this.userData["onboardStep"] === ONBOARDING_STEP + 1
      ) {
        this.userName = `${this.userData["firstName"]} ${this.userData["lastName"]}`;
      } else if (this.userData["email"]) {
        this.userName = this.userData["email"];
      }

      if (+this.userData["onboardStep"] === ONBOARDING_STEP + 1) {
        this.enableShow = true;
      }
      if(this.userData.selectedDoctorData){
        this.chatId = this.userData.selectedDoctorData.user_id+'_'+this.userData.selectedDoctorData.parent_id;
      }else{
        this.chatId = this.userData.userId+'_'+this.userData.doctorId;
      }
      if(this.userData.parentId){
        this.availableDoctors = JSON.parse(this.userData.parentId);
      }
      if(this.userData.subAccount && this.availableDoctors.length > 0 && !this.userData.selectedDoctorId){
        this.isProfilemanager = true;
      }
      //this.chatId = "23_45";
    }
  }

  /**
   * Function to logout
   */
  logout() {
    this.isLoggedIn = false;
    this.selectedDocorName = '';
    this.messagingService.deleteFcmToken();
    this.userService.logout();
    // this._authBookingService.removeBookingDetail();
    this.router.navigateByUrl("/auth/login");
  }

  changePassword() {
    this.router.navigateByUrl("accounts/settings/change-password");
  }

  openInbox() {
    this.messagingService.notificationCount = 0;
    this.router.navigateByUrl("feature/inbox");
  }
  /**
   * Function to select tab
   * @param tab number
   */
  selectTab(tab: number) {
    this.selectedTab = tab;
    switch (tab) {
      case 2:
        this.router.navigate(["/favorites"], {
          queryParams: {
            page: 1,
          },
        });
        break;

      case 3:
        this.router.navigate(["/appointment/upcoming"], {
          queryParams: {
            page: 1,
          },
        });
        break;

      case 4:
        this.router.navigate(["/prescription/online-consults"], {
          queryParams: {
            page: 1,
          },
        });
        break;

      case 5:
        this.router.navigate(["/account/profile"]);
        break;

      default:
        this.router.navigate(["/home"]);
        break;
    }
  }

  /**
   * Function to handle route change
   */
  handleRouteChange(event: any) {
    this.userName = localStorage.getItem("userName");

    // this.HideHeader(event);
    this.showBreadcrumb(event);
    this.hideDentistSearchBar(event);
    this.updateLoginStatus();
    this.checkForTab(event);
  }

  /**
   * Function to check for selected tab
   */
  checkForTab(event) {
    if (event.url.includes("onboard")) {
      this.addFullWidthClass = true;
    } else {
      this.addFullWidthClass = false;
    }

    if (event.url.includes("/home")) this.selectedTab = 1;
    else if (event.url.includes("/favorites")) this.selectedTab = 2;
    else if (this.tabForAppointment(event.url)) this.selectedTab = 3;
    else if (event.url.includes("/prescription")) this.selectedTab = 4;
    else if (event.url.includes("/account")) this.selectedTab = 5;
    else {
      this.selectedTab = null;
    }
    if (event.url.includes("/appointment/book")) {
      this.selectedTab = null;
    }

    this.isVideoCall = event.url.includes("/video-call");
    this.removeHeader =
      event.url.includes("/terms-and-conditions") || event.url.includes("/faq");
  }

  tabForAppointment(url) {
    url = url.split("?")[0];
    let appointmentUrl = ["/appointment/past", "/appointment/upcoming"];
    return appointmentUrl.indexOf(url) > -1;
  }

  /**
   * Function to update user login status
   */
  updateLoginStatus() {
    //TODO :- check logged in from user.service.ts
    if (this.userService.isCompleteLoggedIn()) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  // HideHeader(event){
  //     if (event.url.includes("/login")|| event.url.includes("/register")){
  //         this.headerDisplay= false
  //     }else{
  //         this.headerDisplay= true
  //     }
  // }
  hideDentistSearchBar(event) {
    if (event.url.includes("/doctor/listing")) {
      this.hideDentistSearch = true;
    } else {
      this.hideDentistSearch = false;
    }
  }

  showBreadcrumb(event) {
    // if (event.url.includes("auth/login") || event.url.includes("auth/register") || event.url.includes("/home") || event.url.includes("/doctor/listing")) {
    //   this.showBreaderCrumb = false;
    // } else {
    //   this.showBreaderCrumb = true;
    // }
  }

  toggleSidebar() {
    this.helperService.toggleSidebar();
  }

}
