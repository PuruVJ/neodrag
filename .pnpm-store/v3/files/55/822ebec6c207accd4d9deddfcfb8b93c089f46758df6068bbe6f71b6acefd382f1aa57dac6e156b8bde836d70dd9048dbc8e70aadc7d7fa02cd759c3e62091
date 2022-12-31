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
const isNodeJS = typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
let StreamingCompatibleResponse;
function createResponseClass() {
  var _isStream, _body, _a;
  StreamingCompatibleResponse = (_a = class extends Response {
    constructor(body, init) {
      let isStream = body instanceof ReadableStream;
      super(isStream ? null : body, init);
      __privateAdd(this, _isStream, void 0);
      __privateAdd(this, _body, void 0);
      __privateSet(this, _isStream, isStream);
      __privateSet(this, _body, body);
    }
    get body() {
      return __privateGet(this, _body);
    }
    async text() {
      if (__privateGet(this, _isStream) && isNodeJS) {
        let decoder = new TextDecoder();
        let body = __privateGet(this, _body);
        let out = "";
        for await (let chunk of body) {
          out += decoder.decode(chunk);
        }
        return out;
      }
      return super.text();
    }
    async arrayBuffer() {
      if (__privateGet(this, _isStream) && isNodeJS) {
        let body = __privateGet(this, _body);
        let chunks = [];
        let len = 0;
        for await (let chunk of body) {
          chunks.push(chunk);
          len += chunk.length;
        }
        let ab = new Uint8Array(len);
        let offset = 0;
        for (const chunk of chunks) {
          ab.set(chunk, offset);
          offset += chunk.length;
        }
        return ab;
      }
      return super.arrayBuffer();
    }
  }, _isStream = new WeakMap(), _body = new WeakMap(), _a);
  return StreamingCompatibleResponse;
}
const createResponse = isNodeJS ? (body, init) => {
  if (typeof body === "string" || ArrayBuffer.isView(body)) {
    return new Response(body, init);
  }
  if (typeof StreamingCompatibleResponse === "undefined") {
    return new (createResponseClass())(body, init);
  }
  return new StreamingCompatibleResponse(body, init);
} : (body, init) => new Response(body, init);
export {
  createResponse
};
