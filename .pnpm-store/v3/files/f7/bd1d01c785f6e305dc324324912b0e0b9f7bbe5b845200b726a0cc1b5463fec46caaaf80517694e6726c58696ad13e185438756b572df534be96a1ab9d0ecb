export class VFile {
  /**
   * Create a new virtual file.
   *
   * If `options` is `string` or `Buffer`, it’s treated as `{value: options}`.
   * If `options` is a `URL`, it’s treated as `{path: options}`.
   * If `options` is a `VFile`, shallow copies its data over to the new file.
   * All fields in `options` are set on the newly created `VFile`.
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * It’s not possible to set either `dirname` or `extname` without setting
   * either `history`, `path`, `basename`, or `stem` as well.
   *
   * @param {Compatible} [value]
   */
  constructor(value?: Compatible | undefined)
  /**
   * Place to store custom information (default: `{}`).
   * It’s OK to store custom data directly on the file but moving it to
   * `data` is recommended.
   * @type {Data}
   */
  data: Data
  /**
   * List of messages associated with the file.
   * @type {Array<VFileMessage>}
   */
  messages: Array<VFileMessage>
  /**
   * List of filepaths the file moved between.
   * The first is the original path and the last is the current path.
   * @type {Array<string>}
   */
  history: Array<string>
  /**
   * Base of `path` (default: `process.cwd()` or `'/'` in browsers).
   * @type {string}
   */
  cwd: string
  /**
   * Raw value.
   * @type {Value}
   */
  value: Value
  /**
   * Whether a file was saved to disk.
   * This is used by vfile reporters.
   * @type {boolean}
   */
  stored: boolean
  /**
   * Sometimes files have a non-string, compiled, representation.
   * This can be stored in the `result` field.
   * One example is when turning markdown into React nodes.
   * This is used by unified to store non-string results.
   * @type {unknown}
   */
  result: unknown
  /**
   * Sometimes files have a source map associated with them.
   * This can be stored in the `map` field.
   * This should be a `Map` type, which is equivalent to the `RawSourceMap`
   * type from the `source-map` module.
   * @type {Map|undefined}
   */
  map: Map | undefined
  /**
   * Set the full path (example: `'~/index.min.js'`).
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   * @param {string|URL} path
   */
  set path(arg: string)
  /**
   * Get the full path (example: `'~/index.min.js'`).
   * @returns {string}
   */
  get path(): string
  /**
   * Set the parent path (example: `'~'`).
   * Cannot be set if there’s no `path` yet.
   */
  set dirname(arg: string | undefined)
  /**
   * Get the parent path (example: `'~'`).
   */
  get dirname(): string | undefined
  /**
   * Set basename (including extname) (`'index.min.js'`).
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set basename(arg: string | undefined)
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   */
  get basename(): string | undefined
  /**
   * Set the extname (including dot) (example: `'.js'`).
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   */
  set extname(arg: string | undefined)
  /**
   * Get the extname (including dot) (example: `'.js'`).
   */
  get extname(): string | undefined
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set stem(arg: string | undefined)
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   */
  get stem(): string | undefined
  /**
   * Serialize the file.
   *
   * @param {BufferEncoding} [encoding='utf8']
   *   When `value` is a `Buffer`, `encoding` is a character encoding to
   *   understand it as (default: `'utf8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(encoding?: BufferEncoding | undefined): string
  /**
   * Constructs a new `VFileMessage`, where `fatal` is set to `false`, and
   * associates it with the file by adding it to `vfile.messages` and setting
   * `message.file` to the current filepath.
   *
   * @param {string|Error|VFileMessage} reason
   *   Human readable reason for the message, uses the stack and message of the error if given.
   * @param {Node|NodeLike|Position|Point} [place]
   *   Place where the message occurred in the file.
   * @param {string} [origin]
   *   Computer readable reason for the message
   * @returns {VFileMessage}
   *   Message.
   */
  message(
    reason: string | Error | VFileMessage,
    place?:
      | import('unist').Node<import('unist').Data>
      | import('unist').Position
      | import('unist').Point
      | NodeLike
      | undefined,
    origin?: string | undefined
  ): VFileMessage
  /**
   * Like `VFile#message()`, but associates an informational message where
   * `fatal` is set to `null`.
   *
   * @param {string|Error|VFileMessage} reason
   *   Human readable reason for the message, uses the stack and message of the error if given.
   * @param {Node|NodeLike|Position|Point} [place]
   *   Place where the message occurred in the file.
   * @param {string} [origin]
   *   Computer readable reason for the message
   * @returns {VFileMessage}
   *   Message.
   */
  info(
    reason: string | Error | VFileMessage,
    place?:
      | import('unist').Node<import('unist').Data>
      | import('unist').Position
      | import('unist').Point
      | NodeLike
      | undefined,
    origin?: string | undefined
  ): VFileMessage
  /**
   * Like `VFile#message()`, but associates a fatal message where `fatal` is
   * set to `true`, and then immediately throws it.
   *
   * > 👉 **Note**: a fatal error means that a file is no longer processable.
   *
   * @param {string|Error|VFileMessage} reason
   *   Human readable reason for the message, uses the stack and message of the error if given.
   * @param {Node|NodeLike|Position|Point} [place]
   *   Place where the message occurred in the file.
   * @param {string} [origin]
   *   Computer readable reason for the message
   * @returns {never}
   *   Message.
   */
  fail(
    reason: string | Error | VFileMessage,
    place?:
      | import('unist').Node<import('unist').Data>
      | import('unist').Position
      | import('unist').Point
      | NodeLike
      | undefined,
    origin?: string | undefined
  ): never
}
export type Node = import('unist').Node
export type Position = import('unist').Position
export type Point = import('unist').Point
export type NodeLike = Record<string, unknown> & {
  type: string
  position?: Position | undefined
}
export type URL = import('./minurl.shared.js').URL
export type Data = import('../index.js').Data
export type Value = import('../index.js').Value
/**
 * Encodings supported by the buffer class.
 * This is a copy of the typing from Node, copied to prevent Node globals from
 * being needed.
 * Copied from: <https://github.com/DefinitelyTyped/DefinitelyTyped/blob/90a4ec8/types/node/buffer.d.ts#L170>
 */
export type BufferEncoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex'
/**
 * Things that can be passed to the constructor.
 */
export type Compatible = Value | Options | VFile | URL
export type VFileCoreOptions = {
  value?: import('../index.js').Value | undefined
  cwd?: string | undefined
  history?: string[] | undefined
  path?: string | import('./minurl.shared.js').URL | undefined
  basename?: string | undefined
  stem?: string | undefined
  extname?: string | undefined
  dirname?: string | undefined
  data?: import('../index.js').Data | undefined
}
/**
 * Raw source map, see:
 * <https://github.com/mozilla/source-map/blob/58819f0/source-map.d.ts#L15-L23>.
 */
export type Map = {
  version: number
  sources: Array<string>
  names: Array<string>
  sourceRoot?: string | undefined
  sourcesContent?: Array<string> | undefined
  mappings: string
  file: string
}
/**
 * Configuration: a bunch of keys that will be shallow copied over to the new
 * file.
 */
export type Options = {
  [key: string]: unknown
} & VFileCoreOptions
export type ReporterSettings = Record<string, unknown>
export type Reporter = <T = ReporterSettings>(
  files: Array<VFile>,
  options: T
) => string
import {VFileMessage} from 'vfile-message'
