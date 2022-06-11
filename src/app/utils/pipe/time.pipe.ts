/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";

@Pipe({
  name: "otpTime",
})
export class OtpTimePipe implements PipeTransform {
  transform(inputTime: number) {
    let remainingMin = _.floor(_.divide(inputTime, 60000));
    let remainingSec = _.divide(
      _.subtract(inputTime, _.multiply(remainingMin, 60000)),
      1000
    );
    return remainingMin + ":" + remainingSec;
  }
}
