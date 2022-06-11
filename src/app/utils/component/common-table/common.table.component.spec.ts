/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CommonTableComponent } from "./common.table.component";

describe("TableComponent", () => {
  let component: CommonTableComponent;
  let fixture: ComponentFixture<CommonTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommonTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
