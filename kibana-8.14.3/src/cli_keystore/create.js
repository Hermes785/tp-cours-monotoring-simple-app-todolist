"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.createCli = createCli;
var _logger = require("../cli/logger");
var _utils = require("./utils");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

async function create(keystore, options) {
  const logger = new _logger.Logger(options);
  if (keystore.exists()) {
    const overwrite = await (0, _utils.confirm)('A Kibana keystore already exists. Overwrite?');
    if (!overwrite) {
      return logger.log('Exiting without modifying keystore.');
    }
  }
  keystore.reset();
  keystore.save();
  logger.log(`Created Kibana keystore in ${keystore.path}`);
}
function createCli(program, keystore) {
  program.command('create').description('Creates a new Kibana keystore').option('-s, --silent', 'prevent all logging').action(create.bind(null, keystore));
}