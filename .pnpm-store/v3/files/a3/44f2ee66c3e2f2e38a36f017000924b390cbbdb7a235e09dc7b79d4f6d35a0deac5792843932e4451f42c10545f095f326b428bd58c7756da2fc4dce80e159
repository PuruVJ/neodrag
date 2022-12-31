// src/utils.ts
function d(t, e) {
  if (!t)
    throw new Error(e);
}
function y(t, e) {
  return typeof e === t;
}
function v(t) {
  return t instanceof Promise;
}
function f(t, e, i) {
  Object.defineProperty(t, e, i);
}

// src/spy.ts
var x = /* @__PURE__ */ new Set();
function A(t) {
  d(y("function", t) || y("undefined", t), "cannot spy on a non-function value");
  let e = function(...o) {
    if (e.called = !0, e.callCount++, e.calls.push(o), e.next) {
      let [s, l] = e.next;
      if (e.results.push(e.next), e.next = null, s === "ok")
        return l;
      throw l;
    }
    let r, n = "ok";
    if (e.impl)
      try {
        r = e.impl.apply(this, o), n = "ok";
      } catch (s) {
        throw r = s, n = "error", e.results.push([n, s]), s;
      }
    let c = [n, r];
    if (v(r)) {
      let s = r.then((l) => c[1] = l).catch((l) => {
        throw c[0] = "error", c[1] = l, l;
      });
      Object.assign(s, r), r = s;
    }
    return e.results.push(c), r;
  };
  f(e, "_isMockFunction", { get: () => !0 }), f(e, "length", { value: t ? t.length : 0 }), f(e, "returns", {
    get() {
      return this.results.map(([, o]) => o);
    }
  }), f(e, "name", { value: t && t.name || "spy" });
  let i = () => {
    e.called = !1, e.callCount = 0, e.results = [], e.calls = [];
  };
  return i(), e.impl = t, e.reset = i, e.nextError = (o) => (e.next = ["error", o], e), e.nextResult = (o) => (e.next = ["ok", o], e), e;
}

// src/spyOn.ts
var k = (t, e) => Object.getOwnPropertyDescriptor(t, e);
function C(t, e, i) {
  d(!y("undefined", t), "spyOn could not find an object to spy upon"), d(y("object", t) || y("function", t), "cannot spyOn on a primitive value");
  let o = () => {
    if (typeof e != "object")
      return [e, "value"];
    if ("getter" in e && "setter" in e)
      throw new Error("cannot spy on both getter and setter");
    if ("getter" in e)
      return [e.getter, "get"];
    if ("setter" in e)
      return [e.setter, "set"];
    throw new Error("specify getter or setter to spy on");
  }, [r, n] = o(), c = k(t, r), s = Object.getPrototypeOf(t), l = s && k(s, r), a = c || l;
  d(a || r in t, `${String(r)} does not exist`);
  let T = !1;
  n === "value" && a && !a.value && a.get && (n = "get", T = !0, i = a.get());
  let u;
  a ? u = a[n] : n !== "value" ? u = () => t[r] : u = t[r], i || (i = u);
  let p = A(i), S = (m) => {
    let { value: O, ...h } = a || {
      configurable: !0,
      writable: !0
    };
    n !== "value" && delete h.writable, h[n] = m, f(t, r, h);
  }, w = () => S(u);
  return p.restore = w, p.getOriginal = () => T ? u() : u, p.willCall = (m) => (p.impl = m, p), S(T ? () => p : p), x.add(p), p;
}

// src/restoreAll.ts
function q() {
  for (let t of x)
    t.restore();
  x.clear();
}
export {
  q as restoreAll,
  x as spies,
  A as spy,
  C as spyOn
};
