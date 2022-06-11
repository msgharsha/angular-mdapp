/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { LOCAL_CONST } from "../../../constants/constants";
import { BookAppointmentService } from "../../services/book-appointment.service";
import { ErrorService } from "../../../../utils/service/error.service";
import { ToasterService } from "../../../../utils/service/toaster.service";

@Component({
  selector: "app-book-appointment-form",
  templateUrl: "./book-appointment-form.component.html",
  styleUrls: ["./book-appointment-form.component.scss"],
})
export class BookAppointmentFormComponent implements OnInit {
  //select options data
  @Input() procedureData: Array<any> = [];
  @Input() patientFamily: Array<any> = [];
  @Input() prefilledData: any = {};
  @Output() officeUpdate: EventEmitter<any> = new EventEmitter<any>();

  public slots: Array<any> = [];

  //FormControllers data
  public bookAppointmentForm: FormGroup;
  public reason: FormControl;
  public date: FormControl;
  public patient: FormControl;
  public isFirstVisit: FormControl;
  public isPreMedication: FormControl;
  public selectedSlot: FormControl;

  private dentistId: number = null;

  public isAppointmentBooked: boolean = false;
  public nextAvailableDate;
  public errorMsg;
  public contentSpecificLoader: boolean = false;
  public onSubmit: boolean = false;
  public bookingOffice: any;

  constructor(
    private builder: FormBuilder,
    private _bookAppointment: BookAppointmentService,
    private errorHandler: ErrorService,
    private vref: ViewContainerRef,
    private _router: Router,
    private _toastr: ToasterService
  ) {}

  public OPTION: any = {};
  public minDate: Date = new Date();

  ngOnInit() {
    this.OPTION = LOCAL_CONST.OPTION1;
    this.setValidators();
    this.initFormGroup(this.builder);
    this.bindPreSelectedData(this.prefilledData);
  }

  /**
   * set the validator
   */
  setValidators() {
    this.reason = new FormControl(null, [Validators.required]);
    this.date = new FormControl(null, [Validators.required]);
    this.patient = new FormControl(null, [Validators.required]);
    this.isFirstVisit = new FormControl(null, []);
    this.isPreMedication = new FormControl(null, []);
    this.selectedSlot = new FormControl(null, [Validators.required]);
  }

  /**
   * initialize the form
   * @param builder
   */
  initFormGroup(builder: FormBuilder) {
    this.bookAppointmentForm = builder.group({
      reason: this.reason,
      date: this.date,
      patient: this.patient,
      isFirstVisit: this.isFirstVisit,
      isPreMedication: this.isPreMedication,
      selectedSlot: this.selectedSlot,
    });
  }

  /**
   * pre selected data
   * @param data
   */
  bindPreSelectedData(data) {
    this.dentistId = data.dentistId;
    this.reason.setValue(data.procedureId);
    this.date.setValue(data.date);
    this.getDentistSlotsWithOffice();
  }

  /**
   * Function to get slots
   */
  getDentistSlotsWithOffice() {
    let paramsWithValid = this.createValidParams();
    if (!paramsWithValid.isValidParam) {
      return;
    }
    this.contentSpecificLoader = true;

    this._bookAppointment.getExpertSlots(paramsWithValid.params).subscribe(
      (res) => {
        this.slots = res.data.slot;
        this.contentSpecificLoader = false;
        this.setOffice(res.data.office);
        let index = this.setSlot();
        setTimeout(() => {
          this.activeScrollToSeclectedSlot(index);
        }, 110);
        this.nextAvailableDate = res.data.nextAvailableDate;
      },
      (err) => {
        this.contentSpecificLoader = false;
        this.errorHandler.handleError(err, this.vref);
      },
      () => {}
    );
  } //get-dentist-slot

  /**
   * on slot change update the value
   * @param slot
   */
  onSlotSelect(slot) {
    this.errorMsg = null;
    this.selectedSlot.setValue(slot);
  }

  /**
   * create the post body for
   * book the appointment
   */
  createBody() {
    this.isFirstVisit.setValue(this.getValueOPTION(this.isFirstVisit.value));
    this.isPreMedication.setValue(
      this.getValueOPTION(this.isPreMedication.value)
    );
    let body = {
      isFirstVisit: this.isFirstVisit.value,
      isPreMedicate: this.isPreMedication.value,
      expertId: this.dentistId,
      procedureId: this.reason.value,
      startTime: this.selectedSlot.value["time"],
      offset: encodeURIComponent(moment().format("Z")),
      bookedFor: _.find(
        this.patientFamily,
        (o) => o["id"] == this.patient.value
      ),
      dateId: this.selectedSlot.value["dateId"],
      timeId: this.selectedSlot.value["timeId"],
      officeId: this.bookingOffice.id,
    };
    let bookFor = {};
    bookFor = body.bookedFor;
    body["bookedFor"] = bookFor;
    return body;
  }

  /**
   * on booking the appointment
   */
  onBookAppointment() {
    this.onSubmit = true;
    if (this.bookAppointmentForm.invalid) {
      window.scroll(0, 250);
      return;
    }
    let body = this.createBody();
    this._bookAppointment.bookSlot(body).subscribe(
      (success) => {
        this.isAppointmentBooked = true;
        const { appointment } = success.data;
        this._toastr.showSuccess(this.vref, "Success", success.message);
        setTimeout(
          () =>
            this._router.navigate(["appointment", "detail", appointment.id]),
          500
        );
      },
      (err) => {
        this.errorHandler.handleError(err, this.vref);
      }
    );
  } //onBookAppointment-closes

  /**
   * method get value for label in radio selection
   * @param val
   */
  getValueOPTION(val) {
    if (typeof val == "boolean") {
      return val;
    }
    let option = _.find(this.OPTION, function (o) {
      return o.LABEL == val;
    });
    return option ? option.VAL : null;
  }

  /**
   * update the slots as reason is updated
   */
  updateSlots(date?) {
    let newDate = moment(new Date(date)).startOf("day").format();
    if (date) {
      this.date.setValue(newDate);
    }
    this.prefilledData.slot = null;
    this.selectedSlot.setValue(null);
    this.getDentistSlotsWithOffice();
  }

  /**
   * assign slot value acc to condition
   * and return the selected slot index;
   */
  setSlot() {
    let i = -1,
      selectedSlotIndex = -1;
    if (!this.prefilledData.slot) {
      this.selectedSlot.setValue(null);
    } else {
      _.find(this.slots, (o) => {
        i++;
        if (o["time"] == this.prefilledData.slot) {
          selectedSlotIndex = i;
          this.selectedSlot.setValue(o);
        }
      });
    }
    return selectedSlotIndex;
  }

  /**
   * create valid params for slot
   */
  createValidParams() {
    let params: any = {};
    let isValidParam = true;
    params.expertId = this.dentistId;
    params.date = moment(this.date.value).startOf("day").valueOf();
    params.procedureId = this.reason.value;
    params.offset = encodeURIComponent(moment().format("Z"));
    if (!params.procedureId || _.isNaN(_.toNumber(params.procedureId))) {
      isValidParam = false;
    }
    if (!params.date || _.isDate(params.procedureId)) {
      isValidParam = false;
    }
    return { params, isValidParam };
  }

  /**
   * set the office and give update to parent.
   * @param office
   */
  setOffice(office) {
    this.bookingOffice = office;
    this.officeUpdate.emit(office);
  }

  /**
   * move the scroll to selected slot;
   * @param index
   */
  activeScrollToSeclectedSlot(index) {
    try {
      let id = "time_slot" + index;
      let leftPos = document.getElementById(id).offsetLeft;
      document.getElementById("time-container").scrollLeft = leftPos - 62;
    } catch (exe) {}
  }
}
