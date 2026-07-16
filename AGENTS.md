# NeedyWebUI — Agent Guide

## What this is

A dependency-free CSS component library that ports the UI from *Needy Streamer Overdose* (Needy Girl Overdose) to the web. No build step, no bundler, no package manager. Raw CSS + vanilla JS + HTML.

## Project structure

```
nso_ui.css            ← entry point (imports the 5 modules below)
css/base.css          ← core styles, variables, layout, utilities (~2694 lines)
css/components.css    ← buttons, modals, tabs, tooltips, toggles, etc. (~716 lines)
css/icons.css         ← icon system via CSS custom properties (~160 icons)
css/sidebar.css       ← sliding sidebar nav
css/stream.css        ← live-stream window layout
examples/index.html   ← full component showcase / demo
examples/nso.js       ← vanilla JS for interactive components (global window.NSO)
fonts/                ← DinkieBitmap-9px.woff2 (pixel font — core to aesthetic)
background/           ← tile/background PNGs (day/dusk/night themes)
icons/                ← game icon PNGs (emotes, achievements, reactions)
ui/                   ← cursor, nav button sprites
```

## Build / dev / test

There are none. CSS files are used as-is by browsers. To preview: open `examples/index.html` in a browser (use a local server to avoid CORS issues with `@import`).

## CSS conventions

- **Prefix:** all new components use `nso-` (e.g. `nso-btn`, `nso-modal`, `nso-tabs`)
- **BEM-like:** `nso-btn--ghost`, `nso-modal__content`, `nso-tabs__tab--active`
- **State toggling:** CSS class switches (e.g. `nso-sidebar--open`, `nso-modal--open`)
- **Utilities:** `u-` prefix (e.g. `u-mt16`, `u-flex`, `u-w-full`)
- **Icons:** `.nso-icon` base + modifier class sets `--nso-icon` CSS custom property
- **Legacy classes:** older game-port styles use non-prefixed names (`noonbutton`, `duskbutton`, `nightbutton`, `contact`, `profile`, etc.) — do not rename these

## Brand palette

```css
--color-primary: #4D23CD   /* purple */
--color-secondary: #90F3E1 /* teal */
--color-accent: #EFCFEF    /* pink */
--color-bg: #FDF8FD        /* near-white */
```

Do not introduce new colors without reason. The palette is intentionally limited.

## Key quirks

- `base.css` contains duplicated style blocks (copy-paste from game port). Leave them alone unless actively consolidating — they're not bugs.
- Icon system: each icon class sets `--nso-icon: url(...)` on a CSS custom property; `.nso-icon` uses `background: var(--nso-icon)`. Icon size via `--nso-icon-size`.
- Background day/dusk/night switching: toggle `noonbg`/`duskbg`/`nightbg` classes on container.
- Canvas-based progress bars in `nso.js` create animated graph elements with history tracking.
- The pixel-art aesthetic is intentional: `image-rendering: pixelated`, bitmap font, custom cursor.
- Game-specific terminology in class names (`JINE`, `shinanegen`) is canonical — do not "translate" to generic names.
- Distribution via CDN: `cdn.jsdelivr.net/gh/ArThirtyFour/NeedyWebUI@main/nso_ui.css`.
