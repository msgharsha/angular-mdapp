/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VideoCallsComponent } from "./video-calls.component";

const routes: Routes = [{ path: "", component: VideoCallsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoCallsRoutingModule {}
