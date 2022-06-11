/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Directive,
  HostListener,
  Output,
  EventEmitter,
  ElementRef,
} from "@angular/core";

@Directive({
  selector: "[scrollUp]",
})
export class ScrollUpDirective {
  /// Event Emitter used to communicate the event of data load
  @Output() load: EventEmitter<any> = new EventEmitter();

  @HostListener("scroll") onScroll() {
    if (this.eleRef.nativeElement.scrollTop < 10) {
      this.load.emit();
    }
  }

  constructor(private eleRef: ElementRef) {}
}
