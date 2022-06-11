/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

/**
 * Function to get address from lat long
 */
export function reverseGeoCode(coord, callback) {
  if (google) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: coord }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback(null, results);
      } else {
        callback(
          { status, error: new Error(geocode_message.not_defined) },
          null
        );
      }
    });
  } else {
    callback({ error: new Error(geocode_message.not_defined) });
  }
}

const geocode_message = {
  not_defined: "google is not defined",
  geocode_error: "error in geocode API",
};
