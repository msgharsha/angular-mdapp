
import { Component, OnInit, ViewContainerRef, Inject, Input } from "@angular/core";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { AppointmentService } from "../../appointments.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { MatDialog } from "@angular/material/dialog";
import { RepositoryService } from "../../../../../repository/repository.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: "detailednotesmodel",
  templateUrl: "./detailednotesmodel.component.html",
  styleUrls: ["./notes.component.scss"],
})
export class DetailedNotesComponent implements OnInit {
 
  constructor(
    private dialogRef: MatDialogRef<DetailedNotesComponent>,
    @Inject(MAT_DIALOG_DATA) public notesHistoryData: any,
    private translater: TranslaterService,
    private repositoryService: RepositoryService,
    private appointmentService: AppointmentService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService
  ) {}

  ngOnInit(): void {
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
