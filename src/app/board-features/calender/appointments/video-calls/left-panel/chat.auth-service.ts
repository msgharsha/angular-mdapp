/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { HttpService } from "./../../../../../utils/service/http.service";
import { Injectable } from "@angular/core";

@Injectable()
export class ChatService {
  constructor(private _http: HttpService) {}

  public getChatSessionToken(id, revokedChatAccess?) {
    let url = `consultation/chat-auth/${id}`;
    if (revokedChatAccess) {
      url += `?revokedChatAccess=${revokedChatAccess}`;
    }

    return this._http.getRequest(url);
  }
}
