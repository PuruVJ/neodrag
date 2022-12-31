var H = Object.defineProperty;
var P = (n, a, t) => a in n ? H(n, a, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[a] = t;
var i = (n, a, t) => (P(n, typeof a != "symbol" ? a + "" : a, t), t);

// src/event.ts
function r(n, a = null) {
  let t = new Event(n);
  return Object.defineProperty(t, "task", {
    value: a,
    enumerable: !0,
    writable: !1,
    configurable: !1
  }), t;
}

// src/constants.ts
var S = {
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
}, b = S;

// src/utils.ts
var j = (n) => n / 1e6, w = () => {
  var n;
  return typeof ((n = globalThis.process) == null ? void 0 : n.hrtime) == "function" ? j(Number(process.hrtime.bigint())) : performance.now();
}, B = (n) => n.reduce((a, t) => a + t, 0) / n.length || 0, L = (n, a) => n.reduce((e, s) => e + (s - a) ** 2) / (n.length - 1) || 0, q = (async () => {
}).constructor, K = (n) => n.constructor === q;

// src/task.ts
var u = class extends EventTarget {
  constructor(t, e, s) {
    super();
    i(this, "bench");
    i(this, "name");
    i(this, "fn");
    i(this, "runs", 0);
    i(this, "result");
    this.bench = t, this.name = e, this.fn = s;
  }
  async run() {
    var c, p, l;
    this.dispatchEvent(r("start", this));
    let t = 0, e = [], s = K(this.fn);
    for (await this.bench.setup(this, "run"); (t < this.bench.time || this.runs < this.bench.iterations) && !((c = this.bench.signal) != null && c.aborted); ) {
      let o = 0;
      try {
        o = this.bench.now(), s ? await this.fn() : this.fn();
      } catch (f) {
        this.setResult({ error: f });
      }
      let h = this.bench.now() - o;
      this.runs += 1, e.push(h), t += h;
    }
    await this.bench.teardown(this, "run"), e.sort((o, h) => o - h);
    {
      let o = e[0], h = e[e.length - 1], f = t / this.runs, F = 1e3 / f, E = B(e), T = L(e, E), k = Math.sqrt(T), g = k / Math.sqrt(e.length), y = e.length - 1, x = b[String(Math.round(y) || 1)] || b.infinity, M = g * x, R = M / E * 100 || 0, O = e[Math.ceil(e.length * (75 / 100)) - 1], _ = e[Math.ceil(e.length * (99 / 100)) - 1], A = e[Math.ceil(e.length * (99.5 / 100)) - 1], I = e[Math.ceil(e.length * (99.9 / 100)) - 1];
      if ((p = this.bench.signal) != null && p.aborted)
        return this;
      this.setResult({
        totalTime: t,
        min: o,
        max: h,
        hz: F,
        period: f,
        samples: e,
        mean: E,
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
    return (l = this.result) != null && l.error && (this.dispatchEvent(r("error", this)), this.bench.dispatchEvent(r("error", this))), this.dispatchEvent(r("cycle", this)), this.bench.dispatchEvent(r("cycle", this)), this.dispatchEvent(r("complete", this)), this;
  }
  async warmup() {
    var s;
    this.dispatchEvent(r("warmup", this));
    let t = this.bench.now(), e = 0;
    for (this.bench.setup(this, "warmup"); (e < this.bench.warmupTime || this.runs < this.bench.warmupIterations) && !((s = this.bench.signal) != null && s.aborted); ) {
      try {
        await Promise.resolve().then(this.fn);
      } catch (c) {
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
    this.dispatchEvent(r("reset", this)), this.runs = 0, this.result = void 0;
  }
};

// src/bench.ts
var v = class extends EventTarget {
  constructor(t = {}) {
    var e, s, c, p, l, o, h;
    super();
    i(this, "_tasks", /* @__PURE__ */ new Map());
    i(this, "signal");
    i(this, "warmupTime", 100);
    i(this, "warmupIterations", 5);
    i(this, "time", 500);
    i(this, "iterations", 10);
    i(this, "now", w);
    i(this, "setup");
    i(this, "teardown");
    this.now = (e = t.now) != null ? e : this.now, this.warmupTime = (s = t.warmupTime) != null ? s : this.warmupTime, this.warmupIterations = (c = t.warmupIterations) != null ? c : this.warmupIterations, this.time = (p = t.time) != null ? p : this.time, this.iterations = (l = t.iterations) != null ? l : this.iterations, this.signal = t.signal, this.setup = (o = t.setup) != null ? o : () => {
    }, this.teardown = (h = t.teardown) != null ? h : () => {
    }, this.signal && this.signal.addEventListener("abort", () => {
      this.dispatchEvent(r("abort"));
    }, { once: !0 });
  }
  async run() {
    var e;
    this.dispatchEvent(r("start"));
    let t = [];
    for (let s of [...this._tasks.values()])
      (e = this.signal) != null && e.aborted ? t.push(s) : t.push(await s.run());
    return this.dispatchEvent(r("complete")), t;
  }
  async warmup() {
    this.dispatchEvent(r("warmup"));
    for (let [, t] of this._tasks)
      await t.warmup();
  }
  reset() {
    this.dispatchEvent(r("reset")), this._tasks.forEach((t) => {
      t.reset();
    });
  }
  add(t, e) {
    let s = new u(this, t, e);
    return this._tasks.set(t, s), this.dispatchEvent(r("add", s)), this;
  }
  remove(t) {
    let e = this.getTask(t);
    return this.dispatchEvent(r("remove", e)), this._tasks.delete(t), this;
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
var tt = v;
export {
  v as Bench,
  u as Task,
  tt as default,
  w as now
};
