"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installCommand = installCommand;
var _utils = require("@kbn/utils");
var _repoInfo = require("@kbn/repo-info");
var _install = require("./install");
var _logger = require("../../cli/logger");
var _settings = require("./settings");
var _log_warnings = require("../lib/log_warnings");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function processCommand(command, options) {
  let settings;
  try {
    settings = (0, _settings.parse)(command, options, _repoInfo.kibanaPackageJson);
  } catch (ex) {
    //The logger has not yet been initialized.
    console.error(ex.message);
    process.exit(64);
  }
  const logger = new _logger.Logger(settings);
  (0, _log_warnings.logWarnings)(logger);
  (0, _install.install)(settings, logger);
}
function installCommand(program) {
  program.command('install <plugin/url>').option('-q, --quiet', 'disable all process messaging except errors').option('-s, --silent', 'disable all process messaging').option('-c, --config <path>', 'path to the config file', (0, _utils.getConfigPath)()).option('-t, --timeout <duration>', 'length of time before failing; 0 for never fail', _settings.parseMilliseconds).description('install a plugin', `Common examples:
  install file:///Path/to/my/x-pack.zip
  install https://path.to/my/x-pack.zip`).action(processCommand);
}