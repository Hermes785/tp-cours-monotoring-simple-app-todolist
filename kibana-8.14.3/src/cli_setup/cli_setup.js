"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _repoInfo = require("@kbn/repo-info");
var _chalk = _interopRequireDefault(require("chalk"));
var _ora = _interopRequireDefault(require("ora"));
var _commander = require("commander");
var _utils = require("@kbn/utils");
var _elasticsearch_service = require("@kbn/interactive-setup-plugin/server/elasticsearch_service");
var _errors = require("@kbn/interactive-setup-plugin/server/errors");
var _utils2 = require("./utils");
var _logger = require("../cli/logger");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const program = new _commander.Command('bin/kibana-setup');
program.version(_repoInfo.kibanaPackageJson.version).description('This command walks you through all required steps to securely connect Kibana with Elasticsearch').option('-t, --enrollment-token <token>', 'Elasticsearch enrollment token').option('-s, --silent', 'Prevent all logging');
program.parse(process.argv);
const options = program.opts();
const spinner = (0, _ora.default)();
const logger = new _logger.Logger(options);
async function initCommand() {
  var _options$enrollmentTo;
  const token = (0, _utils2.decodeEnrollmentToken)((_options$enrollmentTo = options.enrollmentToken) !== null && _options$enrollmentTo !== void 0 ? _options$enrollmentTo : options.silent ? undefined : await (0, _utils2.promptToken)());
  if (!token) {
    logger.error(_chalk.default.red('Invalid enrollment token provided.'));
    logger.error('');
    logger.error('To generate a new enrollment token run:');
    logger.error(`  ${(0, _utils2.getCommand)('elasticsearch-create-enrollment-token', '-s kibana')}`);
    process.exit(1);
  }
  if (!(await _utils2.kibanaConfigWriter.isConfigWritable())) {
    logger.error(_chalk.default.red('Kibana does not have enough permissions to write to the config file.'));
    logger.error('');
    logger.error('To grant write access run:');
    logger.error(`  chmod +w ${(0, _utils.getConfigPath)()}`);
    process.exit(1);
  }
  logger.log('');
  if (!options.silent) {
    spinner.start(_chalk.default.dim('Configuring Kibana...'));
  }
  let configToWrite;
  try {
    configToWrite = await _utils2.elasticsearch.enroll({
      hosts: token.adr,
      apiKey: token.key,
      caFingerprint: _elasticsearch_service.ElasticsearchService.formatFingerprint(token.fgr)
    });
  } catch (error) {
    if (!options.silent) {
      spinner.fail(`${_chalk.default.bold('Unable to connect to Elasticsearch with the provided enrollment token:')} ${_chalk.default.red(`${(0, _errors.getDetailedErrorMessage)(error)}`)}`);
    }
    logger.error('');
    logger.error('To generate a new enrollment token run:');
    logger.error(`  ${(0, _utils2.getCommand)('elasticsearch-create-enrollment-token', '-s kibana')}`);
    process.exit(1);
  }
  try {
    await _utils2.kibanaConfigWriter.writeConfig(configToWrite);
  } catch (error) {
    if (!options.silent) {
      spinner.fail(`${_chalk.default.bold('Unable to configure Kibana:')} ${_chalk.default.red(`${(0, _errors.getDetailedErrorMessage)(error)}`)}`);
    }
    logger.error(_chalk.default.red(`${(0, _errors.getDetailedErrorMessage)(error)}`));
    process.exit(1);
  }
  if (!options.silent) {
    spinner.succeed(_chalk.default.bold('Kibana configured successfully.'));
  }
  logger.log('');
  logger.log('To start Kibana run:');
  logger.log(`  ${(0, _utils2.getCommand)('kibana')}`);
}
initCommand();