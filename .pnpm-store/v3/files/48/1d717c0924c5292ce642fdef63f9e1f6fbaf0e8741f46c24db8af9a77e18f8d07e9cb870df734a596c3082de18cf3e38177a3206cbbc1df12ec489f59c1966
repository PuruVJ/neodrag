/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Position} Position
 * @typedef {import('unist').Point} Point
 * @typedef {object & {type: string, position?: Position|undefined}} NodeLike
 */

import {stringifyPosition} from 'unist-util-stringify-position'

export class VFileMessage extends Error {
  /**
   * Create a message for `reason` at `place` from `origin`.
   *
   * When an error is passed in as `reason`, the `stack` is copied.
   *
   * @param {string|Error|VFileMessage} reason
   *   Reason for message.
   *   Uses the stack and message of the error if given.
   * @param {Node|NodeLike|Position|Point} [place]
   *   Place at which the message occurred in a file.
   * @param {string} [origin]
   *   Place in code the message originates from (example `'my-package:my-rule-name'`)
   */
  constructor(reason, place, origin) {
    /** @type {[string|null, string|null]} */
    const parts = [null, null]
    /** @type {Position} */
    let position = {
      // @ts-expect-error: we always follows the structure of `position`.
      start: {line: null, column: null},
      // @ts-expect-error: "
      end: {line: null, column: null}
    }

    super()

    if (typeof place === 'string') {
      origin = place
      place = undefined
    }

    if (typeof origin === 'string') {
      const index = origin.indexOf(':')

      if (index === -1) {
        parts[1] = origin
      } else {
        parts[0] = origin.slice(0, index)
        parts[1] = origin.slice(index + 1)
      }
    }

    if (place) {
      // Node.
      if ('type' in place || 'position' in place) {
        if (place.position) {
          // @ts-expect-error: looks like a position.
          position = place.position
        }
      }
      // Position.
      else if ('start' in place || 'end' in place) {
        // @ts-expect-error: looks like a position.
        position = place
      }
      // Point.
      else if ('line' in place || 'column' in place) {
        position.start = place
      }
    }

    // Fields from `Error`
    this.name = stringifyPosition(place) || '1:1'
    /** @type {string} */
    this.message = typeof reason === 'object' ? reason.message : reason
    /** @type {string} */
    this.stack = ''

    if (typeof reason === 'object' && reason.stack) {
      this.stack = reason.stack
    }

    /**
     * Reason for message.
     *
     * @type {string}
     */
    this.reason = this.message

    /* eslint-disable no-unused-expressions */
    /**
     * Whether this is a fatal problem that marks an associated file as no
     * longer processable.
     * If `true`, marks associated file as no longer processable.
     * If `false`, necessitates a (potential) change.
     * The value can also be `null` or `undefined`, for things that might not
     * need changing.
     *
     * @type {boolean?}
     */
    this.fatal

    /**
     * Starting line of error.
     *
     * @type {number?}
     */
    this.line = position.start.line

    /**
     * Starting column of error.
     *
     * @type {number?}
     */
    this.column = position.start.column

    /**
     * Full range information, when available.
     * Has `start` and `end` fields, both set to an object with `line` and
     * `column`, set to `number?`.
     *
     * @type {Position?}
     */
    this.position = position

    /**
     * Namespace of warning (example: `'my-package'`).
     *
     * @type {string?}
     */
    this.source = parts[0]

    /**
     * Category of message (example: `'my-rule-name'`).
     *
     * @type {string?}
     */
    this.ruleId = parts[1]

    /**
     * Path of a file (used throughout the VFile ecosystem).
     *
     * @type {string?}
     */
    this.file

    // The following fields are “well known”.
    // Not standard.
    // Feel free to add other non-standard fields to your messages.

    /**
     * Specify the source value that’s being reported, which is deemed
     * incorrect.
     *
     * @type {string?}
     */
    this.actual

    /**
     * Suggest values that should be used instead of `actual`, one or more
     * values that are deemed as acceptable.
     *
     * @type {Array<string>?}
     */
    this.expected

    /**
     * Link to documentation for the message.
     *
     * @type {string?}
     */
    this.url

    /**
     * Long form description of the message (supported by `vfile-reporter`).
     *
     * @type {string?}
     */
    this.note
    /* eslint-enable no-unused-expressions */
  }
}

VFileMessage.prototype.file = ''
VFileMessage.prototype.name = ''
VFileMessage.prototype.reason = ''
VFileMessage.prototype.message = ''
VFileMessage.prototype.stack = ''
VFileMessage.prototype.fatal = null
VFileMessage.prototype.column = null
VFileMessage.prototype.line = null
VFileMessage.prototype.source = null
VFileMessage.prototype.ruleId = null
VFileMessage.prototype.position = null
