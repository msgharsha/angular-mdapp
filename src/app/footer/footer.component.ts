/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { TranslaterService } from "../utils/service/translater.service";

@Component({
  selector: "footer-component",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {
  public isShowFooter = true;

  constructor(private translater: TranslaterService) {}

  ngOnInit() {
    if (window.location.pathname.split("/")[1] === "video-call") {
      this.isShowFooter = false;
    }
    this.translater.TranslationAsPerSelection();
  }
}
