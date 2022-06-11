/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import { Injectable } from "@angular/core";

@Injectable()
export class DynamicOtpService {
  public popupOpen: boolean = false;
  public IsPhoneNumberVerified: boolean;
  constructor() {}
}
