/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "../../../utils/service/localStorage.service";
import { Router } from "@angular/router";

import * as IntroJs from 'intro.js';
@Component({
  selector: "app-availability",
  templateUrl: "./availability.component.html",
})
export class AvailabilityComponent implements OnInit {
  public lang;
  public introTour;
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.introTour = this.localStorageService.getItem("tourFlag");
    this.lang = this.localStorageService.getItem("language");
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
      intro.setOption("doneLabel", "Next");
      intro.setOption("nextLabel", "Next");
      intro.setOption("prevLabel", "Back");
      stepsContent = {
        steps: [
          {
            element: '#available_step1',
            intro: "Review and edit your availability here.",
            position: 'right'
          },
          {
            element: '#available_step2',
            intro: "Choose Appointment to review your scheduled appointments for the day.",
            position: 'right',
          }
        ]
      }
    } else {
      intro.setOption("doneLabel", "Prochaine");
      intro.setOption("nextLabel", "Prochaine");
      intro.setOption("prevLabel", "Arrière");
      stepsContent = {
        steps: [
          {
            element: '#available_step1',
            intro: "Revoyez et modifiez vos disponibilités ici",
            position: 'right'
          },
          {
            element: '#available_step2',
            intro: "Choisissez Rendez-vous pour revoir vos consultations de la journée.",
            position: 'right',
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
      self.router.navigateByUrl('payments');
    });

    intro.onexit(function () {
      console.log("complete")
    });

    intro.setOptions({
      exitOnOverlayClick: false,
      showBullets: false
    });

    // Start tutorial
    intro.start();
  }

}
