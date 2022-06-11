/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Output, EventEmitter, Input } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
export const RIGHT_PANEL = {
  DIAGNOSIS: "DIAGNOSIS",
  MEDICAL_HISTORY: "MEDICAL_HISTORY",
  MEDICAL_REPORT: "MEDICAL_REPORT",
  CLOSE: "CLOSE",
};
@Component({
  selector: "right-panel",
  templateUrl: "./right-panel.component.html",
  animations: [
    trigger("openClose", [
      state(
        "open",
        style({
          left: "0px",
          width: "100%",
        })
      ),
      state(
        "closed",
        style({
          left: "calc(100%)",
          width: "0px",
        })
      ),
      transition("open => closed", [animate("0.3s")]),
      transition("closed => open", [animate("0.3s")]),
    ]),
    trigger("openCloseTimeAndQuantity", [
      state(
        "open",
        style({
          display: "initial",
        })
      ),
      state(
        "closed",
        style({
          display: "none",
        })
      ),
    ]),
  ],
  styleUrls: ["./right-panel.component.scss"],
})
export class RightPanelComponent {
  @Input() panelName: string = RIGHT_PANEL.CLOSE;
  panel = RIGHT_PANEL;

  get isOpen(): boolean {
    return this._isOpen;
  }

  private _isOpen: boolean;

  @Output() toggleOpen = new EventEmitter();

  constructor() {}

  closePanel() {
    this.toggleOpen.emit({ panelName: RIGHT_PANEL.CLOSE });
  }
}
