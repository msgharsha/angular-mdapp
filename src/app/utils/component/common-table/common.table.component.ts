/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-common-table",
  templateUrl: "./common.table.component.html",
  styleUrls: ["./common.table.component.scss"],
})
export class CommonTableComponent implements OnInit {
  @Input() data = [];
  @Input() headers = [];
  @Input() EmptyRecordsMsg = '';
  @Output() pageChange = new EventEmitter();
  @Output() editSelected = new EventEmitter();
  @Output() deleteSelected = new EventEmitter();
  @Output() saveSelected = new EventEmitter();
  @Output() printSelected = new EventEmitter();
  itemsPerPage = 10;
  currentPage = 1;
  @Input() totalCount;

  constructor(public sanatizer: DomSanitizer) {}

  ngOnInit(): void {
    if (!this.totalCount) {
      this.totalCount = this.data.length;
      this.itemsPerPage = this.totalCount;
    }
  }

  ngOnChanges(value) {
    if (
      value.totalCount &&
      value.totalCount.previousValue !== value.totalCount.currentValue
    ) {
      this.itemsPerPage = 10;
    }
  }

  pageChangedEvent(event) {
    this.currentPage = event;
    this.pageChange &&
      this.pageChange.emit({
        page: this.currentPage,
        limit: this.itemsPerPage,
        skip: this.itemsPerPage * (this.currentPage - 1),
      });
  }

  edit(id) {
    this.editSelected.emit(id);
  }

  delete(id) {
    this.deleteSelected.emit(id);
  }

  save(id) {
    this.saveSelected.emit(id);
  }

  print(id) {
    this.printSelected.emit(id);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.editSelected.unsubscribe();
    this.deleteSelected.unsubscribe();
    this.pageChange.unsubscribe();
    this.saveSelected.unsubscribe();
    this.printSelected.unsubscribe();
  }
}
