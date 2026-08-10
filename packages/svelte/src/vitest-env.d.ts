// `@neodrag/core` resolves to its TypeScript *source* in the workspace (its dev "import" export
// points at `src/`), so core's in-source unit tests — `if (import.meta.vitest) { … }` — are pulled
// into this package's type-check even though they only ever run under Vitest in core. Type the hook
// here so those blocks check cleanly. Global ambient decl in a non-entry `.d.ts` → never reaches dist.
interface ImportMeta {
	readonly vitest?: typeof import('vitest');
}
