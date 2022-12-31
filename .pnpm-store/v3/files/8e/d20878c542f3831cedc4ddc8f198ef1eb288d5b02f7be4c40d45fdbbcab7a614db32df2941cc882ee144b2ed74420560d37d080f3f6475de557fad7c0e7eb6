/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('micromark-util-types').CompileContext} CompileContext
 *
 * @typedef Options
 * @property {string} [clobberPrefix='user-content-']
 *   Prefix to use before the `id` attribute to prevent it from *clobbering*.
 *   attributes.
 *   DOM clobbering is this:
 *
 *   ```html
 *   <p id=x></p>
 *   <script>alert(x)</script>
 *   ```
 *
 *   Elements by their ID are made available in browsers on the `window` object.
 *   Using a prefix prevents this from being a problem.
 * @property {string} [label='Footnotes']
 *   Label to use for the footnotes section.
 *   Affects screen reader users.
 *   Change it if you’re authoring in a different language.
 * @property {string} [backLabel='Back to content']
 *   Label to use from backreferences back to their footnote call.
 *   Affects screen reader users.
 *   Change it if you’re authoring in a different language.
 */

import {ok as assert} from 'uvu/assert'
import {normalizeIdentifier} from 'micromark-util-normalize-identifier'
import {sanitizeUri} from 'micromark-util-sanitize-uri'

const own = {}.hasOwnProperty

/**
 * @param {Options} [options={}]
 * @returns {HtmlExtension}
 */
export function gfmFootnoteHtml(options = {}) {
  const label = options.label || 'Footnotes'
  const backLabel = options.backLabel || 'Back to content'
  const clobberPrefix =
    options.clobberPrefix === undefined || options.clobberPrefix === null
      ? 'user-content-'
      : options.clobberPrefix
  return {
    enter: {
      gfmFootnoteDefinition() {
        const stack = /** @type {Array<boolean>} */ (this.getData('tightStack'))
        stack.push(false)
      },
      gfmFootnoteDefinitionLabelString() {
        this.buffer()
      },
      gfmFootnoteCallString() {
        this.buffer()
      }
    },
    exit: {
      gfmFootnoteDefinition() {
        let definitions = /** @type {Record<string, string>} */ (
          this.getData('gfmFootnoteDefinitions')
        )
        const footnoteStack = /** @type {Array<string>} */ (
          this.getData('gfmFootnoteDefinitionStack')
        )
        const tightStack = /** @type {Array<boolean>} */ (
          this.getData('tightStack')
        )
        const current = footnoteStack.pop()
        const value = this.resume()

        assert(current, 'expected to be in a footnote')

        if (!definitions) {
          this.setData('gfmFootnoteDefinitions', (definitions = {}))
        }

        if (!own.call(definitions, current)) definitions[current] = value

        tightStack.pop()
        this.setData('slurpOneLineEnding', true)
        // “Hack” to prevent a line ending from showing up if we’re in a definition in
        // an empty list item.
        this.setData('lastWasTag')
      },
      gfmFootnoteDefinitionLabelString(token) {
        let footnoteStack = /** @type {Array<string>} */ (
          this.getData('gfmFootnoteDefinitionStack')
        )

        if (!footnoteStack) {
          this.setData('gfmFootnoteDefinitionStack', (footnoteStack = []))
        }

        footnoteStack.push(normalizeIdentifier(this.sliceSerialize(token)))
        this.resume() // Drop the label.
        this.buffer() // Get ready for a value.
      },
      gfmFootnoteCallString(token) {
        let calls = /** @type {Array<string>|undefined} */ (
          this.getData('gfmFootnoteCallOrder')
        )
        let counts = /** @type {Record<string, number>|undefined} */ (
          this.getData('gfmFootnoteCallCounts')
        )
        const id = normalizeIdentifier(this.sliceSerialize(token))
        /** @type {number} */
        let counter

        this.resume()

        if (!calls) this.setData('gfmFootnoteCallOrder', (calls = []))
        if (!counts) this.setData('gfmFootnoteCallCounts', (counts = {}))

        const index = calls.indexOf(id)
        const safeId = sanitizeUri(id.toLowerCase())

        if (index === -1) {
          calls.push(id)
          counts[id] = 1
          counter = calls.length
        } else {
          counts[id]++
          counter = index + 1
        }

        const reuseCounter = counts[id]

        this.tag(
          '<sup><a href="#' +
            clobberPrefix +
            'fn-' +
            safeId +
            '" id="' +
            clobberPrefix +
            'fnref-' +
            safeId +
            (reuseCounter > 1 ? '-' + reuseCounter : '') +
            '" data-footnote-ref="" aria-describedby="footnote-label">' +
            String(counter) +
            '</a></sup>'
        )
      },
      null() {
        const calls = /** @type {Array<string>} */ (
          this.getData('gfmFootnoteCallOrder') || []
        )
        const counts = /** @type {Record<string, number>} */ (
          this.getData('gfmFootnoteCallCounts') || {}
        )
        const definitions = /** @type {Record<string, string>} */ (
          this.getData('gfmFootnoteDefinitions') || {}
        )
        let index = -1

        if (calls.length > 0) {
          this.lineEndingIfNeeded()
          this.tag(
            '<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">'
          )
          this.raw(this.encode(label))
          this.tag('</h2>')
          this.lineEndingIfNeeded()
          this.tag('<ol>')
        }

        while (++index < calls.length) {
          // Called definitions are always defined.
          const id = calls[index]
          const safeId = sanitizeUri(id.toLowerCase())
          let referenceIndex = 0
          /** @type {Array<string>} */
          const references = []

          while (++referenceIndex <= counts[id]) {
            references.push(
              '<a href="#' +
                clobberPrefix +
                'fnref-' +
                safeId +
                (referenceIndex > 1 ? '-' + referenceIndex : '') +
                '" data-footnote-backref="" class="data-footnote-backref" aria-label="' +
                this.encode(backLabel) +
                '">↩' +
                (referenceIndex > 1
                  ? '<sup>' + referenceIndex + '</sup>'
                  : '') +
                '</a>'
            )
          }

          const reference = references.join(' ')
          let injected = false

          this.lineEndingIfNeeded()
          this.tag('<li id="' + clobberPrefix + 'fn-' + safeId + '">')
          this.lineEndingIfNeeded()
          this.tag(
            definitions[id].replace(
              /<\/p>(?:\r?\n|\r)?$/,
              (/** @type {string} */ $0) => {
                injected = true
                return ' ' + reference + $0
              }
            )
          )

          if (!injected) {
            this.lineEndingIfNeeded()
            this.tag(reference)
          }

          this.lineEndingIfNeeded()
          this.tag('</li>')
        }

        if (calls.length > 0) {
          this.lineEndingIfNeeded()
          this.tag('</ol>')
          this.lineEndingIfNeeded()
          this.tag('</section>')
        }
      }
    }
  }
}
