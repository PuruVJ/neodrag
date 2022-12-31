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
  constructor(
    reason: string | Error | VFileMessage,
    place?:
      | import('unist').Node<import('unist').Data>
      | import('unist').Position
      | import('unist').Point
      | NodeLike
      | undefined,
    origin?: string | undefined
  )
  /** @type {string} */
  stack: string
  /**
   * Reason for message.
   *
   * @type {string}
   */
  reason: string
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
  fatal: boolean | null
  /**
   * Starting line of error.
   *
   * @type {number?}
   */
  line: number | null
  /**
   * Starting column of error.
   *
   * @type {number?}
   */
  column: number | null
  /**
   * Full range information, when available.
   * Has `start` and `end` fields, both set to an object with `line` and
   * `column`, set to `number?`.
   *
   * @type {Position?}
   */
  position: Position | null
  /**
   * Namespace of warning (example: `'my-package'`).
   *
   * @type {string?}
   */
  source: string | null
  /**
   * Category of message (example: `'my-rule-name'`).
   *
   * @type {string?}
   */
  ruleId: string | null
  /**
   * Path of a file (used throughout the VFile ecosystem).
   *
   * @type {string?}
   */
  file: string | null
  /**
   * Specify the source value that’s being reported, which is deemed
   * incorrect.
   *
   * @type {string?}
   */
  actual: string | null
  /**
   * Suggest values that should be used instead of `actual`, one or more
   * values that are deemed as acceptable.
   *
   * @type {Array<string>?}
   */
  expected: Array<string> | null
  /**
   * Link to documentation for the message.
   *
   * @type {string?}
   */
  url: string | null
  /**
   * Long form description of the message (supported by `vfile-reporter`).
   *
   * @type {string?}
   */
  note: string | null
}
export type Node = import('unist').Node
export type Position = import('unist').Position
export type Point = import('unist').Point
export type NodeLike = object & {
  type: string
  position?: Position | undefined
}
