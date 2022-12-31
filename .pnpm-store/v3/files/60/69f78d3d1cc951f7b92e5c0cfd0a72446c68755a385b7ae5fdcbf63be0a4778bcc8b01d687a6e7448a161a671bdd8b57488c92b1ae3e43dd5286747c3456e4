/**
 * @typedef {import('./lib/errors.js').ErrnoException} ErrnoException
 */

import {defaultResolve} from './lib/resolve.js'

/**
 * Match `import.meta.resolve` except that `parent` is required (you can pass
 * `import.meta.url`).
 *
 * @param {string} specifier
 *   The module specifier to resolve relative to parent
 *   (`/example.js`, `./example.js`, `../example.js`, `some-package`, `fs`,
 *   etc).
 * @param {string} parent
 *   The absolute parent module URL to resolve from.
 *   You should pass `import.meta.url` or something else.
 * @returns {Promise<string>}
 *   Returns a promise that resolves to a full `file:`, `data:`, or `node:` URL
 *   to the found thing.
 */
export async function resolve(specifier, parent) {
  if (!parent) {
    throw new Error(
      'Please pass `parent`: `import-meta-resolve` cannot ponyfill that'
    )
  }

  try {
    return defaultResolve(specifier, {parentURL: parent}).url
  } catch (error) {
    const exception = /** @type {ErrnoException} */ (error)

    return exception.code === 'ERR_UNSUPPORTED_DIR_IMPORT' &&
      typeof exception.url === 'string'
      ? exception.url
      : Promise.reject(error)
  }
}

export {moduleResolve} from './lib/resolve.js'
