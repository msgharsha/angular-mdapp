/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManagePaymentComponent } from "./manage-payment.component";

describe("ManageDrugsComponent", () => {
  let component: ManagePaymentComponent;
  let fixture: ComponentFixture<ManagePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePaymentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
