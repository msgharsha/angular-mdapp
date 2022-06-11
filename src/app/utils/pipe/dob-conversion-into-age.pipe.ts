/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "dobConversionIntoAge",
})
export class DobConversionIntoAgePipe implements PipeTransform {
  transform(dob: string): unknown {
    let dateArr = dob.split("/"); //day/mon/yr
    const value = +new Date(
      Number(dateArr[2]),
      Number(dateArr[1]) - 1,
      Number(dateArr[0]) + 1
    );
    var timeDiff = Math.abs(Date.now() - value);
    let age = Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
    console.log("age: ", value);
    return age;
  }
}
