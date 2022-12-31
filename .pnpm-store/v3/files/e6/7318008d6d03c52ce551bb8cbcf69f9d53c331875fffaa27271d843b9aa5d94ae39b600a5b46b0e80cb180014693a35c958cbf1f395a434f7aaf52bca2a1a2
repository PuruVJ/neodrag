// This wrapper exists because JS in TS can’t export a `@type` of a function.
import type {Options} from './lib/index.js'
import type {Root} from 'hast'
import type {Plugin} from 'unified'
// Note: defining all nodes here, such as with `Root | Element | ...` seems
// to trip TS up.
declare const rehypeStringify: Plugin<[Options?] | Array<void>, Root, string>
export default rehypeStringify
export type {Options}
