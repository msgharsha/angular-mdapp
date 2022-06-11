/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  OnInit,
  ViewContainerRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { ToasterService } from "../../../service/toaster.service";
import { SessionManager } from "../session-manager.service";

@Component({
  selector: "video-call",
  templateUrl: "./video-call.component.html",
  styleUrls: ["./video-call.component.scss"],
})
export class VideoCallComponent implements OnInit {
  private SUB_ELEMENT_ID = "subscriber";
  private SUB_SCREEN_ELEMENT_ID = "subscriberScreen";
  private PUB_ELEMENT_ID = "publisher";

  private token = null;
  private sessionId = null;

  public isVideoDisable = true;
  public isAudioDisable = true;

  private publisher;
  private session;

  isScreenShare = false;
  isCallDisconnected = true;

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
    private toaster: ToasterService
  ) {
    this.subscriptions = this.sessionManager.onError.subscribe((message) => {
      this.toaster.showError(this.vref, message, "Error");
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

  ngOnInit() {
    // this.subscribeRouteParams();
  }

  subscribeRouteParams() {
    this.route.queryParams.subscribe((params) => {
      this.sessionId = params["sessionId"];
      this.token = params["token"];
      this.connect(this.sessionId, this.token);
    });
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
        "Please, Allow Permission for Hardware Devices.",
        "Info"
      );
    } else {
      // this.session = this.sessionManager.getSession(sessionId, this.SUB_ELEMENT_ID,this.SUB_SCREEN_ELEMENT_ID, this.callSubOptions);
      // let connectionEstablished = await this.sessionManager.connectSession(token);
      // this.isCallDisconnected=!<boolean>connectionEstablished;
      // this.onConnectionUpdate.emit(<boolean>connectionEstablished);
      // if(connectionEstablished)this.call();
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

  close() {
    this.sessionManager.sendSignal(
      "callEnded",
      () => {
        this.closeConnection();
      },
      () => {
        this.toaster.showError(
          this.vref,
          "Error in closing connection.",
          "Error"
        );
      }
    );
  }

  closeConnection() {
    if (!this.isCallDisconnected) {
      this.isCallDisconnected = true;
      this.sessionManager.destroyPublisher();
      this.sessionManager.unsubscribeSubscribers();
      this.sessionManager.disconnectSession();
      this.subscriptions.unsubscribe();
      this.onConnectionUpdate.emit(!this.isCallDisconnected);
    }
  }

  ngOnDestroy() {
    this.closeConnection();
    this.subscriptions.unsubscribe();
  }
}
