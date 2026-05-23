---
'@neodrag/core': minor
'@neodrag/svelte': minor
'@neodrag/react': minor
'@neodrag/vue': minor
'@neodrag/solid': minor
'@neodrag/vanilla': minor
---

Remove `Compartment` from the public API. Framework wrappers now reconcile plugin changes internally via `engine.update` when you pass a reactive plugin factory (`() => plugins`). Added browser tests for two-way `position` binding and update re-entry guards.
