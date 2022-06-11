 import { Component, ViewContainerRef, OnInit, EventEmitter } from "@angular/core";
 import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
 import { AuthorizationService } from "../authorization.service";
 import { ErrorService } from "../../utils/service/error.service";
 import { ToasterService } from "../../utils/service/toaster.service";
 import { LocalStorageService } from "../../utils/service/localStorage.service";
 
 @Component({
   templateUrl: "./shortlink.component.html",
 })
 
 export class ShortlinkComponent implements OnInit {
  
   public token: any;
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
       this.token = params.token;
     });
     this.authService.getLongUrl(this.token).subscribe(
      (res) => {
       console.log(res.data[0])
       if(res && res.data && res.data[0]){
         window.location.replace( res.data[0].longUrl);
       } else {
        this.toaster.showError(this.vref, "Error", "INVALID_TOKEN");
       }
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
   }
 
   public ngOnInit(): void {
   }
 

 
   
 }
 