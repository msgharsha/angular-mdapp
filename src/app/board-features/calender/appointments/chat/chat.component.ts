/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { ChatManagerService } from "./services/chat-manager.service";
import { PubnubWrapperService } from "./services/pubnub-wrapper/pubnub-wrapper.service";
import { Subscription } from "rxjs";
import { TranslaterService } from "../../../../utils/service/translater.service";

import {
  Message,
  ConnectionStatus,
  PresenceStatus,
  MessageUpdateStatus,
  MessageEventType,
  MessageAckTag,
  MessageType,
} from "./services/chat-model";
import {
  style,
  state,
  animate,
  transition,
  trigger,
} from "@angular/animations";
import { PresenceEventAction } from "./services/pubnub-wrapper/data-types";

export enum ScrollDirection {
  Top,
  Bottom,
}
@Component({
  selector: "app-chat",
  templateUrl: "chat.component.html",
  styleUrls: ["chat.component.scss"],
  animations: [
    trigger("toggleConnectionMessage", [
      state(
        "void",
        style({
          height: "0px",
        })
      ),
      state(
        "visible",
        style({
          height: "auto",
        })
      ),
      transition("visible => void", [animate("0.3s")]),
      transition("void => visible", [animate("0.3s")]),
    ]),
  ],
  providers: [ChatManagerService, PubnubWrapperService],
})
export class ChatComponent {
  @Input() hasFocus: boolean = true;
  @Input() chatToken: string;
  @Input() channelId: string;
  @Input() uuid: string;
  @Input() sender: any;
  @Input() receiver: any;
  @Input() isOpen: boolean = false;
  message = null;
  file;
  subscriptions: Subscription;
  messageList: Array<Message>;
  userId: string;
  connection: ConnectionStatus;
  presence: PresenceStatus;
  unreadCount: number;
  scrollDirection: ScrollDirection;
  trigger: boolean;
  typing: boolean;
  isConnected: boolean;
  showLoader: boolean;
  @ViewChild("chatMessages", { static: true }) chatMessagesWindow;
  @Output() onCloseChat = new EventEmitter();
  @Output() onUnreadCountUpdate = new EventEmitter();
  messageTypes = MessageType;
  presenceEvents = PresenceEventAction;

  constructor(
    private chatManager: ChatManagerService,
    private translater: TranslaterService
  ) {
    this.subscribeConnectionEvent();
    this.subscribePresenceEvent();
    this.subscribeTypingEvent();
    this.subscribeNewMessageEvent();
  }

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
  }
  private subscribeConnectionEvent() {
    this.subscriptions = this.chatManager.onConnectionUpdate.subscribe(
      (connection: ConnectionStatus) => {
        this.connection = connection;
        this.isConnected = connection.isConnected;
        this.removeConnectionStatusWindow();
      }
    );
  }

  private subscribePresenceEvent() {
    this.subscriptions.add(
      this.chatManager.onPresenceUpdate.subscribe(
        (presence: PresenceStatus) => {
          this.presence = presence;
        }
      )
    );
  }

  private subscribeTypingEvent() {
    this.subscriptions.add(
      this.chatManager.onTypingEvent.subscribe((typing) => {
        this.typing = typing;
        if (this.typing) {
          this.triggerScroll(ScrollDirection.Bottom);
        }
      })
    );
  }

  private subscribeNewMessageEvent() {
    this.subscriptions.add(
      this.chatManager.onMessageReceive.subscribe(
        (messagesStatus: MessageUpdateStatus) => {
          if (messagesStatus.event != MessageEventType.COUNT_UPDATE)
            this.messageList = messagesStatus.messages;
          if (this.chatManager.unreadCount && this.isOpen) {
            this.sendAckForAllUnread(this.chatManager.unreadCount);
          }
          if (this.hasFocus) {
            this.chatManager.unreadCount = 0;
            if (messagesStatus.event == MessageEventType.HISTORY) {
              this.triggerScroll(ScrollDirection.Top);
            } else {
              this.triggerScroll(ScrollDirection.Bottom);
              this.sendAckActionForLastMessage();
            }
          } else {
            this.triggerCountUpdate(this.chatManager.unreadCount);
          }
        }
      )
    );
  }

  /**
   * send READ acknowledgement for latest received message
   */
  private sendAckActionForLastMessage() {
    var messageLength = this.messageList.length;
    if (messageLength) {
      var lastMessage = this.messageList[messageLength - 1];
      if (lastMessage.userId != this.uuid)
        this.chatManager.addAcknowledgementAction(
          lastMessage.time,
          MessageAckTag.READ
        );
    }
  }

  ngOnChanges(sampleChanges) {
    if (sampleChanges["hasFocus"] && this.hasFocus) {
      this.chatManager.unreadCount = 0;
      if (this.unreadCount) {
        this.sendAckForAllUnread(this.unreadCount);
      }
      this.triggerCountUpdate(0);
      this.removeConnectionStatusWindow();
      this.triggerScroll(ScrollDirection.Bottom);
    }
    if (
      sampleChanges["chatToken"] ||
      sampleChanges["channelId"] ||
      sampleChanges["uuid"]
    ) {
      if (this.chatToken && this.channelId && this.uuid) {
        this.chatManager.channelId = this.channelId;
        this.chatManager.chatToken = this.chatToken;
        this.chatManager.uuid = this.uuid;
        this.chatManager.initializeSession();
      }
    }
  }

  private triggerCountUpdate(count) {
    this.unreadCount = count;
    this.onUnreadCountUpdate.emit(count);
  }

  sendMessage() {
    if (this.isConnected && !this.showLoader) {
      this.onTyping(false);
      let msg;
      if (this.message && this.message.trim()) {
        msg = this.message;
        this.message = "";
      }
      let file;
      if (this.file && this.file.url) {
        let fileExt = this.file.url.substring(this.file.url.lastIndexOf("."));
        let type = fileExt === ".pdf" ? MessageType.DOC : MessageType.IMG;
        file = { ...this.file, type };
        this.clearFileData();
      }
      if (msg || file) this.chatManager.sendMessage(msg, file);
    }
  }

  /**
   * scrolls the chat window in provided direction
   * @param direction
   */
  scrollChatWindow(direction) {
    if (this.chatMessagesWindow) {
      let element = this.chatMessagesWindow.nativeElement;
      element.scrollTop =
        direction === ScrollDirection.Top ? 0 : element.scrollHeight + 400;
      this.trigger = false;
    }
  }

  /**
   * after view update triggers scroll if there is any update required
   */
  ngAfterViewChecked() {
    if (this.trigger) {
      this.scrollChatWindow(this.scrollDirection);
    }
  }

  /**
   * closes chat window
   */
  closeChat() {
    this.onCloseChat.emit();
  }

  /**
   * acknowledges all the unread Messages
   * @param unreadCount
   */
  private sendAckForAllUnread(unreadCount) {
    let unreadMessages;
    if (this.messageList.length > unreadCount) {
      unreadMessages = this.messageList.slice(
        this.messageList.length - 1 - unreadCount
      );
    } else {
      unreadMessages = this.messageList;
    }
    unreadMessages.forEach((msg) =>
      this.chatManager.addAcknowledgementAction(msg.time, MessageAckTag.READ)
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private removeConnectionStatusWindow() {
    if (this.hasFocus)
      setTimeout(() => {
        this.connection = null;
      }, 3000);
  }

  /*  Monitors pressed keys on Input
   - Dispatches a message when the ENTER key is pressed
   - Closes the current focused window on ESC
   */
  onChatInputTyped(event: any): void {
    switch (event.keyCode) {
      case 13:
        this.sendMessage();
        break;
      case 27:
        this.closeChat();
        break;
    }
  }

  /**
   * send typing signal
   * @param typing
   */
  onTyping(typing) {
    this.chatManager.sendSignal(typing);
  }

  /**
   * hits history load
   */
  loadHistory() {
    this.chatManager.getChatHistory();
  }

  /**
   * fileUploading started
   * @param loading
   */
  uploadingStart(loading: boolean) {
    this.showLoader = loading;
    this.handleChatWindowScroll();
  }

  private handleChatWindowScroll() {
    if (this.chatMessagesWindow && this.showLoader) {
      let element = this.chatMessagesWindow.nativeElement;
      if (
        element.scrollHeight - element.offsetHeight - element.scrollTop <
        100
      ) {
        this.triggerScroll(ScrollDirection.Bottom);
      }
    }
  }

  /**
   * updates chat winodw scroll information
   * @param direction
   */
  private triggerScroll(direction: ScrollDirection) {
    this.trigger = true;
    this.scrollDirection = direction;
  }

  clearFileData(fileUploader?) {
    if (fileUploader) {
      let type = this.file.url.includes(".pdf") ? "doc" : "image";
      fileUploader.deleteFileFromAWS(type);
    } else {
      this.file = { url: null, originalName: null };
    }
  }
}
