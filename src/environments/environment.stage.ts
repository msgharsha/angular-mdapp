// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=stage` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
/**
 * 
 * Copyright 2009-2021 Blue Shark Solution Inc
 * @author bssinc
 */

export const environment = {
  production: true,
  baseUrl: "https://stg-api.cactusmd.com/api",
  portalURL: "https://stg-provider.cactusmd.com/",
  openTokApiKey: "47200924",
  countryCode: "+91",
  secretKeys: {
    token: "x-id",
    user: "",
    bookingDetail: "",
  },
  maxImageSize: 5000000,
  editorApiKey: "lv6yyopkjqid849762v4i3d3m61490aga30t1u04zndpsdz3",
  firebase: {
    apiKey: "AIzaSyAtSDq8uP9KBKNBuE8QUPMuE2TKY3CXS2c",
    authDomain: "famous-store-313418.firebaseapp.com",
    projectId: "famous-store-313418",
    storageBucket: "famous-store-313418.appspot.com",
    messagingSenderId: "792211351404",
    appId: "1:792211351404:web:b316c0970bac6891463549",
    measurementId: "G-KV0N94Z09M"
  },
  pubnubKeys: {
    publishKey: "pub-c-a52c422c-c5ff-4930-b081-8baa5d7f8277",
    subscribeKey: "sub-c-2a8b4992-5f4a-11eb-84d8-cecfdbf5cbf8",
  },
  googleMapKey: "AIzaSyDAgGaY1OLGVMrT-afESjcdGPeZfwOE8s4",
};
