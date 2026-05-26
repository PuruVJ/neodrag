# bundle-roast design language (reference for Neodrag homepage)

Source: `/Users/puruvijay/Projects/bundle-roast` (SvelteKit + Tailwind 4.2)

Live site: https://bundle-roast.puruvj.dev/

---

## Stack

| Layer | Choice |
|--------|--------|
| Framework | SvelteKit 2 |
| CSS | **Tailwind CSS v4** via `@tailwindcss/vite` |
| Animations | `tw-animate-css` |
| Components | bits-ui (shadcn-style primitives in `src/lib/components/ui/`) |
| Utilities | `tailwind-merge`, `tailwind-variants`, `clsx` |
| Theme | **Dark only** on homepage (`<body class="dark">`) |

Fonts in repo (`layout.css`):

- **Sans**: `'Inter', ui-sans-serif, system-ui, sans-serif` — **not** EB Garamond, **not** Montserrat in source
- **Mono**: `ui-monospace, 'SF Mono', Menlo, monospace`
- Display = **Inter at extrabold/black** + **mono for all chrome/labels**

User asked for “bolder, Mont type” → interpret as **heavy Inter + mono editorial** (magazine / terminal desk), not serif.

---

## Color system (map to Neodrag palette)

bundle-roast uses OKLCH tokens in `:root` / `.dark` + `--flame` accent.

| Token | bundle-roast (dark) | Neodrag equivalent (keep) |
|--------|---------------------|-----------------------------|
| Page bg | `oklch(0.085 0.005 50)` + grunge layers | `--app-color-shell` dark + subtle texture optional |
| Accent | `--flame` `oklch(0.78 0.19 55)` | `--app-color-primary` (coral/red — different hue, keep Neodrag) |
| Text | `--foreground` warm off-white | `--app-color-dark` (in dark theme = light text) |
| Muted | `--muted-foreground` | `color-mix(dark, transparent ~35–55%)` |
| Panel surface | `bg-white/[2.5%]` on transparent | `bg-white/[2.5%]` or `color-mix(shell, primary 4%)` |
| Borders | `border-white/[6%]`, `border-foreground/15` | hairlines, not dock pill shadows |
| Selection | flame 50% mix | primary-based selection |

**Do not** copy bundle-roast orange flame wholesale — use Neodrag primary for `▍`, links, CTA, focus rings.

---

## Background (signature look)

`layout.css` `body` uses **5 fixed layers**:

1. Edge vignette (dark corners)
2. Warm/cool radial washes (off-axis)
3. Diagonal scratch repeat (`repeating-linear-gradient` 108deg)
4. SVG turbulence blotches (paper tear)
5. Fine SVG grain

`background-attachment: fixed` — does not scroll with content.

Neodrag homepage: optional **lighter** version (vignette + one warm radial using primary) so it doesn’t fight docs pages.

---

## Layout rhythm

- **Max width**: `max-w-4xl` (~56rem) centered column
- **Vertical gap**: `gap-5` between sections
- **Section padding**: `p-6 sm:p-8`
- **Page padding**: `px-3 py-10 sm:px-0`

Homepage playground: widen stage (`max-w-6xl` or two-column) but keep **section panel** vocabulary.

---

## Section pattern (repeat everywhere)

```html
<section class="flex flex-col gap-4 bg-white/[2.5%] p-6 sm:p-8">
  <div class="flex justify-between border-b border-foreground/15 pb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em]">
    <div class="text-flame"><span>▍</span> section title</div>
    <div class="text-muted-foreground/55">right label</div>
  </div>
  <!-- content -->
</section>
```

`SectionBreak.svelte`: horizontal rules + `§` + optional label between sections.

---

## Masthead / hero

- Watermark glyph: huge `ISS.` at `text-flame/[3%]`, `font-black`, mono
- Kicker row: `▍ issue 001 · 2026 · npm desk` — `tracking-[0.18em]`, uppercase, mono
- H1: `bundle` italic bold + `/` flame + `roast` with **underline border** (`border-b-4 border-flame`)
- Size: `text-[clamp(3rem,9vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]`
- Tagline rule: short horizontal line + mono uppercase
- Body: `text-[1.0625rem]` prose, occasional **bold** emphasis (not italic em)

Neodrag mapping:

- `Neodrag` split or single wordmark with primary slash accent
- Kicker: `Everything's a plugin` / `npm desk` tone
- Drop EB Garamond gradient text on homepage only

---

## Terminal / search UI (SmartSearch)

- Prompt line: `$ ./roast --target` with flame `$`
- Input: dark `oklch(0.07)`, mono, `caret-flame`, thick border `border-2`, focus `border-flame` + soft glow
- Submit: solid `bg-flame` button, `font-black uppercase`, `roast it →`
- Operator chips: small bordered mono buttons

**Code panel** on Neodrag homepage should echo this (mono chrome + dark inset field), not a separate “card UI”.

---

## Lists & data rows

- Grid: `grid-cols-[2.5rem_1fr_auto]` — index | command | description
- Index: `font-black tabular-nums`, muted → flame on hover
- Row hover: `hover:bg-flame/[4%] hover:pl-2` (subtle slide)
- Code in rows: `font-bold` mono, truncate

Scenario strip → numbered or `▍`-prefixed rows, not emoji sidebar.

---

## Typography scale

| Role | Classes |
|------|---------|
| Section label | `font-mono text-[0.7rem] uppercase tracking-[0.18em]` |
| Body | `text-[15px] leading-[1.55]` on main |
| H1 | `clamp(3rem–6.5rem) font-extrabold` |
| H3 feature | `text-base font-extrabold tracking-[-0.01em]` |
| Footer | `font-mono text-xs` |

---

## Motion

- `animate-flame-pulse` on status dot
- `animate-scroll` ticker (marquee)
- `transition duration-75–100` on hovers (fast, not sluggish)
- `rotate-[1deg]` on occasional badges (warm-up stamp)

---

## What to avoid (current Neodrag playground mistakes)

- Nested dock-style pills everywhere
- EB Garamond on homepage
- Client-side Shiki (use Astro `<Code>` + toggle `hidden` — already fixed on branch)
- Heavy drop shadows on windows
- Emoji scenario rail
- Three-column “dashboard” grid

---

## Tailwind 4 setup (for docs homepage only)

```ts
// astro.config.ts vite.plugins
import tailwindcss from '@tailwindcss/vite';
```

```css
/* e.g. src/pages/home/home.css or scoped import on index only */
@import 'tailwindcss';

@theme inline {
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--app-font-mono);
  --color-primary: var(--app-color-primary);
  --color-flame: var(--app-color-primary); /* alias for porting classes */
  /* map other --app-* tokens */
}
```

Scope Tailwind to homepage wrapper (`.home-tw`) so docs MDX/layout.css stay on lightningcss.

---

## Key files to port patterns from

| File | Purpose |
|------|---------|
| `src/routes/layout.css` | Tokens, body texture, theme |
| `src/routes/+page.svelte` | Homepage structure |
| `src/lib/components/SectionBreak.svelte` | Section dividers |
| `src/lib/components/SmartSearch.svelte` | Terminal input |
| `src/lib/components/TopNav.svelte` | Compact nav chip |
| `src/app.html` | `class="dark"` |

---

## Neodrag homepage IA (proposed)

1. **Header strip** — logo, edition/kicker, clock/status (optional)
2. **Masthead** — Neodrag wordmark + plugin line + CTAs
3. **Play canvas** — desk + windows (abstract, site tokens) in `bg-white/[2.5%]` section labeled `▍ try it`
4. **Source** — framework tabs + Astro-pre-rendered code in terminal frame
5. **Scenario list** — horizontal `▍` sections or numbered rows (worlds)
6. Optional ticker/footer mono line

---

## Visual check

Local `pnpm dev` in bundle-roast failed in agent sandbox (EPERM on vite temp). Use production https://bundle-roast.puruvj.dev/ or run locally before cloud handoff.
