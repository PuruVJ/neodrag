import { promises } from 'fs';
import { isPackageExists, resolveModule } from 'local-pkg';
import { tryInstallPkg } from './install-pkg.mjs';
import '@antfu/install-pkg';
import '@antfu/utils';
import 'kolorist';
import './warn.mjs';

const _collections = {};
const isLegacyExists = isPackageExists("@iconify/json");
async function loadCollectionFromFS(name, autoInstall = false) {
  if (!await _collections[name]) {
    _collections[name] = task();
  }
  return _collections[name];
  async function task() {
    let jsonPath = resolveModule(`@iconify-json/${name}/icons.json`);
    if (!jsonPath && isLegacyExists) {
      jsonPath = resolveModule(`@iconify/json/json/${name}.json`);
    }
    if (!jsonPath && !isLegacyExists && autoInstall) {
      await tryInstallPkg(`@iconify-json/${name}`);
      jsonPath = resolveModule(`@iconify-json/${name}/icons.json`);
    }
    let stat;
    try {
      stat = jsonPath ? await promises.lstat(jsonPath) : void 0;
    } catch (err) {
      return void 0;
    }
    if (stat && stat.isFile()) {
      return JSON.parse(
        await promises.readFile(jsonPath, "utf8")
      );
    } else {
      return void 0;
    }
  }
}

export { loadCollectionFromFS };
