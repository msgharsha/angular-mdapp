/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { TranslaterService } from "../../../../utils/service/translater.service";
import { EventEmitter, NgZone, Output, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { ErrorService } from "../../../../utils/service/error.service";
import { SessionManager } from "../../../../utils/component/open-tok-call/session-manager.service";
import { ToasterService } from "../../../../utils/service/toaster.service";
import { EventService } from "../../../../utils/service/eventservice";
import { AppointmentService } from "../appointments.service";

@Component({
  selector: "app-video-calls",
  templateUrl: "./video-calls.component.html",
  styleUrls: ["./video-calls.component.scss"],
})
export class VideoCallsComponent implements OnInit {
  public selectedTab = 1;
  public isFullScreen = false;
  public isOpen = false;
  public isChatBtnClicked = false;
  isCallConnected: boolean = true;
  public connectionEstablished = false;
  isD2D: boolean = true;

  private SUB_ELEMENT_ID = "subscriber";
  private SUB_SCREEN_ELEMENT_ID = "subscriberScreen";
  private PUB_ELEMENT_ID = "publisher";

  private token = null;
  private sessionId = null;
  public appointmentType;
  private bookingId;
  private patientId;
  private patientName;
  profileImage;
  isPendingAppointment: boolean = false;

  public isVideoDisable = false;
  public isAudioDisable = false;
  public isConsultationStatus = false;

  private publisher;
  private session;
  startTime;
  endTime;
  offset;
  consultationType;
  age;
  gender;
  startDate;

  isScreenShare = false;
  isCallDisconnected = true;
  isFromPending = false;
  unreadCount;

  private callSubOptions = {
    insertMode: "append",
    width: "100%",
    height: "100%",
    subscribeToAudio: true,
    subscribeToVideo: true,
  };

  private callPubOptions = {
    insertMode: "append",
    publishAudio: false,
    publishVideo: false,
    width: "100%",
    height: "100%",
  };

  private sharePubOptions = {
    videoSource: "screen",
    publishAudio: false,
    mirror: false,
  };

  private subscriptions: Subscription;
  @Output()
  onConnectionUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private route: ActivatedRoute,
    public sessionManager: SessionManager,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private router: Router,
    private ngZone: NgZone,
    private translater: TranslaterService,
    private errorService: ErrorService,
    private appointmentService: AppointmentService,
    private eventService: EventService
  ) {
    this.subscribeRouteParams();
    this.translater.TranslationAsPerSelection();
    if(this.token != "inoffice"){
      this.subscriptions = this.sessionManager.onError.subscribe((message) => {
        this.toaster.showError(this.vref, "Error", message);
      });
   
    

    this.subscriptions.add(
      this.sessionManager.onScreenShareStop.subscribe(() => {
        this.call();
      })
    );

    this.subscriptions.add(
      this.sessionManager.onSignalMessage.subscribe((data) => {
        if (data === "callEnded") this.closeConnection();
      })
    );
  }
  }

  ngOnInit() {
    // this.subscribeRouteParams();
    // this.translater.TranslationAsPerSelection();
  }

  roundHalf(value, step) {
      step || (step = 1.0);
    const inv = 1.0 / step;
    return Math.round(value * inv) / inv;
  }

  convertEpochTime(selectedEpocTime, time) {
      selectedEpocTime = moment(selectedEpocTime).format('YYYY-MM-DD');
      let timeArray = time.split(":");
    
      if (timeArray[0] == 12) {
        timeArray[0] = 0;
      }
    
      let result;
    
      if (time.includes("am")) {
        result = moment(selectedEpocTime).add(parseInt(timeArray[0]), "hours");
      } else {
        result = moment(selectedEpocTime).add(
        parseInt(timeArray[0]) + 12,
        "hours"
        );
      }
    
      let timeMin = timeArray[1].split(" ");
      result = moment(result).add(parseInt(timeMin), "minutes").valueOf();
    
      return result;
	}

  calculatedTimestamps() {
      let date = moment();
      let roundUp = moment(date).format("hh:mm a");
      const timeSlots = roundUp.split(':');
      const timeInfo = roundUp.split(' ');
      let result = this.roundHalf(parseInt(timeSlots[1]), 5);
      roundUp = `${timeSlots[0]}:${result} ${timeInfo[1]}`;
      return this.convertEpochTime(date, roundUp);
  }

  subscribeRouteParams() {
    this.route.queryParams.subscribe((params) => {
      this.sessionId = params["sessionId"];
      this.appointmentType = params["appointmentType"]
      this.token = params["token"];
      this.bookingId = params["bookingId"];
      this.patientId = params["patientUserId"];
      this.patientName = params["patientName"];
      this.startDate = params["startDate"]
        ? moment(params["startDate"]).format("DD MMM, YYYY")
        : null;
      this.startTime = this.calculatedTimestamps();
      this.age = params["age"];
      this.offset = params["offset"];
      this.consultationType = params["consultationType"];
      this.gender = params["gender"];
      this.profileImage = params["profileImage"];
      this.isFromPending = params["isFromPending"] === "true" ? true : false;
      if (!this.sessionId) {
        this.isPendingAppointment = true;
      }
      if (!this.isFromPending && this.token != "inoffice") {
        this.connect(this.sessionId, this.token);
      }
      if(this.appointmentType == 2){
        this.eventService.setSideNavStatusOnConsultation(true);
      }
    });
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    this.appointmentService.isDefaultChatOpen.next(false);
  }

  /**
   * Initialise Session
   * @param {string} sessionId
   * @param {string} token
   */
  async connect(sessionId, token) {
    const isSupported = await this.sessionManager.checkUserMediaAccess();
    if (!isSupported) {
      this.toaster.showInfo(
        this.vref,
        "Info",
        "Please, Allow Permission for Hardware Devices."
      );
    } else {
      this.session = this.sessionManager.getSession(sessionId);
      // this.sessionManager.disconnectSession();
      this.subscriptions.add(
        this.sessionManager
          .connectSession(
            token,
            this.SUB_ELEMENT_ID,
            this.SUB_SCREEN_ELEMENT_ID,
            this.callSubOptions
          )
          .subscribe(
            (res) => {
              this.connectionEstablished = true;
              this.isCallDisconnected = false;
              this.onConnectionUpdate.emit(this.connectionEstablished);
              if (this.connectionEstablished) this.call();
            },
            (err) => {
              console.log(err);
            }
          )
      );
    }
  }

  /**
   * Initialise Video Call
   */
  call() {
    this.isScreenShare = false;
    this.subscriptions.add(
      this.sessionManager
        .publish(this.PUB_ELEMENT_ID, this.callPubOptions)
        .subscribe((res) => {
          this.eventService.setSideNavStatusOnConsultation(true)
          this.sessionManager.publishAudio(!this.isAudioDisable);
          this.sessionManager.publishVideo(!this.isVideoDisable);
        })
    );
  }

  /**
   * Initialise Screen Share
   */
  async share() {
    const isSupported = await this.sessionManager.checkScreenSharingSupport();
    if (!isSupported) {
      this.toaster.showInfo(
        this.vref,
        "This browser does not support screen sharing.",
        "Info"
      );
    } else if (!this.isScreenShare) {
      this.sharePubOptions.publishAudio = !this.isAudioDisable;
      this.subscriptions.add(
        this.sessionManager
          .publishScreen(this.PUB_ELEMENT_ID, this.sharePubOptions)
          .subscribe(
            (res) => {
              this.isScreenShare = true;
              this.sessionManager.publishAudio(!this.isAudioDisable);
            },
            (err) => {
              this.isScreenShare = false;
              this.call();
            }
          )
      );
    } else {
      this.isScreenShare = false;
      this.call();
    }
  }

  toggleVideo() {
    this.sessionManager.publishVideo(this.isVideoDisable);
    this.isVideoDisable = !this.isVideoDisable;
  }

  toggleAudio() {
    this.sessionManager.publishAudio(this.isAudioDisable);
    this.isAudioDisable = !this.isAudioDisable;
  }

  openChatPanel() {
    this.appointmentService.isDefaultChatOpen.next(true);
  }

  close() {
    this.endTime = this.calculatedTimestamps();
    const requestObject = {
      start_time: this.startTime,
      end_time: this.endTime,
      offset: this.offset
    };
    if (requestObject.start_time === requestObject.end_time) {
      requestObject.end_time = moment(requestObject.end_time).add(5, 'm').valueOf();
    }
    this.appointmentService.updateVideoCallSession(this.bookingId, requestObject).subscribe((res) => {
        if (!this.connectionEstablished) {
          this.sessionManager.disconnectSession();
          this.eventService.setSideNavStatusOnConsultation(false);
          if(this.token != "inoffice"){
            this.subscriptions.unsubscribe();
          }
          this.isConsultationStatus = true;
          this.ngZone.run(() =>
            this.onTabSelection(this.consultationType !== 'Private' ? 6 : 5)
            // this.router.navigateByUrl(
            //   "feature/calendar/appointment/detail/" + this.bookingId + "/upcoming"
            // )
          );
          return;
        }

        if (this.sessionManager.getClosedSessionStatus) {
          this.isConsultationStatus = true;
          this.ngZone.run(() =>
            this.onTabSelection(this.consultationType !== 'Private' ? 6 : 5)
            // this.router.navigateByUrl(
            //   "feature/calendar/appointment/detail/" + this.bookingId + "/upcoming"
            // )
          );
          return;
        }

        this.sessionManager.sendSignal(
          "callEnded",
          () => {
            this.closeConnection();
            this.isConsultationStatus = true;
            this.ngZone.run(() =>
              this.onTabSelection(this.consultationType !== 'Private' ? 6 : 5)
              // this.router.navigateByUrl(
              //   "feature/calendar/appointment/detail/" +
              //     this.bookingId +
              //     "/upcoming"
              // )
            );
          },
          () => {
            // this.toaster.showError(this.vref, "Error", 'Error in closing connection.');
            this.destroyOpenTokSession();
            this.isConsultationStatus = true;
            this.ngZone.run(() =>
              this.onTabSelection(this.consultationType !== 'Private' ? 6 : 5)
              // this.router.navigateByUrl(
              //   "feature/calendar/appointment/detail/" +
              //     this.bookingId +
              //     "/upcoming"
              // )
            );
          }
        );
      }), (error) => {
        this.errorService.handleError(error, null);
      }
  }

  closeConnection() {
    if (!this.isCallDisconnected) {
      this.eventService.setSideNavStatusOnConsultation(false);
      this.isCallDisconnected = true;
      this.destroyOpenTokSession();
      this.onConnectionUpdate.emit(!this.isCallDisconnected);
    }
  }

  destroyOpenTokSession() {
    this.sessionManager.destroyPublisher();
    this.sessionManager.unsubscribeSubscribers();
    this.sessionManager.disconnectSession();
    this.subscriptions.unsubscribe();
    this.sessionManager.removeListeners();
  }

  ngOnDestroy() {
    this.closeConnection();
    if(this.token != "inoffice"){
      this.subscriptions.unsubscribe();
    }
  }

  onTabSelection(tabIndex) {
    if ((tabIndex === 6 && this.consultationType === 'Private') 
    || (tabIndex === 6 && !this.isConsultationStatus)){
      return;
    }
    this.selectedTab = tabIndex;
  }

  onFetchingUnreadCount(count) {
    this.unreadCount = count;
  }

  backNavigate() {
    this.router.navigateByUrl(
      "feature/calendar/appointment?appointment=true&type=pending"
    );
  }
}
