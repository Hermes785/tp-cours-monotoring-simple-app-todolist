"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._checkFilePathDeprecation = _checkFilePathDeprecation;
exports._downloadSingle = _downloadSingle;
exports._getFilePath = _getFilePath;
exports.download = download;
var _url = require("url");
var _errors = require("../lib/errors");
var _http = require("./downloaders/http");
var _file = require("./downloaders/file");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function _isWindows() {
  return /^win/.test(process.platform);
}
function _getFilePath(filePath) {
  const decodedPath = decodeURI(filePath);
  const prefixedDrive = /^\/[a-zA-Z]:/.test(decodedPath);
  if (_isWindows() && prefixedDrive) {
    return decodedPath.slice(1);
  }
  return decodedPath;
}
function _checkFilePathDeprecation(sourceUrl, logger) {
  const twoSlashes = /^file:\/\/(?!\/)/.test(sourceUrl);
  if (_isWindows() && twoSlashes) {
    logger.log('Install paths with file:// are deprecated, use file:/// instead');
  }
}
function _downloadSingle(settings, logger, sourceUrl) {
  const urlInfo = (0, _url.parse)(sourceUrl);
  let downloadPromise;
  if (/^file/.test(urlInfo.protocol)) {
    _checkFilePathDeprecation(sourceUrl, logger);
    downloadPromise = (0, _file.downloadLocalFile)(logger, _getFilePath(urlInfo.path), settings.tempArchiveFile);
  } else if (/^https?/.test(urlInfo.protocol)) {
    downloadPromise = (0, _http.downloadHttpFile)(logger, sourceUrl, settings.tempArchiveFile, settings.timeout);
  } else {
    downloadPromise = Promise.reject(new _errors.UnsupportedProtocolError());
  }
  return downloadPromise;
}

//Attempts to download each url in turn until one is successful
function download(settings, logger) {
  const urls = settings.urls.slice(0);
  function tryNext() {
    const sourceUrl = urls.shift();
    if (!sourceUrl) {
      throw new Error('No valid url specified.');
    }
    logger.log(`Attempting to transfer from ${sourceUrl}`);
    return _downloadSingle(settings, logger, sourceUrl).catch(err => {
      const isUnsupportedProtocol = err instanceof _errors.UnsupportedProtocolError;
      const isDownloadResourceNotFound = err.message === 'ENOTFOUND';
      if (isUnsupportedProtocol || isDownloadResourceNotFound) {
        return tryNext();
      }
      throw err;
    });
  }
  return tryNext();
}