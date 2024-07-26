"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
exports.parseMilliseconds = parseMilliseconds;
var _path = require("path");
var _expiryJs = _interopRequireDefault(require("expiry-js"));
var _repoInfo = require("@kbn/repo-info");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function generateUrls({
  version,
  plugin
}) {
  return [plugin, `https://artifacts.elastic.co/downloads/kibana-plugins/${plugin}/${plugin}-${version}.zip`];
}
function parseMilliseconds(val) {
  let result;
  try {
    const timeVal = (0, _expiryJs.default)(val);
    result = timeVal.asMilliseconds();
  } catch (ex) {
    result = 0;
  }
  return result;
}
function parse(command, options, kbnPackage) {
  const settings = {
    timeout: options.timeout || 0,
    quiet: options.quiet || false,
    silent: options.silent || false,
    config: options.config || '',
    plugin: command,
    version: kbnPackage.version,
    pluginDir: (0, _repoInfo.fromRoot)('plugins')
  };
  settings.urls = generateUrls(settings);
  settings.workingPath = (0, _path.resolve)(settings.pluginDir, '.plugin.installing');
  settings.tempArchiveFile = (0, _path.resolve)(settings.workingPath, 'archive.part');
  return settings;
}