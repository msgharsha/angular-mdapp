import { Component, ViewContainerRef, OnInit, ViewChildren, QueryList, ElementRef } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { AuthorizationService } from "../authorization.service";
import { ErrorService } from "../../utils/service/error.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignatureFieldComponent } from './signature-field/signature-field.component';

@Component({
  templateUrl: "./signpad.component.html",
  styleUrls: ["./signpad.component.scss"],
})

export class SignPadComponent implements OnInit {
  public userId: any;
  public lang: any;
  public token: any;
  public userType: any;
  public imageComponentName: any;
  public submitsuccess: boolean = false;
  public form: FormGroup;

  // for convenience as we don't have a QueryList.index
  public secondSig: SignatureFieldComponent;

  @ViewChildren(SignatureFieldComponent) public sigs: QueryList<SignatureFieldComponent>;
  @ViewChildren('sigContainer1') public sigContainer1: QueryList<ElementRef>;
  constructor(
    private vref: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthorizationService,
    private localStorageService: LocalStorageService,
    private errorService: ErrorService,
    private toaster: ToasterService,
    fb: FormBuilder
  ) {
    this.route.queryParams.subscribe((params: any) => {
      this.userId = params.userId;
      this.lang = params.lang;
      this.token = params.token;
      this.userType = params.userType;
      this.imageComponentName = params.imageComponentName;
      this.localStorageService.setItem("language", this.lang);
    });
    this.form = fb.group({
      signatureField1: ['', Validators.required],
    });
  }
  ngOnInit(): void {

  }

  public ngAfterViewInit() {
    this.secondSig = this.sigs.find((sig, index) => index === 1);
    this.setOptions();
  }

  public size(container: ElementRef, sig: SignatureFieldComponent) {
    sig.signaturePad.set('canvasWidth', container.nativeElement.clientWidth);
    sig.signaturePad.set('canvasHeight', container.nativeElement.clientHeight);
  }

  public setOptions() {
    this.sigs.first.signaturePad.set('penColor', 'rgb(0, 0, 0)');
    this.sigs.first.signaturePad.set('backgroundColor', 'rgb(255, 255, 255)');
    this.sigs.first.signaturePad.clear(); // clearing is needed to set the background colour
  }

  public submit() {
    console.log(this.sigs.first.signature);
    let body = {
      content: this.sigs.first.signature,
      fileType: 'image/jpeg',
      userId:this.userId,
      userType:this.userType,
      imageComponentName:this.imageComponentName,
      token:this.token
    };
    this.authService.saveWebcamImage(body).subscribe(
      (res) => {
        const Body = res;
        this.toaster.showSuccess(this.vref, "Success", "IMAGE_SUBMITTED_SUCCESS");
        this.submitsuccess = true;
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  public clear() {
    this.sigs.first.clear();
  }



}
