"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _fs = require("fs");
var _getopts = _interopRequireDefault(require("getopts"));
var _path2 = require("path");
var _nodeInspector = require("node:inspector");
var _nodeWorker_threads = require("node:worker_threads");
var _util = require("util");
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); } /*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
var _counter = /*#__PURE__*/new WeakMap();
var _path = /*#__PURE__*/new WeakMap();
var _session = /*#__PURE__*/new WeakMap();
var _Profiler_brand = /*#__PURE__*/new WeakSet();
class Profiler {
  constructor() {
    _classPrivateMethodInitSpec(this, _Profiler_brand);
    _classPrivateFieldInitSpec(this, _counter, 0);
    _classPrivateFieldInitSpec(this, _path, void 0);
    _classPrivateFieldInitSpec(this, _session, void 0);
    const execOpts = (0, _getopts.default)(process.execArgv);
    const envOpts = (0, _getopts.default)(process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.split(/\s+/) : []);
    _classPrivateFieldSet(_path, this, execOpts['diagnostic-dir'] || envOpts['diagnostic-dir'] || process.cwd());
  }
  isRunning() {
    return _classPrivateFieldGet(_session, this) !== undefined;
  }
  toggle() {
    return this.isRunning() ? _assertClassBrand(_Profiler_brand, this, _stop).call(this) : _assertClassBrand(_Profiler_brand, this, _start).call(this);
  }
}
function _getPath() {
  var _this$counter;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const date = `${year}${month}${day}`;
  const time = `${hours}${minutes}${seconds}`;
  const pid = process.pid;
  const thread = _nodeWorker_threads.threadId;
  const serial = _classPrivateFieldSet(_counter, this, (_this$counter = _classPrivateFieldGet(_counter, this), ++_this$counter)).toString().padStart(3, '0');
  return (0, _path2.join)(_classPrivateFieldGet(_path, this), `CPU.${date}.${time}.${pid}.${thread}.${serial}.cpuprofile`);
}
async function _start() {
  _classPrivateFieldSet(_session, this, new _nodeInspector.Session());
  _classPrivateFieldGet(_session, this).connect();
  _classPrivateFieldGet(_session, this).post = _classPrivateFieldGet(_session, this).post.bind(_classPrivateFieldGet(_session, this));
  await (0, _util.promisify)(_classPrivateFieldGet(_session, this).post)('Profiler.enable');
  await (0, _util.promisify)(_classPrivateFieldGet(_session, this).post)('Profiler.start');
}
async function _stop() {
  try {
    const {
      profile
    } = await (0, _util.promisify)(_classPrivateFieldGet(_session, this).post)('Profiler.stop');
    const path = _assertClassBrand(_Profiler_brand, this, _getPath).call(this);
    await (0, _util.promisify)(_fs.writeFile)(path, JSON.stringify(profile));
  } finally {
    _classPrivateFieldGet(_session, this).disconnect();
    _classPrivateFieldSet(_session, this, undefined);
  }
}
function _default(program) {
  program.option('--profiler.signal <signal>', 'Start/stop CPU profiling on <signal>').on('option:profiler.signal', function (signal) {
    if (!signal) {
      return;
    }
    const profiler = new Profiler();
    process.removeAllListeners(signal);
    process.on(signal, profiler.toggle.bind(profiler));
  });
}
module.exports = exports.default;