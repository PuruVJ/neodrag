---
"@neodrag/core": minor
---

Sortable `preview: 'visual'` now uses in-flow CSS `transform` displacement instead of fixed lift + sibling FLIP. Add `strategy: 'grid'`, optional `transition`, `collision`, and `presets.strategy` helpers. `releaseDuration` remains supported and maps to `transition.duration`. Overlay drop animation is planned for a follow-up (`overlay` option is reserved).
