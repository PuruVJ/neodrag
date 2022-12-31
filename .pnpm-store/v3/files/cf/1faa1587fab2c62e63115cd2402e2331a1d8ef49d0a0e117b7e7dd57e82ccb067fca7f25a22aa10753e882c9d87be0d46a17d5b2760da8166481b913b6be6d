'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const loader_modern = require('./modern.cjs');
const loader_fs = require('./fs.cjs');
const loader_warn = require('./warn.cjs');
const loader_loader = require('./loader.cjs');
require('../svg/build.cjs');
require('../icon/defaults.cjs');
require('../customisations/defaults.cjs');
require('../svg/size.cjs');
require('../icon-set/get-icon.cjs');
require('../icon/merge.cjs');
require('../icon/transformations.cjs');
require('../icon-set/tree.cjs');
require('./utils.cjs');
require('debug');
require('fs');
require('local-pkg');
require('./install-pkg.cjs');
require('@antfu/install-pkg');
require('@antfu/utils');
require('kolorist');
require('./custom.cjs');
require('../svg/trim.cjs');

const loadNodeIcon = async (collection, icon, options) => {
  let result = await loader_loader.loadIcon(collection, icon, options);
  if (result) {
    return result;
  }
  const iconSet = await loader_fs.loadCollectionFromFS(
    collection,
    options?.autoInstall
  );
  if (iconSet) {
    const ids = [
      icon,
      icon.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
      icon.replace(/([a-z])(\d+)/g, "$1-$2")
    ];
    result = await loader_modern.searchForIcon(iconSet, collection, ids, options);
  }
  if (!result && options?.warn) {
    loader_warn.warnOnce(`failed to load ${options.warn} icon`);
  }
  return result;
};

exports.loadNodeIcon = loadNodeIcon;
