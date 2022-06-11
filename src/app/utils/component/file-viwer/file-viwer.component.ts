/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-file-viwer",
  templateUrl: "./file-viwer.component.html",
  styleUrls: ["./file-viwer.component.scss"],
})
export class FileViwerComponent implements OnInit {
  public type: any;
  public url: any;
  constructor(
    private dialogRef: MatDialogRef<FileViwerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.url = this.data;
    this.checkFileExt(this.data);
  }

  checkFileExt(url) {
    const fileExt = url.split("/").pop().split(".").pop();
    if (fileExt == "jpeg" || fileExt == "png" || fileExt == "jpg") {
      this.type = "image";
    } else {
      this.type = "doc";
    }
  }

  close() {
    this.dialogRef.close();
  }
}
