
import { Component, OnInit, ViewContainerRef, Inject, Input } from "@angular/core";
import { TranslaterService } from "../../utils/service/translater.service";
import { PrescriptionService } from "../../utils/service/presciption.sevice";
import { ErrorService } from "../../utils/service/error.service";
import { ToasterService } from "../../utils/service/toaster.service";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
@Component({
  selector: "detailedprescriptionmodel",
  templateUrl: "./detailedprescriptionmodel.component.html",
  styleUrls: ["./prescribe-medicines.component.scss"],
})
export class DetailedPrescriptionComponent implements OnInit {
 
  public template = [];
  public templateSelection;
  public selectedTemplate = {};
  public selectedContent;
  public saveNoteExist: boolean = false;
  public formSubmitted: boolean = false;
  patientId: any;
  prescriptionhistoryList: any;

  constructor(
    private dialogRef: MatDialogRef<DetailedPrescriptionComponent>,
    @Inject(MAT_DIALOG_DATA) public medicalHistoryData: any,
    private translater: TranslaterService,
    private prescriptionService: PrescriptionService,
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.patientId = Number(params["patientId"]);
    });
  }

  ngOnInit(): void {
    console.log(this.patientId);
    this.prescriptionService.getPrescriptionhistory(this.patientId).subscribe(
      (res: any) => {
        this.prescriptionhistoryList = res.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      },
      (err) => {
        this.toaster.showError(this.vref, "Error Occurred", "ERROR_OCCURED");
      }
    );
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
