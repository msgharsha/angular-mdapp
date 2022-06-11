/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { UserService } from "./../../../../../utils/service/user.service";
import { ToasterService } from "./../../../../../utils/service/toaster.service";
import {
  Component,
  ViewContainerRef,
  Input,
  EventEmitter,
} from "@angular/core";
import {
  animate,
  style,
  state,
  transition,
  trigger,
} from "@angular/animations";
import { ChatService } from "./chat.auth-service";
import { Output } from "@angular/core";
import { AppointmentService } from "../../appointments.service";

@Component({
  selector: "app-chat-left-panel",
  templateUrl: "./left-panel-wrapper.component.html",
  styleUrls: ["./left-panel-wrapper.component.scss"],
  animations: [
    trigger("openClose", [
      state(
        "open",
        style({
          right: "30px",
          display: "block",
        })
      ),
      state(
        "closed",
        style({
          right: "-400px",
          display: "none",
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
  @Input() defaultOpenChat: boolean;
  @Output() chatUnreadCount = new EventEmitter<any>();
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
    private vref: ViewContainerRef,
    private appointmentService: AppointmentService
  ) {}

  ngOnChanges(changes) {
    if (changes["bookingId"] && this.bookingId) {
      this.getChatAccess();
    }

    this.appointmentService.isDefaultChatOpen.subscribe(
      (res) => (this.isOpen = res)
    );
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
    this.chatUnreadCount.emit(this.unreadCount);
    this.triggerCount = false;
    this.triggerCount = true;
  }

  getChatAccess() {
    this.chatService.getChatSessionToken(this.bookingId).subscribe(
      (res) => {
        const sessionData = res.data;
        if (sessionData && sessionData.token) {
          this.chatToken = sessionData.token;
          this.channelId = sessionData.channelNames[0];
          this.uuid = this.userService.getUserObj()
            ? this.userService.getUserObj().userId
            : this.userService.getChatUserUUID();
          this.sender = sessionData.sender;
          this.receiver = sessionData.receiver;

          if (this.defaultOpenChat) {
            this.isOpen = true;
          }
        } else {
          this.toaster.showError(
            this.vref,
            sessionData.message,
            "Error Occurred"
          );
        }
      },
      (err) => {
        let errObj = JSON.parse(err.body);
        let errMessage =
          errObj.detail || "Some Error Occurred, Please Try Again Later";
        this.toaster.showError(this.vref, errMessage, "Error Occurred");
      }
    );
  }

  revokeAccess() {
    this.chatService
      .getChatSessionToken(this.bookingId, true)
      .subscribe((res) => {
        this.chatToken = null;
        this.channelId = null;
      });
  }

  ngOnDestroy() {
    //todo stopped revoking access on destroy need to find a fix, and then uncomment
    // this.revokeAccess();
  }
}
