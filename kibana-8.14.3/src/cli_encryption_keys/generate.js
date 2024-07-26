"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports.generateCli = generateCli;
var _jsYaml = require("js-yaml");
var _lodash = require("lodash");
var _interactive = require("./interactive");
var _logger = require("../cli/logger");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

async function generate(encryptionConfig, command) {
  const logger = new _logger.Logger();
  const keys = encryptionConfig.generate({
    force: command.force
  });
  if ((0, _lodash.isEmpty)(keys)) {
    logger.log('No keys to write.  Use the --force flag to generate new keys.');
  } else {
    if (!command.quiet) {
      logger.log('## Kibana Encryption Key Generation Utility\n');
      logger.log(`The 'generate' command guides you through the process of setting encryption keys for:\n`);
      logger.log(encryptionConfig.docs());
      logger.log('Already defined settings are ignored and can be regenerated using the --force flag.  Check the documentation links for instructions on how to rotate encryption keys.');
      logger.log('Definitions should be set in the kibana.yml used configure Kibana.\n');
    }
    if (command.interactive) {
      await (0, _interactive.interactive)(keys, encryptionConfig.docs({
        comment: true
      }), logger);
    } else {
      if (!command.quiet) logger.log('Settings:');
      logger.log((0, _jsYaml.safeDump)(keys));
    }
  }
}
function generateCli(program, encryptionConfig) {
  program.command('generate').description('Generates encryption keys').option('-i, --interactive', 'interactive output').option('-q, --quiet', 'do not include instructions').option('-f, --force', 'generate new keys for all settings').action(generate.bind(null, encryptionConfig));
}