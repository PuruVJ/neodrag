/// <reference types="node" resolution-mode="require"/>
/**
 * @param {URL} url
 * @returns {PackageType}
 */
export function getPackageType(url: URL): PackageType
/**
 * The “Resolver Algorithm Specification” as detailed in the Node docs (which is
 * sync and slightly lower-level than `resolve`).
 *
 * @param {string} specifier
 *   `/example.js`, `./example.js`, `../example.js`, `some-package`, `fs`, etc.
 * @param {URL} base
 *   Full URL (to a file) that `specifier` is resolved relative from.
 * @param {Set<string>} [conditions]
 *   Conditions.
 * @param {boolean} [preserveSymlinks]
 *   Keep symlinks instead of resolving them.
 * @returns {URL}
 *   A URL object to the found thing.
 */
export function moduleResolve(
  specifier: string,
  base: URL,
  conditions?: Set<string> | undefined,
  preserveSymlinks?: boolean | undefined
): URL
/**
 * @param {string} specifier
 * @param {{parentURL?: string, conditions?: Array<string>}} context
 * @returns {{url: string, format?: string|null}}
 */
export function defaultResolve(
  specifier: string,
  context?: {
    parentURL?: string
    conditions?: Array<string>
  }
): {
  url: string
  format?: string | null
}
export type ErrnoException = import('./errors.js').ErrnoException
export type PackageConfig = import('./package-config.js').PackageConfig
export type PackageType = import('./package-config.js').PackageType
import {URL} from 'url'
