/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { PubnubWrapperService } from "./pubnub-wrapper/pubnub-wrapper.service";
import { EventService } from "./../../../utils/service/eventservice";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import {
  Message,
  ConnectionStatus,
  PresenceStatus,
  MessageUpdateStatus,
  MessageEventType,
  MessageAckTag,
  MessageType,
} from "./chat-model";
import {
  PNOperation,
  PNCategory,
  MessageActionEventData,
  PresenceEventData,
  SignalEventData,
  PresenceEventAction,
} from "./pubnub-wrapper/data-types";
import { CONNECTION_STATUS } from "./constants";

@Injectable()
export class ChatManagerService {
  get uuid() {
    return this._uuid;
  }

  set uuid(value) {
    this._uuid = value;
  }
  set chatToken(value) {
    this._chatToken = value;
  }

  get unreadCount(): number {
    return this._unreadCount;
  }

  set unreadCount(value: number) {
    this._unreadCount = value;
  }

  messages: Array<Message> = [];
  onMessageReceive: BehaviorSubject<MessageUpdateStatus> = new BehaviorSubject<MessageUpdateStatus>(
    {
      event: MessageEventType.NONE,
      messages: this.messages,
    }
  );
  onConnectionUpdate: Subject<ConnectionStatus> = new Subject<ConnectionStatus>();
  onPresenceUpdate: Subject<PresenceStatus> = new Subject<PresenceStatus>();
  onLoadingHistory: Subject<boolean> = new Subject<boolean>();
  onTypingEvent: Subject<boolean> = new Subject<boolean>();
  private _unreadCount: number = 0;
  private user;
  private _chatToken;
  private lastTimeToken = new Date().getTime();
  channelId;
  private _uuid;
  subscriptions: Subscription;
  private lastAckTimeReceiver: string;
  private lastAckTimeSender: string;
  sentMessageJSON: any = {};

  constructor(private pubnub: PubnubWrapperService, public eventService:EventService) {
    this.subscribeStatusEvent();
    this.subscribePresenceEvent();
    this.subscribeSignalEvent();
    this.subscribeNewMessageEvent();
    this.subscribeMessageActionEvent();
  }

  /**
   * subscribes to status event of PubNub service
   */
  private subscribeStatusEvent() {
    this.subscriptions = this.pubnub.onChannelStatusChange.subscribe((s) => {
      if (s.category === PNCategory[PNCategory.PNNetworkDownCategory]) {
        this.onConnectionUpdate.next({
          isConnected: false,
          message: CONNECTION_STATUS.NO_NETWORK,
          connecting: false,
        });
      }
      if (
        s.category === PNCategory[PNCategory.PNNetworkUpCategory] ||
        s.category === PNCategory[PNCategory.PNReconnectedCategory]
      ) {
        this.onConnectionUpdate.next({
          isConnected: true,
          message: CONNECTION_STATUS.CONNECTED,
          connecting: false,
        });
      }
      if (s.operation === PNOperation[PNOperation.PNSubscribeOperation]) {
        if (s.error)
          this.onConnectionUpdate.next({
            isConnected: false,
            message: s.errorData.message,
            connecting: false,
          });
        else if (s.category === PNCategory[PNCategory.PNConnectedCategory]) {
          this.onConnectionUpdate.next({
            isConnected: true,
            message: CONNECTION_STATUS.CONNECTED,
            connecting: false,
          });
          this.getChatHistory(s.currentTimetoken);
          this.getPresenceUpdate();
        }
      }
    });
  }

  initializeSession() {
    if (this._chatToken && this.channelId) {
      this.pubnub.initSession(this.uuid, this._chatToken);
      this.onConnectionUpdate.next({
        isConnected: false,
        message: CONNECTION_STATUS.CONNECTING,
        connecting: true,
      });
      this.pubnub.subscribeChannel(this.channelId);
    }
  }

  initializepatientSession() {
    if (this._chatToken && this.channelId) {
      this.pubnub.initSession(this.uuid, this._chatToken);
      this.onConnectionUpdate.next({
        isConnected: false,
        message: CONNECTION_STATUS.CONNECTING,
        connecting: true,
      });
      this.pubnub.subscribeChannel(this.channelId);
    }
  }

  /**
   *subscribes new message event of PubNub
   */
  private subscribeNewMessageEvent() {
    this.subscriptions.add(
      this.pubnub.onMessageEvent.subscribe((m) => {
        let msg: Message;
        let event = MessageEventType.NEW_SENT;
        msg = {
          userId: m.publisher,
          message: m.message.content,
          time: m.timetoken,
          file: m.message.file,
        };
        if (m.publisher != this.uuid) {
          event = MessageEventType.NEW_ARRIVAL;
          if (m.timetoken > this.lastAckTimeReceiver) {
            this.lastAckTimeReceiver = m.timetoken;
            this.unreadCount++;
          }
        } else {
          if (this.sentMessageJSON[m.timetoken]) {
            msg.sent = this.sentMessageJSON[m.timetoken];
            delete this.sentMessageJSON[m.timetoken];
          }
        }
        this.messages.push(msg);
        this.fireMessageEvent(event);
      })
    );
  }

  /**
   *subscribes new message event of PubNub
   */
  private subscribePresenceEvent() {
    this.subscriptions.add(
      this.pubnub.onPresenceChange.subscribe((p: PresenceEventData) => {
        if (p.channel == this.channelId && p.uuid != this.uuid) {
          this.onPresenceUpdate.next({
            status: p.action,
            uuid: p.uuid,
            time: p.timetoken,
          });
        }
      })
    );
  }

  /**
   *subscribes new message event of PubNub
   */
  private subscribeSignalEvent() {
    this.subscriptions.add(
      this.pubnub.onSignalEvent.subscribe((signal: SignalEventData) => {
        if (signal.channel == this.channelId && signal.publisher != this.uuid) {
          this.onTypingEvent.next(signal.message.typing);
        }
      })
    );
  }

  /**
   *subscribes new message event of PubNub
   */
  private subscribeMessageActionEvent() {
    this.subscriptions.add(
      this.pubnub.onMessageActionEvent.subscribe(
        (ma: MessageActionEventData) => {
          if (
            ma.data.uuid != this.uuid &&
            ma.data.type == "acknowledgement" &&
            ma.data.value == MessageAckTag[MessageAckTag.READ]
          ) {
            this.lastAckTimeReceiver = ma.data.actionTimetoken;
            this.messages.filter(
              (msg) => msg.time === ma.data.messageTimetoken
            )[0].read = ma.data.actionTimetoken;
          }
          if (
            ma.data.uuid == this.uuid &&
            ma.data.type == "acknowledgement" &&
            ma.data.value == MessageAckTag[MessageAckTag.READ]
          ) {
            this.unreadCount = 0;
            this.fireMessageEvent(MessageEventType.COUNT_UPDATE);
          }
        }
      )
    );
  }

  /**
   *sends message on the specified channel
   * @param message
   * @param file
   */
  sendMessage(message: string, file: { url: string; type: MessageType }) {
    if (this.lastAckTimeReceiver)
      this.pubnub.publish(
        {
          channel: this.channelId,
          message: {
            sender: this.uuid,
            content: message,
            lastAckTime: this.lastAckTimeReceiver,
            file,
          },
        },
        (status, response) => {
          if (
            status.error &&
            (status.category ===
              PNCategory[PNCategory.PNNetworkIssuesCategory] ||
              status.category === PNCategory[PNCategory.PNTimeoutCategory])
          ) {
            let msg: Message = {
              userId: <string>this.uuid,
              message: message,
              time: null,
              file,
            };
            this.messages.push(msg);
            this.fireMessageEvent(MessageEventType.NEW_SENT);
          } else if (
            status.category === PNCategory[PNCategory.PNAccessDeniedCategory]
          ) {
            this.onConnectionUpdate.next({
              isConnected: false,
              message: status.errorData.message,
              connecting: false,
            });
          } else if (!status.error) {
            this.addAcknowledgementAction(
              response.timetoken,
              MessageAckTag.SENT
            );
          }
        }
      );
  }

  /**
   * fetches 25 history messages from the currentTime
   */
  getChatHistory(time?) {
    let lastTimeToken = this.messages.length ? this.messages[0].time : time;
    if (this.lastTimeToken != lastTimeToken || !this.messages.length) {
      this.lastTimeToken = lastTimeToken;
      this.onLoadingHistory.next(true);
      this.pubnub.fetchMessages(
        this.channelId,
        lastTimeToken,
        null,
        25,
        (status, response) => {
          this.onLoadingHistory.next(false);
          if (!status.error) {
            let event = this.getEventTypeForHistory();
            var channelMessages = response.channels[this.channelId];
            this.messages.unshift(
              ...this.getFormattedMessages(channelMessages || [])
            );
            this.fireMessageEvent(event);
            if (event == MessageEventType.NEW_ARRIVAL) {
              this.evaluateLastAcknowledgement(time, channelMessages || []);
            }
          }
        }
      );
    }
  }

  private getEventTypeForHistory() {
    if (!this.messages.length) {
      return MessageEventType.NEW_ARRIVAL;
    } else return MessageEventType.HISTORY;
  }

  /**
   * evaluate lastAckTime of receiver ans sender both and hit API call to get unread count
   * @param crntSubscriptionTime
   * @param channelMessages
   */
  private evaluateLastAcknowledgement(crntSubscriptionTime, channelMessages) {
    var recentHistory = channelMessages.length;
    if (recentHistory) {
      var lastMessage = channelMessages[recentHistory - 1];
      if (lastMessage.message.sender == this.uuid) {
        this.lastAckTimeReceiver = this.getAckTimeForTag(
          lastMessage,
          MessageAckTag.READ,
          "lastAckTime"
        );
        this.lastAckTimeSender = this.getAckTimeForTag(
          lastMessage,
          MessageAckTag.SENT,
          "timetoken"
        );
      } else {
        this.lastAckTimeSender = this.getAckTimeForTag(
          lastMessage,
          MessageAckTag.READ,
          "lastAckTime"
        );
        this.getMessagesCount(this.lastAckTimeSender);
        this.lastAckTimeReceiver = this.getAckTimeForTag(
          lastMessage,
          MessageAckTag.SENT,
          "timetoken"
        );
      }
    } else {
      this.lastAckTimeReceiver = crntSubscriptionTime;
    }
  }

  private getAckTimeForTag(message, ackTag: MessageAckTag, messageTimeKey) {
    if (
      message.actions &&
      message.actions.acknowledgement &&
      message.actions.acknowledgement[ackTag] &&
      message.actions.acknowledgement[ackTag][0]
    ) {
      return message.actions.acknowledgement[ackTag][0].actionTimetoken;
    } else {
      return message.message[messageTimeKey];
    }
  }

  private getPresenceUpdate() {
    this.pubnub.hereNow(this.channelId, (status, response) => {
      if (!status.error) {
        var channel = response.channels[this.channelId];
        if (
          channel &&
          (channel.occupancy == 2 ||
            (channel.occupancy == 1 && channel.occupants[0]._uuid != this.uuid))
        ) {
          this.onPresenceUpdate.next({ status: PresenceEventAction.join });
        } else {
          this.onPresenceUpdate.next({ status: PresenceEventAction.leave });
        }
      }
    });
  }

  /**
   * formats the messages
   * @param channelMessages
   * @returns {any}
   */
  private getFormattedMessages(channelMessages) {
    return channelMessages.map((msg) => ({
      userId: msg.message.sender,
      message: msg.message.content,
      time: msg.timetoken,
      read: msg.actions
        ? msg.actions.acknowledgement
          ? msg.actions.acknowledgement.READ
          : null
        : null,
      sent: msg.actions
        ? msg.actions.acknowledgement
          ? msg.actions.acknowledgement.SENT
          : null
        : null,
      file: msg.message.file,
    }));
  }

  /**
   * gets message count after the specified time token
   * @param time
   */
  private getMessagesCount(time) {
    this.pubnub.getMessageCounts(this.channelId, time, (status, response) => {
      console.log("unread, response", status, response);
      if (!status.error) {
        if (response.channels[this.channelId]) {
          this.unreadCount = response.channels[this.channelId];
          this.fireMessageEvent(MessageEventType.COUNT_UPDATE);
        }
      }
    });
  }

  private fireMessageEvent(event) {
    this.onMessageReceive.next({ event, messages: this.messages });
    this.eventService.setUnreadMessages(this.messages);
  }

  /**
   * adds message action for a specified message
   * @param messageTimeToken
   * @param tag
   */
  addAcknowledgementAction(messageTimeToken, tag) {
    this.pubnub.addMessageAction(
      this.channelId,
      messageTimeToken,
      tag,
      (status, response) => {
        if (!status.error) {
          if (tag == MessageAckTag.SENT) {
            var message = this.messages.filter(
              (msg) => msg.time === messageTimeToken
            )[0];
            if (message) message.sent = response.data.actionTimetoken;
            else
              this.sentMessageJSON[messageTimeToken] =
                response.data.actionTimetoken;
          }
        }
      }
    );
  }

  /**
   * send typing signal
   */
  sendSignal(typing) {
    this.pubnub.sendSignal(
      { message: { typing }, channel: this.channelId },
      (status, response) => {}
    );
  }

  ngOnDestroy() {
    this.pubnub.removeListener();
    if (this.channelId) this.pubnub.unsubscribeChannel(this.channelId);
    this.subscriptions.unsubscribe();
  }
}
