/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import * as _ from "lodash";
import * as moment from "moment";
import { Values } from '../../constants/values';
import { ToasterService } from "../../utils/service/toaster.service";
import { Router } from "@angular/router";
import { ManageAutoFormService } from '../manage-forms.service';
import { TranslateService, LangChangeEvent } from "@ngx-translate/core";

@Component({
    selector: "app-autoform-details",
    templateUrl: "./form-details.component.html",
    styleUrls: ["./form-details.component.scss"],
    providers: []
})
export class FormDetailsComponent implements OnInit {

    formDetails = [];

    totalCount = 0;
    provinceType = Values.PROVINCE_FORM.province_id;
    pageInfo = {
      page: 1,
      limit: 10,
      skip: 0,
    };

    tableHeaders = [
        {
            label: "FORM_TYPE",
            key: "type",
        },
        {
            label: "FORM_SUB_TYPE",
            key: "sub_type",
        },
        {
            label: "FORM_CODE",
            key: "code",
        },
        {
            label: "FORM_NAME",
            key: "name",
        },
        {
            label: "FORM_DESCRIPTION",
            key: "description",
        },
        {
            label: "UPDATED_DATE",
            key: "updated_at",
            renderHTML: (event) => {
                let date = new Date(event.value);
                return moment(date).format("DD-MM-YYYY HH:mm");
            },
        },
        {
            label: "PRINT_FORM",
            key: "id",
            printIcon: true,
        }
    ];

    constructor(
        private toaster: ToasterService,
        private vref: ViewContainerRef,
        private manageAutoFormService: ManageAutoFormService,
        private translate: TranslateService,
        private router: Router
    ) {
        this.getAutomatedForms();
    }

    ngOnInit(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            let url = this.router.url.split("/");
            if (url[url.length - 1] == "form-details") {
            }
        });
    };

    getAutomatedForms() {
        const requestObject = {
            provice_id: this.provinceType,
            formType: JSON.stringify([Values.PROVINCE_FORM.formTypes[0], Values.PROVINCE_FORM.formTypes[2], Values.PROVINCE_FORM.formTypes[3]]),
            current_page: this.pageInfo.page,
            page_limit: this.pageInfo.limit
        };
        this.manageAutoFormService.getAutomatedForms(requestObject).subscribe((res) => {
            res.data.forEach((element, index) => {
                if (element.url_path && element.url_path !== '') {
                   const getBaseUrl = this.manageAutoFormService.previewFileInfo(element.name, element.url_path, 'doc');
                    res.data[index].pdfPreviewUrl = getBaseUrl;   
                }
            });
           this.formDetails = res.data;
           if (res.pagination.currentPage === 1)
           this.totalCount = res.pagination.total;
        });
    };


    onPageChange(event) {
        this.pageInfo = event;
        this.getAutomatedForms();
    };

    printInfo(id) {
        const findObject = _.find(this.formDetails, {id: id});
        if (findObject.pdfPreviewUrl) {
            window.open(findObject.pdfPreviewUrl)
        } else {
            this.toaster.showError(
                this.vref,
                "Error Occurred",
                "ERROR_OCCURED"
            );
        }
    }

}
