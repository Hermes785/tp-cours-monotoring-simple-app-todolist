"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EncryptionConfig = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _path = require("path");
var _lodash = require("lodash");
var _fs = require("fs");
var _jsYaml = require("js-yaml");
var _utils = require("@kbn/utils");
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); } /*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
var _config = /*#__PURE__*/new WeakMap();
var _encryptionKeyPaths = /*#__PURE__*/new WeakMap();
var _encryptionMeta = /*#__PURE__*/new WeakMap();
class EncryptionConfig {
  constructor() {
    _classPrivateFieldInitSpec(this, _config, (0, _jsYaml.safeLoad)((0, _fs.readFileSync)((0, _path.join)((0, _utils.getConfigDirectory)(), 'kibana.yml'))));
    _classPrivateFieldInitSpec(this, _encryptionKeyPaths, ['xpack.encryptedSavedObjects.encryptionKey', 'xpack.reporting.encryptionKey', 'xpack.security.encryptionKey']);
    _classPrivateFieldInitSpec(this, _encryptionMeta, {
      'xpack.encryptedSavedObjects.encryptionKey': {
        docs: 'https://www.elastic.co/guide/en/kibana/current/xpack-security-secure-saved-objects.html#xpack-security-secure-saved-objects',
        description: 'Used to encrypt stored objects such as dashboards and visualizations'
      },
      'xpack.reporting.encryptionKey': {
        docs: 'https://www.elastic.co/guide/en/kibana/current/reporting-settings-kb.html#general-reporting-settings',
        description: 'Used to encrypt saved reports'
      },
      'xpack.security.encryptionKey': {
        docs: 'https://www.elastic.co/guide/en/kibana/current/security-settings-kb.html#security-session-and-cookie-settings',
        description: 'Used to encrypt session information'
      }
    });
  }
  _getEncryptionKey(key) {
    return (0, _lodash.get)(_classPrivateFieldGet(_config, this), key);
  }
  _hasEncryptionKey(key) {
    return !!(0, _lodash.get)(_classPrivateFieldGet(_config, this), key);
  }
  _generateEncryptionKey() {
    return _crypto.default.randomBytes(16).toString('hex');
  }
  docs({
    comment
  } = {}) {
    const commentString = comment ? '#' : '';
    let docs = '';
    _classPrivateFieldGet(_encryptionKeyPaths, this).forEach(key => {
      docs += `${commentString}${key}
    ${commentString}${_classPrivateFieldGet(_encryptionMeta, this)[key].description}
    ${commentString}${_classPrivateFieldGet(_encryptionMeta, this)[key].docs}
\n`;
    });
    return docs;
  }
  generate({
    force = false
  }) {
    const output = {};
    _classPrivateFieldGet(_encryptionKeyPaths, this).forEach(key => {
      if (force || !this._hasEncryptionKey(key)) {
        output[key] = this._generateEncryptionKey();
      }
    });
    return output;
  }
}
exports.EncryptionConfig = EncryptionConfig;