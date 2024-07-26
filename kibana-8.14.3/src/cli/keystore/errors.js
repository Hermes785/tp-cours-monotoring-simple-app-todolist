"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnableToReadKeystore = void 0;
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

class KeystoreError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
class UnableToReadKeystore extends KeystoreError {
  constructor(message) {
    super(message || 'unable to read keystore');
  }
}
exports.UnableToReadKeystore = UnableToReadKeystore;