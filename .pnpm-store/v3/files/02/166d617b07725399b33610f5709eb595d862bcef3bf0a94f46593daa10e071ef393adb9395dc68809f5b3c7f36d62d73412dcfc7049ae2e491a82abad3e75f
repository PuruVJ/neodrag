"use strict";
var f = Object.defineProperty;
var H = Object.getOwnPropertyDescriptor;
var P = Object.getOwnPropertyNames;
var S = Object.prototype.hasOwnProperty;
var j = (n, r, t) => r in n ? f(n, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[r] = t;
var q = (n, r) => {
  for (var t in r)
    f(n, t, { get: r[t], enumerable: !0 });
}, z = (n, r, t, e) => {
  if (r && typeof r == "object" || typeof r == "function")
    for (let s of P(r))
      !S.call(n, s) && s !== t && f(n, s, { get: () => r[s], enumerable: !(e = H(r, s)) || e.enumerable });
  return n;
};
var V = (n) => z(f({}, "__esModule", { value: !0 }), n);
var a = (n, r, t) => (j(n, typeof r != "symbol" ? r + "" : r, t), t);

// src/index.ts
var J = {};
q(J, {
  Bench: () => p,
  Task: () => c,
  default: () => G,
  now: () => E
});
module.exports = V(J);

// src/event.ts
function i(n, r = null) {
  let t = new Event(n);
  return Object.defineProperty(t, "task", {
    value: r,
    enumerable: !0,
    writable: !1,
    configurable: !1
  }), t;
}

// src/constants.ts
var C = {
  1: 12.71,
  2: 4.303,
  3: 3.182,
  4: 2.776,
  5: 2.571,
  6: 2.447,
  7: 2.365,
  8: 2.306,
  9: 2.262,
  10: 2.228,
  11: 2.201,
  12: 2.179,
  13: 2.16,
  14: 2.145,
  15: 2.131,
  16: 2.12,
  17: 2.11,
  18: 2.101,
  19: 2.093,
  20: 2.086,
  21: 2.08,
  22: 2.074,
  23: 2.069,
  24: 2.064,
  25: 2.06,
  26: 2.056,
  27: 2.052,
  28: 2.048,
  29: 2.045,
  30: 2.042,
  31: 2.0399,
  32: 2.0378,
  33: 2.0357,
  34: 2.0336,
  35: 2.0315,
  36: 2.0294,
  37: 2.0273,
  38: 2.0252,
  39: 2.0231,
  40: 2.021,
  41: 2.0198,
  42: 2.0186,
  43: 2.0174,
  44: 2.0162,
  45: 2.015,
  46: 2.0138,
  47: 2.0126,
  48: 2.0114,
  49: 2.0102,
  50: 2.009,
  51: 2.0081,
  52: 2.0072,
  53: 2.0063,
  54: 2.0054,
  55: 2.0045,
  56: 2.0036,
  57: 2.0027,
  58: 2.0018,
  59: 2.0009,
  60: 2,
  61: 1.9995,
  62: 1.999,
  63: 1.9985,
  64: 1.998,
  65: 1.9975,
  66: 1.997,
  67: 1.9965,
  68: 1.996,
  69: 1.9955,
  70: 1.995,
  71: 1.9945,
  72: 1.994,
  73: 1.9935,
  74: 1.993,
  75: 1.9925,
  76: 1.992,
  77: 1.9915,
  78: 1.991,
  79: 1.9905,
  80: 1.99,
  81: 1.9897,
  82: 1.9894,
  83: 1.9891,
  84: 1.9888,
  85: 1.9885,
  86: 1.9882,
  87: 1.9879,
  88: 1.9876,
  89: 1.9873,
  90: 1.987,
  91: 1.9867,
  92: 1.9864,
  93: 1.9861,
  94: 1.9858,
  95: 1.9855,
  96: 1.9852,
  97: 1.9849,
  98: 1.9846,
  99: 1.9843,
  100: 1.984,
  101: 1.9838,
  102: 1.9836,
  103: 1.9834,
  104: 1.9832,
  105: 1.983,
  106: 1.9828,
  107: 1.9826,
  108: 1.9824,
  109: 1.9822,
  110: 1.982,
  111: 1.9818,
  112: 1.9816,
  113: 1.9814,
  114: 1.9812,
  115: 1.9819,
  116: 1.9808,
  117: 1.9806,
  118: 1.9804,
  119: 1.9802,
  120: 1.98,
  infinity: 1.96
}, w = C;

// src/utils.ts
var N = (n) => n / 1e6, E = () => {
  var n;
  return typeof ((n = globalThis.process) == null ? void 0 : n.hrtime) == "function" ? N(Number(process.hrtime.bigint())) : performance.now();
}, B = (n) => n.reduce((r, t) => r + t, 0) / n.length || 0, L = (n, r) => n.reduce((e, s) => e + (s - r) ** 2) / (n.length - 1) || 0, D = (async () => {
}).constructor, K = (n) => n.constructor === D;

// src/task.ts
var c = class extends EventTarget {
  constructor(t, e, s) {
    super();
    a(this, "bench");
    a(this, "name");
    a(this, "fn");
    a(this, "runs", 0);
    a(this, "result");
    this.bench = t, this.name = e, this.fn = s;
  }
  async run() {
    var u, l, m;
    this.dispatchEvent(i("start", this));
    let t = 0, e = [], s = K(this.fn);
    for (await this.bench.setup(this, "run"); (t < this.bench.time || this.runs < this.bench.iterations) && !((u = this.bench.signal) != null && u.aborted); ) {
      let o = 0;
      try {
        o = this.bench.now(), s ? await this.fn() : this.fn();
      } catch (v) {
        this.setResult({ error: v });
      }
      let h = this.bench.now() - o;
      this.runs += 1, e.push(h), t += h;
    }
    await this.bench.teardown(this, "run"), e.sort((o, h) => o - h);
    {
      let o = e[0], h = e[e.length - 1], v = t / this.runs, F = 1e3 / v, b = B(e), T = L(e, b), k = Math.sqrt(T), g = k / Math.sqrt(e.length), y = e.length - 1, x = w[String(Math.round(y) || 1)] || w.infinity, M = g * x, R = M / b * 100 || 0, O = e[Math.ceil(e.length * (75 / 100)) - 1], _ = e[Math.ceil(e.length * (99 / 100)) - 1], A = e[Math.ceil(e.length * (99.5 / 100)) - 1], I = e[Math.ceil(e.length * (99.9 / 100)) - 1];
      if ((l = this.bench.signal) != null && l.aborted)
        return this;
      this.setResult({
        totalTime: t,
        min: o,
        max: h,
        hz: F,
        period: v,
        samples: e,
        mean: b,
        variance: T,
        sd: k,
        sem: g,
        df: y,
        critical: x,
        moe: M,
        rme: R,
        p75: O,
        p99: _,
        p995: A,
        p999: I
      });
    }
    return (m = this.result) != null && m.error && (this.dispatchEvent(i("error", this)), this.bench.dispatchEvent(i("error", this))), this.dispatchEvent(i("cycle", this)), this.bench.dispatchEvent(i("cycle", this)), this.dispatchEvent(i("complete", this)), this;
  }
  async warmup() {
    var s;
    this.dispatchEvent(i("warmup", this));
    let t = this.bench.now(), e = 0;
    for (this.bench.setup(this, "warmup"); (e < this.bench.warmupTime || this.runs < this.bench.warmupIterations) && !((s = this.bench.signal) != null && s.aborted); ) {
      try {
        await Promise.resolve().then(this.fn);
      } catch (u) {
      }
      this.runs += 1, e = this.bench.now() - t;
    }
    this.bench.teardown(this, "warmup"), this.runs = 0;
  }
  addEventListener(t, e, s) {
    super.addEventListener(t, e, s);
  }
  removeEventListener(t, e, s) {
    super.removeEventListener(t, e, s);
  }
  setResult(t) {
    this.result = { ...this.result, ...t }, Object.freeze(this.reset);
  }
  reset() {
    this.dispatchEvent(i("reset", this)), this.runs = 0, this.result = void 0;
  }
};

// src/bench.ts
var p = class extends EventTarget {
  constructor(t = {}) {
    var e, s, u, l, m, o, h;
    super();
    a(this, "_tasks", /* @__PURE__ */ new Map());
    a(this, "signal");
    a(this, "warmupTime", 100);
    a(this, "warmupIterations", 5);
    a(this, "time", 500);
    a(this, "iterations", 10);
    a(this, "now", E);
    a(this, "setup");
    a(this, "teardown");
    this.now = (e = t.now) != null ? e : this.now, this.warmupTime = (s = t.warmupTime) != null ? s : this.warmupTime, this.warmupIterations = (u = t.warmupIterations) != null ? u : this.warmupIterations, this.time = (l = t.time) != null ? l : this.time, this.iterations = (m = t.iterations) != null ? m : this.iterations, this.signal = t.signal, this.setup = (o = t.setup) != null ? o : () => {
    }, this.teardown = (h = t.teardown) != null ? h : () => {
    }, this.signal && this.signal.addEventListener("abort", () => {
      this.dispatchEvent(i("abort"));
    }, { once: !0 });
  }
  async run() {
    var e;
    this.dispatchEvent(i("start"));
    let t = [];
    for (let s of [...this._tasks.values()])
      (e = this.signal) != null && e.aborted ? t.push(s) : t.push(await s.run());
    return this.dispatchEvent(i("complete")), t;
  }
  async warmup() {
    this.dispatchEvent(i("warmup"));
    for (let [, t] of this._tasks)
      await t.warmup();
  }
  reset() {
    this.dispatchEvent(i("reset")), this._tasks.forEach((t) => {
      t.reset();
    });
  }
  add(t, e) {
    let s = new c(this, t, e);
    return this._tasks.set(t, s), this.dispatchEvent(i("add", s)), this;
  }
  remove(t) {
    let e = this.getTask(t);
    return this.dispatchEvent(i("remove", e)), this._tasks.delete(t), this;
  }
  addEventListener(t, e, s) {
    super.addEventListener(t, e, s);
  }
  removeEventListener(t, e, s) {
    super.removeEventListener(t, e, s);
  }
  get results() {
    return [...this._tasks.values()].map((t) => t.result);
  }
  get tasks() {
    return [...this._tasks.values()];
  }
  getTask(t) {
    return this._tasks.get(t);
  }
};

// src/index.ts
var G = p;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bench,
  Task,
  now
});
