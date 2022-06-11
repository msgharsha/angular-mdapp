/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  OnInit,
  Input,
  ViewContainerRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ErrorService } from "../../../../utils/service/error.service";
import { ToasterService } from "../../../../utils/service/toaster.service";
// import { BackendService } from '../../../backend.service';
import { DialogModalComponent } from "../../../../utils/component/cancel-modal/cancel-modal.component";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";

import * as moment from "moment";
import { isToday, isPast } from "date-fns";
import { Router } from "@angular/router";
import { CalendarService } from "../../calendar.service";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../../../utils/service/localStorage.service";

@Component({
  selector: "app-availability-provider-date-template",
  templateUrl: "./availability-provider-date-template.component.html",
  styleUrls: ["./availability-provider-date-template.scss"],
})
export class AvailabilityProviderDateTemplateComponent implements OnInit {
  @Input() day: any;
  @Input() locale: any;
  @Output() fetchEvents = new EventEmitter<any>();
  selectedSlot = new Set();
  availabilityId;
  form: FormGroup;
  lang: string;
  public userData: any;

  constructor(
    // private backendService: BackendService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    private calendarService: CalendarService,
    public translate: TranslateService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      checkArray: this.fb.array([], [Validators.required]),
    });

    this.translate.onLangChange.subscribe(() => {
      this.lang = this.localStorageService.getItem("language");
    });
    this.lang = this.localStorageService.getItem("language");
    this.userData = this.localStorageService.getItem("userData");
  }

  editAvailability(data) {
    console.log(this.day)
    const slotId = [...this.selectedSlot][0];
    const availabilityId = this.availabilityId;
    this.router.navigateByUrl(
      `/feature/calendar/availability/edit/${availabilityId}?timeId=${slotId}`
    );
  }

  copyAvailability(data, p) {
    p.close();

    // const copyDialogRef = this.dialog.open(CopyAvailabilityPopupComponent, {
    //   panelClass: 'general-modal',
    //   maxWidth: '600px',
    //   data: activeEvent
    // });
    // copyDialogRef.afterClosed().subscribe(() => {
    //   this.fetchEvents.emit();
    // });
  }

  confirmDeleteRequest(data, p) {
    const selectedDate = moment(data[0].start)
      .locale(this.lang)
      .format("dddd, MMMM Do YYYY");
    p.close();
    let msg = this.translate.instant(
      "ARE_YOU_SURE_TO_DELETE_AVAILABILITY_FOR",
      { selectedDate: selectedDate }
    );
    const dialogRef = this.dialog.open(DialogModalComponent, {
      data: {
        message: msg,
        buttonText: {
          ok: "Yes",
          cancel: "No",
        },
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteAvailability(data);
      }
    });
  }

  deleteAvailability(data) {
    const slotId = [...this.selectedSlot][0];
    if(this.userData && this.userData.subAccount && this.userData.selectedDoctorData){
      this.calendarService.managerDeleteAvailability(slotId,this.userData.selectedDoctorData).subscribe(
        (res) => {
          const message = "AVAILABILITY_DELETED_SUCCESSFULLY";
          this.toaster.showSuccess(this.vref, "", message);
          this.selectedSlot.delete(slotId);
          this.fetchEvents.emit();
        },
        (err) => this.handleError(err)
      );
    } else {
      this.calendarService.deleteAvailability(slotId).subscribe(
        (res) => {
          const message = "AVAILABILITY_DELETED_SUCCESSFULLY";
          this.toaster.showSuccess(this.vref, "", message);
          this.selectedSlot.delete(slotId);
          this.fetchEvents.emit();
        },
        (err) => this.handleError(err)
      );
    }
  }

  handleError(err) {
    this.errorService.handleError(err, this.vref);
  }

  openEventsPopOver(p, events) {
    if (events && events.length) {
      this.removeAllSelectedCheckboxes();
      p.open();
    }
  }

  removeAllSelectedCheckboxes() {
    let i = 0;
    const checkArray: FormArray = this.form.get("checkArray") as FormArray;
    checkArray.controls.forEach((item: FormControl) => {
      checkArray.removeAt(i);
      i++;
    });
  }

  onCheckboxChange(e) {
    const checkArray: FormArray = this.form.get("checkArray") as FormArray;
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i = 0;
      checkArray.controls.forEach((item: FormControl) => {
        if (item.value === e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  submitForm() {
    console.log(this.form.value);
  }

  minCheckLength(mode) {
    if (this.form.value.checkArray.length > 0) {
      if (mode === "EDIT") {
        return !!this.selectedSlot.size;
      }
      return true;
    } else {
      return false;
    }
  }

  addAvailability(events) {
    this.router.navigateByUrl(
      `/feature/calendar/availability/add?date=${events[0].meta.date}`
    );
  }

  selectedSlotExists(slot) {
    if (this.selectedSlot.has(slot.id)) {
      return true;
    } else {
      return false;
    }
  }

  selectSlotHandler(data, slot, id) {
    if (this.selectedSlot.has(slot.id)) {
      this.selectedSlot.delete(slot.id);
    } else {
      this.selectedSlot = new Set();
      this.selectedSlot.add(slot.id);
      this.availabilityId = id;
    }
  }

  dateIsPast(date) {
    return !isToday(date) && isPast(date);
  }
}
