/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-repository",
  templateUrl: "./repository.component.html",
  styleUrls: ["./repository.component.scss"],
})
export class RepositoryComponent implements OnInit {
  type = "notes";

  constructor(private routeInfo: ActivatedRoute, private router: Router) {
    this.routeInfo.params.subscribe((param) => {
      this.type = this.router.url || "notes";
    });
  }

  ngOnInit(): void {}

  navigateTo(type) {
    this.type = type;
    this.router.navigateByUrl("repository/" + type);
  }
}
