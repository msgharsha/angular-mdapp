/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RepositoryComponent } from "./repository.component";
import { RepositoryRoutingModule } from "./repository.routing";
import { UtilsModule } from "../utils/utils.module";
import { MyNotesComponent } from "./my-notes/my-notes.component";
import { MyAddressbookComponent } from "./my-addressbook/my-addressbook.component";
import { MyAddressBookListComponent } from "./my-addressbooklist/my-addressbooklist.component";
import { MyPharmacyComponent } from "./my-pharmacy/my-pharmacy.component";
import { AddEditNotesComponent } from "./add-edit-notes/add-edit-notes.component";
import { NgxMaskModule } from "ngx-mask";

@NgModule({
  declarations: [
    RepositoryComponent,
    MyNotesComponent,
    MyAddressbookComponent,
    MyAddressBookListComponent,
    MyPharmacyComponent,
    AddEditNotesComponent,
  ],
  imports: [CommonModule, RepositoryRoutingModule, NgxMaskModule.forRoot(), UtilsModule],
  entryComponents: [AddEditNotesComponent],
})
export class RepositoryModule {}
