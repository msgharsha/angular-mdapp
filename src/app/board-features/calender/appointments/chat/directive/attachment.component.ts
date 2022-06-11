/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, ViewContainerRef, forwardRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, NG_VALUE_ACCESSOR } from "@angular/forms";
import { FileUploadComponent } from "../../../../../utils/component/file-upload/file-upload.component";
import { UploadFileService } from "../../../../../utils/service/upload-file.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { LocalStorageService } from "../../../../../utils/service/localStorage.service";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService } from "../../../../../utils/component/loader/loader.service";

@Component({
  selector: "attachment",
  template: `<div class="input-file-wrapper">
      <div class="upload-file-input position-abs"></div>
      <input
        type="file"
        name="myfile "
        class="input-file upload-file-input "
        [id]="'f-' + modalId"
        (change)="fileUploaded($event, 'f-' + modalId)"
        accept=".jpg, .png, .jpeg, .pdf"
        [disabled]="pdfForm.value.url || showLoader"
        [ngClass]="{
          disabled: pdfForm.value.url || showLoader,
          loading: showLoader
        }"
      />
    </div>
    <button
      class=""
      #openModal
      [attr.data-target]="'#fileUpload'"
      data-toggle="modal"
      hidden
      type="button"
    >
      {{ "OPEN" | translate }}
    </button>
    <button
      #closeModal
      [attr.data-target]="'#fileUpload'"
      data-toggle="modal"
      data-dismiss="modal"
      hidden
      type="button"
    >
      {{ "CLOSE" | translate }}
    </button> `,
  styleUrls: ["./attachment.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AttachmentComponent),
      multi: true,
    },
    UploadFileService,
  ],
})
export class AttachmentComponent extends FileUploadComponent {
  /// Event Emitter used to communicate the event of data load
  constructor(
    formBuilder: FormBuilder,
    _upload: UploadFileService,
    vcr: ViewContainerRef,
    errorHandler: ErrorService,
    localStorageService: LocalStorageService,
    _toast: ToasterService,
    matDialog: MatDialog,
    translater: TranslaterService,
    public translate: TranslateService
  ) {
    super(formBuilder, _upload, vcr,errorHandler,localStorageService, _toast, matDialog, translater, translate);
  }
}
