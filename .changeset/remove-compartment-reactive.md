---
'@neodrag/core': minor
'@neodrag/svelte': minor
'@neodrag/react': minor
'@neodrag/vue': minor
'@neodrag/solid': minor
'@neodrag/vanilla': minor
---

Remove `Compartment` from the public API. Framework wrappers now reconcile plugin changes internally via `engine.update` when you pass a reactive plugin factory (`() => plugins`). Transform repaints after reactive position updates. Added browser tests for two-way `position` binding, update re-entry guards, and a comprehensive Chromium reactive benchmark suite.
