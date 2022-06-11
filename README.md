# Cactus Provider

This repository serve as an doctor portal in CactusMD. In this service we manage all stuff related to doctors. Separate module is created for each activity.

## Get started

### Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
npm start
```

These are the most useful commands defined in `package.json`:

* `npm start` - runs the TypeScript compiler, asset copier, and a server at the same time, all three in "watch mode".
* `npm run build:dev` - runs the TypeScript compiler and asset copier once for dev environment.
* `npm run build:qa` - runs the TypeScript compiler and asset copier once for qa environment.
* `npm run build:stage` - runs the TypeScript compiler and asset copier once for stage environment.
* `npm run build:prod` - runs the TypeScript compiler and asset copier once for production environment.
* `npm run lint` - runs `tslint` on the project files.