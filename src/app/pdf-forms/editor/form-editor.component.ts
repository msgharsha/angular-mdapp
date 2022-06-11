/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { ManageAutoFormService } from '../../manage-forms/manage-forms.service';
import WebViewer from '@pdftron/webviewer';
import { Subject, Subscription } from 'rxjs';
import { AppointmentService } from '../../board-features/calender/appointments/appointments.service';
import { saveAs } from "file-saver";

@Component({
    selector: "app-autoform-editor",
    templateUrl: "./form-editor.component.html",
    styleUrls: ["./form-editor.component.scss"],
    providers: []
})
export class FormEditorComponent implements OnInit {

    @ViewChild('viewer') viewer: ElementRef;
    wvInstance: any;
    annotationsInfo: any;
    params: any;
    bookingInfo: any;
    fileUrl = '';
    @Output() coreControlsEvent: EventEmitter<any> = new EventEmitter();
    public routeChangeSubscription: Subscription;

    private documentLoaded$: Subject<void>;

    formBindingsInfo = [
        {
            name: 'XR-formulaire',
            genderInfo: {
                female: 'fem',
                male: 'mas'
            },
            formData: {
                patient: {
                    P_NAME: "patientName",
                    P_EMAIL: 'patientEmail',
                    P_CELL_PHONE: 'patientPhoneNumber',
                    P_HOME_PHONE: 'patientPhoneNumber',
                    P_DOB: 'dob'
                },
                doctor: {
                    D_NAME: 'firstName,lastName',
                    D_DATE: 'date',
                    D_LIC: 'licenseNumber',
                    D_SIGN: 'signature',
                    CLINIC_INFO: 'clinicName'
                }
            }
        },
        {
            name: 'Laboratories-requisition-Adult-patients',
            genderInfo: {
                female: 'P_FEMALE',
                male: 'P_Male'
            },
            formData: {
                patient: {
                    P_LNAME: "patientFirstName",
                    P_FNAME: "patientLastName",
                    P_DOB: "dob",
                    gender: 'gender'
                },
                doctor: {
                    D_LNAME: "firstName",
                    D_FNAME: "lastName",
                    D_DATE: "date",
                    D_CLINIC_NAME: "clinicName",
                    D_CLINIC_PHONE: "clinicPhoneNumber",
                    D_LIC: "licenseNumber",
                    D_CLINIC_INFO: "addressLine1",
                    D_SIGN: "signature"
                }
            }
        }
    ]


    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private manageAutoFormService: ManageAutoFormService,
        private appointmentService: AppointmentService
    ) {
        this.documentLoaded$ = new Subject<void>();
        this.routeChangeSubscription = this.activatedRoute.queryParams.subscribe((param) => {
            this.params = param;
            if (['XR-formulaire', 'Laboratories-requisition-Adult-patients'].includes(param.name)) {
                if (param.imageUrl) {
                    this.fileUrl = this.manageAutoFormService.previewPDFFileInfo('doc', param.imageUrl, 'doc');
                }
            } else {
                this.router.navigateByUrl("feature/dashboard");
            }
        });
    }

    ngOnInit(): void {
        this.appointmentService.getAppointmentById(this.params.bookingId).subscribe((res) => {
            this.bookingInfo = res.data;
            // let doctorDate = parseInt(res.data.doctor.date)
            // res.data.doctor.date = new Date(doctorDate).toISOString();
           
        });
    };

    ngAfterViewInit(): void {
        let self = this;
        WebViewer({
            path: '../../lib',
            initialDoc: this.fileUrl
        }, this.viewer.nativeElement).then(instance => {
            this.wvInstance = instance;
            instance.UI.disableElements(['toolbarGroup-Annotate']);
            instance.UI.disableElements(['toolbarGroup-Shapes']);
            instance.UI.disableElements(['toolbarGroup-Insert']);
            instance.UI.disableElements(['toolbarGroup-Edit']);
            instance.UI.disableElements(['toolbarGroup-FillAndSign']);
            instance.UI.disableElements(['toolbarGroup-Forms']);
            instance.UI.disableElements(['toolbarGroup-View']);
            instance.UI.disableElements(['menuButton', 'eraserToolButton', 'freeHandHighlightToolGroupButton', 'freeHandToolGroupButton', 'shapeToolGroupButton', 'freeTextToolGroupButton', 'stickyToolGroupButton', 'squigglyToolGroupButton', 'strikeoutToolGroupButton', 'highlightToolGroupButton', 'underlineToolGroupButton', 'textPopup', 'selectToolButton', 'leftPanelButton', 'viewControlsButton', 'panToolButton', 'searchButton', 'toggleNotesButton', 'themeChangeButton']);

            this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);

            const { documentViewer, Annotations, annotationManager, SaveOptions } = instance.Core;

            const docViewer = instance.Core.documentViewer;
            const annotManager = docViewer.getAnnotationManager();
            const fieldManager = annotManager.getFieldManager();

            documentViewer.addEventListener('annotationsLoaded', () => {
                const annotList = annotationManager.getAnnotationsList();
                self.annotationsInfo = annotList;
                console.log('annotations loaded');
            });


            let downloadStatus = false;
            // Add header button that will get file data on click
            instance.UI.setHeaderItems(header => {
                header.push({
                    type: 'actionButton',
                    img: '../../assets/images/print.svg',
                    onClick: async () => {
                        const doc = documentViewer.getDocument();
                        if (!downloadStatus) {
                            self.annotationsInfo.forEach(function (annot) {
                                if (annot.fieldName !== undefined) {
                                    try {
                                        const field: any = fieldManager.getField(annot.fieldName);
                                        field.widgets.map(annot => {
                                            annot.fieldFlags.set('ReadOnly', true);
                                        });
                                    } catch(error) {
                                        console.log(error)
                                    }
                                }
                            });
                        }
                        downloadStatus = true;
                        const xfdfString = await annotationManager.exportAnnotations();
                        const data = await doc.getFileData({
                            // saves the document with annotations in it
                            flags: SaveOptions.LINEARIZED,
                            xfdfString,
                            ...{ flatten: true }
                        });
                        const arr = new Uint8Array(data);
                        const blob = new Blob([arr], { type: 'application/pdf' });
                        saveAs(blob, 'downloaded.pdf');
                        self.annotationsInfo.forEach(function (annot) {
                            if (annot.fieldName) {
                                if (annot instanceof Annotations.WidgetAnnotation) {
                                    try {
                                        const field: any = fieldManager.getField(annot.fieldName);
                                        field.widgets.map(annot => {
                                            annot.fieldFlags.set('ReadOnly', false);
                                        });
                                    } catch(error) {
                                        console.log(error)
                                    }
                                }
                            }
                        });
                        downloadStatus = false;
                        // add code for handling Blob here
                    }
                });
            });

            documentViewer.addEventListener('documentLoaded', async () => {
                documentViewer.getAnnotationsLoadedPromise().then(() => {
                    const fieldManager = annotationManager.getFieldManager();
                    const findFormInfo = _.find(self.formBindingsInfo, { name: self.params.name });
                    let objectInfo = {};
                    console.log('==============> to find the form info')
                    console.log(findFormInfo)
                    console.log('===============>to find the form info')
                    if (findFormInfo) {
                        for (let key in findFormInfo.formData.patient) {
                            const value = findFormInfo.formData.patient[key];
                            const keysInfo = value.split(",");
                            if (key === 'gender') {
                                const keyValue = this.bookingInfo.patient[value];
                                const keyName = findFormInfo.genderInfo[keyValue];
                                objectInfo[keyName] = 'Oui';
                            } else if (value === 'current_date') {
                                objectInfo[key] = moment().format('YYYY-MM-DD');
                            } else if (['dob', 'date'].includes(value)) {
                                objectInfo[key] = moment(new Date(this.bookingInfo.patient[value])).format('YYYY-MM-DD');
                            } else if (keysInfo.length !== 0) {
                                let responseValue = '';
                                keysInfo.forEach(element => {
                                    responseValue = responseValue + this.bookingInfo.patient[element] + ' ';
                                });
                                objectInfo[key] = responseValue;
                            } else {
                                objectInfo[key] = this.bookingInfo.patient[value];
                            }
                        }
                        for (let key in findFormInfo.formData.doctor) {
                            const value = findFormInfo.formData.doctor[key];
                            const keysInfo = value.split(",");
                            if (key === 'gender') {
                                const keyValue = this.bookingInfo.patient[value];
                                const keyName = findFormInfo.genderInfo[keyValue];
                                objectInfo[keyName] = 'Oui';
                            } else if (value === 'current_date') {
                                objectInfo[key] = moment().format('YYYY-MM-DD');
                            } else if (['dob', 'date'].includes(value)) {
                                objectInfo[key] = moment(new Date(this.bookingInfo.doctor[value])).format('YYYY-MM-DD');
                            } else if (keysInfo.length !== 0) {
                                let responseValue = '';
                                keysInfo.forEach(element => {
                                    responseValue = responseValue + this.bookingInfo.doctor[element] + ' ';
                                });
                                objectInfo[key] = responseValue;
                            } else {
                                objectInfo[key] = this.bookingInfo.doctor[value];
                            }
                        }
                    }
                    console.log("=================> to find objectInfo");
                    console.log(objectInfo);
                    console.log("=================> to find objectInfo");
                    for (let key in objectInfo) {
                        self.annotationsInfo.forEach(function (annot) {
                            if (annot instanceof Annotations.WidgetAnnotation) {
                                if (annot.fieldName === key) {
                                    const field: any = fieldManager.getField(annot.fieldName);
                                    field.setValue(objectInfo[key]);
                                    field.widgets.map(annot => {
                                        annot.fieldFlags.set('ReadOnly', true);
                                    });
                                }
                            }
                        });
                    }
                });
            });
        })
    }

    getDocumentLoadedObservable() {
        return this.documentLoaded$.asObservable();
    }

    ngOnDestroy() {
        if (this.routeChangeSubscription) {
            this.routeChangeSubscription.unsubscribe();
        }
    }

}
