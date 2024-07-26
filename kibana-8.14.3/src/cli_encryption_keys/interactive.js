"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interactive = interactive;
var _fs = require("fs");
var _path = require("path");
var _utils = require("../cli_keystore/utils");
var _utils2 = require("@kbn/utils");
var _jsYaml = require("js-yaml");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

async function interactive(keys, docs, logger) {
  const settings = Object.keys(keys);
  logger.log('This tool will ask you a number of questions in order to generate the right set of keys for your needs.\n');
  const setKeys = {};
  for (const setting of settings) {
    const include = await (0, _utils.confirm)(`Set ${setting}?`);
    if (include) setKeys[setting] = keys[setting];
  }
  const count = Object.keys(setKeys).length;
  const plural = count > 1 ? 's were' : ' was';
  logger.log('');
  if (!count) return logger.log('No keys were generated');
  logger.log(`The following key${plural} generated:`);
  logger.log(Object.keys(setKeys).join('\n'));
  logger.log('');
  const write = await (0, _utils.confirm)('Save generated keys to a sample Kibana configuration file?');
  if (write) {
    const defaultSaveLocation = (0, _path.join)((0, _utils2.getConfigDirectory)(), 'kibana.sample.yml');
    const promptedSaveLocation = await (0, _utils.question)(`What filename should be used for the sample Kibana config file? [${defaultSaveLocation}])`);
    const saveLocation = promptedSaveLocation || defaultSaveLocation;
    (0, _fs.writeFileSync)(saveLocation, docs + (0, _jsYaml.safeDump)(setKeys));
    logger.log(`Wrote configuration to ${saveLocation}`);
  } else {
    logger.log('\nSettings:');
    logger.log((0, _jsYaml.safeDump)(setKeys));
  }
}