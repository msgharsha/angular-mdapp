/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { UserService } from "../service/user.service";
import { MessagingService } from "../service/messaging.service";
import { Router } from "@angular/router";

/**
 * This interceptor automatically adds the token header needed by our backend API if such token is present
 * in the current state of the application.
 */
@Injectable({
  providedIn: "root",
})
export class InterceptorService implements HttpInterceptor {
  constructor(
    private userService: UserService,
    private router: Router,
    public messagingService: MessagingService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: any) => {
        return event;
      }),
      catchError((error) => {
        console.log("==========", error);

        if ([401, 403].includes(error.status)) {
          this.messagingService.deleteFcmToken();
          this.userService.logout();
          this.router.navigateByUrl("/auth/login");
        }
        return throwError(error);
      })
    );
  }
}
