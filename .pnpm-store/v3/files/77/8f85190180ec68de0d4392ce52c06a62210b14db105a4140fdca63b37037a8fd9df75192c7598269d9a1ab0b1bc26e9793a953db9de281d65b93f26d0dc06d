// Manually “tree shaken” from:
// <https://github.com/nodejs/node/blob/40fa2e9/lib/internal/modules/package_json_reader.js>
// Last checked on: Nov 23, 2022.
// Removed the native dependency.
// Also: no need to cache, we do that in resolve already.

/**
 * @typedef {import('./errors.js').ErrnoException} ErrnoException
 */

import fs from 'node:fs'
import path from 'node:path'

const reader = {read}
export default reader

/**
 * @param {string} jsonPath
 * @returns {{string: string|undefined}}
 */
function read(jsonPath) {
  try {
    const string = fs.readFileSync(
      path.toNamespacedPath(path.join(path.dirname(jsonPath), 'package.json')),
      'utf8'
    )
    return {string}
  } catch (error) {
    const exception = /** @type {ErrnoException} */ (error)

    if (exception.code === 'ENOENT') {
      return {string: undefined}
      // Throw all other errors.
      /* c8 ignore next 4 */
    }

    throw exception
  }
}
