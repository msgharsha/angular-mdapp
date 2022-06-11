/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewContainerRef,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ErrorService } from "../../../../utils/service/error.service";
import { ToasterService } from "../../../../utils/service/toaster.service";
// import { BackendService } from '../../../backend.service';
// import { ConfirmDialogComponent } from '../../../../utils/component/confirm-dialog/confirm-dialog.component';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
// import { CopyAvailabilityPopupComponent } from '../../availability/copy-availability-popup/copy-availability-popup.component';
import { isToday, isPast } from "date-fns";

@Component({
  selector: "app-availability-practice-date-template",
  templateUrl: "./availability-practice-date-template.component.html",
  styleUrls: ["./availability-practice-date-template.component.scss"],
})
export class AvailabilityPracticeDateTemplateComponent implements OnInit {
  @Input() day: any;
  @Input() locale: any;
  @Output() fetchEvents = new EventEmitter<any>();
  selectedSlot = new Set();
  form: FormGroup;
  public defaultImgSrc = "../../assets/images/doctor-1.png";

  constructor(
    // private backendService: BackendService,
    private errorService: ErrorService,
    private vref: ViewContainerRef,
    private toaster: ToasterService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      checkArray: this.fb.array([], [Validators.required]),
    });
  }

  editAvailability(data) {
    // const slotId = [...this.selectedSlot][0];
    // const availabilityId = this.form.value.checkArray[0];
    // this.backendService.navigateTo(
    //   `/backend/calendar/availability/edit/${availabilityId}?timeId=${slotId}`
    // );
  }

  copyAvailability(data, p) {
    p.close();
    // get checked event data
    // const activeEvent = this.getCheckedEventData(data);
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
    // get checked event data
    this.getCheckedEventData(data);

    p.close();
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   data: {
    //     message: `Are you sure to delete availability of ${providerName}?`,
    //     buttonText: {
    //       ok: 'Yes',
    //       cancel: 'No'
    //     }
    //   }
    // });
    // dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    //   if (confirmed) {
    //     this.deleteAvailability(data);
    //   }
    // });
  }

  deleteAvailability(data) {
    // this.backendService.deleteAvailability({ availabilityId }).subscribe(
    //   res => {
    //     const message = 'Availability Deleted Successfully!';
    //     this.toaster.showSuccess(this.vref, '', message);
    //     this.fetchEvents.emit();
    //   },
    //   err => this.handleError(err)
    // );
  }

  handleError(err) {
    this.errorService.handleError(err, this.vref);
  }

  openEventsPopOver(p, events) {
    if (events && events.length) {
      p.open();
      this.removeAllSelectedCheckboxes();
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

  addAvailability(events) {
    // this.backendService.navigateTo(
    //   `/backend/calendar/availability/add?date=${events[0].meta.date}`
    // );
  }

  minCheckLength(mode, eventData) {
    if (this.form.value.checkArray.length === 1) {
      if (mode === "EDIT") {
        const selectedSlotExist = this.checkSelectedSlotandEventMatches(
          eventData
        );
        return !!this.selectedSlot.size && selectedSlotExist;
      }
      return true;
    } else {
      return false;
    }
  }
  checkSelectedSlotandEventMatches(eventData) {
    // get checked event data
    const activeEvent = this.getCheckedEventData(eventData);
    const selectedSlotId = [...this.selectedSlot][0]; // get active time slot
    return (
      activeEvent &&
      activeEvent.meta.slots.some((item) => item.id === selectedSlotId)
    );
  }

  selectedSlotExists(slot) {
    if (this.selectedSlot.has(slot.id)) {
      return true;
    } else {
      return false;
    }
  }

  selectSlotHandler(data, slot) {
    if (this.selectedSlot.has(slot.id)) {
      this.selectedSlot.delete(slot.id);
    } else {
      this.selectedSlot = new Set();
      this.selectedSlot.add(slot.id);
    }
  }

  getCheckedEventData(eventsData) {
    // get checked event data
    const selectedEventId = parseInt(this.form.value.checkArray[0], 10);
    return eventsData.find((item) => item.meta.id === selectedEventId);
  }

  dateIsPast(date) {
    return !isToday(date) && isPast(date);
  }

  checkIfAllSlotsBlockOut(events) {
    return events.meta.slots.every((item) => item.details.isBlocked);
  }
}
