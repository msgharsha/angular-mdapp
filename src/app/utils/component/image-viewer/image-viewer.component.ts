/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Input, OnInit, Output,EventEmitter } from "@angular/core";
import { Subscription, fromEvent } from "rxjs";

@Component({
  selector: "app-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"],
})
export class ImageViewerComponent implements OnInit {
  isOpen: boolean = false;
  imageLoaded: boolean = false;
  previewLoaded: boolean = false;
  @Input() src;
  @Input() alt: string = "alt";
  @Input() showIcon: boolean = false;
  @Input() openStatus:any;
  @Input() width;
  @Input() height;
  @Output("openImageStatus") openImageStatus: EventEmitter<boolean> = new EventEmitter();

  subscription: Subscription;

  ngOnInit() {
    if(this.openStatus){
      this.isOpen = true;
      this.attachEscapeListener();
    }
  }

  open() {
    this.isOpen = true;
    this.attachEscapeListener();
  }

  private attachEscapeListener() {
    this.subscription = fromEvent(document, "keyup").subscribe((e) => {
      if (e["keyCode"] === 27) {
        this.close();
      }
    });
  }

  close() {
    this.isOpen = false;
    this.openImageStatus.emit(false);
    this.imageLoaded = false;
    this.subscription.unsubscribe();
  }

  onImageLoad(status) {
    this.imageLoaded = status;
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
