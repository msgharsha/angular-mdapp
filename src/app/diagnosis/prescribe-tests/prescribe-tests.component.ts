/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { TranslaterService } from "../../utils/service/translater.service";

@Component({
  selector: "app-prescribe-tests",
  templateUrl: "./prescribe-tests.component.html",
  styleUrls: ["./prescribe-tests.component.scss"],
})
export class PrescribeTestsComponent implements OnInit {
  constructor(private translater: TranslaterService) {}

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
  }
}
