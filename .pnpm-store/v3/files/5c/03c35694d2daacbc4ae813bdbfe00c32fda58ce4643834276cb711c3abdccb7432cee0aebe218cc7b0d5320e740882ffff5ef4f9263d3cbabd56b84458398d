import { b as resolve, e as distDir } from './chunk-utils-env.4afc6329.js';
import { c as createBirpc } from './vendor-index.783e7f3e.js';
import { workerId } from 'tinypool';
import { ModuleCacheMap } from 'vite-node/client';
import { g as getWorkerState } from './chunk-typecheck-constants.e478eb98.js';
import { e as executeInViteNode } from './chunk-runtime-mocker.03096876.js';
import { r as rpc } from './chunk-runtime-rpc.503623e9.js';
import { p as processError } from './chunk-runtime-error.12631a44.js';
import 'tty';
import 'node:url';
import 'path';
import 'node:path';
import 'local-pkg';
import 'vite-node/utils';
import 'vite';
import './vendor-index.2e96c50b.js';
import 'acorn';
import 'node:module';
import 'node:fs';
import 'url';
import 'fs';
import 'module';
import 'assert';
import 'util';
import './chunk-utils-timers.54caa12a.js';
import 'chai';

let _viteNode;
const moduleCache = new ModuleCacheMap();
const mockMap = /* @__PURE__ */ new Map();
async function startViteNode(ctx) {
  if (_viteNode)
    return _viteNode;
  const processExit = process.exit;
  process.on("beforeExit", (code) => {
    rpc().onWorkerExit(code);
  });
  process.exit = (code = process.exitCode || 0) => {
    rpc().onWorkerExit(code);
    return processExit(code);
  };
  process.on("unhandledRejection", (err) => {
    rpc().onUnhandledRejection(processError(err));
  });
  const { config } = ctx;
  const { run: run2 } = (await executeInViteNode({
    files: [
      resolve(distDir, "entry.js")
    ],
    fetchModule(id) {
      return rpc().fetch(id);
    },
    resolveId(id, importer) {
      return rpc().resolveId(id, importer);
    },
    moduleCache,
    mockMap,
    interopDefault: config.deps.interopDefault,
    root: config.root,
    base: config.base
  }))[0];
  _viteNode = { run: run2 };
  return _viteNode;
}
function init(ctx) {
  if (typeof __vitest_worker__ !== "undefined" && ctx.config.threads && ctx.config.isolate)
    throw new Error(`worker for ${ctx.files.join(",")} already initialized by ${getWorkerState().ctx.files.join(",")}. This is probably an internal bug of Vitest.`);
  const { config, port, workerId: workerId$1 } = ctx;
  process.env.VITEST_WORKER_ID = String(workerId$1);
  process.env.VITEST_POOL_ID = String(workerId);
  globalThis.__vitest_environment__ = config.environment;
  globalThis.__vitest_worker__ = {
    ctx,
    moduleCache,
    config,
    mockMap,
    rpc: createBirpc(
      {},
      {
        eventNames: ["onUserConsoleLog", "onFinished", "onCollected", "onWorkerExit"],
        post(v) {
          port.postMessage(v);
        },
        on(fn) {
          port.addListener("message", fn);
        }
      }
    )
  };
  if (ctx.invalidates) {
    ctx.invalidates.forEach((fsPath) => {
      moduleCache.delete(fsPath);
      moduleCache.delete(`mock:${fsPath}`);
    });
  }
  ctx.files.forEach((i) => moduleCache.delete(i));
}
async function run(ctx) {
  init(ctx);
  const { run: run2 } = await startViteNode(ctx);
  return run2(ctx.files, ctx.config);
}

export { run };
