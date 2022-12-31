/**
 * @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
 * @typedef {import('./syntax.js').Align} Align
 */

const alignment = {
  none: '',
  left: ' align="left"',
  right: ' align="right"',
  center: ' align="center"'
}

/** @type {HtmlExtension} */
export const gfmTableHtml = {
  enter: {
    table(token) {
      /** @type {Array<Align>} */
      // @ts-expect-error Custom.
      const tableAlign = token._align
      this.lineEndingIfNeeded()
      this.tag('<table>')
      this.setData('tableAlign', tableAlign)
    },
    tableBody() {
      // Clear slurping line ending from the delimiter row.
      this.setData('slurpOneLineEnding')
      this.tag('<tbody>')
    },
    tableData() {
      const tableAlign = /** @type {Array<Align>} */ (
        this.getData('tableAlign')
      )
      const tableColumn = /** @type {number} */ (this.getData('tableColumn'))
      const align = alignment[tableAlign[tableColumn]]

      if (align === undefined) {
        // Capture results to ignore them.
        this.buffer()
      } else {
        this.lineEndingIfNeeded()
        this.tag('<td' + align + '>')
      }
    },
    tableHead() {
      this.lineEndingIfNeeded()
      this.tag('<thead>')
    },
    tableHeader() {
      const tableAlign = /** @type {Array<Align>} */ (
        this.getData('tableAlign')
      )
      const tableColumn = /** @type {number} */ (this.getData('tableColumn'))
      const align = alignment[tableAlign[tableColumn]]

      this.lineEndingIfNeeded()
      this.tag('<th' + align + '>')
    },
    tableRow() {
      this.setData('tableColumn', 0)
      this.lineEndingIfNeeded()
      this.tag('<tr>')
    }
  },
  exit: {
    // Overwrite the default code text data handler to unescape escaped pipes when
    // they are in tables.
    codeTextData(token) {
      let value = this.sliceSerialize(token)

      if (this.getData('tableAlign')) {
        value = value.replace(/\\([\\|])/g, replace)
      }

      this.raw(this.encode(value))
    },
    table() {
      this.setData('tableAlign')
      // If there was no table body, make sure the slurping from the delimiter row
      // is cleared.
      this.setData('slurpAllLineEndings')
      this.lineEndingIfNeeded()
      this.tag('</table>')
    },
    tableBody() {
      this.lineEndingIfNeeded()
      this.tag('</tbody>')
    },
    tableData() {
      const tableAlign = /** @type {Array<Align>} */ (
        this.getData('tableAlign')
      )
      const tableColumn = /** @type {number} */ (this.getData('tableColumn'))

      if (tableColumn in tableAlign) {
        this.tag('</td>')
        this.setData('tableColumn', tableColumn + 1)
      } else {
        // Stop capturing.
        this.resume()
      }
    },
    tableHead() {
      this.lineEndingIfNeeded()
      this.tag('</thead>')
      this.setData('slurpOneLineEnding', true)
      // Slurp the line ending from the delimiter row.
    },
    tableHeader() {
      const tableColumn = /** @type {number} */ (this.getData('tableColumn'))
      this.tag('</th>')
      this.setData('tableColumn', tableColumn + 1)
    },
    tableRow() {
      const tableAlign = /** @type {Array<Align>} */ (
        this.getData('tableAlign')
      )
      let tableColumn = /** @type {number} */ (this.getData('tableColumn'))

      while (tableColumn < tableAlign.length) {
        this.lineEndingIfNeeded()
        this.tag('<td' + alignment[tableAlign[tableColumn]] + '></td>')
        tableColumn++
      }

      this.setData('tableColumn', tableColumn)
      this.lineEndingIfNeeded()
      this.tag('</tr>')
    }
  }
}

/**
 * @param {string} $0
 * @param {string} $1
 * @returns {string}
 */
function replace($0, $1) {
  // Pipes work, backslashes don’t (but can’t escape pipes).
  return $1 === '|' ? $1 : $0
}
