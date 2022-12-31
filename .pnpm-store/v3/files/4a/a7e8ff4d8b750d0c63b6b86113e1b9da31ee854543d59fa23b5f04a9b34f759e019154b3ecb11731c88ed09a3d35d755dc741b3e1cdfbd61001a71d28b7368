// Manually “tree shaken” from:
// <https://github.com/nodejs/node/blob/3ebe753/lib/internal/modules/esm/package_config.js>
// Last checked on: Nov 23, 2022.

/**
 * @typedef {import('./errors.js').ErrnoException} ErrnoException
 *
 * @typedef {'module'|'commonjs'|'none'} PackageType
 *
 * @typedef PackageConfig
 * @property {string} pjsonPath
 * @property {boolean} exists
 * @property {string|undefined} main
 * @property {string|undefined} name
 * @property {PackageType} type
 * @property {Record<string, unknown>|undefined} exports
 * @property {Record<string, unknown>|undefined} imports
 */

import {URL, fileURLToPath} from 'node:url'
import {codes} from './errors.js'
import packageJsonReader from './package-json-reader.js'

const {ERR_INVALID_PACKAGE_CONFIG} = codes

/** @type {Map<string, PackageConfig>} */
const packageJsonCache = new Map()

/**
 * @param {string} path
 * @param {string|URL} specifier Note: `specifier` is actually optional, not base.
 * @param {URL} [base]
 * @returns {PackageConfig}
 */
export function getPackageConfig(path, specifier, base) {
  const existing = packageJsonCache.get(path)
  if (existing !== undefined) {
    return existing
  }

  const source = packageJsonReader.read(path).string

  if (source === undefined) {
    /** @type {PackageConfig} */
    const packageConfig = {
      pjsonPath: path,
      exists: false,
      main: undefined,
      name: undefined,
      type: 'none',
      exports: undefined,
      imports: undefined
    }
    packageJsonCache.set(path, packageConfig)
    return packageConfig
  }

  /** @type {Record<string, unknown>} */
  let packageJson
  try {
    packageJson = JSON.parse(source)
  } catch (error) {
    const exception = /** @type {ErrnoException} */ (error)

    throw new ERR_INVALID_PACKAGE_CONFIG(
      path,
      (base ? `"${specifier}" from ` : '') + fileURLToPath(base || specifier),
      exception.message
    )
  }

  const {exports, imports, main, name, type} = packageJson

  /** @type {PackageConfig} */
  const packageConfig = {
    pjsonPath: path,
    exists: true,
    main: typeof main === 'string' ? main : undefined,
    name: typeof name === 'string' ? name : undefined,
    type: type === 'module' || type === 'commonjs' ? type : 'none',
    // @ts-expect-error Assume `Record<string, unknown>`.
    exports,
    // @ts-expect-error Assume `Record<string, unknown>`.
    imports: imports && typeof imports === 'object' ? imports : undefined
  }
  packageJsonCache.set(path, packageConfig)
  return packageConfig
}

/**
 * @param {URL} resolved
 * @returns {PackageConfig}
 */
export function getPackageScopeConfig(resolved) {
  let packageJsonUrl = new URL('package.json', resolved)

  while (true) {
    const packageJsonPath = packageJsonUrl.pathname

    if (packageJsonPath.endsWith('node_modules/package.json')) break

    const packageConfig = getPackageConfig(
      fileURLToPath(packageJsonUrl),
      resolved
    )
    if (packageConfig.exists) return packageConfig

    const lastPackageJsonUrl = packageJsonUrl
    packageJsonUrl = new URL('../package.json', packageJsonUrl)

    // Terminates at root where ../package.json equals ../../package.json
    // (can't just check "/package.json" for Windows support).
    if (packageJsonUrl.pathname === lastPackageJsonUrl.pathname) break
  }

  const packageJsonPath = fileURLToPath(packageJsonUrl)
  /** @type {PackageConfig} */
  const packageConfig = {
    pjsonPath: packageJsonPath,
    exists: false,
    main: undefined,
    name: undefined,
    type: 'none',
    exports: undefined,
    imports: undefined
  }
  packageJsonCache.set(packageJsonPath, packageConfig)
  return packageConfig
}
