"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanArtifacts = cleanArtifacts;
exports.cleanPrevious = cleanPrevious;
var _del = _interopRequireDefault(require("del"));
var _fs = _interopRequireDefault(require("fs"));
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function cleanPrevious(settings, logger) {
  return new Promise(function (resolve, reject) {
    try {
      _fs.default.statSync(settings.workingPath);
      logger.log('Found previous install attempt. Deleting...');
      try {
        _del.default.sync(settings.workingPath, {
          force: true
        });
      } catch (e) {
        reject(e);
      }
      resolve();
    } catch (e) {
      if (e.code !== 'ENOENT') reject(e);
      resolve();
    }
  });
}
function cleanArtifacts(settings) {
  // delete the working directory.
  // At this point we're bailing, so swallow any errors on delete.
  try {
    _del.default.sync(settings.workingPath);
  } catch (e) {} // eslint-disable-line no-empty
}