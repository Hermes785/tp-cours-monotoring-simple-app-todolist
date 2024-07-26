"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertVersion = assertVersion;
exports.existingInstall = existingInstall;
var _path = _interopRequireDefault(require("path"));
var _fs = require("fs");
var _version = require("./utils/version");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function existingInstall(settings, logger) {
  try {
    (0, _fs.statSync)(_path.default.join(settings.pluginDir, settings.plugins[0].id));
    logger.error(`Plugin ${settings.plugins[0].id} already exists, please remove before installing a new version`);
    process.exit(70);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}
function assertVersion(settings) {
  if (!settings.plugins[0].kibanaVersion) {
    throw new Error(`Plugin kibana.json is missing both a version property (required) and a kibanaVersion property (optional).`);
  }
  const actual = (0, _version.cleanVersion)(settings.plugins[0].kibanaVersion);
  const expected = (0, _version.cleanVersion)(settings.version);
  if (!(0, _version.versionSatisfies)(actual, expected)) {
    throw new Error(`Plugin ${settings.plugins[0].id} [${actual}] is incompatible with Kibana [${expected}]`);
  }
}