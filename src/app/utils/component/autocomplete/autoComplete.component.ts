/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  forwardRef,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from "@angular/forms";
import { REGEX } from "../details/constants/regex";
import { TranslaterService } from "../../service/translater.service";

@Component({
  selector: "autocomplete",
  templateUrl: "./autoComplete.component.html",
  styleUrls: ["./autoComplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoCompleteComponent),
      multi: true,
    },
  ],
})
export class AutoCompleteComponent
  implements OnInit, AfterViewInit, ControlValueAccessor {
  public addressForm: FormGroup;

  public CITY_KEY = "locality";
  public COUNTRY_KEY = "country";
  public COUNTY_KEY = "administrative_area_level_2";
  public STATE_KEY = "administrative_area_level_1";
  public PINCODE_KEY = "postal_code";
  public STREET_ADDRESS_KEY = "street_address";
  onChange: any = () => {};
  onTouched = () => {};

  @Input("i") i: number;
  @Input("savedAddress") savedAddress: any;
  @Input("fieldsRequired") fieldsRequired: any;
  @Input("isEditable") isEditable: boolean = false;
  @Input("formSubmitted") formSubmitted: boolean;
  @Input("bold") bold: boolean;
  @Input("locationDescription") locationDescription: string;
  @Input("locationHeading") locationHeading: string;
  @Input("onProfilePage") onProfilePage: boolean = false;
  @Input("onAddressPage") onAddressPage: boolean = false;
  placeSelected: any;

  ngOnInit() {
    this.fieldsRequired = this.fieldsRequired == "true" ? true : false;
    this.createForm();
  }

  constructor(
    private formBuilder: FormBuilder,
    private cref: ChangeDetectorRef,
    private translaterService: TranslaterService
  ) {}

  writeValue(addressObj) {
    this.patchForm(addressObj);
  }

  addressChanged(event: any) {
    this.placeChanged({ name: event.target.value });
    this.updateChange();
  }

  patchForm(addressObj) {
    this.placeSelected = addressObj.addressDetail;
    this.addressForm.patchValue({
      addressLine1: addressObj.addressLine1 || null,
      addressLine2: addressObj.addressLine2 || null,
      city: addressObj.city || null,
      clinicFax: addressObj.clinicFax || null,
      clinicName: addressObj.clinicName || null,
      province: addressObj.province || null,
      postalCode: addressObj.postalCode || null,
      lat: +addressObj.lat || null,
      lng: +addressObj.lng || null,
      // "country": addressObj.addressDetail ? addressObj.addressDetail.country : null,
      // "county": addressObj.addressDetail ? addressObj.addressDetail.county : null,
      // "id": addressObj.id
    });
    this.updateAddress(addressObj.address || null);
  }

  registerOnChange(fn: object) {
    this.onChange = fn;
    if (this.savedAddress && this.addressForm.invalid && this.fieldsRequired) {
      this.onChange("");
      return;
    }
  }

  registerOnTouched(fn: object) {}

  createForm() {
    let formObj;
    if (this.fieldsRequired) {
      formObj = {
        addressLine1: [null, Validators.required],
        lat: [null, Validators.required],
        lng: [null, Validators.required],
        city: [null, Validators.required],
        postalCode: [
          null,
          [
            Validators.required,
            Validators.maxLength(7),
            Validators.minLength(6),
            Validators.pattern(REGEX.POSTAL_CODE),
          ],
        ],
        country: [null],
        clinicFax:[null],
        clinicName:[null],
        county: [null],
        province: [null, Validators.required],
        addressLine2: [null],
        id: [],
      };
    } else {
      formObj = {
        addressLine1: [null],
        lat: [null],
        lng: [null],
        city: [null],
        clinicFax:[null],
        clinicName:[null],
        postalCode: [null],
        country: [null],
        addressLine2: [null],
        county: [null],
        province: [null],
        id: [],
      };
    }

    this.addressForm = this.formBuilder.group(formObj);
    if(this.onProfilePage && !this.onAddressPage) {
      this.addressForm.get('clinicName').setValidators([Validators.required]);
      this.addressForm.get('clinicName').updateValueAndValidity();
    } else {
      this.addressForm.get('clinicName').clearValidators();
      this.addressForm.get('clinicName').updateValueAndValidity();
    }

  }

  ngAfterViewInit() {
    if (this.savedAddress)
      this.updateAddress(
        this.savedAddress.address ? this.savedAddress.address : null
      );
    this.addGooglePlace();
  }

  /**
   * Function to update location on view
   */
  updateAddress(addressObj) {
    let address = addressObj;
    if (!address) {
      address = this.addressForm.controls.addressLine1.value || null;
    }
    let inputAddress: any = document.getElementById("officeAddress" + this.i);
    if (inputAddress) inputAddress.value = address;
  }

  /**
   * Function to add google autocomplete
   */
  addGooglePlace() {
    const options = {
      componentRestrictions: { country: "ca" },
    };
    let input = document.getElementById("officeAddress" + this.i);
    let autocomplete = new google.maps.places.Autocomplete(input, options);
    this.addPlaceChangedListener(autocomplete);
  }

  /**
   * Function to add place change listener
   * @param autoComplete object
   */
  addPlaceChangedListener(autoComplete: any) {
    autoComplete.addListener("place_changed", () => {
      let place = autoComplete.getPlace();
      this.placeChanged(place);

      this.updateChange();
      this.cref.detectChanges();
    });
  }

  /**
   * Function to get required error
   */

  hasRequiredError(key) {
    return (
      this.fieldsRequired &&
      this.formSubmitted &&
      this.addressForm.hasError("required", key)
    );
  }
  hasError(errorType: string, key: string) {
    return this.formSubmitted && this.addressForm.hasError(errorType, [key]);
  }

  /**
   * Function to Update formControl Values
   */

  updateChange() {
    if (this.addressForm.invalid && this.fieldsRequired) {
      this.onChange("");
      return;
    }

    let updateObj = {
      addressLine1: this.addressForm.controls.addressLine1.value,
      postalCode: this.addressForm.get("postalCode").value,
      city: this.addressForm.get("city").value,
      province: this.addressForm.get("province").value,
      addressLine2: this.addressForm.get("addressLine2").value ? this.addressForm.get("addressLine2").value : "",
      clinicFax:this.addressForm.get("clinicFax").value,
      clinicName:this.addressForm.get("clinicName").value,
      lat: this.addressForm.controls.lat.value + "",
      lng: this.addressForm.controls.lng.value + "",
      // "id": this.addressForm.get("id").value
      // "country": this.addressForm.get("country").value,
      // "county": this.addressForm.get("county").value,
    };

    // if (this.addressForm.get("id").value) {
    //     updateObj['id'] = this.addressForm.get("id").value
    // }

    // if (!updateObj.addressLine2) {
    //   delete updateObj.addressLine2;
    // }

    this.onChange(updateObj);
  }

  /**
   * Function to set address fields (city, postalCode, etc)
   */
  setAddressFields(place: any) {
    let addressComponent = place.address_components;

    let updateObj = {
      city: null,
      country: null,
      county: null,
      province: null,
      postalCode: null,
    };

    addressComponent.forEach((address) => {
      switch (address.types[0]) {
        case this.CITY_KEY:
          updateObj.city = address.long_name;
          break;
        case this.COUNTY_KEY:
          updateObj.county = address.long_name;
          break;
        case this.STATE_KEY:
          updateObj.province = address.long_name;
          break;
        case this.COUNTRY_KEY:
          updateObj.country = address.long_name;
          break;
        case this.PINCODE_KEY:
          updateObj.postalCode = address.long_name;
          break;
        default:
          return;
      }
    });
    this.placeSelected = updateObj;
    this.addressForm.controls.city.setValue(updateObj.city);
    this.addressForm.controls.country.setValue(updateObj.country);
    this.addressForm.controls.postalCode.setValue(updateObj.postalCode);
    this.addressForm.controls.county.setValue(updateObj.county);
    this.addressForm.controls.province.setValue(updateObj.province);
  }

  /**
   * Function to set latitude and longtitude
   * @param lat number
   * @param long number
   */
  setLatLong(lat, long) {
    this.addressForm.controls.lat.setValue(lat);
    this.addressForm.controls.lng.setValue(long);
  }

  /**
   * Function to prefill address of user
   * @param place object
   */
  setAddress(place: any) {
    this.addressForm.get("addressLine1").setValue(place.name || null);
    this.updateAddress(place.name || null);
  }

  /**
   * Function to empty address, city, country, postalCode, lat, long
   * @param place Object
   */
  emptyOtherFields(place) {
    this.setLatLong(null, null);
    this.setAddress(place);
    this.setCity(null);
    this.setCountry(null);
    this.setPin(null);
    this.setCounty(null);
    this.setState(null);
  }

  setPin(postalCode) {
    this.addressForm.get("postalCode").setValue(postalCode);
  }

  setStreetAddress(addressLine2) {
    this.addressForm.get("addressLine2").setValue(addressLine2);
  }

  setCountry(country) {
    this.addressForm.get("country").setValue(country);
  }

  setCity(cityVal) {
    this.addressForm.get("city").setValue(cityVal);
  }

  setCounty(countyVal) {
    this.addressForm.get("county").setValue(countyVal);
  }

  setState(stateVal) {
    this.addressForm.get("province").setValue(stateVal);
  }

  placeChanged(place: any) {
    /**
     * If user doesnt selects any place
     */
    if (!place.geometry) {
      this.placeSelected = null;
      this.emptyOtherFields(place);
      return;
    }
    let geometry = place.geometry.location;
    this.setAddressFields(place);
    this.setLatLong(geometry.lat(), geometry.lng());
    this.setAddress(place);
  }
}
