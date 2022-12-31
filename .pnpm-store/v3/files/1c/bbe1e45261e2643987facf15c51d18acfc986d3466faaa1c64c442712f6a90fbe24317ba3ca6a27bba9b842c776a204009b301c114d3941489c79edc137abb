/**
 * @param {Definition} definition
 * @returns {Schema}
 */
export function create(definition: Definition): Schema
export type Properties = import('./schema.js').Properties
export type Normal = import('./schema.js').Normal
export type Attributes = Record<string, string>
export type Definition = {
  properties: Record<string, number | null>
  transform: (attributes: Attributes, property: string) => string
  space?: string | undefined
  attributes?: Attributes | undefined
  mustUseProperty?: string[] | undefined
}
import {Schema} from './schema.js'
