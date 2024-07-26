"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOss = isOss;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function isOss() {
  return !_fs.default.existsSync(_path.default.resolve(__dirname, '../../../x-pack'));
}