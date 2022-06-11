/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { TranslaterService } from "../utils/service/translater.service";

@Component({
  selector: "terms-and-condition",
  templateUrl: "./terms-condition.component.html",
  styleUrls: ["./terms-condition.component.scss"],
})
export class TermsAndConditionComponent implements OnInit {
  constructor(private translater: TranslaterService) {}

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
  }
}
