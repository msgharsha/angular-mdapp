/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoaderService } from "../../../../../utils/component/loader/loader.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { VideoCallVerificationService } from "./video-cal-verification.service";
import { TranslaterService } from "../../../../../utils/service/translater.service";

@Component({
  selector: "app-video-verification",
  templateUrl: "./video-call-verification.component.html",
  styleUrls: ["./vide-call-verification.component.scss"],
  providers: [VideoCallVerificationService],
})
export class VideoCallVerificationComponent implements OnInit {
  message;
  isError: boolean;
  email;

  constructor(
    private _activateRoute: ActivatedRoute,
    private loader: LoaderService,
    private verificationService: VideoCallVerificationService,
    private _router: Router,
    private toastService: ToasterService,
    private errorHandler: ErrorService,
    private translater: TranslaterService
  ) {}

  ngOnInit() {
    let bookingParam = this._activateRoute.snapshot.queryParams.bookingId;
    if (bookingParam) {
      this.loader.showLoader();
      this.verificationService.getSessionToken(bookingParam).subscribe(
        (res) => {
          const resBody = JSON.parse(res._body);
          this.loader.hideLoader();
          this.isError = false;
          this.message = resBody.message;
          const sessionData = resBody.data;
          const bookingId = sessionData.bookingId;
          if (sessionData && sessionData.sessionId && sessionData.token) {
            this._router.navigate(["video-call"], {
              queryParams: {
                sessionId: sessionData.sessionId,
                token: sessionData.token,
                bookingId,
              },
            });
          } else {
            this.isError = true;
            this.message = sessionData.message;
            this.toastService.showError(
              null,
              sessionData.message,
              "Error Occurred"
            );
            this.goToFeature();
          }
        },
        (err) => {
          this.isError = true;
          this.loader.hideLoader();
          this.errorHandler.handleError(err, null);
          this.goToFeature();
        }
      );
    } else {
      this.goToFeature();
    }
    this.translater.TranslationAsPerSelection();
  }

  private goToFeature() {
    this._router.navigateByUrl("/feature");
  }
}
