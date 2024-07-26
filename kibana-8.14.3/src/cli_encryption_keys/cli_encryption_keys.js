"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _repoInfo = require("@kbn/repo-info");
var _command = _interopRequireDefault(require("../cli/command"));
var _encryption_config = require("./encryption_config");
var _generate = require("./generate");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const argv = process.argv.slice();
const program = new _command.default('bin/kibana-encryption-keys');
program.version(_repoInfo.kibanaPackageJson.version).description('A tool for managing encryption keys');
const encryptionConfig = new _encryption_config.EncryptionConfig();
(0, _generate.generateCli)(program, encryptionConfig);
program.command('help <command>').description('Get the help for a specific command').action(function (cmdName) {
  const cmd = Object.values(program.commands).find(command => command._name === cmdName);
  if (!cmd) return program.error(`unknown command ${cmdName}`);
  cmd.help();
});
program.command('*', null, {
  noHelp: true
}).action(function (cmd) {
  program.error(`unknown command ${cmd}`);
});

// check for no command name
const subCommand = argv[2] && !String(argv[2][0]).match(/^-|^\.|\//);
if (!subCommand) {
  program.defaultHelp();
}
program.parse(process.argv);