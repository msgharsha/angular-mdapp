/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class LoaderService {
  private callPendingStatus = 0;
  public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {}

  public showLoader() {
    this.callPendingStatus++;
    if (this.callPendingStatus > 0) {
      this.status.next(true);
    }
  }

  public hideLoader(force?: boolean) {
    if (this.callPendingStatus > 0) {
      this.callPendingStatus--;
    }

    if (this.callPendingStatus <= 0) {
      this.callPendingStatus = 0;
      this.status.next(false);
    }
    if (force) {
      this.callPendingStatus = 0;
      this.status.next(false);
    }
  }
}
