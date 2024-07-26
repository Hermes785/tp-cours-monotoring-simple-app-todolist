"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.remove = remove;
var _fs = require("fs");
var _del = _interopRequireDefault(require("del"));
var _error_if_x_pack = require("../lib/error_if_x_pack");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function remove(settings, logger) {
  try {
    let stat;
    try {
      stat = (0, _fs.statSync)(settings.pluginPath);
    } catch (e) {
      (0, _error_if_x_pack.errorIfXPackRemove)(settings, logger);
      throw new Error(`Plugin [${settings.plugin}] is not installed`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`[${settings.plugin}] is not a plugin`);
    }
    logger.log(`Removing ${settings.plugin}...`);
    _del.default.sync(settings.pluginPath, {
      force: true
    });
    logger.log('Plugin removal complete');
  } catch (err) {
    logger.error(`Unable to remove plugin because of error: "${err.message}"`);
    process.exit(74); // eslint-disable-line no-process-exit
  }
}