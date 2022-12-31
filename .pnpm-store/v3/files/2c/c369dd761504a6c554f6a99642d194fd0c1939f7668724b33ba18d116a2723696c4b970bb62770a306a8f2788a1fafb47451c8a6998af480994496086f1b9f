'use strict';

const context = require('./shared/unimport.50fa89e4.cjs');
const vueTemplate = require('./shared/unimport.7b88c06e.cjs');
require('fs');
require('fast-glob');
require('pathe');
require('mlly');
require('scule');
require('local-pkg');
require('os');
require('pkg-types');
require('magic-string');
require('strip-literal');

async function installGlobalAutoImports(imports, options = {}) {
  const {
    globalObject = globalThis,
    overrides = false
  } = options;
  imports = Array.isArray(imports) ? imports : await imports.getImports();
  await Promise.all(
    imports.map(async (i) => {
      if (i.disabled) {
        return;
      }
      const as = i.as || i.name;
      if (overrides || !(as in globalObject)) {
        const module = await import(i.from);
        globalObject[as] = module[i.name];
      }
    })
  );
  return globalObject;
}

exports.builtinPresets = context.builtinPresets;
exports.createUnimport = context.createUnimport;
exports.resolveBuiltinPresets = context.resolveBuiltinPresets;
exports.resolvePreset = context.resolvePreset;
exports.scanDirExports = context.scanDirExports;
exports.scanExports = context.scanExports;
exports.addImportToCode = vueTemplate.addImportToCode;
exports.dedupeImports = vueTemplate.dedupeImports;
exports.defineUnimportPreset = vueTemplate.defineUnimportPreset;
exports.excludeRE = vueTemplate.excludeRE;
exports.getMagicString = vueTemplate.getMagicString;
exports.getString = vueTemplate.getString;
exports.importAsRE = vueTemplate.importAsRE;
exports.matchRE = vueTemplate.matchRE;
exports.normalizeImports = vueTemplate.normalizeImports;
exports.resolveIdAbsolute = vueTemplate.resolveIdAbsolute;
exports.separatorRE = vueTemplate.separatorRE;
exports.stripCommentsAndStrings = vueTemplate.stripCommentsAndStrings;
exports.toExports = vueTemplate.toExports;
exports.toImports = vueTemplate.toImports;
exports.toTypeDeclarationFile = vueTemplate.toTypeDeclarationFile;
exports.toTypeDeclarationItems = vueTemplate.toTypeDeclarationItems;
exports.installGlobalAutoImports = installGlobalAutoImports;
