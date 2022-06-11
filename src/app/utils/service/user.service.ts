/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { LocalStorageService } from "./localStorage.service";
import { environment } from "../../../environments/environment";
import { LoaderService } from "../component/loader/loader.service";

@Injectable()
export class UserService {
  private token: string;
  private TOKEN_KEY: string = environment.secretKeys.token;
  private USER_KEY: string = environment.secretKeys.user;

  constructor(
    private localStorageService: LocalStorageService,
    private loader: LoaderService
  ) {
    // Update user token first time application loads
    this.token = localStorageService.getItem(this.TOKEN_KEY);
  }

  /**
   * Function to update user token
   */
  set userToken(token: string) {
    this.localStorageService.setItem(this.TOKEN_KEY, token);
    this.token = token;
  }

  /**
   * Function to get user token
   */
  get userToken() {
    return this.token;
  }

  /**
   * Function to logout user
   */
  logout() {
    this.token = null;
    const currentLang = this.localStorageService.getItem("language");
    this.localStorageService.clearLocalStorage();
    this.localStorageService.setItem("language", currentLang);
    this.loader.showLoader();
    setTimeout(() => {
      this.loader.hideLoader();
    }, 1000);
  }

  /**
   * Function to save user obj
   */
  saveUserObj(userObj: Object) {
    this.localStorageService.setItem(this.USER_KEY, userObj);
  }

  /**
   * Function to get user obj
   */
  getUserObj() {
    return this.localStorageService.getItem("userData");
  }

  updateUserObj(newObj: Object) {
    let userObj = this.localStorageService.getItem(this.USER_KEY);
    this.localStorageService.setItem(this.USER_KEY, _.assign(userObj, newObj));
  }

  isCompleteLoggedIn() {
    return this.userToken ? true : false;
  }

  setChatUserUUID(UUID: string) {
    this.localStorageService.setItem("x-chat-uuid", UUID);
  }
  getChatUserUUID() {
    return this.localStorageService.getItem("x-chat-uuid");
  }
}
