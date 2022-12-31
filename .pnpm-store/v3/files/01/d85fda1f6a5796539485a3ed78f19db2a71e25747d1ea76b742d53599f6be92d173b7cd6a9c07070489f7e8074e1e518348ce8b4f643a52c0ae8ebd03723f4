import { searchForIcon } from './modern.mjs';
import { loadCollectionFromFS } from './fs.mjs';
import { warnOnce } from './warn.mjs';
import { loadIcon } from './loader.mjs';
import '../svg/build.mjs';
import '../icon/defaults.mjs';
import '../customisations/defaults.mjs';
import '../svg/size.mjs';
import '../icon-set/get-icon.mjs';
import '../icon/merge.mjs';
import '../icon/transformations.mjs';
import '../icon-set/tree.mjs';
import './utils.mjs';
import 'debug';
import 'fs';
import 'local-pkg';
import './install-pkg.mjs';
import '@antfu/install-pkg';
import '@antfu/utils';
import 'kolorist';
import './custom.mjs';
import '../svg/trim.mjs';

const loadNodeIcon = async (collection, icon, options) => {
  let result = await loadIcon(collection, icon, options);
  if (result) {
    return result;
  }
  const iconSet = await loadCollectionFromFS(
    collection,
    options?.autoInstall
  );
  if (iconSet) {
    const ids = [
      icon,
      icon.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
      icon.replace(/([a-z])(\d+)/g, "$1-$2")
    ];
    result = await searchForIcon(iconSet, collection, ids, options);
  }
  if (!result && options?.warn) {
    warnOnce(`failed to load ${options.warn} icon`);
  }
  return result;
};

export { loadNodeIcon };
