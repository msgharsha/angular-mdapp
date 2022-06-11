/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslaterService } from "../../../utils/service/translater.service";

@Component({
  selector: "app-welcome",
  templateUrl: "./welcome.component.html",
  styleUrls: ["./welcome.component.scss"],
})
export class WelcomeComponent implements OnInit {
  constructor(private router: Router, private translater: TranslaterService) {}

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
  }
}
