"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _repoInfo = require("@kbn/repo-info");
var _command = _interopRequireDefault(require("../cli/command"));
var _list = require("./list");
var _install = require("./install");
var _remove = require("./remove");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const argv = process.argv.slice();
const program = new _command.default('bin/kibana-plugin');
program.version(_repoInfo.kibanaPackageJson.version).description('The Kibana plugin manager enables you to install and remove plugins that ' + 'provide additional functionality to Kibana');
(0, _list.listCommand)(program);
(0, _install.installCommand)(program);
(0, _remove.removeCommand)(program);
program.command('help <command>').description('get the help for a specific command').action(function (cmdName) {
  const cmd = program.commands.find(c => c._name === cmdName);
  if (!cmd) {
    return program.error(`unknown command ${cmdName}`);
  }
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
program.parse(argv);