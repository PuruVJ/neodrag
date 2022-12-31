/// <reference types="node" resolution-mode="require"/>
/**
 * @param {URL} url
 * @param {{parentURL: string}} context
 * @returns {string|null}
 */
export function defaultGetFormatWithoutErrors(
  url: URL,
  context: {
    parentURL: string
  }
): string | null
/**
 * @param {string} url
 * @param {{parentURL: string}} context
 * @returns {string|null|void}
 */
export function defaultGetFormat(
  url: string,
  context: {
    parentURL: string
  }
): string | null | void
export type ProtocolHandler = (
  parsed: URL,
  context: {
    parentURL: string
  },
  ignoreErrors: boolean
) => string | null | void
import {URL} from 'url'
