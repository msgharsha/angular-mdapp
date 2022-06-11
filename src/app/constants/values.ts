/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { URL } from "./url";
export const Values = {
  ROLE: {
    DENTIST: 1,
    HYGIENIST: 2,
  },
  MAX_IMG_Count: 5,
  EXPRESSION: {
    MAIL: "[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$",
    WEBSITE: new RegExp(
      /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/
    ),
  },
  QR_ACTIONTYPE: {
    READ: 0,
    REGENERATE: 1,
  },
  USER_ROLE: {
    PRACTICE_ADMIN: "Practice Owner",
    DENTIST: "Dentist",
    HYGIENIST: "Hygienist",
  },
  SALUTATION: {
    DENTIST: "Dr.",
  },

  PAGINATION: {
    LIMIT: 10,
  },
  /**
   * Kindly donot change the below array not even a single space
   * because its binding at calendar edit,view,add modal and template.
   */
  TIMINGS: [
    "12:00 am",
    "12:30 am",
    "1:00 am",
    "1:30 am",
    "2:00 am",
    "2:30 am",
    "3:00 am",
    "3:30 am",
    "4:00 am",
    "4:30 am",
    "5:00 am",
    "5:30 am",
    "6:00 am",
    "6:30 am",
    "7:00 am",
    "7:30 am",
    "8:00 am",
    "8:30 am",
    "9:00 am",
    "9:30 am",
    "10:00 am",
    "10:30 am",
    "11:00 am",
    "11:30 am",
    "12:00 pm",
    "12:30 pm",
    "1:00 pm",
    "1:30 pm",
    "2:00 pm",
    "2:30 pm",
    "3:00 pm",
    "3:30 pm",
    "4:00 pm",
    "4:30 pm",
    "5:00 pm",
    "5:30 pm",
    "6:00 pm",
    "6:30 pm",
    "7:00 pm",
    "7:30 pm",
    "8:00 pm",
    "8:30 pm",
    "9:00 pm",
    "9:30 pm",
    "10:00 pm",
    "10:30 pm",
    "11:00 pm",
    "11:30 pm",
  ],
  PROVINCE_FORM: {
      province_id: 11,
      name: "Quebec",
      formTypes: [
        "Administration forms",
        "Prescriptions",
        "Requisitions",
        "Referrals and Agency"
      ]
    },
  InHeaderNotRequiredLogoutIcon: [
    "/welcome",
    "/email-verification",
    `/${URL.VIDEO_CALL}`,
    `/${URL.TERMS}`,
    `/${URL.FAQS}`,
  ],
  HeaderNotRequired: [
    "/dentist/sign-up",
    "/dentist/sign-in",
    "/dentist/forgot-password",
    "/dentist/reset-password",
    "/",
  ],
};
