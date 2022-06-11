/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Input, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import * as _ from "lodash";
@Component({
  selector: "radio-btn",
  templateUrl: "./radio-btn.component.html",
  styleUrls: ["./radio-btn.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioBtnComponent),
      multi: true,
    },
  ],
})
export class RadioBtnComponent implements OnInit, ControlValueAccessor {
  @Input("labelArr") labelArr: Array<any>;
  @Input("checked") checked: string;
  @Input("keyName") keyName: string;
  @Input("isMedicalHistoryForm") isMedicalHistoryForm: boolean = false;
  public radioBtnGroup: Array<RadioBtn> = [];
  private onChange: any = () => {};

  constructor() {}

  ngOnInit() {
    this.setRadioBtnGroup();
    this.selectRadioAuto(this.checked);
  }

  ngOnChanges(arg) {
    if (arg.checked && arg.checked.previousValue != arg.checked.currentValue) {
      this.selectRadioAuto(this.checked);
    }
  }

  /**
   * set the radio button at initial state.
   */
  setRadioBtnGroup(index?) {
    this.radioBtnGroup = [];
    for (let i = 0; i < this.labelArr.length; i++) {
      let radioBtn: RadioBtn = {
        value: i == index ? true : false,
        label: this.keyName ? this.labelArr[i][this.keyName] : this.labelArr[i],
        id: this.keyName ? this.labelArr[i].id : null,
      };
      this.radioBtnGroup.push(radioBtn);
    }
  }

  radioBtnClick(index: number, value: boolean) {
    let val = !value;
    if (val) {
      this.setRadioBtnGroup();
      this.radioBtnGroup[index].value = val;
      //key that is selected
      let keyIndex = _.findIndex(this.radioBtnGroup, (o: RadioBtn) => {
        return o.value == true;
      });
      this.onChange(
        this.keyName
          ? this.radioBtnGroup[keyIndex]
          : this.radioBtnGroup[keyIndex].label
      );
    }
  }

  /**
   * method to set value of formControler
   * @param val
   */
  writeValue(val: object) {}

  registerOnChange(fn: object) {
    this.onChange = fn;
  }

  registerOnTouched(fn: object) {}

  /**
   * if you wanna select on runtime force fully
   * @param val
   * call this function with your label
   */
  selectRadioAuto(val) {
    this.setRadioBtnGroup();
    let index = _.findIndex(this.labelArr, (o: any) =>
      this.keyName ? o[this.keyName] == val : o == val
    );
    if (index > -1) {
      this.radioBtnGroup[index].value = true;
      this.onChange(
        this.keyName
          ? this.radioBtnGroup[index]
          : this.radioBtnGroup[index].label
      );
    }
  }
} //component-closes

interface RadioBtn {
  value: boolean;
  label: string;
  id: string;
}
