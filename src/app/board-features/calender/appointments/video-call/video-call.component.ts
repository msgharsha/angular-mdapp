/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { RIGHT_PANEL } from "./right-panel/right-panel.component";
import { ToasterService } from "../../../../utils/service/toaster.service";
import { Subscription } from "rxjs";
import { SessionManager } from "../../../../utils/component/open-tok-call/session-manager.service";
import { TranslaterService } from "../../../../utils/service/translater.service";

@Component({
  selector: "video-call-page",
  templateUrl: "video-call.component.html",
  styleUrls: ["video-call.component.scss"],
  animations: [
    trigger("openCloseMotion", [
      state(
        "open",
        style({
          width: "calc(100% - 345px)",
        })
      ),
      state(
        "closed",
        style({
          width: "100%",
        })
      ),
      transition("open => closed", [animate("0.3s")]),
      transition("closed => open", [animate("0.3s")]),
    ]),
  ],
  providers: [SessionManager],
})
export class VideoCallComponent implements OnInit {
  private bookingId = null;

  public panelName = RIGHT_PANEL.CLOSE;
  public isOpen = false;
  private subscriptions: Subscription;
  isCallConnected: boolean = true;
  isD2D: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private sessionManager: SessionManager,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private ngZone: NgZone,
    private translater: TranslaterService
  ) {
    this.subscribePrescriptionEvent();
  }

  private subscribePrescriptionEvent() {
    this.subscriptions = this.sessionManager.onSendPrescription.subscribe(
      (success) => {
        if (success)
          this.toaster.showSuccess(
            this.vref,
            "Notified to the patient.",
            "Prescription saved."
          );
        else
          this.toaster.showSuccess(this.vref, "Prescription saved.", "Success");
      }
    );
  }

  ngOnInit() {
    this.subscribeRouteParams();
    this.translater.TranslationAsPerSelection();
  }

  subscribeRouteParams() {
    this.route.queryParams.subscribe((params) => {
      this.bookingId = params["bookingId"];
      this.isD2D = "false" == params["isD2D"] ? false : true;
    });
  }

  openRightPanel(panelName) {
    this.panelName = panelName;
    this.updateOpenClose();
  }

  closeRightPanel() {
    this.panelName = RIGHT_PANEL.CLOSE;
    this.updateOpenClose();
  }

  updateOpenClose() {
    this.isOpen = this.panelName != RIGHT_PANEL.CLOSE;
  }

  MedicalReport() {
    this.openRightPanel(RIGHT_PANEL.MEDICAL_REPORT);
  }

  MedicalHistory() {
    this.openRightPanel(RIGHT_PANEL.MEDICAL_HISTORY);
  }

  DiagnosePatient() {
    this.openRightPanel(RIGHT_PANEL.DIAGNOSIS);
  }

  onConnectionUpdate(status) {
    this.ngZone.run(() => {
      this.isCallConnected = status;
    });
  }
}
