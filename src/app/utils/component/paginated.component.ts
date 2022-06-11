/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { Subscription } from "rxjs";

@Component({
  selector: "paginated",
  template: "",
})
export class PaginatedComponent {
  get count(): number {
    return this._count;
  }

  set count(value: number) {
    this.checkOnCountUpdate(value);
    this._count = value;
  }

  private checkOnCountUpdate(value: number) {
    if ((this.currentPage - 1) * this.itemsPerPage >= value) {
      this.navigateToPage(1);
    }
  }

  currentPage: number = 1;
  private _count: number = 0;
  itemsPerPage: number = 10;
  subscriptions: Subscription;

  constructor(protected route: ActivatedRoute, protected router: Router) {}

  getData(currentPage) {
    //todo override this
  }

  /**
   * Function to handle page change event
   */
  pageChangedEvent(pageNo: number) {
    if (pageNo === this.currentPage) {
      this.getData(pageNo);
    } else {
      this.navigateToPage(pageNo);
    }
  }

  /**
   * Function to navigate to page num
   */
  navigateToPage(pageNo) {
    this.router.navigate([], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        page: pageNo,
      },
      relativeTo: this.route,
      replaceUrl: true,
    });
  }

  /**
   * Function to get route params
   */
  subscribeRouteParams() {
    this.subscriptions = this.route.queryParams.subscribe((params: any) => {
      if (
        !+params.page ||
        _.isUndefined(params.page) ||
        _.isNull(params.page) ||
        _.isNaN(_.toNumber(params.page))
      ) {
        this.navigateToPage(1);
      } else {
        this.currentPage = _.toNumber(params.page) || 1;
        if (this.currentPage < 0) {
          this.navigateToPage(1);
          return;
        }
        this.getData(this.currentPage);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscriptions) this.subscriptions.unsubscribe();
  }
}
