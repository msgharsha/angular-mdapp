/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { HttpService } from "../utils/service/http.service";

@Injectable({
  providedIn: "root",
})
export class RepositoryService {
  constructor(private httpService: HttpService) { }

  getMyNotes() {
    return this.httpService.getRequest("practice/notes");
  }

  saveMyNotes(body) {
    return this.httpService.postRequest("practice/notes", body);
  }

  deleteNote(noteId) {
    return this.httpService.deleteRequest(`practice/notes/${noteId}`);
  }

  editMyNote(body) {
    return this.httpService.putRequest("practice/notes", body);
  }

  getLabDetails(doctorId: string | number) {
    return this.httpService.getRequest("practice/addressbook" + `/${doctorId}`);
  }

  saveMyAddress(body) {
    return this.httpService.postRequest("practice/addressbook", body);
  }

  editMyAddress(body,addressId) {
    return this.httpService.putRequest("practice/addressbook"+ `/${addressId}`, body);
  }

  deleteAddress(addressId) {
    return this.httpService.deleteRequest(`practice/addressbook/${addressId}`);
  }

  endMyTour(body) {
    return this.httpService.postRequest("v1/provider/global/practice/introtour", body);
  }

  trimEmptyCheck() {
    return (input: any) => {
      return _.trim(input.value)
        ? null
        : {
          required: {
            valid: false,
          },
        };
    };
  }
}
