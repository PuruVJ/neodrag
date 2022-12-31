/// <reference types="node" resolution-mode="require"/>
/**
 * @param {string} path
 * @param {string|URL} specifier Note: `specifier` is actually optional, not base.
 * @param {URL} [base]
 * @returns {PackageConfig}
 */
export function getPackageConfig(
  path: string,
  specifier: string | URL,
  base?: URL | undefined
): PackageConfig
/**
 * @param {URL} resolved
 * @returns {PackageConfig}
 */
export function getPackageScopeConfig(resolved: URL): PackageConfig
export type ErrnoException = import('./errors.js').ErrnoException
export type PackageType = 'module' | 'commonjs' | 'none'
export type PackageConfig = {
  pjsonPath: string
  exists: boolean
  main: string | undefined
  name: string | undefined
  type: PackageType
  exports: Record<string, unknown> | undefined
  imports: Record<string, unknown> | undefined
}
import {URL} from 'url'
