import type {Literal} from 'hast'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface Raw extends Literal {
  type: 'raw'
}

declare module 'hast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RootContentMap {
    raw: Raw
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ElementContentMap {
    raw: Raw
  }
}
