"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadLocalFile = downloadLocalFile;
var _fs = require("fs");
var _progress = require("../progress");
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

function openSourceFile({
  sourcePath
}) {
  try {
    const fileInfo = (0, _fs.statSync)(sourcePath);
    const readStream = (0, _fs.createReadStream)(sourcePath);
    return {
      readStream,
      fileInfo
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('ENOTFOUND');
    }
    throw err;
  }
}
async function copyFile({
  readStream,
  writeStream,
  progress
}) {
  await new Promise((resolve, reject) => {
    // if either stream errors, fail quickly
    readStream.on('error', reject);
    writeStream.on('error', reject);

    // report progress as we transfer
    readStream.on('data', chunk => {
      progress.progress(chunk.length);
    });

    // write the download to the file system
    readStream.pipe(writeStream);

    // when the write is done, we are done
    writeStream.on('finish', resolve);
  });
}

/*
// Responsible for managing local file transfers
*/
async function downloadLocalFile(logger, sourcePath, targetPath) {
  try {
    const {
      readStream,
      fileInfo
    } = openSourceFile({
      sourcePath
    });
    const writeStream = (0, _fs.createWriteStream)(targetPath);
    try {
      const progress = new _progress.Progress(logger);
      progress.init(fileInfo.size);
      await copyFile({
        readStream,
        writeStream,
        progress
      });
      progress.complete();
    } catch (err) {
      readStream.close();
      writeStream.close();
      throw err;
    }
  } catch (err) {
    logger.error(err);
    throw err;
  }
}