/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

export const C_URL = {
  FEATURE: {
    // HOME: routes.HOME,
    // CALENDAR: routes.CALENDAR,
    // MANAGE_PRACTICE: routes.MANAGE_ORG,
    // MANAGE_TEAM: routes.MANAGE_TEAM,
    // MANAGE_PATIENTS: routes.MANAGE_PATIENT,
    // DOCTOR_CONNECT: routes.DOCTOR_CONNECT,
    // PATIENT_CONNECT: routes.PATIENT_CONNECT,
    // ACCOUNT: routes.SETTINGS,
  },
  FULL: {
    ACCOUNT_SETTING: {
      PERSONAL: "/feature/account/personal",
      WORK_DETAIL: "/feature/account/work-detail",
      EMERGENCY: "/feature/account/emergency",
    },
    MANAGE_PRACTICE: {
      GENERAL: {
        HOME: "/feature/manage-practice/general",
        IMAGE: "/feature/manage-practice/general/image",
        INFO: "/feature/manage-practice/general/dental-info",
        PROCEDURE: "/feature/manage-practice/general/procedures",
      },
      OFFICES: {
        HOME: "/feature/manage-practice/office-list",
        VIEW: "/feature/manage-practice/view-office-detail",
        EDIT: "/feature/manage-practice/edit-office-detail?",
      },
      PATIENT_FORM: {
        HOME: "",
      },
    },
    MANAGE_PATIENTS: {
      PRESCRIPTION: "prescription",
      VIEW_PATIENT: "view-patient",
      REPORTS: "reports",
      MY_PRESCRIPTION: "images",
      APPOINTMENTS: "appointments",
      VIEW: "view",
    },
  },
  AVAILABILITY: {
    GET: "practice/availability",
  },
  APPOINTMENT: {
    GET: "practice/appointment",
    EDIT: "practice/booking/edit",
  },
  SEND_REMINDER: {
    POST: "practice/booking/send-reminder",
  },
};
