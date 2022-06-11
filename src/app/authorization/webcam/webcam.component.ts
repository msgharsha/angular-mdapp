 import { Component, ViewContainerRef, OnInit, EventEmitter } from "@angular/core";
 import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
 import { AuthorizationService } from "../authorization.service";
 import { ErrorService } from "../../utils/service/error.service";
 import { ToasterService } from "../../utils/service/toaster.service";
 import { LocalStorageService } from "../../utils/service/localStorage.service";
 import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';
 
 @Component({
   templateUrl: "./webcam.component.html",
   styleUrls: ["./webcam.component.scss"],
 })
 
 export class WebcamComponent implements OnInit {
   public userId: any;
   public lang: any;
   public token: any;
   public userType: any;
   public imageComponentName: any;
   public submitsuccess: boolean = false;
   options: UploaderOptions;
   files: UploadFile[];
   uploadInput: EventEmitter<UploadInput>;
   base64Image: any;
   fileType: any;
   constructor(
     private vref: ViewContainerRef,
     private router: Router,
     private route: ActivatedRoute,
     private authService: AuthorizationService,
     private localStorageService: LocalStorageService,
     private errorService: ErrorService,
     private toaster: ToasterService,
   ) {
     this.route.queryParams.subscribe((params: any) => {
       this.userId = params.userId;
       this.lang = params.lang;
       this.token = params.token;
       this.userType = params.userType;
       this.imageComponentName = params.imageComponentName;
       this.localStorageService.setItem("language", this.lang);
     });
     this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
   }
 
   public ngOnInit(): void {
   }
 
   submitWebcamImage() {
     let body = {
       content: this.base64Image,
       fileType: this.fileType,
       userId: this.userId,
       userType: this.userType,
       imageComponentName: this.imageComponentName,
       token: this.token
     };
     console.log(body);
     this.authService.saveWebcamImage(body).subscribe(
       (res) => {
         const Body = res;
         this.toaster.showSuccess(this.vref, "Success", "IMAGE_SUBMITTED_SUCCESS");
         this.submitsuccess = true;
       },
       (err) => this.errorService.handleError(err, this.vref)
     );
   }
 
   onUploadOutput(output: UploadOutput): void {
     if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') { // add file to array when added
       this.getBase64(output.file).then(
         data => this.base64Image = data
       );
     }
   }
 
   getBase64(file) {
     this.fileType = file.type
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(file.nativeFile);
       reader.onload = () => resolve(reader.result);
       reader.onerror = error => reject(error);
     });
   }
 }
 