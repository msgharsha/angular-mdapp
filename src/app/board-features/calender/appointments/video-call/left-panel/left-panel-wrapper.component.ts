/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { UserService } from "./../../../../../utils/service/user.service";
import { ToasterService } from "./../../../../../utils/service/toaster.service";
import { Component, ViewContainerRef, Input } from "@angular/core";
import {
  animate,
  style,
  state,
  transition,
  trigger,
} from "@angular/animations";
import { ChatService } from "./chat.auth-service";

@Component({
  selector: "app-chat-left-panel",
  templateUrl: "./left-panel-wrapper.component.html",
  styleUrls: ["./left-panel-wrapper.component.scss"],
  animations: [
    trigger("openClose", [
      state(
        "open",
        style({
          left: "0px",
        })
      ),
      state(
        "closed",
        style({
          left: "-400px",
        })
      ),
      transition("open => closed", [animate("0.3s")]),
      transition("closed => open", [animate("0.3s")]),
    ]),
  ],
  providers: [ChatService],
})
export class LeftPanelChatWrapper {
  @Input() bookingId: number;
  isOpen: boolean = false;
  unreadCount: number;
  triggerCount: boolean;
  chatToken: string;
  channelId: string;
  uuid: string;
  receiver: any;
  sender: any;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private toaster: ToasterService,
    private vref: ViewContainerRef
  ) {}

  ngOnChanges(changes) {
    if (changes["bookingId"] && this.bookingId) {
      this.getChatAccess();
    }
  }

  /**
   * closes chat window
   */
  closeChat() {
    this.isOpen = false;
  }

  /**
   * open chat window
   */
  openChat() {
    if (this.chatToken) this.isOpen = true;
  }

  triggerCountUpdate(count) {
    this.unreadCount = count;
    this.triggerCount = false;
    this.triggerCount = true;
  }

  getChatAccess() {
    // this.chatService.getChatSessionToken(this.bookingId).subscribe((res) => {
    //   const sessionData = JSON.parse(res._body).data;
    //   if (sessionData && sessionData.token) {
    //     this.chatToken = sessionData.token;
    //     this.channelId = sessionData.channelNames[0];
    //     this.uuid = this.userService.getUserId();
    //     this.sender = sessionData.sender;
    //     this.receiver = sessionData.receiver;
    //   } else {
    //     this.toaster.showError(this.vref, sessionData.message, "Error Occurred");
    //   }
    // }, (err) => {
    //   let errObj = JSON.parse(err._body);
    //   let errMessage = errObj.detail || "Some Error Occurred, Please Try Again Later";
    //   this.toaster.showError(this.vref, errMessage, "Error Occurred");
    // });
  }

  revokeAccess() {
    // this.chatService.getChatSessionToken(this.bookingId, true).subscribe((res) => {
    //   this.chatToken = null;
    //   this.channelId = null;
    // });
  }

  ngOnDestroy() {
    //todo stopped revoking access on destroy need to find a fix, and then uncomment
    // this.revokeAccess();
  }
}
