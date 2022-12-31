'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const fs = require('fs');
const localPkg = require('local-pkg');
const loader_installPkg = require('./install-pkg.cjs');
require('@antfu/install-pkg');
require('@antfu/utils');
require('kolorist');
require('./warn.cjs');

const _collections = {};
const isLegacyExists = localPkg.isPackageExists("@iconify/json");
async function loadCollectionFromFS(name, autoInstall = false) {
  if (!await _collections[name]) {
    _collections[name] = task();
  }
  return _collections[name];
  async function task() {
    let jsonPath = localPkg.resolveModule(`@iconify-json/${name}/icons.json`);
    if (!jsonPath && isLegacyExists) {
      jsonPath = localPkg.resolveModule(`@iconify/json/json/${name}.json`);
    }
    if (!jsonPath && !isLegacyExists && autoInstall) {
      await loader_installPkg.tryInstallPkg(`@iconify-json/${name}`);
      jsonPath = localPkg.resolveModule(`@iconify-json/${name}/icons.json`);
    }
    let stat;
    try {
      stat = jsonPath ? await fs.promises.lstat(jsonPath) : void 0;
    } catch (err) {
      return void 0;
    }
    if (stat && stat.isFile()) {
      return JSON.parse(
        await fs.promises.readFile(jsonPath, "utf8")
      );
    } else {
      return void 0;
    }
  }
}

exports.loadCollectionFromFS = loadCollectionFromFS;
