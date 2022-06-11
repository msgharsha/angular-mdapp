/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Input, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import { DateAdapter } from "@angular/material/core";
import { LocalStorageService } from "../../service/localStorage.service";
@Component({
  selector: "app-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent implements OnInit {
  @Input() list = [];

  dropDownSettings = {
    singleSelection: false,
    idField: "id",
    textField: "english_values",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };

  constructor(
    private translateService: TranslateService,
    private dateAdapter: DateAdapter<Date>,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.setDateLocale();
    this.subscribeLangChangeEvent();
  }

  subscribeLangChangeEvent() {
    this.translateService.onLangChange.subscribe(() => this.setDateLocale());
  }

  setDateLocale() {
    let lang = this.localStorageService.getItem("language");
    this.dateAdapter.setLocale(lang);
  }

  onSearch(event, item) {
    if (item.search) {
      const searches = _.debounce(item.search, 800);
      searches(event.target.value);
    }
  }

  translateOption(key, translate) {
    if (!translate) {
      return key;
    }
    return this.translateService.instant(key);
  }
}
