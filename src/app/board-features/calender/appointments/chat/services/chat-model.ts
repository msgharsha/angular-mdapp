/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { PresenceEventAction } from "./pubnub-wrapper/data-types";
export interface Message {
  userId: string;
  message: any;
  time: string;
  read?: string;
  sent?: string;
  file: { url: string; type: MessageType };
}
export class ConnectionStatus {
  message: string;
  isConnected: boolean;
  connecting: boolean;
}
export interface PresenceStatus {
  status: PresenceEventAction;
  uuid?: string;
  time?: string;
}
export enum MessageEventType {
  HISTORY,
  NEW_ARRIVAL,
  NEW_SENT,
  COUNT_UPDATE,
  NONE,
}
export class MessageUpdateStatus {
  event: MessageEventType;
  messages: Array<Message>;
}
export enum MessageAckTag {
  SENT = <any>"SENT",
  READ = <any>"READ",
}
export enum MessageType {
  TEXT = <any>"TEXT",
  IMG = <any>"IMAGE",
  DOC = <any>"DOC",
}
