/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
// import { AddEditNotesComponent } from "../add-edit-notes/add-edit-notes.component";
import { MyAddressbookComponent } from "../my-addressbook/my-addressbook.component";
import { RepositoryService } from "../repository.service";
import { ToasterService } from "../../../../src/app/utils/service/toaster.service";
import { ErrorService } from "../../../../src/app/utils/service/error.service";
import { DialogModalComponent } from "../../../../src/app/utils/component/cancel-modal/cancel-modal.component";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { MSG } from "../constant";
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: "app-my-addressbooklist",
  templateUrl: "./my-addressbooklist.component.html",
  styleUrls: ["./my-addressbooklist.component.scss"],
})
export class MyAddressBookListComponent implements OnInit {
  public addressList: any;
  public headers: any = [];
  public userData: {};
  public headersBind = ['labName', 'contactPerson', 'phoneNumber'];
  constructor(
    private matDialog: MatDialog,
    private repositoryService: RepositoryService,
    private localStorageService: LocalStorageService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private traslate: TranslateService
  ) { }

  ngOnInit(): void {
    this.userData = this.localStorageService.getItem("userData") || {};
    this.getAddressList();
    this.headers = ['NAME_OF_LAB', 'CONTACT_PERSON', 'PHONE_NUMBER']
  }

  getAddressList() {
    this.repositoryService.getLabDetails(this.userData["doctorId"]).subscribe((res) => {
      if (res) {
        this.addressList = res.data.addressBok;
      }
    });
  }


  addAddress() {
    const dialogRef = this.matDialog.open(MyAddressbookComponent);
    dialogRef.afterClosed().subscribe((data) => {
      console.log(data);
      if (typeof data == "object") {
        this.repositoryService.saveMyAddress(data).subscribe(
          (res) => {
            if (res && res.success) {
              this.toaster.showSuccess(this.vref, "Success", "ADDRESS_ADDED");
              this.getAddressList();
            }
          },
          (err) => {
            this.toaster.showError(
              this.vref,
              "Error Occurred",
              "ERROR_OCCURED"
            );
          }
        );
      }
    });
  }

  editMyAddress(addressId) {
    const selectedAddress = this.addressList.filter((obj) => {
      return obj.id === addressId;
    });
    const dialogRef = this.matDialog.open(MyAddressbookComponent, {
      data: selectedAddress,
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (typeof data == "object") {
        //data.id = addressId.toString();
        this.repositoryService.editMyAddress(data,addressId).subscribe(
          (res) => {
            if (res && res.success) {
              this.toaster.showSuccess(this.vref, "Success", "ADDRESS_UPDATED");
              this.getAddressList();
            }
          },
          (err) => {
            this.toaster.showError(
              this.vref,
              "Error Occurred",
              "ERROR_OCCURED"
            );
          }
        );
      }
    });
  }

  deleteMyAddress(addressId) {
    this.matDialog
      .open(DialogModalComponent, {
        height: "auto",
        width: "350px",
        data: {
          message: "CONFIRM_DELETE_NOTE",
        },
      })
      .afterClosed()
      .subscribe((val) => {
        if (val) {
          this.repositoryService.deleteAddress(addressId).subscribe(
            (res) => {
              if (res && res.success) {
                this.toaster.showSuccess(this.vref, "Success", "ADDRESS_DELETED");
                this.getAddressList();
              }
            },
            (err) => {
              this.toaster.showError(
                this.vref,
                "Error Occurred",
                "ERROR_OCCURED"
              );
            }
          );
        }
      });
  }
}
