"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _utils = require("@kbn/utils");
var _repoInfo = require("@kbn/repo-info");
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _chalk = _interopRequireDefault(require("chalk"));
var _command = _interopRequireDefault(require("../cli/command"));
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const program = new _command.default('bin/kibana-verification-code');
program.version(_repoInfo.kibanaPackageJson.version).description('Tool to get Kibana verification code').action(() => {
  const fpath = _path.default.join((0, _utils.getDataPath)(), 'verification_code');
  try {
    const code = _fs.default.readFileSync(fpath).toString();
    console.log(`Your verification code is: ${_chalk.default.black.bgCyanBright(` ${code.substr(0, 3)} ${code.substr(3)} `)}`);
  } catch (error) {
    console.log(`Couldn't find verification code.

If Kibana hasn't been configured yet, restart Kibana to generate a new code.

Otherwise, you can safely ignore this message and start using Kibana.`);
  }
});
program.parse(process.argv);