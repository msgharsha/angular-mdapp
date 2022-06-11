/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Directive, HostListener, Output, EventEmitter } from "@angular/core";
import { Subject } from "rxjs";
import { map, debounceTime, distinctUntilChanged } from "rxjs/operators";

@Directive({
  selector: "[typing]",
})
export class TypingDirective {
  @Output() onTyping: EventEmitter<any> = new EventEmitter();
  public keyUpEvent: Subject<any> = new Subject<any>();
  public keyPressEvent: Subject<any> = new Subject<any>();
  private typing: boolean;

  @HostListener("keyup", ["$event"]) onKeyup(event) {
    this.keyUpEvent.next(event);
  }

  @HostListener("keypress", ["$event"]) onKeyPress(event) {
    this.keyPressEvent.next(event);
  }

  constructor() {
    this.keyUpEvent
      .pipe(debounceTime(3000), distinctUntilChanged())
      .subscribe((e) => {
        this.onTyping.emit(false);
      });
    this.keyPressEvent
      .pipe(
        debounceTime(500),
        map((event) => event.keyCode !== 13 && event.target.value),
        distinctUntilChanged()
      )
      .subscribe((e) => {
        if (e) {
          this.onTyping.emit(true);
        }
      });
  }
}
