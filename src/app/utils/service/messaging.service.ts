/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { HttpService } from "../service/http.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { environment } from "../../../environments/environment";
@Injectable()
export class MessagingService {
  public token;
  public notificationCount = 0;
  public inboxUrl = environment.portalURL + "feature/inbox";
  currentMessage = new BehaviorSubject(null);

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private httpService: HttpService,
    private localStorageService: LocalStorageService
  ) {
    this.angularFireMessaging.messages.subscribe(
      (_messaging: AngularFireMessaging) => {
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    );
  }

  // INBOX Service API

  sendInboxToken(token) {
    let bodyObj = {
      device_id: "web",
      device_token: token,
    };
    return this.httpService.postRequest("notification/device/login", bodyObj);
  }

  getInboxListing(params) {
    return this.httpService.getRequest("notification/device/inbox", params);
  }

  deleteInboxToken(fcmToken) {
    return this.httpService.deleteRequest(
      `notification/device/logout/${fcmToken}`
    );
  }

  getDoctorStatus() {
    return this.httpService.getRequest('practice/status');
  }

  deleteFcmToken() {
    let fcmToken = this.localStorageService.getItem("fcmToken");
    if (!fcmToken) {
      this.localStorageService.removeItem("fcmToken");
      return;
    }
    this.deleteInboxToken(fcmToken).subscribe(
      (res) => {
        this.localStorageService.removeItem("fcmToken");
      },
      (err) => {
        console.log(err);
      }
    );
  }

  requestInboxPermission() {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        if (!token) {
          this.localStorageService.removeItem("fcmToken");
          return;
        }
        this.sendInboxToken(token).subscribe(
          (res) => {
            this.localStorageService.setItem("fcmToken", token);
          },
          (err) => {
            console.log(err);
          }
        );
      },
      (err) => {
        console.error("Unable to get permission to notify.", err);
      }
    );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        this.notificationCount = this.notificationCount + 1;
        this.currentMessage.next(payload);
        this.showCustomNotification(payload);
      },
      (err) => {
        console.error("Unable to get  to notify.", err);
      }
    );
  }

  showCustomNotification(payload: any) {
    let notify_data = payload["notification"];
    let title = notify_data["title"];
    let options = {
      body: notify_data["body"],
      Icon: "",
      badge: "",
      Image: "",
    };
    let notify: Notification = new Notification(title, options);

    notify.onclick = (event) => {
      event.preventDefault();
      window.location.href = this.inboxUrl;
    };
  }
}
