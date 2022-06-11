/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChatComponent } from "./chat.component";
import { ScrollUpDirective } from "./directive/scroll-up.directive";
import { UtilsModule } from "../../../../utils/utils.module";
import { TypingDirective } from "./directive/typing.directive";
import { AttachmentComponent } from "./directive/attachment.component";
import { CommonModule } from "@angular/common";
import { ImageViewerModule } from "../../../../utils/component/image-viewer/image-viewer.module";

@NgModule({
  declarations: [
    ChatComponent,
    ScrollUpDirective,
    TypingDirective,
    AttachmentComponent,
  ],
  imports: [CommonModule, FormsModule, UtilsModule, ImageViewerModule],
  exports: [ChatComponent, CommonModule, FormsModule, UtilsModule],
})
export class ChatModule {}
