"use strict";
var h = Object.defineProperty;
var O = Object.getOwnPropertyDescriptor;
var P = Object.getOwnPropertyNames;
var K = Object.prototype.hasOwnProperty;
var b = (t, e) => {
  for (var n in e)
    h(t, n, { get: e[n], enumerable: !0 });
}, M = (t, e, n, s) => {
  if (e && typeof e == "object" || typeof e == "function")
    for (let r of P(e))
      !K.call(t, r) && r !== n && h(t, r, { get: () => e[r], enumerable: !(s = O(e, r)) || s.enumerable });
  return t;
};
var F = (t) => M(h({}, "__esModule", { value: !0 }), t);

// src/index.ts
var E = {};
b(E, {
  restoreAll: () => C,
  spies: () => x,
  spy: () => S,
  spyOn: () => I
});
module.exports = F(E);

// src/utils.ts
function d(t, e) {
  if (!t)
    throw new Error(e);
}
function y(t, e) {
  return typeof e === t;
}
function A(t) {
  return t instanceof Promise;
}
function f(t, e, n) {
  Object.defineProperty(t, e, n);
}

// src/spy.ts
var x = /* @__PURE__ */ new Set();
function S(t) {
  d(y("function", t) || y("undefined", t), "cannot spy on a non-function value");
  let e = function(...s) {
    if (e.called = !0, e.callCount++, e.calls.push(s), e.next) {
      let [i, l] = e.next;
      if (e.results.push(e.next), e.next = null, i === "ok")
        return l;
      throw l;
    }
    let r, o = "ok";
    if (e.impl)
      try {
        r = e.impl.apply(this, s), o = "ok";
      } catch (i) {
        throw r = i, o = "error", e.results.push([o, i]), i;
      }
    let c = [o, r];
    if (A(r)) {
      let i = r.then((l) => c[1] = l).catch((l) => {
        throw c[0] = "error", c[1] = l, l;
      });
      Object.assign(i, r), r = i;
    }
    return e.results.push(c), r;
  };
  f(e, "_isMockFunction", { get: () => !0 }), f(e, "length", { value: t ? t.length : 0 }), f(e, "returns", {
    get() {
      return this.results.map(([, s]) => s);
    }
  }), f(e, "name", { value: t && t.name || "spy" });
  let n = () => {
    e.called = !1, e.callCount = 0, e.results = [], e.calls = [];
  };
  return n(), e.impl = t, e.reset = n, e.nextError = (s) => (e.next = ["error", s], e), e.nextResult = (s) => (e.next = ["ok", s], e), e;
}

// src/spyOn.ts
var k = (t, e) => Object.getOwnPropertyDescriptor(t, e);
function I(t, e, n) {
  d(!y("undefined", t), "spyOn could not find an object to spy upon"), d(y("object", t) || y("function", t), "cannot spyOn on a primitive value");
  let s = () => {
    if (typeof e != "object")
      return [e, "value"];
    if ("getter" in e && "setter" in e)
      throw new Error("cannot spy on both getter and setter");
    if ("getter" in e)
      return [e.getter, "get"];
    if ("setter" in e)
      return [e.setter, "set"];
    throw new Error("specify getter or setter to spy on");
  }, [r, o] = s(), c = k(t, r), i = Object.getPrototypeOf(t), l = i && k(i, r), a = c || l;
  d(a || r in t, `${String(r)} does not exist`);
  let R = !1;
  o === "value" && a && !a.value && a.get && (o = "get", R = !0, n = a.get());
  let u;
  a ? u = a[o] : o !== "value" ? u = () => t[r] : u = t[r], n || (n = u);
  let p = S(n), v = (T) => {
    let { value: G, ...m } = a || {
      configurable: !0,
      writable: !0
    };
    o !== "value" && delete m.writable, m[o] = T, f(t, r, m);
  }, w = () => v(u);
  return p.restore = w, p.getOriginal = () => R ? u() : u, p.willCall = (T) => (p.impl = T, p), v(R ? () => p : p), x.add(p), p;
}

// src/restoreAll.ts
function C() {
  for (let t of x)
    t.restore();
  x.clear();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  restoreAll,
  spies,
  spy,
  spyOn
});
