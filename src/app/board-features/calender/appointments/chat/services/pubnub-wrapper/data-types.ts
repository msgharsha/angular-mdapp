/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

export class PubNubUser {
  id: string;
  name: string;
}
export class PubNubUserState {
  state: { lastAckTime: string };
  channels: Array<string>;
  uuid: string;
}
export class PubNubMessage {
  message: any;
  channel: string;
}
export enum PNOperation {
  PNSubscribeOperation = <any>"PNSubscribeOperation",
  PNFetchMessagesOperation = <any>"PNFetchMessagesOperation",
}
export enum PNCategory {
  PNTimeoutCategory = <any>"PNTimeoutCategory",
  PNBadRequestCategory = <any>"PNBadRequestCategory",
  PNAccessDeniedCategory = <any>"PNAccessDeniedCategory",
  PNNetworkUpCategory = <any>"PNNetworkUpCategory",
  PNNetworkDownCategory = <any>"PNNetworkDownCategory",
  PNConnectedCategory = <any>"PNConnectedCategory",
  PNReconnectedCategory = <any>"PNReconnectedCategory",
  PNNetworkIssuesCategory = <any>"PNNetworkIssuesCategory",
}

export class PNStatus {
  error: string;
  category: string;
  operation: string;
  errorData: any;
}
export enum PresenceEventAction {
  timeout = <any>"timeout",
  join = <any>"join",
  leave = <any>"leave",
  "state-change" = <any>"state-change",
}
export interface PresenceEventData {
  action: PresenceEventAction; //Can be join, leave, state-change or timeout
  channel: string; // The channel for which the message belongs
  occupancy: number; // No. of users connected with the channel
  state: any; // User State
  subscription: string; //The channel group or wildcard subscription match (if exists)
  timestamp: string; //Publish timetoken
  timetoken: string; //Current timetoken
  uuid: string; // UUIDs of users who are connected with the channel
}
enum MessageActionType {
  added = <any>"added",
  removed = <any>"removed",
}
export interface MessageActionEventData {
  channel: string; // The channel for which the message belongs
  publisher: string; //The Publisher
  event: MessageActionType; // message action added or removed
  data: {
    uuid: string;
    type: string; // message action type
    value: string; // message action value
    messageTimetoken: string; // The timetoken of the original message
    actionTimetoken: string; //The timetoken of the message action
  };
}
export interface SignalEventData {
  channel: string; // The channel for which the message belongs
  publisher: string; //The Publisher
  message: any; //The message
  timetoken: string; //Current timetoken
  subscription: string; //The channel group or wildcard subscription match (if exists)
}
