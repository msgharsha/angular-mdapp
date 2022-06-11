/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "loader",
  templateUrl: "./loader.component.html",
  styleUrls: ["./loader.component.scss"],
})
export class LoaderComponent implements OnInit {
  @Input() show: boolean;
  constructor() {}

  ngOnInit() {}
}
