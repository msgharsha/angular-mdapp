/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable, ViewContainerRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DialogModalComponent } from "../component/cancel-modal/cancel-modal.component";
import { ToasterService } from "./toaster.service";
import { DOCUMENT } from "@angular/common";
import { Inject } from "@angular/core";
import { ERR_MSG } from "../../constants/errors/messages";
import { MSG } from "../../constants/messages";
import { Renderer2 } from "@angular/core";
import { RendererFactory2 } from "@angular/core";

@Injectable()
export class HelperService {
  public renderer: Renderer2;

  constructor(
    private _toast: ToasterService,
    public matDialog: MatDialog,
    private _renderer: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = _renderer.createRenderer(null, null);
  }

  errorHandling(err, vcr?) {
    console.log("global error handler", err);
    let errMessage = "";
    try {
      const errObj = JSON.parse(err._body);
      errMessage = errObj.detail || ERR_MSG.RANDOM;
    } catch (ex) {
      errMessage = ERR_MSG.CONN;
    }
    if (vcr) {
      this._toast.showError(vcr, errMessage, ERR_MSG.TITLE);
    } else {
      // this._toast.showTestError(errMessage, ERR_MSG.TITLE);
    }
    return;
  } // error-handling method closes

  successHandling(success: any, vcr?: ViewContainerRef) {
    console.log("global success handler", success);
    let successMsg = "";
    try {
      const successObj = JSON.parse(success._body);
      successMsg = successObj.detail || successObj.message || MSG.SUCCESS.MSG;
    } catch (ex) {
      successMsg = MSG.SUCCESS.MSG;
    }
    if (vcr) {
      this._toast.showSuccess(vcr, successMsg, MSG.SUCCESS.TITLE);
    } else {
      // this._toast.showSuccess(successMsg, MSG.SUCCESS.TITLE);
    }
  } //success-handling

  removeEmptyProps(obj) {
    for (var property in obj) {
      if (
        obj.hasOwnProperty(property) &&
        [null, "", NaN].indexOf(obj[property]) > -1
      ) {
        delete obj[property];
      }
    }
    return obj;
  }

  public confirmAction(successCallback, message?: string, failureCallback?) {
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      height: "350px",
      width: "350px",
      data: {
        message: message,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) successCallback();
      else if (failureCallback) failureCallback();
    });
  }

  public toggleSidebar() {
    const sidebarElements = this.getSidebarElements();

    if (sidebarElements.sidebarClass && sidebarElements.sidebarClass.length) {
      this.renderer.removeClass(sidebarElements.sidebarDiv, "sidenav-active");
      this.renderer.removeClass(
        sidebarElements.sidebarOverlayDiv,
        "sidenav-active"
      );
      return;
    }
    this.renderer.addClass(sidebarElements.sidebarDiv, "sidenav-active");
    this.renderer.addClass(sidebarElements.sidebarOverlayDiv, "sidenav-active");
  }

  getSidebarElements() {
    return {
      sidebarDiv: this.document.getElementById("sidenav"),
      sidebarOverlayDiv: this.document.getElementById("sidenav-overlay"),
      sidebarClass: this.document.getElementsByClassName("sidenav-active"),
    };
  }

  titleCase(string) {
    let sentence = string.toLowerCase().split(" ");
    for (let i = 0; i < sentence.length; i++) {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    
    return sentence.join(" ");
  }

} // Service-closes
