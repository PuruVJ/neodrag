import { performance } from 'perf_hooks';
import { s as someTasksAreOnly, i as interpretTaskModes, t as takeCoverageInsideWorker, p as pLimit } from './chunk-integrations-coverage.befed097.js';
import { r as resetRunOnceCounter, i as index, v as vi, s as setCurrentTest } from './chunk-utils-import.dc87c88c.js';
import { g as getWorkerState, R as RealDate, t as toArray, l as relativePath, j as isRunningInBenchmark, p as partitionSuiteChildren, q as shuffle, u as hasTests, v as hasFailed, w as createDefer, f as getFullName } from './chunk-typecheck-constants.e478eb98.js';
import { f as clearCollectorContext, h as defaultSuite, j as setHooks, k as getHooks, l as collectorContext, m as getBenchOptions, n as getFn, o as setState, G as GLOBAL_EXPECT, p as getState } from './chunk-runtime-chain.198631fd.js';
import { r as rpc } from './chunk-runtime-rpc.503623e9.js';
import { p as processError } from './chunk-runtime-error.12631a44.js';
import { installSourcemapsSupport } from 'vite-node/source-map';
import { e as environments } from './chunk-env-node.b3664da2.js';
import { i as isNode, a as isBrowser } from './chunk-utils-env.4afc6329.js';
import { b as safeClearTimeout, s as safeSetTimeout } from './chunk-utils-timers.54caa12a.js';

let globalSetup = false;
async function setupGlobalEnv(config) {
  resetRunOnceCounter();
  Object.defineProperty(globalThis, "__vitest_index__", {
    value: index,
    enumerable: false
  });
  setupDefines(config.defines);
  if (globalSetup)
    return;
  globalSetup = true;
  if (isNode) {
    const state = getWorkerState();
    installSourcemapsSupport({
      getSourceMap: (source) => state.moduleCache.getSourceMap(source)
    });
    await setupConsoleLogSpy();
  }
  if (config.globals)
    (await import('./chunk-integrations-globals.5af12e76.js')).registerApiGlobally();
}
function setupDefines(defines) {
  for (const key in defines)
    globalThis[key] = defines[key];
}
async function setupConsoleLogSpy() {
  const stdoutBuffer = /* @__PURE__ */ new Map();
  const stderrBuffer = /* @__PURE__ */ new Map();
  const timers = /* @__PURE__ */ new Map();
  const unknownTestId = "__vitest__unknown_test__";
  const { Writable } = await import('node:stream');
  const { Console } = await import('node:console');
  function schedule(taskId) {
    const timer = timers.get(taskId);
    const { stdoutTime, stderrTime } = timer;
    safeClearTimeout(timer.timer);
    timer.timer = safeSetTimeout(() => {
      if (stderrTime < stdoutTime) {
        sendStderr(taskId);
        sendStdout(taskId);
      } else {
        sendStdout(taskId);
        sendStderr(taskId);
      }
    });
  }
  function sendStdout(taskId) {
    const buffer = stdoutBuffer.get(taskId);
    if (!buffer)
      return;
    const content = buffer.map((i) => String(i)).join("");
    if (!content.trim())
      return;
    const timer = timers.get(taskId);
    rpc().onUserConsoleLog({
      type: "stdout",
      content,
      taskId,
      time: timer.stdoutTime || RealDate.now(),
      size: buffer.length
    });
    stdoutBuffer.set(taskId, []);
    timer.stdoutTime = 0;
  }
  function sendStderr(taskId) {
    const buffer = stderrBuffer.get(taskId);
    if (!buffer)
      return;
    const content = buffer.map((i) => String(i)).join("");
    if (!content.trim())
      return;
    const timer = timers.get(taskId);
    rpc().onUserConsoleLog({
      type: "stderr",
      content,
      taskId,
      time: timer.stderrTime || RealDate.now(),
      size: buffer.length
    });
    stderrBuffer.set(taskId, []);
    timer.stderrTime = 0;
  }
  const stdout = new Writable({
    write(data, encoding, callback) {
      var _a, _b;
      const id = ((_b = (_a = getWorkerState()) == null ? void 0 : _a.current) == null ? void 0 : _b.id) ?? unknownTestId;
      let timer = timers.get(id);
      if (timer) {
        timer.stdoutTime = timer.stdoutTime || RealDate.now();
      } else {
        timer = { stdoutTime: RealDate.now(), stderrTime: RealDate.now(), timer: 0 };
        timers.set(id, timer);
      }
      let buffer = stdoutBuffer.get(id);
      if (!buffer) {
        buffer = [];
        stdoutBuffer.set(id, buffer);
      }
      buffer.push(data);
      schedule(id);
      callback();
    }
  });
  const stderr = new Writable({
    write(data, encoding, callback) {
      var _a, _b;
      const id = ((_b = (_a = getWorkerState()) == null ? void 0 : _a.current) == null ? void 0 : _b.id) ?? unknownTestId;
      let timer = timers.get(id);
      if (timer) {
        timer.stderrTime = timer.stderrTime || RealDate.now();
      } else {
        timer = { stderrTime: RealDate.now(), stdoutTime: RealDate.now(), timer: 0 };
        timers.set(id, timer);
      }
      let buffer = stderrBuffer.get(id);
      if (!buffer) {
        buffer = [];
        stderrBuffer.set(id, buffer);
      }
      buffer.push(data);
      schedule(id);
      callback();
    }
  });
  globalThis.console = new Console({
    stdout,
    stderr,
    colorMode: true,
    groupIndentation: 2
  });
}
async function loadEnvironment(name) {
  const pkg = await import(`vitest-environment-${name}`);
  if (!pkg || !pkg.default || typeof pkg.default !== "object" || typeof pkg.default.setup !== "function") {
    throw new Error(
      `Environment "${name}" is not a valid environment. Package "vitest-environment-${name}" should have default export with "setup" method.`
    );
  }
  return pkg.default;
}
async function withEnv(name, options, fn) {
  const config = environments[name] || await loadEnvironment(name);
  const env = await config.setup(globalThis, options);
  try {
    await fn();
  } finally {
    await env.teardown(globalThis);
  }
}
async function runSetupFiles(config) {
  const files = toArray(config.setupFiles);
  await Promise.all(
    files.map(async (fsPath) => {
      getWorkerState().moduleCache.delete(fsPath);
      await import(fsPath);
    })
  );
}

const now$1 = Date.now;
function hash(str) {
  let hash2 = 0;
  if (str.length === 0)
    return `${hash2}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash2 = (hash2 << 5) - hash2 + char;
    hash2 = hash2 & hash2;
  }
  return `${hash2}`;
}
async function collectTests(paths, config) {
  const files = [];
  const browserHashMap = getWorkerState().browserHashMap;
  async function importFromBrowser(filepath) {
    const match = filepath.match(/^(\w:\/)/);
    const hash2 = browserHashMap.get(filepath);
    if (match)
      return await import(`/@fs/${filepath.slice(match[1].length)}?v=${hash2}`);
    else
      return await import(`${filepath}?v=${hash2}`);
  }
  for (const filepath of paths) {
    const path = relativePath(config.root, filepath);
    const file = {
      id: hash(path),
      name: path,
      type: "suite",
      mode: "run",
      filepath,
      tasks: [],
      projectName: config.name
    };
    clearCollectorContext();
    try {
      const setupStart = now$1();
      await runSetupFiles(config);
      const collectStart = now$1();
      file.setupDuration = collectStart - setupStart;
      if (config.browser && isBrowser)
        await importFromBrowser(filepath);
      else
        await import(filepath);
      const defaultTasks = await defaultSuite.collect(file);
      setHooks(file, getHooks(defaultTasks));
      for (const c of [...defaultTasks.tasks, ...collectorContext.tasks]) {
        if (c.type === "test") {
          file.tasks.push(c);
        } else if (c.type === "benchmark") {
          file.tasks.push(c);
        } else if (c.type === "suite") {
          file.tasks.push(c);
        } else if (c.type === "collector") {
          const suite = await c.collect(file);
          if (suite.name || suite.tasks.length)
            file.tasks.push(suite);
        }
      }
      file.collectDuration = now$1() - collectStart;
    } catch (e) {
      file.result = {
        state: "fail",
        error: processError(e)
      };
      if (config.browser)
        console.error(e);
    }
    calculateHash(file);
    const hasOnlyTasks = someTasksAreOnly(file);
    interpretTaskModes(file, config.testNamePattern, hasOnlyTasks, false, config.allowOnly);
    files.push(file);
  }
  return files;
}
function calculateHash(parent) {
  parent.tasks.forEach((t, idx) => {
    t.id = `${parent.id}_${idx}`;
    if (t.type === "suite")
      calculateHash(t);
  });
}

async function importTinybench() {
  if (!globalThis.EventTarget)
    await import('./vendor-index.534e612c.js').then(function (n) { return n.i; });
  return await import('tinybench');
}
const now = Date.now;
function updateSuiteHookState(suite, name, state) {
  var _a;
  if (!suite.result)
    suite.result = { state: "run" };
  if (!((_a = suite.result) == null ? void 0 : _a.hooks))
    suite.result.hooks = {};
  const suiteHooks = suite.result.hooks;
  if (suiteHooks) {
    suiteHooks[name] = state;
    updateTask(suite);
  }
}
function getSuiteHooks(suite, name, sequence) {
  const hooks = getHooks(suite)[name];
  if (sequence === "stack" && (name === "afterAll" || name === "afterEach"))
    return hooks.slice().reverse();
  return hooks;
}
async function callSuiteHook(suite, currentTask, name, args) {
  const callbacks = [];
  if (name === "beforeEach" && suite.suite) {
    callbacks.push(
      ...await callSuiteHook(suite.suite, currentTask, name, args)
    );
  }
  updateSuiteHookState(currentTask, name, "run");
  const state = getWorkerState();
  const sequence = state.config.sequence.hooks;
  const hooks = getSuiteHooks(suite, name, sequence);
  if (sequence === "parallel") {
    callbacks.push(...await Promise.all(hooks.map((fn) => fn(...args))));
  } else {
    for (const hook of hooks)
      callbacks.push(await hook(...args));
  }
  updateSuiteHookState(currentTask, name, "pass");
  if (name === "afterEach" && suite.suite) {
    callbacks.push(
      ...await callSuiteHook(suite.suite, currentTask, name, args)
    );
  }
  return callbacks;
}
const packs = /* @__PURE__ */ new Map();
let updateTimer;
let previousUpdate;
function updateTask(task) {
  packs.set(task.id, task.result);
  safeClearTimeout(updateTimer);
  updateTimer = safeSetTimeout(() => {
    previousUpdate = sendTasksUpdate();
  }, 10);
}
async function sendTasksUpdate() {
  safeClearTimeout(updateTimer);
  await previousUpdate;
  if (packs.size) {
    const p = rpc().onTaskUpdate(Array.from(packs));
    packs.clear();
    return p;
  }
}
const callCleanupHooks = async (cleanups) => {
  await Promise.all(cleanups.map(async (fn) => {
    if (typeof fn !== "function")
      return;
    await fn();
  }));
};
async function runTest(test) {
  var _a, _b, _c;
  if (test.mode !== "run") {
    const { getSnapshotClient } = await import('./chunk-runtime-chain.198631fd.js').then(function (n) { return n.r; });
    getSnapshotClient().skipTestSnapshots(test);
    return;
  }
  if (((_a = test.result) == null ? void 0 : _a.state) === "fail") {
    updateTask(test);
    return;
  }
  const start = now();
  test.result = {
    state: "run",
    startTime: start
  };
  updateTask(test);
  clearModuleMocks();
  setCurrentTest(test);
  if (isNode) {
    const { getSnapshotClient } = await import('./chunk-runtime-chain.198631fd.js').then(function (n) { return n.r; });
    await getSnapshotClient().setTest(test);
  }
  const workerState = getWorkerState();
  workerState.current = test;
  const retry = test.retry || 1;
  for (let retryCount = 0; retryCount < retry; retryCount++) {
    let beforeEachCleanups = [];
    try {
      setState({
        assertionCalls: 0,
        isExpectingAssertions: false,
        isExpectingAssertionsError: null,
        expectedAssertionsNumber: null,
        expectedAssertionsNumberErrorGen: null,
        testPath: (_b = test.suite.file) == null ? void 0 : _b.filepath,
        currentTestName: getFullName(test)
      }, globalThis[GLOBAL_EXPECT]);
      beforeEachCleanups = await callSuiteHook(test.suite, test, "beforeEach", [test.context, test.suite]);
      test.result.retryCount = retryCount;
      await getFn(test)();
      const {
        assertionCalls,
        expectedAssertionsNumber,
        expectedAssertionsNumberErrorGen,
        isExpectingAssertions,
        isExpectingAssertionsError
      } = test.context._local ? test.context.expect.getState() : getState(globalThis[GLOBAL_EXPECT]);
      if (expectedAssertionsNumber !== null && assertionCalls !== expectedAssertionsNumber)
        throw expectedAssertionsNumberErrorGen();
      if (isExpectingAssertions === true && assertionCalls === 0)
        throw isExpectingAssertionsError;
      test.result.state = "pass";
    } catch (e) {
      test.result.state = "fail";
      test.result.error = processError(e);
    }
    try {
      await callSuiteHook(test.suite, test, "afterEach", [test.context, test.suite]);
      await callCleanupHooks(beforeEachCleanups);
    } catch (e) {
      test.result.state = "fail";
      test.result.error = processError(e);
    }
    if (test.result.state === "pass")
      break;
    updateTask(test);
  }
  if (test.result.state === "fail")
    await Promise.all(((_c = test.onFailed) == null ? void 0 : _c.map((fn) => fn(test.result))) || []);
  if (test.fails) {
    if (test.result.state === "pass") {
      test.result.state = "fail";
      test.result.error = processError(new Error("Expect test to fail"));
    } else {
      test.result.state = "pass";
      test.result.error = void 0;
    }
  }
  if (isBrowser && test.result.error)
    console.error(test.result.error.message, test.result.error.stackStr);
  setCurrentTest(void 0);
  if (isNode) {
    const { getSnapshotClient } = await import('./chunk-runtime-chain.198631fd.js').then(function (n) { return n.r; });
    getSnapshotClient().clearTest();
  }
  test.result.duration = now() - start;
  if (workerState.config.logHeapUsage && isNode)
    test.result.heap = process.memoryUsage().heapUsed;
  workerState.current = void 0;
  updateTask(test);
}
function markTasksAsSkipped(suite) {
  suite.tasks.forEach((t) => {
    t.mode = "skip";
    t.result = { ...t.result, state: "skip" };
    updateTask(t);
    if (t.type === "suite")
      markTasksAsSkipped(t);
  });
}
async function runSuite(suite) {
  var _a;
  if (((_a = suite.result) == null ? void 0 : _a.state) === "fail") {
    markTasksAsSkipped(suite);
    updateTask(suite);
    return;
  }
  const start = now();
  suite.result = {
    state: "run",
    startTime: start
  };
  updateTask(suite);
  const workerState = getWorkerState();
  if (suite.mode === "skip") {
    suite.result.state = "skip";
  } else if (suite.mode === "todo") {
    suite.result.state = "todo";
  } else {
    try {
      const beforeAllCleanups = await callSuiteHook(suite, suite, "beforeAll", [suite]);
      if (isRunningInBenchmark()) {
        await runBenchmarkSuite(suite);
      } else {
        for (let tasksGroup of partitionSuiteChildren(suite)) {
          if (tasksGroup[0].concurrent === true) {
            const mutex = pLimit(workerState.config.maxConcurrency);
            await Promise.all(tasksGroup.map((c) => mutex(() => runSuiteChild(c))));
          } else {
            const { sequence } = workerState.config;
            if (sequence.shuffle || suite.shuffle) {
              const suites = tasksGroup.filter((group) => group.type === "suite");
              const tests = tasksGroup.filter((group) => group.type === "test");
              const groups = shuffle([suites, tests], sequence.seed);
              tasksGroup = groups.flatMap((group) => shuffle(group, sequence.seed));
            }
            for (const c of tasksGroup)
              await runSuiteChild(c);
          }
        }
      }
      await callSuiteHook(suite, suite, "afterAll", [suite]);
      await callCleanupHooks(beforeAllCleanups);
    } catch (e) {
      suite.result.state = "fail";
      suite.result.error = processError(e);
    }
  }
  suite.result.duration = now() - start;
  if (workerState.config.logHeapUsage && isNode)
    suite.result.heap = process.memoryUsage().heapUsed;
  if (suite.mode === "run") {
    if (!hasTests(suite)) {
      suite.result.state = "fail";
      if (!suite.result.error)
        suite.result.error = new Error(`No test found in suite ${suite.name}`);
    } else if (hasFailed(suite)) {
      suite.result.state = "fail";
    } else {
      suite.result.state = "pass";
    }
  }
  updateTask(suite);
}
function createBenchmarkResult(name) {
  return {
    name,
    rank: 0,
    rme: 0,
    samples: []
  };
}
async function runBenchmarkSuite(suite) {
  const { Task, Bench } = await importTinybench();
  const start = performance.now();
  const benchmarkGroup = [];
  const benchmarkSuiteGroup = [];
  for (const task of suite.tasks) {
    if (task.mode !== "run")
      continue;
    if (task.type === "benchmark")
      benchmarkGroup.push(task);
    else if (task.type === "suite")
      benchmarkSuiteGroup.push(task);
  }
  if (benchmarkSuiteGroup.length)
    await Promise.all(benchmarkSuiteGroup.map((subSuite) => runBenchmarkSuite(subSuite)));
  if (benchmarkGroup.length) {
    const defer = createDefer();
    const benchmarkMap = {};
    suite.result = {
      state: "run",
      startTime: start,
      benchmark: createBenchmarkResult(suite.name)
    };
    updateTask(suite);
    benchmarkGroup.forEach((benchmark, idx) => {
      const options = getBenchOptions(benchmark);
      const benchmarkInstance = new Bench(options);
      const benchmarkFn = getFn(benchmark);
      benchmark.result = {
        state: "run",
        startTime: start,
        benchmark: createBenchmarkResult(benchmark.name)
      };
      const id = idx.toString();
      benchmarkMap[id] = benchmark;
      const task = new Task(benchmarkInstance, id, benchmarkFn);
      benchmark.task = task;
      updateTask(benchmark);
    });
    benchmarkGroup.forEach((benchmark) => {
      benchmark.task.addEventListener("complete", (e) => {
        const task = e.task;
        const _benchmark = benchmarkMap[task.name || ""];
        if (_benchmark) {
          const taskRes = task.result;
          const result = _benchmark.result.benchmark;
          Object.assign(result, taskRes);
          updateTask(_benchmark);
        }
      });
      benchmark.task.addEventListener("error", (e) => {
        const task = e.task;
        const _benchmark = benchmarkMap[task.name || ""];
        defer.reject(_benchmark ? task.result.error : e);
      });
    });
    Promise.all(benchmarkGroup.map(async (benchmark) => {
      await benchmark.task.warmup();
      return await new Promise((resolve) => safeSetTimeout(async () => {
        resolve(await benchmark.task.run());
      }));
    })).then((tasks) => {
      suite.result.duration = performance.now() - start;
      suite.result.state = "pass";
      tasks.sort((a, b) => a.result.mean - b.result.mean).forEach((cycle, idx) => {
        const benchmark = benchmarkMap[cycle.name || ""];
        benchmark.result.state = "pass";
        if (benchmark) {
          const result = benchmark.result.benchmark;
          result.rank = Number(idx) + 1;
          updateTask(benchmark);
        }
      });
      updateTask(suite);
      defer.resolve(null);
    });
    await defer;
  }
}
async function runSuiteChild(c) {
  if (c.type === "test")
    return runTest(c);
  else if (c.type === "suite")
    return runSuite(c);
}
async function runSuites(suites) {
  for (const suite of suites)
    await runSuite(suite);
}
async function runFiles(files, config) {
  var _a;
  for (const file of files) {
    if (!file.tasks.length && !config.passWithNoTests) {
      if (!((_a = file.result) == null ? void 0 : _a.error)) {
        file.result = {
          state: "fail",
          error: new Error(`No test suite found in file ${file.filepath}`)
        };
      }
    }
    await runSuite(file);
  }
}
async function startTestsBrowser(paths, config) {
  if (isNode) {
    rpc().onPathsCollected(paths);
  } else {
    const files = await collectTests(paths, config);
    await rpc().onCollected(files);
    await runSuites(files);
    await sendTasksUpdate();
  }
}
async function startTestsNode(paths, config) {
  const files = await collectTests(paths, config);
  rpc().onCollected(files);
  const { getSnapshotClient } = await import('./chunk-runtime-chain.198631fd.js').then(function (n) { return n.r; });
  getSnapshotClient().clear();
  await runFiles(files, config);
  const coverage = await takeCoverageInsideWorker(config.coverage);
  rpc().onAfterSuiteRun({ coverage });
  await getSnapshotClient().saveCurrent();
  await sendTasksUpdate();
}
async function startTests(paths, config) {
  if (config.browser)
    return startTestsBrowser(paths, config);
  else
    return startTestsNode(paths, config);
}
function clearModuleMocks() {
  const { clearMocks, mockReset, restoreMocks, unstubEnvs, unstubGlobals } = getWorkerState().config;
  if (restoreMocks)
    vi.restoreAllMocks();
  else if (mockReset)
    vi.resetAllMocks();
  else if (clearMocks)
    vi.clearAllMocks();
  if (unstubEnvs)
    vi.unstubAllEnvs();
  if (unstubGlobals)
    vi.unstubAllGlobals();
}

export { setupGlobalEnv as a, startTests as s, withEnv as w };
