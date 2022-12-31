var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _request, _requestValues, _outgoing, _ensureParsed, ensureParsed_fn, _ensureOutgoingMap, ensureOutgoingMap_fn, _parse, parse_fn;
import { parse, serialize } from "cookie";
const DELETED_EXPIRATION = new Date(0);
const DELETED_VALUE = "deleted";
class AstroCookie {
  constructor(value) {
    this.value = value;
  }
  json() {
    if (this.value === void 0) {
      throw new Error(`Cannot convert undefined to an object.`);
    }
    return JSON.parse(this.value);
  }
  number() {
    return Number(this.value);
  }
  boolean() {
    if (this.value === "false")
      return false;
    if (this.value === "0")
      return false;
    return Boolean(this.value);
  }
}
class AstroCookies {
  constructor(request) {
    __privateAdd(this, _ensureParsed);
    __privateAdd(this, _ensureOutgoingMap);
    __privateAdd(this, _parse);
    __privateAdd(this, _request, void 0);
    __privateAdd(this, _requestValues, void 0);
    __privateAdd(this, _outgoing, void 0);
    __privateSet(this, _request, request);
    __privateSet(this, _requestValues, null);
    __privateSet(this, _outgoing, null);
  }
  delete(key, options) {
    const serializeOptions = {
      expires: DELETED_EXPIRATION
    };
    if (options == null ? void 0 : options.domain) {
      serializeOptions.domain = options.domain;
    }
    if (options == null ? void 0 : options.path) {
      serializeOptions.path = options.path;
    }
    __privateMethod(this, _ensureOutgoingMap, ensureOutgoingMap_fn).call(this).set(key, [
      DELETED_VALUE,
      serialize(key, DELETED_VALUE, serializeOptions),
      false
    ]);
  }
  get(key) {
    if (__privateGet(this, _outgoing) !== null && __privateGet(this, _outgoing).has(key)) {
      let [serializedValue, , isSetValue] = __privateGet(this, _outgoing).get(key);
      if (isSetValue) {
        return new AstroCookie(serializedValue);
      } else {
        return new AstroCookie(void 0);
      }
    }
    const values = __privateMethod(this, _ensureParsed, ensureParsed_fn).call(this);
    const value = values[key];
    return new AstroCookie(value);
  }
  has(key) {
    if (__privateGet(this, _outgoing) !== null && __privateGet(this, _outgoing).has(key)) {
      let [, , isSetValue] = __privateGet(this, _outgoing).get(key);
      return isSetValue;
    }
    const values = __privateMethod(this, _ensureParsed, ensureParsed_fn).call(this);
    return !!values[key];
  }
  set(key, value, options) {
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else {
      let toStringValue = value.toString();
      if (toStringValue === Object.prototype.toString.call(value)) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = toStringValue;
      }
    }
    const serializeOptions = {};
    if (options) {
      Object.assign(serializeOptions, options);
    }
    __privateMethod(this, _ensureOutgoingMap, ensureOutgoingMap_fn).call(this).set(key, [
      serializedValue,
      serialize(key, serializedValue, serializeOptions),
      true
    ]);
  }
  *headers() {
    if (__privateGet(this, _outgoing) == null)
      return;
    for (const [, value] of __privateGet(this, _outgoing)) {
      yield value[1];
    }
  }
}
_request = new WeakMap();
_requestValues = new WeakMap();
_outgoing = new WeakMap();
_ensureParsed = new WeakSet();
ensureParsed_fn = function() {
  if (!__privateGet(this, _requestValues)) {
    __privateMethod(this, _parse, parse_fn).call(this);
  }
  if (!__privateGet(this, _requestValues)) {
    __privateSet(this, _requestValues, {});
  }
  return __privateGet(this, _requestValues);
};
_ensureOutgoingMap = new WeakSet();
ensureOutgoingMap_fn = function() {
  if (!__privateGet(this, _outgoing)) {
    __privateSet(this, _outgoing, /* @__PURE__ */ new Map());
  }
  return __privateGet(this, _outgoing);
};
_parse = new WeakSet();
parse_fn = function() {
  const raw = __privateGet(this, _request).headers.get("cookie");
  if (!raw) {
    return;
  }
  __privateSet(this, _requestValues, parse(raw));
};
export {
  AstroCookies
};
