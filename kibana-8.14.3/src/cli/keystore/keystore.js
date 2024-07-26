"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Keystore = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _fs = require("fs");
var _crypto = require("crypto");
var errors = _interopRequireWildcard(require("./errors"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const VERSION = 1;
const ALGORITHM = 'aes-256-gcm';
const ITERATIONS = 10000;
class Keystore {
  constructor(path, password = '') {
    this.path = path;
    this.password = password;
    this.reset();
    this.load();
  }
  static encrypt(text, password = '') {
    const iv = (0, _crypto.randomBytes)(12);
    const salt = (0, _crypto.randomBytes)(64);
    const key = (0, _crypto.pbkdf2Sync)(password, salt, ITERATIONS, 32, 'sha512');
    const cipher = (0, _crypto.createCipheriv)(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
  }
  static decrypt(data, password = '') {
    try {
      const bData = Buffer.from(data, 'base64');

      // convert data to buffers
      const salt = bData.slice(0, 64);
      const iv = bData.slice(64, 76);
      const tag = bData.slice(76, 92);
      const text = bData.slice(92);
      const key = (0, _crypto.pbkdf2Sync)(password, salt, ITERATIONS, 32, 'sha512');
      const decipher = (0, _crypto.createDecipheriv)(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      return decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
    } catch (e) {
      throw new errors.UnableToReadKeystore();
    }
  }
  save() {
    const text = JSON.stringify(this.data);

    // The encrypted text and the version are colon delimited to make
    // it easy to visually read the version as we could have easily
    // included it with the buffer

    const keystore = [VERSION, Keystore.encrypt(text, this.password)].join(':');
    (0, _fs.writeFileSync)(this.path, keystore);
  }
  load() {
    try {
      const keystore = (0, _fs.readFileSync)(this.path);
      const [, data] = keystore.toString().split(':');
      this.data = JSON.parse(Keystore.decrypt(data, this.password));
    } catch (e) {
      if (e.code === 'ENOENT') {
        return;
      }
      throw e;
    }
  }
  reset() {
    this.data = {};
  }
  exists() {
    return (0, _fs.existsSync)(this.path);
  }
  keys() {
    return Object.keys(this.data);
  }
  has(key) {
    return this.keys().indexOf(key) > -1;
  }
  add(key, value) {
    this.data[key] = value;
  }
  remove(key) {
    delete this.data[key];
  }
}
exports.Keystore = Keystore;
(0, _defineProperty2.default)(Keystore, "errors", errors);