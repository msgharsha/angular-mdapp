/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component } from "@angular/core";
@Component({
  selector: "image-crop-modal",
  template: ` <div
    class="modal fade  image-crop-modal-index"
    tabindex="-1"
    role="dialog"
    id="fileUpload"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header custom-modal-header">
          <h4 class="modal-title">{{ "IMAGE_UPLOAD" | translate }}</h4>
          <button
            type="button"
            class="close close-icon"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="img-wrapper" id="dfileUpload">
            <img class="img-responsive" id="target" />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-ghost"
            data-dismiss="modal"
            #closeModal
          >
            Close
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </div>`,
  styleUrls: ["../file-upload.component.scss"],
})
export class ImageCropModalComponent {}
