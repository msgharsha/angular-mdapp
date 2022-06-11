/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  OnInit,
  Input,
  Output,
  forwardRef,
  EventEmitter,
  ViewContainerRef,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from "@angular/forms";
import * as _ from "lodash";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "../../../../environments/environment";
import { UploadFileService } from "../../service/upload-file.service";
import { ErrorService } from "../../service/error.service";
import { ToasterService } from "../../service/toaster.service";
import { DialogModalComponent } from "../cancel-modal/cancel-modal.component";
import { CamImageConfirmComponent } from "../camimageconfirm-modal/camimageconfirm-modal.component";
import { Subject } from "rxjs";
import { TranslaterService } from "../../service/translater.service";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../service/localStorage.service";

declare var $;

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
  styleUrls: ["./file-upload.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
    UploadFileService,
  ],
})
export class FileUploadComponent implements OnInit, ControlValueAccessor {
  @Input("id") id: string;
  @Input("blockHeight") blockHeight: number = 200;
  @Input("blockWidth") blockWidth: number = 200;
  @Input("blockRadius") blockRadius: number = 200;
  @Input("roundImage") roundImage: boolean = true;
  @Input("healthCardImage") healthCardImage: boolean = false;
  @Input("healthUrl") healthUrl:any;
  @Input("isDimensionValidation") isDimensionValidation: boolean = false;
  @Input("validateHeight") validateHeight: number;
  @Input("validateWidth") validateWidth: number;
  @Input("imageTitle") imageTitle: string = "";
  @Input("isProfilePage") isProfilePage: boolean = false;
  @Input("uploadMsg") uploadMsg: string;
  @Input("removeMsg") removeMsg: string;
  @Output("uploading") uploading: EventEmitter<boolean> = new EventEmitter();
  @Output("disableButton")
  disableButton: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output("viewLinkStatus") viewLinkStatus: EventEmitter<any> = new EventEmitter();

  @ViewChild("openModal", { static: true }) openModal;
  @ViewChild("closeModal", { static: true }) closeModal;

  /**
   * Required inputs
   * UploadNumber :- No. of file input required
   * modalId :- Unique id for the modal
   */
  @Input("uploadNumber") uploadNumber: number;
  @Input("modalId") modalId: string;
  @Input("maxImageSize") maxImageSize: number;
  @Input("isPdfSupported") isPdfSupported: boolean = true;
  @Input("showImageOptions") showImageOptions: boolean = true;
  @Input("deleteImageSubscription") deleteImageSubscription: Subject<any>;
  @Output("onFileChange")
  onFileChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output("saveImageNotification")
  saveImageNotification: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() deleteRequisitionFiles = new EventEmitter<any>();
  @Input("isRequisition") isRequisition: boolean;
  public pdfForm: FormGroup;
  public showLoader: boolean = false;
  public fileName: string = "";
  public fileSrc: string;
  public fileExt: string;
  public supportedExtension: any;
  public onChange: any = () => {};

  public darkRoomRef: any;
  public imageArr: any;

  public file: File;
  public userData: any;

  constructor(
    private formBuilder: FormBuilder,
    private _upload: UploadFileService,
    private vcr: ViewContainerRef,
    private errorHandler: ErrorService,
    private localStorageService: LocalStorageService,
    private _toast: ToasterService,
    private matDialog: MatDialog,
    private translater: TranslaterService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.translater.TranslationAsPerSelection();
    this.createFormBuilder();
    /**
     * Listen to bootstrap modal close events, destroy darkroom instance on modal close
     */
    $(document).on("hide.bs.modal", `#${this.modalId}`, () => {
      this.closeDarkRoom();
    });

    /**
     * Assign default values to "Input" variables if value not provided
     */
    this.setDefaults();
    this.translater.TranslationAsPerSelection();

    if (this.isPdfSupported) {
      this.supportedExtension = ".jpg, .png, .jpeg, .docx, .doc, .pdf";
    } else {
      this.supportedExtension = ".jpg, .png, .jpeg";
    }
  }

  /**
   * Function to set default values
   */
  setDefaults() {
    /**
     * Set default height to 200px
     */
    if (!this.blockHeight) this.blockHeight = 200;

    /**
     * Set default width to 200px
     */
    if (!this.blockWidth) this.blockWidth = 200;

    /**
     * Set default max size to 10Mb
     */
    if (!this.maxImageSize) this.maxImageSize = environment.maxImageSize;
  }

  /**
   * Function to remove image from image array
   * @param index integer
   *
   */
  removeImage(index: number) {
    this.confirmRemoveFile("image");
  }

  /**
   * Function to close modal
   */
  closeModalClick() {
    this.closeModal.nativeElement.click();
  }

  /**
   * Function to destroy darkroom instance
   */
  closeDarkRoom() {
    if (this.darkRoomRef) this.darkRoomRef.selfDestroy();
  }

  /**
   * Function to create form builder
   */
  createFormBuilder() {
    this.pdfForm = this.formBuilder.group({
      url: [null, Validators.required],
      originalFileName: [null, Validators.required],
    });
  }

  writeValue(obj) {
    if (!_.isEmpty(obj)) {
      if (!this.isRequisition) {
        this.pdfForm.patchValue({
          url: obj.url,
          originalFileName: obj.originalFileName || obj.url,
        });
        this.fileName = obj.originalFileName || obj.url;
      }
      if (this.isRequisition) {
        this.pdfForm.patchValue({
          url: obj.url,
          originalFileName: obj.originalFileName || obj.url,
        });
        this.fileName = obj.url.split("/").pop();
      }

      if (this.fileName) {
        let fileExt = this.fileName.substring(this.fileName.lastIndexOf("."));
        this.fileExt = fileExt;
        if (fileExt) {
          if (fileExt === ".pdf") {
            this.fileSrc = "/assets/images/pdf-file.png";
          } else if (fileExt === ".docx") {
            this.fileSrc = "/assets/images/docx.png";
          } else if (fileExt === ".doc") {
            this.fileSrc = "/assets/images/docs.png";
          } else {
            this.fileSrc = obj.url;
          }
        } else {
          this.fileSrc = obj.url;
        }
      }
    }
  }

  registerOnTouched() {}

  registerOnChange(fn: object) {
    this.onChange = fn;
  }

  onEdit(ref) {
    if (document.getElementById(ref)) {
      document.getElementById(ref).click();
    }
  }

  /**
   * Function to remove uploaded pdf
   */
  removePdf() {
    let fileName = this.pdfForm.value["url"].split("/").pop();
    let fileExt = fileName.substring(fileName.lastIndexOf("."));
    // let fileName = this.pdfForm.get("originalFileName").value || '';
    // let fileExt = fileName.substring(fileName.lastIndexOf('.'));
    let type =
      fileExt === ".pdf" || fileExt === ".doc" || fileExt === ".docx"
        ? "doc"
        : "image";
    this.confirmRemoveFile(type);
  }

  /**
   * Function to remove image from image array
   * @param index integer
   *
   */

  confirmRemoveFile(type) {
    const modalMessage = `${`Do you want to delete the ${type} permanently?`
      .toUpperCase()
      .split(" ")
      .join("_")}`;
    const dialogRef = this.matDialog.open(DialogModalComponent, {
      // height: '250px',
      width: "350px",
      data: {
        message: modalMessage,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.deleteFileFromAWS(type);
    });
  }

  deleteFileFromAWS(type) {
    this.emitDisableEvent(true);
    let fileUrl = this.pdfForm.get("url").value;
    let fileName = this.pdfForm.get("originalFileName").value;
    this.pdfForm.get("url").setValue(null);
    this.pdfForm.get("originalFileName").setValue(null);

    this.showLoader = true;
    this._upload.deleteFile(type, fileUrl).subscribe(
      (res) => {
        this.onChange(this.pdfForm.value);
        this.showLoader = false;
        this.deleteImageFromLocal();
        let msg = this.removeMsg || res.message;
        this._toast.showSuccess(this.vcr, "Success", msg);
      },
      (error) => {
        this.showLoader = false;
        this.emitDisableEvent(false);
        this.pdfForm.get("url").setValue(fileUrl);
        this.pdfForm.get("originalFileName").setValue(fileName);

        const errBody = JSON.parse(error._body);
        this._toast.showWarning(this.vcr, errBody.detail, "Error");
      },
      () => {
        this.showLoader = false;
        this.emitDisableEvent(false);
      }
    );
  }

  deleteImageFromLocal() {
    if (this.deleteImageSubscription) {
      this.deleteRequisitionFiles.emit(true);
      // this.deleteImageSubscription.next(true);
    }
  }

  /**
   * Function to empty input file
   * @param inputFileId string
   */
  emptyFileField(inputFileId) {
    document.getElementById(inputFileId)["value"] = "";
  }

  /**
   * Function to upload file
   */
  fileUploaded(event, inputFieldId) {
    let fileReader: FileReader = new FileReader();
    let file = _.get(event.target, "files[0]", null);
    this.emptyFileField(inputFieldId);

    if (_.isNull(file)) return;

    let fileExt = file["name"].substring(file["name"].lastIndexOf(".")).toLowerCase();

    /**
     * Check for file extension
     */
    if (!this.supportedExtension.split(", ").includes(fileExt)) {
      this._toast.showWarning(this.vcr, "", "FILE_EXTENSION_IS_NOT_SUPPORTED");
      return;
    }

    /**
     * Check for file size limit
     */
    if (file.size > this.maxImageSize && fileExt != ".pdf") {
      // TODO :- Use toaster message
      this._toast.showWarning(this.vcr, "Size", "IMAGE_MAX_SIZE_REACHED");
      return;
    }
    /**
     * Check for file size limit
     */
    if (file.size > this.maxImageSize && fileExt === ".pdf") {
      this._toast.showWarning(this.vcr, "Size", "DOC_MAX_SIZE_REACHED");
      return;
    }
    fileReader.onload = (e: any) => {
      this.fileUploader(e, file, fileExt);
    };
    this.uploading.emit(true);
    fileReader.readAsDataURL(file);
    this.file = file;
  }

  fileUploader(e, file, fileExt) {
    let res = _.get(e, "target.result");
    if (fileExt === ".pdf" || fileExt === ".docx" || fileExt === ".doc") {
      this.uploadFile(file, res, "doc");
      this.uploading.emit(false);
    } else {
      this.displayModal(e.target["result"]);
    }
  }

  /**
   * Function to set image in the modal
   * @param base64Image string
   */
  setImage(base64Image) {
    let query = `div.img-wrapper#d${this.modalId} img`;
    document.querySelector(query)["src"] = base64Image;
    document.querySelector(query)["onload"] = null;
  }

  /**
   * Function to display bootstrap modal for crop/transition of image
   * @param base64Image string
   */
  displayModal(base64Image) {
    this.setImage(base64Image);
    this.openModal.nativeElement.click();
    this.loadDarkRoomPlugin();
  }

  /**
   * Function to initialize darkroom plugin for image cropping
   */

  loadDarkRoomPlugin() {
    let outerRef = this;
    let query = `div.img-wrapper#d${this.modalId} img`;

    let darkRoomOptions = {
      minWidth: 100,
      minHeight: 100,
      maxWidth: 500,
      maxHeight: 500,
    };

    darkRoomOptions["plugins"] = {
      crop: {
        minHeight: 50,
        maxHeight: 50,
      },
      save: {
        callback: function (e) {
          let closeButton: any = document.getElementsByClassName(
            "darkroom-button darkroom-button-danger"
          )[0];
          if (closeButton) {
            closeButton.click();
          }
          let base64Data = this.darkroom.image.toDataURL();
          outerRef.closeModalClick();
          outerRef.showLoader = true;
          if (outerRef.isDimensionValidation) {
            let height = this.darkroom.image.height;
            let width = this.darkroom.image.width;
            if (
              height > outerRef.validateHeight ||
              width > outerRef.validateWidth
            ) {
              let msg = outerRef.translate.instant(
                "FILE_UPLOAD_DIMENSION_MESSAGE",
                {
                  height: height,
                  width: width,
                  validateHeight: +outerRef.validateHeight - 1,
                  validateWidth: +outerRef.validateWidth - 1,
                }
              );
              outerRef._toast.showError(outerRef.vcr, "Size", msg);
              outerRef.showLoader = false;
              return;
            }
          }
          outerRef.uploadFile(outerRef.file, base64Data, "image");
        }, //callback-closes.
      }, //save-closes
    }; //darkRoomOptions-closes,

    this.darkRoomRef = new Darkroom(query, darkRoomOptions);
  } //

  dataURLtoFile(dataurl, filename, type) {
    if (type === "doc") {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let fileType = filename.substring(filename.lastIndexOf("."));
      if (!mime && (fileType === ".doc" || fileType === ".docx")) {
        mime = "application/msword";
      }
      return new File([u8arr], filename, { type: mime });
    } else {
      var Arr = dataurl.split(","),
        Mime = Arr[0].match(/:(.*?);/)[1],
        Bstr = atob(Arr[1]),
        N = Bstr.length,
        U8arr = new Uint8Array(N);
      while (N--) {
        U8arr[N] = Bstr.charCodeAt(N);
      }
      return new File([U8arr], filename, { type: Mime });
    }
  }

  emitDisableEvent(status: boolean) {
    this.disableButton.emit(status);
  }

  uploadFile(file, base64, type) {
    this.emitDisableEvent(true);
    this.showLoader = true;
    let formData = new FormData();
    this.fileName = file["name"];
    let fileObj = this.dataURLtoFile(base64, file["name"], type);
    if (type == "doc") {
      formData.append("fileType", "doc");
    }
    formData.append("file", fileObj);
    this._upload.upload(formData, type).subscribe(
      (res) => {
        res.data.url = res.data.url[0];
        this.pdfForm.get("url").setValue(res.data.url);
        this.pdfForm
          .get("originalFileName")
          .setValue(res.data.originalFileName);
        let fileExt = this.fileName.substring(this.fileName.lastIndexOf("."));
        this.fileExt = fileExt;
        if (fileExt) {
          if (fileExt === ".pdf") {
            this.fileSrc = "/assets/images/pdf-file.png";
          } else if (fileExt === ".docx") {
            this.fileSrc = "/assets/images/docx.png";
          } else if (fileExt === ".doc") {
            this.fileSrc = "/assets/images/docs.png";
          } else {
            this.fileSrc = res.data.url;
          }
        } else {
          this.fileSrc = res.data.url;
        }
        this.onChange(res.data);
        this.emitDisableEvent(false);
        let msg = this.uploadMsg || res.message;
        this._toast.showSuccess(this.vcr, "Success", msg);
        this.showLoader = false;
      },
      (error) => {
        this.showLoader = false;
        this.emitDisableEvent(false);
        const errBody = JSON.parse(error._body);
      },
      () => {
        this.showLoader = false;
        this.emitDisableEvent(false);
      }
    );
  }

  onEditFromDevice(){
    this.userData = this.localStorageService.getItem("userData") || {};
    let body = {
      userId: this.userData['userId'],
      userType: "doctor",
      imageComponentName: "signature",
      email:this.userData['email'],
      phoneNumber:this.userData['phoneNumber']
      // phoneNumber:"9848866133",
      // email: "sriharsham@ibaseit.com"
    };
    this._upload.signatureNotification(body).subscribe(
      (res: any) => {
        console.log(res);
        if(res.success){
          let viewObbj = {};
            viewObbj['columnName'] = 'signature';
            this.viewLinkStatus.emit(viewObbj);
          const dialogRef = this.matDialog.open(CamImageConfirmComponent, {
            height: "auto",
            width: "350px",
            data: {
              message: "PLZ_FOLLOW_THE_LINK_TO_UPLOAD_IMAGE",
            },
          });
        }
      },
      (err) => this.errorHandler.handleError(err, this.vcr)
    );
  }

  onImageEditFromDevice(modalId){
    console.log(modalId);
    this.userData = this.localStorageService.getItem("userData") || {};
    let body = {
      userId: this.userData['userId'],
      userType: "doctor",
      email:this.userData['email'],
      phoneNumber:this.userData['phoneNumber']
      // phoneNumber:"9848866133",
      // email: "sriharsham@ibaseit.com"
    };
    body['imageComponentName'] = modalId == 'govt_id_front_image' ? "govt_id_front_image" : "specimen_cheque";
    this._upload.imageNotification(body).subscribe(
      (res: any) => {
        console.log(res);
        if(res.success){
          let viewObbj = {};
            viewObbj['columnName'] = modalId == 'govt_id_front_image' ? "govt_id_front_image" : "specimen_cheque";
            this.viewLinkStatus.emit(viewObbj);
          const dialogRef = this.matDialog.open(CamImageConfirmComponent, {
            height: "auto",
            width: "350px",
            data: {
              message: "PLZ_FOLLOW_THE_LINK_TO_UPLOAD_IMAGE",
            },
          });
        }
      },
      (err) => this.errorHandler.handleError(err, this.vcr)
    );
  }
}
