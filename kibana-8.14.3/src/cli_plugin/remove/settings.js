"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
var _path = require("path");
var _repoInfo = require("@kbn/repo-info");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function parse(command, options) {
  const settings = {
    quiet: options.quiet || false,
    silent: options.silent || false,
    config: options.config || '',
    pluginDir: (0, _repoInfo.fromRoot)('plugins'),
    plugin: command
  };
  settings.pluginPath = (0, _path.resolve)(settings.pluginDir, settings.plugin);
  return settings;
}