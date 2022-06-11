/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { DynamicOtpService } from "../../utils/service/dynamic-otp.service";

@Component({
  selector: "app-onboard",
  templateUrl: "./onboard.component.html",
  styleUrls: ["./onboard.component.scss"],
})
export class OnboardComponent implements OnInit {
  constructor(public dynamicOtpService: DynamicOtpService) {}

  ngOnInit(): void {
    this.dynamicOtpService.popupOpen = false;
  }
}
