/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable, ViewContainerRef } from "@angular/core";
import * as _ from "lodash";
import { ToasterService } from "./toaster.service";
import { HttpResponse } from "@angular/common/http";

@Injectable()
export class ErrorService {
  public errorCodes = {};

  private genericErrorObject = {
    ERROR_TITLE: "Error Occurred",
    ERROR_DESC: "Some error occurred, please try again later",
  };

  constructor(private toaster: ToasterService) {}

  showGenericError(view: ViewContainerRef) {
    this.toaster.showError(
      view,
      _.get(this.genericErrorObject, "ERROR_TITLE"),
      _.get(this.genericErrorObject, "ERROR_DESC")
    );
  }

  showCustomError(errObj: any, view: ViewContainerRef, errorKey?) {
    this.toaster.showError(
      view,
      _.get(errObj, "code", "Error Occurred"),
      _.get(
        errObj,
        errorKey || "detail",
        "Some Error Occured, Please Try Again Later"
      )
    );
  }

  parseError(err) {
    return _.attempt(JSON.parse.bind(null, err));
  }

  executeFunction(callback, errObj) {
    let callbackParam = _.isError(errObj) ? null : errObj;
    if (_.isFunction(callback)) callback(callbackParam);
  }

  handleError(
    err: HttpResponse<any>,
    view: ViewContainerRef,
    callback?: Function,
    key = "message"
  ) {
    let errBody = _.get(err, "error", {});
    if (_.isError(errBody)) {
      this.showGenericError(view);
    } else {
      this.showCustomError(errBody, view, key);
    }

    this.executeFunction(callback, errBody);
  }
}
