/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { environment } from "../../../../../../../environments/environment";
import {
  PubNubUserState,
  PubNubMessage,
  PubNubUser,
  PresenceEventData,
  MessageActionEventData,
  SignalEventData,
} from "./data-types";
declare var PubNub;

@Injectable()
export class PubnubWrapperService {
  get session() {
    if (!this._session) throw "Instance Required.";
    return this._session;
  }

  set session(value) {
    this._session = value;
  }

  private _session;
  onChannelStatusChange: Subject<any> = new Subject<any>();
  onPresenceChange: Subject<PresenceEventData> = new Subject<PresenceEventData>();
  onMessageEvent: Subject<any> = new Subject<any>();
  onSignalEvent: Subject<SignalEventData> = new Subject<SignalEventData>();
  onMessageActionEvent: Subject<MessageActionEventData> = new Subject<MessageActionEventData>();
  listener = {
    message: (m) => {
      console.log("message", m);
      this.onMessageEvent.next(m);
    },
    presence: (p: PresenceEventData) => {
      console.log("presence", p);
      this.onPresenceChange.next(p);
    },
    signal: (s) => {
      console.log("signal", s);
      this.onSignalEvent.next(s);
      // handle signal
    },
    messageAction: (ma) => {
      this.onMessageActionEvent.next(ma);
      console.log("maction", ma);
    },
    status: (s) => {
      console.log("status", s);
      this.onChannelStatusChange.next(s);
    },
  };

  constructor() {}

  /**
   * gets Pubnub session
   * @param uuid
   * @param token
   * @returns {any}
   */
  initSession(uuid, token) {
    if (!this._session) {
      this.session = new PubNub({
        ...environment.pubnubKeys,
        uuid: uuid,
        ssl: true,
        authKey: token,
        autoNetworkDetection: true, // enable for non-browser environment automatic reconnection
        restore: true, // enable catchup on missed messages
        presenceTimeout: 120,
        heartbeatInterval: 30,
      });
    }
    this.addListener();
  }

  /**
   * creates User
   * @param user
   * @param handler
   */
  createUser(user: PubNubUser, handler: (status, response) => void) {
    this.session.createUser(user, handler);
  }

  /**
   * gets User
   * @param userId
   * @param includeOptions
   * @param handler
   */
  getUser(
    userId: string,
    includeOptions = { customFields: true },
    handler: (status, response) => void
  ) {
    this.session.getUser(
      {
        userId: userId,
        include: includeOptions,
      },
      handler
    );
  }

  /**
   * subscribes the channel
   * @param channelId
   * @param withPresence
   */
  subscribeChannel(channelId, withPresence?) {
    this.session.subscribe({
      channels: [channelId],
      withPresence: true,
    });
  }

  /**
   * unsubscribe the channel
   * @param channelId
   */
  unsubscribeChannel(channelId) {
    this.session.unsubscribe({
      channels: [channelId],
    });
  }

  /**
   * updates state for channel
   * @param state
   * @param handler
   */
  setState(state: PubNubUserState, handler: (status, response) => void) {
    this.session.setState(state, handler);
  }

  /**
   * get user's state
   * @param uuid
   * @param channelId
   * @param handler
   */
  getState(uuid, channelId, handler: (status, response) => void) {
    this.session.getState(
      {
        uuid: uuid,
        channels: [channelId],
      },
      handler
    );
  }

  /**
   * gets channles updated state for channelId
   * @param channelId
   * @param handler
   */
  hereNow(channelId, handler: (status, response) => void) {
    this.session.hereNow(
      {
        channels: [channelId],
        includeState: true,
      },
      handler
    );
  }

  /**
   * add listeners on pubnub session
   */
  addListener() {
    this.session.addListener(this.listener);
  }

  /**
   * sends messages
   * @param message
   * @param handler
   */
  publish(message: PubNubMessage, handler) {
    this.session.publish(message, handler);
  }

  sendSignal(message: PubNubMessage, handler) {
    try {
      this.session.signal(message, handler);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * gets messages count
   * @param channelId
   * @param lastTimeToken
   * @param handler
   */
  getMessageCounts(channelId: string, lastTimeToken, handler) {
    this.session.messageCounts(
      {
        channels: [channelId],
        channelTimetokens: [lastTimeToken],
      },
      handler
    );
  }

  /**
   * fetches messages
   * @param channelId
   * @param currentTime
   * @param lastTime
   * @param count
   * @param handler
   */
  fetchMessages(
    channelId: string,
    currentTime: number,
    lastTime: number,
    count: number = 100,
    handler
  ) {
    let options = {
      channels: [channelId],
      count: count,
      includeMessageActions: true,
    };
    if (currentTime) {
      options["start"] = "" + currentTime;
    }
    if (lastTime) {
      options["end"] = "" + lastTime;
    }
    this.session.fetchMessages(options, handler);
  }

  /**
   * adds messages action for the message of that particular time stamp
   * @param channelId
   * @param messageTimetoken
   * @param ackTag
   * @param handler
   */
  addMessageAction(channelId, messageTimetoken, ackTag, handler) {
    this.session.addMessageAction(
      {
        channel: channelId,
        messageTimetoken: messageTimetoken,
        action: {
          type: "acknowledgement",
          value: ackTag,
        },
      },
      handler
    );
  }

  removeListener() {
    try {
      this.session.removeListener(this.listener);
    } catch (err) {}
  }
}
