/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";

@Pipe({
  name: "timings",
})
export class TimingsPipe implements PipeTransform {
  transform(inputArr: Array<any>) {
    if (!_.isArray(inputArr)) return [];

    let availableArr = _.map(inputArr, (inp) => {
      return _.assign(inp, { time: moment(inp.time).format("hh:mm a") });
    });
    if (availableArr.length > 4) {
      return _.chain(_.take(availableArr, 3)).concat({ time: "More" }).value();
    } else {
      return availableArr;
    }
  }
}
