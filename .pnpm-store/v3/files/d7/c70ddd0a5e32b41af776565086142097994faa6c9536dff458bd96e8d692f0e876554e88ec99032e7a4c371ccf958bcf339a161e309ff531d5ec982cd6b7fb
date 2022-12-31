/**
 * @typedef {import('micromark-util-types').Extension} Extension
 * @typedef {import('micromark-util-types').Resolver} Resolver
 * @typedef {import('micromark-util-types').Tokenizer} Tokenizer
 * @typedef {import('micromark-util-types').State} State
 * @typedef {import('micromark-util-types').Token} Token
 */

/**
 * @typedef {'left'|'center'|'right'|'none'} Align
 */
import {factorySpace} from 'micromark-factory-space'
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace
} from 'micromark-util-character'

/** @type {Extension} */
export const gfmTable = {
  flow: {
    null: {
      tokenize: tokenizeTable,
      resolve: resolveTable
    }
  }
}
const nextPrefixedOrBlank = {
  tokenize: tokenizeNextPrefixedOrBlank,
  partial: true
}
/** @type {Resolver} */

function resolveTable(events, context) {
  let index = -1
  /** @type {boolean|undefined} */

  let inHead
  /** @type {boolean|undefined} */

  let inDelimiterRow
  /** @type {boolean|undefined} */

  let inRow
  /** @type {number|undefined} */

  let contentStart
  /** @type {number|undefined} */

  let contentEnd
  /** @type {number|undefined} */

  let cellStart
  /** @type {boolean|undefined} */

  let seenCellInRow

  while (++index < events.length) {
    const token = events[index][1]

    if (inRow) {
      if (token.type === 'temporaryTableCellContent') {
        contentStart = contentStart || index
        contentEnd = index
      }

      if (
        // Combine separate content parts into one.
        (token.type === 'tableCellDivider' || token.type === 'tableRow') &&
        contentEnd
      ) {
        const content = {
          type: 'tableContent',
          start: events[contentStart][1].start,
          end: events[contentEnd][1].end
        }
        /** @type {Token} */

        const text = {
          type: 'chunkText',
          start: content.start,
          end: content.end,
          // @ts-expect-error It’s fine.
          contentType: 'text'
        }
        events.splice(
          contentStart,
          contentEnd - contentStart + 1,
          ['enter', content, context],
          ['enter', text, context],
          ['exit', text, context],
          ['exit', content, context]
        )
        index -= contentEnd - contentStart - 3
        contentStart = undefined
        contentEnd = undefined
      }
    }

    if (
      events[index][0] === 'exit' &&
      cellStart !== undefined &&
      cellStart + (seenCellInRow ? 0 : 1) < index &&
      (token.type === 'tableCellDivider' ||
        (token.type === 'tableRow' &&
          (cellStart + 3 < index ||
            events[cellStart][1].type !== 'whitespace')))
    ) {
      const cell = {
        type: inDelimiterRow
          ? 'tableDelimiter'
          : inHead
          ? 'tableHeader'
          : 'tableData',
        start: events[cellStart][1].start,
        end: events[index][1].end
      }
      events.splice(index + (token.type === 'tableCellDivider' ? 1 : 0), 0, [
        'exit',
        cell,
        context
      ])
      events.splice(cellStart, 0, ['enter', cell, context])
      index += 2
      cellStart = index + 1
      seenCellInRow = true
    }

    if (token.type === 'tableRow') {
      inRow = events[index][0] === 'enter'

      if (inRow) {
        cellStart = index + 1
        seenCellInRow = false
      }
    }

    if (token.type === 'tableDelimiterRow') {
      inDelimiterRow = events[index][0] === 'enter'

      if (inDelimiterRow) {
        cellStart = index + 1
        seenCellInRow = false
      }
    }

    if (token.type === 'tableHead') {
      inHead = events[index][0] === 'enter'
    }
  }

  return events
}
/** @type {Tokenizer} */

function tokenizeTable(effects, ok, nok) {
  const self = this
  /** @type {Array<Align>} */

  const align = []
  let tableHeaderCount = 0
  /** @type {boolean|undefined} */

  let seenDelimiter
  /** @type {boolean|undefined} */

  let hasDash
  return start
  /** @type {State} */

  function start(code) {
    // @ts-expect-error Custom.
    effects.enter('table')._align = align
    effects.enter('tableHead')
    effects.enter('tableRow') // If we start with a pipe, we open a cell marker.

    if (code === 124) {
      return cellDividerHead(code)
    }

    tableHeaderCount++
    effects.enter('temporaryTableCellContent') // Can’t be space or eols at the start of a construct, so we’re in a cell.

    return inCellContentHead(code)
  }
  /** @type {State} */

  function cellDividerHead(code) {
    effects.enter('tableCellDivider')
    effects.consume(code)
    effects.exit('tableCellDivider')
    seenDelimiter = true
    return cellBreakHead
  }
  /** @type {State} */

  function cellBreakHead(code) {
    if (code === null || markdownLineEnding(code)) {
      return atRowEndHead(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceHead
    }

    if (seenDelimiter) {
      seenDelimiter = undefined
      tableHeaderCount++
    }

    if (code === 124) {
      return cellDividerHead(code)
    } // Anything else is cell content.

    effects.enter('temporaryTableCellContent')
    return inCellContentHead(code)
  }
  /** @type {State} */

  function inWhitespaceHead(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return inWhitespaceHead
    }

    effects.exit('whitespace')
    return cellBreakHead(code)
  }
  /** @type {State} */

  function inCellContentHead(code) {
    // EOF, whitespace, pipe
    if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
      effects.exit('temporaryTableCellContent')
      return cellBreakHead(code)
    }

    effects.consume(code)
    return code === 92 ? inCellContentEscapeHead : inCellContentHead
  }
  /** @type {State} */

  function inCellContentEscapeHead(code) {
    if (code === 92 || code === 124) {
      effects.consume(code)
      return inCellContentHead
    } // Anything else.

    return inCellContentHead(code)
  }
  /** @type {State} */

  function atRowEndHead(code) {
    if (code === null) {
      return nok(code)
    }

    effects.exit('tableRow')
    effects.exit('tableHead')
    const originalInterrupt = self.interrupt
    self.interrupt = true
    return effects.attempt(
      {
        tokenize: tokenizeRowEnd,
        partial: true
      },
      function (code) {
        self.interrupt = originalInterrupt
        effects.enter('tableDelimiterRow')
        return atDelimiterRowBreak(code)
      },
      function (code) {
        self.interrupt = originalInterrupt
        return nok(code)
      }
    )(code)
  }
  /** @type {State} */

  function atDelimiterRowBreak(code) {
    if (code === null || markdownLineEnding(code)) {
      return rowEndDelimiter(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceDelimiter
    }

    if (code === 45) {
      effects.enter('tableDelimiterFiller')
      effects.consume(code)
      hasDash = true
      align.push('none')
      return inFillerDelimiter
    }

    if (code === 58) {
      effects.enter('tableDelimiterAlignment')
      effects.consume(code)
      effects.exit('tableDelimiterAlignment')
      align.push('left')
      return afterLeftAlignment
    } // If we start with a pipe, we open a cell marker.

    if (code === 124) {
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      return atDelimiterRowBreak
    }

    return nok(code)
  }
  /** @type {State} */

  function inWhitespaceDelimiter(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return inWhitespaceDelimiter
    }

    effects.exit('whitespace')
    return atDelimiterRowBreak(code)
  }
  /** @type {State} */

  function inFillerDelimiter(code) {
    if (code === 45) {
      effects.consume(code)
      return inFillerDelimiter
    }

    effects.exit('tableDelimiterFiller')

    if (code === 58) {
      effects.enter('tableDelimiterAlignment')
      effects.consume(code)
      effects.exit('tableDelimiterAlignment')
      align[align.length - 1] =
        align[align.length - 1] === 'left' ? 'center' : 'right'
      return afterRightAlignment
    }

    return atDelimiterRowBreak(code)
  }
  /** @type {State} */

  function afterLeftAlignment(code) {
    if (code === 45) {
      effects.enter('tableDelimiterFiller')
      effects.consume(code)
      hasDash = true
      return inFillerDelimiter
    } // Anything else is not ok.

    return nok(code)
  }
  /** @type {State} */

  function afterRightAlignment(code) {
    if (code === null || markdownLineEnding(code)) {
      return rowEndDelimiter(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceDelimiter
    } // `|`

    if (code === 124) {
      effects.enter('tableCellDivider')
      effects.consume(code)
      effects.exit('tableCellDivider')
      return atDelimiterRowBreak
    }

    return nok(code)
  }
  /** @type {State} */

  function rowEndDelimiter(code) {
    effects.exit('tableDelimiterRow') // Exit if there was no dash at all, or if the header cell count is not the
    // delimiter cell count.

    if (!hasDash || tableHeaderCount !== align.length) {
      return nok(code)
    }

    if (code === null) {
      return tableClose(code)
    }

    return effects.check(
      nextPrefixedOrBlank,
      tableClose,
      effects.attempt(
        {
          tokenize: tokenizeRowEnd,
          partial: true
        },
        factorySpace(effects, bodyStart, 'linePrefix', 4),
        tableClose
      )
    )(code)
  }
  /** @type {State} */

  function tableClose(code) {
    effects.exit('table')
    return ok(code)
  }
  /** @type {State} */

  function bodyStart(code) {
    effects.enter('tableBody')
    return rowStartBody(code)
  }
  /** @type {State} */

  function rowStartBody(code) {
    effects.enter('tableRow') // If we start with a pipe, we open a cell marker.

    if (code === 124) {
      return cellDividerBody(code)
    }

    effects.enter('temporaryTableCellContent') // Can’t be space or eols at the start of a construct, so we’re in a cell.

    return inCellContentBody(code)
  }
  /** @type {State} */

  function cellDividerBody(code) {
    effects.enter('tableCellDivider')
    effects.consume(code)
    effects.exit('tableCellDivider')
    return cellBreakBody
  }
  /** @type {State} */

  function cellBreakBody(code) {
    if (code === null || markdownLineEnding(code)) {
      return atRowEndBody(code)
    }

    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return inWhitespaceBody
    } // `|`

    if (code === 124) {
      return cellDividerBody(code)
    } // Anything else is cell content.

    effects.enter('temporaryTableCellContent')
    return inCellContentBody(code)
  }
  /** @type {State} */

  function inWhitespaceBody(code) {
    if (markdownSpace(code)) {
      effects.consume(code)
      return inWhitespaceBody
    }

    effects.exit('whitespace')
    return cellBreakBody(code)
  }
  /** @type {State} */

  function inCellContentBody(code) {
    // EOF, whitespace, pipe
    if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
      effects.exit('temporaryTableCellContent')
      return cellBreakBody(code)
    }

    effects.consume(code)
    return code === 92 ? inCellContentEscapeBody : inCellContentBody
  }
  /** @type {State} */

  function inCellContentEscapeBody(code) {
    if (code === 92 || code === 124) {
      effects.consume(code)
      return inCellContentBody
    } // Anything else.

    return inCellContentBody(code)
  }
  /** @type {State} */

  function atRowEndBody(code) {
    effects.exit('tableRow')

    if (code === null) {
      return tableBodyClose(code)
    }

    return effects.check(
      nextPrefixedOrBlank,
      tableBodyClose,
      effects.attempt(
        {
          tokenize: tokenizeRowEnd,
          partial: true
        },
        factorySpace(effects, rowStartBody, 'linePrefix', 4),
        tableBodyClose
      )
    )(code)
  }
  /** @type {State} */

  function tableBodyClose(code) {
    effects.exit('tableBody')
    return tableClose(code)
  }
  /** @type {Tokenizer} */

  function tokenizeRowEnd(effects, ok, nok) {
    return start
    /** @type {State} */

    function start(code) {
      effects.enter('lineEnding')
      effects.consume(code)
      effects.exit('lineEnding')
      return factorySpace(effects, prefixed, 'linePrefix')
    }
    /** @type {State} */

    function prefixed(code) {
      // Blank or interrupting line.
      if (
        self.parser.lazy[self.now().line] ||
        code === null ||
        markdownLineEnding(code)
      ) {
        return nok(code)
      }

      const tail = self.events[self.events.length - 1] // Indented code can interrupt delimiter and body rows.

      if (
        !self.parser.constructs.disable.null.includes('codeIndented') &&
        tail &&
        tail[1].type === 'linePrefix' &&
        tail[2].sliceSerialize(tail[1], true).length >= 4
      ) {
        return nok(code)
      }

      self._gfmTableDynamicInterruptHack = true
      return effects.check(
        self.parser.constructs.flow,
        function (code) {
          self._gfmTableDynamicInterruptHack = false
          return nok(code)
        },
        function (code) {
          self._gfmTableDynamicInterruptHack = false
          return ok(code)
        }
      )(code)
    }
  }
}
/** @type {Tokenizer} */

function tokenizeNextPrefixedOrBlank(effects, ok, nok) {
  let size = 0
  return start
  /** @type {State} */

  function start(code) {
    // This is a check, so we don’t care about tokens, but we open a bogus one
    // so we’re valid.
    effects.enter('check') // EOL.

    effects.consume(code)
    return whitespace
  }
  /** @type {State} */

  function whitespace(code) {
    if (code === -1 || code === 32) {
      effects.consume(code)
      size++
      return size === 4 ? ok : whitespace
    } // EOF or whitespace

    if (code === null || markdownLineEndingOrSpace(code)) {
      return ok(code)
    } // Anything else.

    return nok(code)
  }
}
