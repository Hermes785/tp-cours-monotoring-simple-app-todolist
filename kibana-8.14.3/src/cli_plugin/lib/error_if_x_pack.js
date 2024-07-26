"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorIfXPackInstall = errorIfXPackInstall;
exports.errorIfXPackRemove = errorIfXPackRemove;
var _is_oss = require("./is_oss");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function isXPack(plugin) {
  return /x-pack/.test(plugin);
}
function errorIfXPackInstall(settings) {
  if (isXPack(settings.plugin)) {
    if ((0, _is_oss.isOss)()) {
      throw new Error('You are using the OSS-only distribution of Kibana.  ' + 'As of version 6.3+ X-Pack is bundled in the standard distribution of this software by default; ' + 'consequently it is no longer available as a plugin. Please use the standard distribution of Kibana to use X-Pack features.');
    } else {
      throw new Error('Kibana now contains X-Pack by default, there is no longer any need to install it as it is already present.');
    }
  }
}
function errorIfXPackRemove(settings) {
  if (isXPack(settings.plugin) && !(0, _is_oss.isOss)()) {
    throw new Error('You are using the standard distribution of Kibana.  Please install the OSS-only distribution to remove X-Pack features.');
  }
}