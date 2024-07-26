"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadHttpFile = downloadHttpFile;
var _fs = require("fs");
var _wreck = _interopRequireDefault(require("@hapi/wreck"));
var _httpProxyAgent = _interopRequireDefault(require("http-proxy-agent"));
var _httpsProxyAgent = _interopRequireDefault(require("https-proxy-agent"));
var _proxyFromEnv = require("proxy-from-env");
var _progress = require("../progress");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function getProxyAgent(sourceUrl, logger) {
  const proxy = (0, _proxyFromEnv.getProxyForUrl)(sourceUrl);
  if (!proxy) {
    return null;
  }
  logger.log(`Picked up proxy ${proxy} from environment variable.`);
  if (/^https/.test(sourceUrl)) {
    return new _httpsProxyAgent.default(proxy);
  } else {
    return new _httpProxyAgent.default(proxy);
  }
}
async function sendRequest({
  sourceUrl,
  timeout
}, logger) {
  const maxRedirects = 11; //Because this one goes to 11.
  const reqOptions = {
    timeout,
    redirects: maxRedirects
  };
  const proxyAgent = getProxyAgent(sourceUrl, logger);
  if (proxyAgent) {
    reqOptions.agent = proxyAgent;
  }
  try {
    const promise = _wreck.default.request('GET', sourceUrl, reqOptions);
    const req = promise.req;
    const resp = await promise;
    if (resp.statusCode >= 400) {
      throw new Error('ENOTFOUND');
    }
    return {
      req,
      resp
    };
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      err = new Error('ENOTFOUND');
    }
    throw err;
  }
}
function downloadResponse({
  resp,
  targetPath,
  progress
}) {
  return new Promise((resolve, reject) => {
    const writeStream = (0, _fs.createWriteStream)(targetPath);

    // if either stream errors, fail quickly
    resp.on('error', reject);
    writeStream.on('error', reject);

    // report progress as we download
    resp.on('data', chunk => {
      progress.progress(chunk.length);
    });

    // write the download to the file system
    resp.pipe(writeStream);

    // when the write is done, we are done
    writeStream.on('finish', resolve);
  });
}

/*
Responsible for managing http transfers
*/
async function downloadHttpFile(logger, sourceUrl, targetPath, timeout) {
  try {
    const {
      req,
      resp
    } = await sendRequest({
      sourceUrl,
      timeout
    }, logger);
    try {
      const totalSize = parseFloat(resp.headers['content-length']) || 0;
      const progress = new _progress.Progress(logger);
      progress.init(totalSize);
      await downloadResponse({
        resp,
        targetPath,
        progress
      });
      progress.complete();
    } catch (err) {
      req.abort();
      throw err;
    }
  } catch (err) {
    if (err.message !== 'ENOTFOUND') {
      logger.error(err);
    }
    throw err;
  }
}