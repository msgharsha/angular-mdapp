/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Input, forwardRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from "@angular/forms";
import { TranslaterService } from "../../service/translater.service";
import { TranslateService } from "@ngx-translate/core";
import { DateAdapter } from "@angular/material/core";
import { LocalStorageService } from "../../service/localStorage.service";

@Component({
  selector: "app-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  @Input("fieldsRequired") fieldsRequired: any;
  @Input("formSubmitted") formSubmitted: boolean;
  @Input("maxDate") maxDate: any;
  @Input("minDate") minDate: any;
  @Input("validationMsg") validationMsg: string = "";
  @Input("placeholder") placeholder: string = "";
  @Input("formControlName") formControlName: string = "";
  @Input("label") label: string = "";
  @Input("manadatory") manadatory: boolean = false;
  @Input("disabled") disabled: boolean = false;
  @Input("clearIcon") clearIcon: boolean = false;
  
  public inputModel: string;
  public datePickerForm: FormGroup;
  public lang: string;
  public onChange: any = () => {};

  constructor(
    private formBuilder: FormBuilder,
    private translaterService: TranslaterService,
    private translate: TranslateService,
    private dateAdapter: DateAdapter<Date>,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.fieldsRequired = this.fieldsRequired == "true" ? true : false;
    this.createFormBuilder();
    this.translaterService.TranslationAsPerSelection();
    this.subscribeLangChangeEvent();
    this.setDateLocale();
  }

  /**
   * Function to create form builder
   */
  createFormBuilder() {
    this.datePickerForm = this.formBuilder.group({
      [this.formControlName]: [null, [Validators.required]],
    });
  }

  subscribeLangChangeEvent() {
    this.translate.onLangChange.subscribe(() => this.setDateLocale());
  }

  setDateLocale() {
    this.lang = this.localStorageService.getItem("language");
    this.dateAdapter.setLocale(this.lang);
  }

  writeValue(obj) {
    this.patchForm(obj);
    this.datePickerForm.controls[this.formControlName].setValue(obj);
  }

  registerOnTouched() {}

  registerOnChange(fn: object) {
    this.onChange = fn;
  }

  patchForm(obj) {
    this.datePickerForm.patchValue({
      [this.formControlName]:
        this.datePickerForm.get(this.formControlName).value || null,
    });
  }

  dateChange() {
    this.onChange(this.datePickerForm.controls[this.formControlName].value);
  
  }

  clearDate() {
    this.onChange(this.datePickerForm.controls[this.formControlName].setValue(''));
  }

  /**
   * Function to get required error
   */
  hasRequiredError(key) {
    return (
      this.fieldsRequired &&
      this.formSubmitted &&
      this.datePickerForm.hasError("required", key)
    );
  }
}
