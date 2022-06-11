/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, Input, OnInit, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit {
  @Input() data = [];
  @Input() headers = [];
  @Input() headersBind = [];
  @Input() isNote: boolean;
  @Output() deleteNoteId = new EventEmitter<string>();
  @Output() editNoteId = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}
  editMyNotes(id) {
    this.editNoteId.emit(id);
  }
  deleteMyNotes(id) {
    this.deleteNoteId.emit(id);
  }
}
