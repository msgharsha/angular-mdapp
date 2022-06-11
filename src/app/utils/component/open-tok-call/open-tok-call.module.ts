/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VideoCallComponent } from "./component/video-call-component";

@NgModule({
  imports: [CommonModule],
  declarations: [VideoCallComponent],
  exports: [VideoCallComponent],
})
export class OpenTokCallModule {}
