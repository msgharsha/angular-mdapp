import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import * as _ from "lodash";
import { TranslaterService } from "../../utils/service/translater.service";
import { InvoiceService } from "../invoice.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { OnboardService } from "../../utils/component/details/onboard.service";
import { UserService } from "../../utils/service/user.service";

@Component({
  selector: "subscription-invoice",
  templateUrl: "./subscriptioninvoice.component.html",
  styleUrls: ["./subscriptioninvoice.component.scss"],
})
export class SubscriptionInvoiceComponent implements OnInit {
  public subInvoiceList: any;
  public currentPage = 1;
  public itemsPerPage = 10;
  public count;
  public userData:any = {};
  public doctorInfo = {};

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private translater: TranslaterService,
    private invoiceService: InvoiceService,
    private localStorageService: LocalStorageService,
    private onboardService: OnboardService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.userData = this.localStorageService.getItem("userData") || {};
    this.onboardService.getPersonalDetails(this.userData["doctorId"]).subscribe((res: any) => {
      this.doctorInfo = res.data;
      this.getSubscriptionInvoiceList();
    });
    this.translater.TranslationAsPerSelection();
  }


  getSubscriptionInvoiceList() {
    const requestObject = {
      userId: this.userData['userId'],
      current_page: this.currentPage,
      page_limit: 10
    };
    this.invoiceService.getSubscriptionList(requestObject).subscribe(
      (res: any) => {
        let parsedData = res.data;
        parsedData.data.forEach((element, index) => {
          let doctorInfo:any = _.pick(this.doctorInfo, ['firstName', 'lastName', 'addressLine1', 'city', 'province', 'postalCode', 'phoneNumber', 'email']);
          doctorInfo.street1 = doctorInfo.addressLine1;
          doctorInfo.zipCode = doctorInfo.postalCode;
          doctorInfo.phone = doctorInfo.phoneNumber;
          doctorInfo.email = this.userData.email;
          const getBaseUrl = this.invoiceService.previewFileInfo({userInfo: doctorInfo, invoice: JSON.parse(JSON.stringify(element)), token: this.userService.userToken });
          parsedData.data[index].pdfPreviewUrl = getBaseUrl;
        });
        this.subInvoiceList = parsedData.data;
        if (parsedData.pagination.currentPage === 1)
        this.count = parsedData.pagination.total;
      },
      (err) => {
        this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
      }
    );
  }

  patientPageChangedEvent(pageNo) {
    this.currentPage = pageNo;
    this.getSubscriptionInvoiceList();
  }


}
