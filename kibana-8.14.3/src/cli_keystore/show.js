"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.show = show;
exports.showCli = showCli;
var _fs = require("fs");
var _logger = require("../cli/logger");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function show(keystore, key, options = {}) {
  const {
    silent,
    output
  } = options;
  const logger = new _logger.Logger({
    silent
  });
  if (!keystore.exists()) {
    logger.error("ERROR: Kibana keystore not found. Use 'create' command to create one.");
    return -1;
  }
  if (!keystore.has(key)) {
    logger.error("ERROR: Kibana keystore doesn't have requested key.");
    return -1;
  }
  const value = keystore.data[key];
  const valueAsString = typeof value === 'string' ? value : JSON.stringify(value);
  if (output) {
    if ((0, _fs.existsSync)(output)) {
      logger.error('ERROR: Output file already exists. Remove it before retrying.');
      return -1;
    } else {
      (0, _fs.writeFileSync)(output, valueAsString);
      logger.log('Writing output to file: ' + output);
    }
  } else {
    logger.log(valueAsString);
  }
  return 0;
}
function showCli(program, keystore) {
  program.command('show <key>').description('Displays the value of a single setting in the keystore. Pass the -o (or --output) parameter to write the setting to a file.').option('-s, --silent', 'prevent all logging').option('-o, --output <file>', 'output value to a file').action((key, options) => {
    process.exitCode = show(keystore, key, options) || 0;
  });
}