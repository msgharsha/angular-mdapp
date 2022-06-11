
import { Component, OnInit, ViewContainerRef, Inject, Input } from "@angular/core";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { AppointmentService } from "../../appointments.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { MatDialog } from "@angular/material/dialog";
import { RepositoryService } from "../../../../../repository/repository.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: "detailedrequisitionmodel",
  templateUrl: "./detailedrequisitionmodel.component.html",
  styleUrls: ["./requisition.component.scss"],
})
export class DetailedRequisitionComponent implements OnInit {

  public requisitionHistorylist;
  public text;
  constructor(
    private dialogRef: MatDialogRef<DetailedRequisitionComponent>,
    @Inject(MAT_DIALOG_DATA) public requisitionHistoryData: any,
    private translater: TranslaterService,
    private repositoryService: RepositoryService,
    private appointmentService: AppointmentService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService
  ) {}

  ngOnInit(): void {
    this.requisitionHistorylist = this.requisitionHistoryData.requisitionData
  }

  downloadFile(url) {
    window.open(url, "_blank");
  }

  medicalDialogClose(event){
    if(event == 'close'){
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
