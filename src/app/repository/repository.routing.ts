/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MyNotesComponent } from "./my-notes/my-notes.component";
//import { MyAddressbookComponent } from "./my-addressbook/my-addressbook.component";
import { MyAddressBookListComponent } from "./my-addressbooklist/my-addressbooklist.component";
import { RepositoryComponent } from "./repository.component";

const routes: Routes = [
  {
    path: "repository",
    component: RepositoryComponent,
    pathMatch: "prefix",
    children: [
      { path: "", redirectTo: "notes", pathMatch: "full" },
      { path: "notes", component: MyNotesComponent },
      // { path: "addressbook", component: MyAddressbookComponent },
      { path: "addressbook", component: MyAddressBookListComponent },
      // { path: 'pharmacy', component: MyPharmacyComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositoryRoutingModule {}
