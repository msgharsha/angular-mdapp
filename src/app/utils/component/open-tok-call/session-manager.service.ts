/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import * as _ from "lodash";
import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject, from } from "rxjs";
import { environment } from "../../../../environments/environment";

import {
  videoType,
  sessionEvent,
  publishEvent,
  reason,
  error,
} from "./session-manager.constant";

declare var OT;

@Injectable()
export class SessionManager {
  get session() {
    if (!this._session && !this.isSessionClosed) {
      this.onError.next("Connection not established yet");
      throw "Instance Required.";
    }
    return this._session;
  }

  set session(session) {
    this._session = session;
  }

  get getClosedSessionStatus() {
    return this.isSessionClosed;
  }

  private apiKey = environment.openTokApiKey;
  private _session;
  private publisher;
  private subscriber;
  private isSessionClosed = false;
  private isSessionConnected = false;
  private isCallDisconnected = false;

  onError: Subject<any> = new Subject<any>();
  onScreenShareStop: Subject<any> = new Subject<any>();
  onSignalMessage: Subject<any> = new Subject<any>();
  onSendPrescription: Subject<any> = new Subject<any>();
  connectionIdSubscribers: any = {};
  $screenSubscribed: any = new BehaviorSubject<boolean>(false);

  /**
   * Get OpenTok Session
   * @param sessionId
   * @param elementId
   * @param screenElementId
   * @param options
   */
  getSession(sessionId) {
    if (!this._session) {
      this.session = OT.initSession(this.apiKey, sessionId);
      this.session.on(sessionEvent.SESSION_CONNECTED, (event) => {
        this.isSessionConnected = event.target.isConnected();
      });
    }
    return this.session;
  }

  /**
   * Add Session Listener
   * @param elementId
   * @param screenElementId
   * @param options
   */
  addListerner(elementId, screenElementId, options) {
    this.session.on(sessionEvent.STREAM_CREATED, (event) => {
      console.log(
        "on stream created",
        event.stream.connection.id,
        event.stream.id
      );

      if (event.stream.videoType == "screen") {
        this.subscribeStream(event, screenElementId, options, true);
      } else this.subscribeStream(event, elementId, options, false);
    });

    this.session.on(sessionEvent.STREAM_DESTROYED, (event) => {
      console.log("stream destoryed", event);
      // if (event.reason === reason.MEDIA_STOPPED) {
      //   //User clicked stop sharing
      // }
      // else if (event.reason === reason.FORCE_UNPUBLISHED) {
      //   //forceUnpublish()
      // }
      // else if (event.reason === reason.CLIENT_DISCONNECTED) {
      //   //disconnect()
      // }
      // else if (event.reason === reason.FORCE_DISCONNECTED) {
      //   //forceDisconnect()
      // }
      // else if (event.reason === reason.NETWORK_DISCONNECTED) {
      //   //internet connection
      // }
    });

    this.session.on(sessionEvent.SIGNAL_MSG, (event) => {
      if (
        this.session &&
        event.from.connectionId != this.session.connection.connectionId
      ) {
        this.onSignalMessage.next(event.data);
      }
    });
  }

  /**
   * Initialise Publisher
   * @param elementId
   * @param options
   * @param observer
   */
  initPublisher(elementId, options, observer) {
    return OT.initPublisher(elementId, options, (err) => {
      if (err) {
        observer.error(err);
        if (err.name === error.ACCESS_DENIED.name) {
          this.onError.next(error.ACCESS_DENIED.message);
        } else {
          this.onError.next(err.message);
        }
      }
    }).on({
      accessAllowed: (event) => {
        // The user has granted access to the camera and mic.
      },
      accessDenied: (event) => {
        console.log("access Denied", event);
        event.preventDefault();
        // The user has denied access to the camera and mic.
      },
      accessDialogOpened: (event) => {
        // The Allow/Deny dialog box is opened.
      },
      accessDialogClosed: (event) => {
        console.log("access closed", event);
        // The Allow/Deny dialog box is closed.
      },
    });
  }

  /**
   * Publish Stream
   * @param elementId
   * @param options
   */
  publish(elementId, options) {
    return new Observable((observer) => {
      let publisher = this.initPublisher(elementId, options, observer);
      if (this.publisher) {
        this.unpublish();
      }
      this.publisher = publisher;
      this.publishAndAttachListener(publisher, observer);
      this.isSessionClosed = false;
    });
  }

  private publishAndAttachListener(publisher, observer) {
    return this.session
      .publish(publisher, (err) => {
        if (err) {
          if (err.name === error.ACCESS_DENIED.name) {
            //Already Handle
            observer.error();
          } else {
            this.onError.next(err.message);
          }
        } else {
          observer.next();
        }
      })
      .on(publishEvent.STREAM_DESTROYED, (event) => {
        console.log("tsrem event listen", event);
        if (
          event.reason === reason.MEDIA_STOPPED &&
          event.stream.videoType === videoType.SCREEN
        ) {
          //User clicked stop sharing
          event.preventDefault();
          this.onScreenShareStop.next();
        }

        if (event.type === sessionEvent.STREAM_DESTROYED) {
          this.isSessionClosed = true;
        }
      });
  }

  /**
   * Publish Stream
   * @param elementId
   * @param options
   */
  publishScreen(elementId, options) {
    return new Observable((observer) => {
      let publisher = this.initPublisher(elementId, options, observer);
      this.publishAndAttachListener(publisher, observer);
    });
  }

  /**
   * Unpublish Stream
   */
  unpublish() {
    this.session.unpublish(this.publisher, (err) => {
      if (err) this.onError.next(err.message);
    });
    this.publisher = null;
    return this.publisher;
  }

  /**
   * Destroy Publisher
   */
  destroyPublisher() {
    if (this.publisher) {
      this.publisher.destroy();
      this.publisher = null;
    }
  }

  /**
   * Subscribe Stream
   * @param event
   * @param elementId
   * @param options
   * @param screenSubscribed
   */
  subscribeStream(event, elementId, options, screenSubscribed) {
    if (this.session) {
      this.updateExistingSubscribers(event);

      this.connectionIdSubscribers[event.stream.connection.id][
        event.stream.videoType
      ] = this.session.subscribe(event.stream, elementId, options, (err) => {
        //todo optimize screensubscribed logic
        if (err) this.onError.next(err.message);
        else this.$screenSubscribed.next(screenSubscribed);
      });
      console.log("this.connectionIdSubscribers", this.connectionIdSubscribers);
    }
  }

  private updateExistingSubscribers(event) {
    let connectionIdSubscriber = this.connectionIdSubscribers[
      event.stream.connection.id
    ];
    if (connectionIdSubscriber) {
      if (connectionIdSubscriber[event.stream.videoType]) {
        this.unsubscribeSubscribers(
          connectionIdSubscriber[event.stream.videoType]
        );
      }
    } else {
      this.connectionIdSubscribers[event.stream.connection.id] = {};
    }
  }

  /**
   * Unsubscribe Stream
   */
  unsubscribeSubscribers(subscriber?: any) {
    if (subscriber) {
      this.session.unsubscribe(subscriber, (err) => {
        if (err) this.onError.next(err.message);
      });
    } else {
      Object.keys(this.connectionIdSubscribers).forEach((connectionId) => {
        Object.keys(this.connectionIdSubscribers[connectionId]).forEach(
          (type) => {
            let subscribe = this.connectionIdSubscribers[connectionId][type];
            if (subscribe) this.unsubscribeSubscribers(subscribe);
          }
        );
      });
      this.connectionIdSubscribers = {};
    }
  }

  /**
   * Connect Session
   * @param token
   */
  connectSession(token, elementId, screenElementId, options) {
    return from(
      new Promise((resolve, reject) => {
        this.session.connect(token, (err) => {
          if (err && !_.isUndefined(err)) {
            reject(false);
            if (err.name === error.CONNECT_FAILED.name) {
              this.onError.next(error.CONNECT_FAILED.message);
            } else if (err.name === error.NOT_CONNECTED.name) {
              this.onError.next(error.NOT_CONNECTED.message);
            } else {
              this.onError.next(err.message);
            }
          } else {
            if (this.isCallDisconnected) {
              this.session.disconnect();
              this.isCallDisconnected = false;
              this.isSessionConnected = false;
              // this.session = null;
            } else {
              this.addListerner(elementId, screenElementId, options);
            }
            resolve(true);
          }
        });
      })
    );
  }

  /**
   * Disconnect Session
   */
  disconnectSession() {
    if (this.isSessionConnected && this.session) {
      this.session.disconnect();
      this.isSessionConnected = false;
    } else {
      this.isCallDisconnected = true;
    }
  }

  /**
   * Check Browser Support for Screen Sharing
   */
  checkScreenSharingSupport() {
    return new Promise((resolve, reject) => {
      OT.checkScreenSharingCapability((response) => {
        resolve(response.supported);
      });
    });
  }

  /**
   * Check Permission for Hardware Devices
   */
  async checkUserMediaAccess() {
    try {
      const stream = await OT.getUserMedia();
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Disable/Enable Audio
   * @param {boolean} isAudioDisable
   */
  publishAudio(isAudioDisable) {
    if (this.publisher) this.publisher.publishAudio(isAudioDisable);
  }

  /**
   * Disable/Enable Video
   * @param {boolean} isVideoDisable
   */
  publishVideo(isVideoDisable) {
    if (this.publisher) this.publisher.publishVideo(isVideoDisable);
  }

  /**
   * Change Resolution
   * @param {object} option
   */
  setPreferredResolution(option) {
    this.subscriber.setPreferredResolution(option);
  }

  /**
   * Send Signal to Session
   * @param {string} data
   */
  sendSignal(data, onSuccess = () => {}, onError = () => {}) {
    this.session.signal(
      {
        type: "msg",
        data,
      },
      (err) => {
        if (err) onError();
        else {
          onSuccess();
        }
      }
    );
  }

  /**
   * Send Prescription Signal
   * @param {number} bookingId
   */
  sendPrescriptionSignal(bookingId) {
    this.sendSignal(
      { bookingId },
      () => {
        this.onSendPrescription.next(true);
      },
      () => {
        this.onSendPrescription.next(false);
      }
    );
  }

  removeListeners() {
    this.session.off(
      sessionEvent.STREAM_CREATED,
      sessionEvent.STREAM_DESTROYED
    );
  }
}
