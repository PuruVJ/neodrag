/**
 * @typedef {import('mdast').Delete} Delete
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 */

import {containerPhrasing} from 'mdast-util-to-markdown/lib/util/container-phrasing.js'
import {track} from 'mdast-util-to-markdown/lib/util/track.js'

/** @type {FromMarkdownExtension} */
export const gfmStrikethroughFromMarkdown = {
  canContainEols: ['delete'],
  enter: {strikethrough: enterStrikethrough},
  exit: {strikethrough: exitStrikethrough}
}

/**
 * List of constructs that occur in phrasing (paragraphs, headings), but cannot
 * contain strikethroughs. So they sort of cancel each other out.
 *
 * Note: keep in sync with: <https://github.com/syntax-tree/mdast-util-to-markdown/blob/c47743b/lib/unsafe.js#L11>
 */
const constructsWithoutStrikethrough = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe'
]

/** @type {ToMarkdownExtension} */
export const gfmStrikethroughToMarkdown = {
  unsafe: [
    {
      character: '~',
      inConstruct: 'phrasing',
      notInConstruct: constructsWithoutStrikethrough
    }
  ],
  handlers: {delete: handleDelete}
}

handleDelete.peek = peekDelete

/** @type {FromMarkdownHandle} */
function enterStrikethrough(token) {
  this.enter({type: 'delete', children: []}, token)
}

/** @type {FromMarkdownHandle} */
function exitStrikethrough(token) {
  this.exit(token)
}

/**
 * @type {ToMarkdownHandle}
 * @param {Delete} node
 */
function handleDelete(node, _, context, safeOptions) {
  const tracker = track(safeOptions)
  const exit = context.enter('emphasis')
  let value = tracker.move('~~')
  value += containerPhrasing(node, context, {
    ...tracker.current(),
    before: value,
    after: '~'
  })
  value += tracker.move('~~')
  exit()
  return value
}

/** @type {ToMarkdownHandle} */
function peekDelete() {
  return '~'
}
