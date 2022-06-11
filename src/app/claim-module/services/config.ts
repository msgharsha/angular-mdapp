import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Config {


    public static get EVENT_TYPES() {
        return [
            {
                id: "1",
                value: 'Service rendu dans le cadre des lois relatives à la santé et à la sécurité du travail'
            },
            {
                id: "2",
                value: 'Dernières menstruations'
            },
            {
                id: "3",
                value: "Date prévue de l'accouchement"
            }
        ]
    }

    public static get CLAIM_DATA_INFO() {
        return ['location_name', 'no_sect_activ', 'health_card_num', 'diagnosis_code', 'dat_entre_pers_lieu', 'dat_evene_pers', 'dat_sorti_pers_lieu', 'typ_evene_pers' ];
    }

    public static get DATA_INFO_TYPES() {
        return [ "id_elm_fact", "dat_serv_elm_fact", "dhd_elm_fact", "dhf_elm_fact", "refre_connu_id_prof", "timeSlot", "cod_elm_contx", "val_mes", "cod_elm_mesur"];
    }

    public static get GET_TOKEN(): string {
        const tok_det = localStorage.getItem('token');
        if (tok_det !== undefined) {
            return tok_det;
        } else {
            return '';
        }
    }

    public static get ledgerInfo(): object {
        return {
            itemType: "",
            itemCode: "",
            itemDescription: "",
            unitPrice: "",
            quantity: "",
            amount: "",
            tax: "",
            totalAmount: "",
        }
    }

    public static get claimIncidentData(): object {
        return {
            casualPart: "",
            casualDescription: "",
            notesType: "",
            noteText: ""
        }
    }

    public static get ClaimTotalInfo(): object {
        return {
            totalTax: 0,
            vat: 0,
            totalVat: 0,
            deduction: 0,
            totalAmount: 0
        }
    }

    public static get LOGIN_URL(): string { return '/login'; }
}
