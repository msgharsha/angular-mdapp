/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef, Input } from "@angular/core";
import { TranslaterService } from "../../../../../utils/service/translater.service";
import { AppointmentService } from "../../appointments.service";
import { ErrorService } from "../../../../../utils/service/error.service";
import { ToasterService } from "../../../../../utils/service/toaster.service";
import { environment } from "../../../../../../environments/environment";
import { common } from "../../../../../constants/common";
import { MatDialog } from "@angular/material/dialog";
import { MSG } from "../../../../../repository/constant";
import { RepositoryService } from "../../../../../repository/repository.service";
import { LocalStorageService } from "../../../../../utils/service/localStorage.service";
import { AddEditNotesComponent } from "../../../../../repository/add-edit-notes/add-edit-notes.component";
import { DetailedNotesComponent } from "./detailednotesmodel.component"
import { AllNotesComponent } from "./allnotesmodel.component"
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-notes",
  templateUrl: "./notes.component.html",
  styleUrls: ["./notes.component.scss"],
})
export class NotesComponent implements OnInit {
  @Input() bookingId;
  @Input() isFromPending;
  @Input() invitePatientStatus;
  public editorApiKey = environment.editorApiKey;
  public editorConfig = common.editorConifg;
  public template = [];
  public templateSelection;
  public selectedTemplate = {};
  public selectedContent;
  public saveNoteExist: boolean = false;
  public formSubmitted: boolean = false;
  public userData:any= {};
  public patientId:any;

  constructor(
    private matDialog: MatDialog,
    private translater: TranslaterService,
    private repositoryService: RepositoryService,
    private appointmentService: AppointmentService,
    private localStorage: LocalStorageService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private route: ActivatedRoute,
    private toaster: ToasterService
  ) {}

  ngOnInit(): void {
    this.translater.TranslationAsPerSelection();
    this.userData = this.localStorage.getItem("userData") || {};
    this.route.queryParams.subscribe((params) => {
      this.patientId = params.patientId;
    });
    this.getSavedNotes();
  }

  getTemplatesValue() {
    this.appointmentService.getTemplatesValue().subscribe(
      (res: any) => {
        this.template = res.data || [];
        this.template.unshift({});
        if (!this.template.length) {
          return;
        }
        this.templateSelection = this.template[0];
        this.onSelection();
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  onSelection() {
    this.selectedTemplate = this.template.find(
      (item) => item.id == this.templateSelection.id
    );
    this.selectedContent = this.selectedTemplate['content'];
  }

  getSavedNotes() {
    const bookingId = this.bookingId.toString();
    this.appointmentService.getAppointmentNotes(bookingId).subscribe(
      (res) => {
        if (res.data.id) {
          this.template = [res.data] || [];
          this.templateSelection = res.data || "";
          this.onSelection();
          this.saveNoteExist = true;
        } else if (res.data.id == null && res.data.downloadUrl) {
          this.selectedContent = res.data.content;
          this.selectedTemplate['downloadUrl'] = res.data.downloadUrl;
          this.appointmentService.getTemplatesValue().subscribe(
            (res: any) => {
              this.template = res.data || [];
              this.template.unshift({});
              if (!this.template.length) {
                return;
              }
              this.templateSelection = this.template[0];
            },
            (err) => this.errorService.handleError(err, this.vref)
          );
          this.saveNoteExist = true;
        }
        if (!this.saveNoteExist) {
          this.getTemplatesValue();
        }
      },
      (err) => {
        this.errorService.handleError(err, null);
      }
    );
  }

  saveTemplate() {
    this.formSubmitted = true;
    console.log(this.selectedContent);
    if (!this.selectedContent) {
      this.toaster.showError(
        this.vref,
        "TEMPLATE_CONTENT_SHOULD_NOT_BE_EMPTY",
        "TEMPLATE_CONTENT_SHOULD_NOT_BE_EMPTY"
      );
      return;
    }
    const body = {
      bookingId: this.bookingId.toString(),
      templateName: this.selectedTemplate['templateName'] || null,
      content: this.selectedContent,
      templateId : (this.selectedTemplate && this.selectedTemplate['id'] ) ? this.selectedTemplate['id'].toString() : null
    };
    this.appointmentService.saveTemplate(body).subscribe(
      (res: any) => {
        this.translater.getTranslatedValue("TEMPLATE_SAVE_SUCESSFULLY");
        this.toaster.showSuccess(
          this.vref,
          this.translater.translatedKey.toString(),
          res.message
        );
        this.getSavedNotes();
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

  addNote() {
    const dialogRef = this.matDialog.open(AddEditNotesComponent);
    dialogRef.afterClosed().subscribe((data) => {
      if (typeof data == "object") {
        this.repositoryService.saveMyNotes(data).subscribe(
          (res) => {
            if (res && res.message == MSG.SAVED_SUCCESS) {
              this.toaster.showSuccess(this.vref, "Success", "NOTE_ADDED");
              this.getSavedNotes();
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

  detailedNotes(){
    let notesHistoryData;
    this.appointmentService.notesHistory(this.patientId).subscribe(
      (res: any) => {
        console.log(res);
        notesHistoryData = res.data
        this.matDialog
        .open(DetailedNotesComponent, {
          height: "700px",
          width: "1000px",
          data: {
            notesData: notesHistoryData,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
        },
      (err) => this.errorService.handleError(err, this.vref)
    );
    
  }

  allAvailableNotesModel(){
    let allNotes
    this.appointmentService.getTemplatesValue().subscribe(
      (res: any) => {
        allNotes = res.data || [];
        this.matDialog
        .open(AllNotesComponent, {
          height: "700px",
          width: "1000px",
          data: {
            allNotesData: allNotes,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
      },
      (err) => this.errorService.handleError(err, this.vref)
    );
  }

}
