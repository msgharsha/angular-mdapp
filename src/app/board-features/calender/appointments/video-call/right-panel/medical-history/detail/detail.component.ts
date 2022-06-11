/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { TranslaterService } from "../../../../../../../utils/service/translater.service";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit {
  @Output() closeDetailPage = new EventEmitter();
  @Input() presDetails: any;
  constructor(private translater: TranslaterService) {}

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
  }

  public cancelDetails() {
    this.closeDetailPage.emit({ close: true });
  }
}
