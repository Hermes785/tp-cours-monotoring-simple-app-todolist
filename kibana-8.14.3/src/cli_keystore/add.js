"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.addCli = addCli;
var _logger = require("../cli/logger");
var _utils = require("./utils");
var _streams = require("@kbn/utils/src/streams");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// import from path since add.test.js mocks 'fs' required for @kbn/utils

/**
 * @param {Keystore} keystore
 * @param {String} key
 * @param {Object|null} options
 * @property {Boolean} options.force - if true, will overwrite without prompting
 * @property {Stream} options.stdinStream - defaults to process.stdin
 * @property {Boolean} options.stdin - if true, uses options.stdin to read value
 */

async function add(keystore, key, options = {}) {
  var _parsedJsonValue;
  const logger = new _logger.Logger(options);
  let value;
  if (!keystore.exists()) {
    return logger.error("ERROR: Kibana keystore not found. Use 'create' command to create one.");
  }
  if (!options.force && keystore.has(key)) {
    if (options.stdin) {
      return logger.log(`Setting ${key} already exists, exiting without modifying keystore.`);
    } else {
      const overwrite = await (0, _utils.confirm)(`Setting ${key} already exists. Overwrite?`);
      if (!overwrite) {
        return logger.log('Exiting without modifying keystore.');
      }
    }
  }
  if (options.stdin) {
    value = await (0, _streams.createPromiseFromStreams)([options.stdinStream || process.stdin, (0, _streams.createConcatStream)('')]);
  } else {
    value = await (0, _utils.question)(`Enter value for ${key}`, {
      mask: '*'
    });
  }
  const parsedValue = value.trim();
  let parsedJsonValue;
  try {
    parsedJsonValue = JSON.parse(parsedValue);
  } catch {
    // noop, only treat value as json if it parses as JSON
  }
  keystore.add(key, (_parsedJsonValue = parsedJsonValue) !== null && _parsedJsonValue !== void 0 ? _parsedJsonValue : parsedValue);
  keystore.save();
}
function addCli(program, keystore) {
  program.command('add <key>').description('Add a setting to the keystore. Note: The value will be JSON parsed. Use quotes to force string inputs.').option('-f, --force', 'overwrite existing setting without prompting').option('-x, --stdin', 'read setting value from stdin').option('-s, --silent', 'prevent all logging').action(add.bind(null, keystore));
}