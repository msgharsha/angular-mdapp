
import { Component, OnInit, ViewContainerRef, Inject, Input } from "@angular/core";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { AppointmentService } from "../../appointments.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { MatDialog } from "@angular/material/dialog";
import { RepositoryService } from "../../../../../repository/repository.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: "allnotesmodel",
  templateUrl: "./allnotesmodel.component.html",
  styleUrls: ["./notes.component.scss"],
})
export class AllNotesComponent implements OnInit {
 
  constructor(
    private dialogRef: MatDialogRef<AllNotesComponent>,
    @Inject(MAT_DIALOG_DATA) public allNotesData: any,
    private translater: TranslaterService,
    private repositoryService: RepositoryService,
    private appointmentService: AppointmentService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService
  ) {}

  ngOnInit(): void {
    console.log(this.allNotesData)
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
