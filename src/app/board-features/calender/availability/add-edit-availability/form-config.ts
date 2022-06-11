/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

export const formConfig = {
  timeSlots: [
    { name: "15 mins", id: 15 },
    { name: "20 mins", id: 20 },
    { name: "30 mins", id: 30 },
    { name: "45 mins", id: 45 },
    { name: "60 mins", id: 60 },
    { name: "75 mins", id: 75 },
    { name: "90 mins", id: 90 },
  ],

  masterAvailableDays: [
    { id: 6, name: "S" },
    { id: 0, name: "M" },
    { id: 1, name: "T" },
    { id: 2, name: "W" },
    { id: 3, name: "T" },
    { id: 4, name: "F" },
    { id: 5, name: "S" },
  ],

  masterAvailabilityTypes: [
    { id: "VIVODOC_ONLY", name: "VivoDoc Only" },
    { id: "VIVODOC_AND_OTHERS", name: "VivoDoc & Others" },
    { id: "OTHERS", name: "Others Only" },
  ],
};
