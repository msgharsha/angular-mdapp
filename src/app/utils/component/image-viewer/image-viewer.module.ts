/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxImageZoomComponent } from "./image-zoom/ngx-image-zoom.component";
import { ImageViewerComponent } from "./image-viewer.component";

@NgModule({
  declarations: [NgxImageZoomComponent, ImageViewerComponent],
  imports: [CommonModule],
  exports: [NgxImageZoomComponent, ImageViewerComponent],
})
export class ImageViewerModule {}
