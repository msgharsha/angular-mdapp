/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

export class Prescription {
  bookedFor: User;
  bookingId: number;
  expertId: number;
  patientId: number;
  prescriptionId: number;
  salutation: string;
  name: number;
  profileImageUrl: string;
  expertType: string;
  presentComplaints: string;
  findings: string;
  diagnosis: string;
  prescriptionItem: Array<PrescriptionItem>;
}

export class PrescriptionItem {
  id: number;
  name: string;
  notes: string;
  timings: {
    morning: Timing;
    noon: Timing;
    evening: Timing;
  };
  medicationType: string;
  medicationTypeId: number;
  medicationTimeAndQuantity: Array<Timing>;
}
export class User {
  id: number;
  name: string;
  email: string;
  isFamilyMember: boolean;
}

export class Timing {
  time: string;
  quantity: string;
}
export class Diagnosis {
  presentComplaints: string;
  findings: string;
  diagnosis: string;
}
export class UploadPrescription extends Diagnosis {
  bookingId: string;
  prescriptionTitle: string;
  prescriptionUrl: string;
  prescriptionId: number;
}
