/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

export enum videoType {
  VIDEO = "video",
  SCREEN = "screen",
}

export enum sessionEvent {
  SESSION_CONNECTED = "sessionConnected",
  STREAM_CREATED = "streamCreated",
  STREAM_DESTROYED = "streamDestroyed",
  SIGNAL_MSG = "signal:msg",
}

export enum publishEvent {
  STREAM_DESTROYED = "streamDestroyed",
  DESTROYED = "destroyed",
}

export enum reason {
  MEDIA_STOPPED = "mediaStopped",
  FORCE_UNPUBLISHED = "forceUnpublished",
  CLIENT_DISCONNECTED = "clientDisconnected",
  FORCE_DISCONNECTED = "forceDisconnected",
  NETWORK_DISCONNECTED = "networkDisconnected",
}

export const error = {
  ACCESS_DENIED: {
    code: 1500,
    name: "OT_USER_MEDIA_ACCESS_DENIED",
    message: "End-user denied permission to hardware devices.",
  },
  CONNECT_FAILED: {
    name: "OT_CONNECT_FAILED",
    message: "Connection failed. Please try again!",
  },
  NOT_CONNECTED: {
    name: "OT_NOT_CONNECTED",
    message:
      "You are not connected to the internet. Check your network connection.",
  },
};
