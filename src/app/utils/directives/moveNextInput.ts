/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[moveNextByMaxLength]",
})
export class MoveNextByMaxLengthDirective {
  constructor(private _el: ElementRef) {}

  @HostListener("keyup", ["$event"]) onKeyDown(e: any) {
    if (e.srcElement.maxLength === e.srcElement.value.length) {
      e.preventDefault();

      let nextControl: any =
        e.srcElement.parentElement.nextElementSibling.firstElementChild;
      // Searching for next similar control to set it focus
      while (true) {
        if (nextControl) {
          if (nextControl.type === e.srcElement.type) {
            nextControl.focus();
            return;
          } else {
            nextControl = nextControl.nextElementSibling;
          }
        } else {
          return;
        }
      }
    }
  }
}
