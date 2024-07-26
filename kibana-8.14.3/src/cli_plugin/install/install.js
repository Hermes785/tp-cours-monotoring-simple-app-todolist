"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
var _fs = _interopRequireDefault(require("fs"));
var _util = require("util");
var _path = _interopRequireDefault(require("path"));
var _del = _interopRequireDefault(require("del"));
var _download = require("./download");
var _cleanup = require("./cleanup");
var _pack = require("./pack");
var _rename = require("./rename");
var _error_if_x_pack = require("../lib/error_if_x_pack");
var _kibana = require("./kibana");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const mkdir = (0, _util.promisify)(_fs.default.mkdir);
async function install(settings, logger) {
  try {
    (0, _error_if_x_pack.errorIfXPackInstall)(settings, logger);
    await (0, _cleanup.cleanPrevious)(settings, logger);
    await mkdir(settings.workingPath, {
      recursive: true
    });
    await (0, _download.download)(settings, logger);
    await (0, _pack.getPackData)(settings, logger);
    await (0, _pack.extract)(settings, logger);
    _del.default.sync(settings.tempArchiveFile, {
      force: true
    });
    (0, _kibana.existingInstall)(settings, logger);
    (0, _kibana.assertVersion)(settings);
    const targetDir = _path.default.join(settings.pluginDir, settings.plugins[0].id);
    await (0, _rename.renamePlugin)(settings.workingPath, targetDir);
    logger.log('Plugin installation complete');
  } catch (err) {
    logger.error(`Plugin installation was unsuccessful due to error "${err.message}"`);
    (0, _cleanup.cleanArtifacts)(settings);
    process.exit(70);
  }
}