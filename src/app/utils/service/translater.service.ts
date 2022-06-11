/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import { LocalStorageService } from "../service/localStorage.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class TranslaterService {
  public lang: string;
  public translatedKey: string;
  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService
  ) {}

  TranslationAsPerSelection() {
    this.lang = this.localStorageService.getItem("language") || "en";
    this.translate.use(this.lang);
  }

  getTranslatedValue(key) {
    this.translate.get(key).subscribe((translatedString) => {
      this.translatedKey = translatedString.toString();
    });
  }
}
