/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DrugModalComponent } from "./drug-modal.component";

describe("DrugModalComponent", () => {
  let component: DrugModalComponent;
  let fixture: ComponentFixture<DrugModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrugModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrugModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
