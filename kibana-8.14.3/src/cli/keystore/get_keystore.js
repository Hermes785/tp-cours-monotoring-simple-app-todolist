"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getKeystore = getKeystore;
var _fs = require("fs");
var _path = require("path");
var _logger = require("../logger");
var _utils = require("@kbn/utils");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function getKeystore() {
  const configKeystore = (0, _path.join)((0, _utils.getConfigDirectory)(), 'kibana.keystore');
  const dataKeystore = (0, _path.join)((0, _utils.getDataPath)(), 'kibana.keystore');
  let keystorePath = null;
  if ((0, _fs.existsSync)(dataKeystore)) {
    const logger = new _logger.Logger();
    logger.log(`kibana.keystore located in the data folder is deprecated.  Future versions will use the config folder.`);
    keystorePath = dataKeystore;
  } else {
    keystorePath = configKeystore;
  }
  return keystorePath;
}