/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { ToastrService } from "ngx-toastr";
import { Injectable, ViewContainerRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class ToasterService {
  get viewContainerRef(): ViewContainerRef {
    return this._viewContainerRef;
  }

  set viewContainerRef(value: ViewContainerRef) {
    this._viewContainerRef = value;
  }

  private _viewContainerRef: ViewContainerRef;

  constructor(
    public toaster: ToastrService,
    public translate: TranslateService
  ) {}

  showSuccess(vcr: ViewContainerRef, title: string, message: string) {
    this.toaster.success(
      this.translate.instant("SUCCESS") + this.translate.instant(message),
      title,
      { positionClass: "toast-top-center" }
    );
  }

  showError(vcr: ViewContainerRef, title: string, message: string) {
    this.toaster.error(
      this.translate.instant("ERROR") + this.translate.instant(message),
      title,
      { positionClass: "toast-top-center" }
    );
  }
  toastClear(){
    this.toaster.clear();
  }

  showWarning(
    vcr: ViewContainerRef,
    title: string,
    message: string,
    parameter?
  ) {
    this.toaster.warning(
      this.translate.instant("WARNING") +
        this.translate.instant(message, parameter),
      title,
      { positionClass: "toast-top-center" }
    );
  }

  showInfo(vcr: ViewContainerRef, title: string, message: string) {
    this.toaster.info(
      this.translate.instant("INFO") + this.translate.instant(message),
      title,
      { positionClass: "toast-top-center" }
    );
  }
}
