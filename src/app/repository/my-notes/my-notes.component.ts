/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddEditNotesComponent } from "../add-edit-notes/add-edit-notes.component";
import { RepositoryService } from "../repository.service";
import { ToasterService } from "../../../../src/app/utils/service/toaster.service";
import { ErrorService } from "../../../../src/app/utils/service/error.service";
import { DialogModalComponent } from "../../../../src/app/utils/component/cancel-modal/cancel-modal.component";
import { MSG } from "../constant";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../utils/service/localStorage.service";
import { Router } from "@angular/router";

import * as IntroJs from 'intro.js';
@Component({
  selector: "app-my-notes",
  templateUrl: "./my-notes.component.html",
  styleUrls: ["./my-notes.component.scss"],
})
export class MyNotesComponent implements OnInit {
  public notesList: any;
  public lang:any;
  public introTour;
  constructor(
    private matDialog: MatDialog,
    private repositoryService: RepositoryService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private traslate: TranslateService,
    private localStorageService: LocalStorageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.introTour = this.localStorageService.getItem("tourFlag");
    this.lang = this.localStorageService.getItem("language");
    this.getNotesList();
  }

  getNotesList() {
    this.repositoryService.getMyNotes().subscribe((res) => {
      if (res) {
        this.notesList = res.data;
      }
    });
  }

  addNote() {
    const dialogRef = this.matDialog.open(AddEditNotesComponent);
    dialogRef.afterClosed().subscribe((data) => {
      if (typeof data == "object") {
        this.repositoryService.saveMyNotes(data).subscribe(
          (res) => {
            if (res && res.message == MSG.SAVED_SUCCESS) {
              this.toaster.showSuccess(this.vref, "Success", "NOTE_ADDED");
              this.getNotesList();
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

  editMyNote(noteId) {
    const selectedNote = this.notesList.filter((obj) => {
      return obj.id === noteId;
    });
    const dialogRef = this.matDialog.open(AddEditNotesComponent, {
      data: selectedNote,
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (typeof data == "object") {
        data.id = noteId.toString();
        this.repositoryService.editMyNote(data).subscribe(
          (res) => {
            if (res && res.message == "Updated Successfully") {
              this.toaster.showSuccess(this.vref, "Success", "NOTE_UPDATED");
              this.getNotesList();
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

  deleteMyNote(noteId) {
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
          this.repositoryService.deleteNote(noteId).subscribe(
            (res) => {
              if (res.scuccess == true) {
                this.toaster.showSuccess(this.vref, "Success", "NOTE_DELETED");
                this.getNotesList();
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

  ngAfterViewInit() {
    setTimeout(() => {
      if(!this.introTour){
        this.startTour();
      }
    },1000)
  }


  startTour() {
    let self = this;
    console.log("Starting tour");
    let intro = IntroJs();
    let stepsContent
    if (this.lang == 'en') {
      intro.setOption("doneLabel", "Done");
      stepsContent = {
        steps: [
          {
            element: '#notes_step1',
            intro: "Create your own Note templates here to be used on consultations.",
            position: 'left',
          }
        ]
      }
    } else {
      intro.setOption("doneLabel", "Terminé");
      stepsContent = {
        steps: [
          {
            element: '#notes_step1',
            intro: "Créer vos propres gabarits de note pour étre utilisés lors de vos consultations.",
            position: 'left',
            onchange: function () {
              alert("Do whatever you want on this callback.");
            }
          }
        ]
      }
    }

    // Initialize steps
    intro.setOptions(stepsContent);
    
    intro.oncomplete(function () {
    });

    intro.onexit(function () {
      console.log("complete")
      self.endTour()
    });

    intro.setOptions({
      exitOnOverlayClick: false,
      showBullets: false
    });

    intro.start();
  }
  endTour(){
    let userData = this.localStorageService.getItem("userData");
    let body = {};
    body['introTour'] = true;
    body['userId'] = userData.userId;  
    this.repositoryService.endMyTour(body).subscribe((res) => {
      this.localStorageService.setItem("tourFlag", JSON.stringify(res.body.introTour))
    });
  }
}
