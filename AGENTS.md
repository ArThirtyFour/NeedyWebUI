# NeedyWebUI — Agent Guide

## What this is

A dependency-free CSS component library that ports the UI from *Needy Streamer Overdose* (Needy Girl Overdose) to the web. No build step, no bundler, no package manager. Raw CSS + vanilla JS + HTML.

## Project structure

```
nso_ui.css            ← entry point (imports 7 modules)
css/base.css          ← core styles, variables, layout, utilities, legacy game-port blocks (~2700 lines)
css/components.css    ← buttons, titlebars, windows, players, status rows, loaders, tabs, accordions, etc.
css/article.css       ← article/reading layout, callouts, code blocks, risk badges, tables
css/icons.css         ← icon system via CSS custom properties (~160 icons)
css/hljs-nso.css      ← highlight.js theme (brand palette: purple/teal/pink)
css/sidebar.css       ← sliding sidebar nav
css/stream.css        ← live-stream window layout + live chat list
css/feed.css          ← Tweeter-style post feed (queue, reveal animations)
examples/index.html   ← full component showcase / demo
examples/nso_ui.css   ← example-local copy of the entry point (imports ../css/*)
examples/nso.js       ← vanilla JS for interactive components (global window.NSO)
fonts/                ← DinkieBitmap-9px.woff2 (pixel font — core to aesthetic)
background/           ← tile/background PNGs (day/dusk/night themes, JINE chat bg, JINE_date pill)
icons/                ← game icon PNGs (emotes, achievements, reactions)
icons/kusoripu/       ← 32 reply-avatar icons (icon_kusoripu_*), used randomly like the game
ui/                   ← cursor, nav button sprites, comment icon, window buttons, status & loading frames
ui/status/            ← status icons (follower, stress, love, yami) for status rows
ui/loading/           ← 8 loader frames (recoloured to text color, see below)
```


## Source of truth: the game

Before styling a game element, check the game's own data in the export, don't guess. Useful places:
- Prefabs (`GameObject/*.prefab`, YAML text): colours (`m_Color`, `m_fontColor`), font sizes, RectTransform sizes, sprite GUIDs.
- Scripts (`Scripts/Assembly-CSharp/ngov3/*.cs`): behaviour, timings (`DOTween` durations), colour arrays.
- Textures (`Texture2D/*.png`) and sprites (`Sprite/*.asset`, `m_Border` = left, bottom, right, top).
- Map a sprite to a file: sprite `.asset` → `texture` GUID → `Texture2D/*.meta`.

Known canon values (use these, not palette guesses):
- Window frame: outer 2px `#4D23CD`, 4px `#90F4E4`, 2px `#4D23CD`, then content (`WindowBase2D`).
- Titlebar: 26px high, bg `#F0D1F1`, icon 8×8 `#4D23CD` at x=13, title `#1403A6`, three 27×27 buttons with 20×20 icons (min, max, close from `Texture2D/button_*.png`).
- Status text (name and value): `#1403A6`; arrow down `#CC1415`; arrow up `#1239E5` (2D) or `#5D8CFF` (non-2D); `->` `#6B57B0`.
- Tweeter post: avatar 51×51 left, user `#527CE7`, body `#4D23CD`, date `#888888`, photo under text, RT `#409C52`, fav `#B7B465`, replies with kusoripu avatars.
- JINE bubble: other `#CDECFD`, self `#4CF653`, text `#1403A6`, rectangular (9-slice texture `JINE_date_0.png`, border 7px, is the bubble sprite; its corners are antialiased in the texture).
- Live comments: `CommentIcon` 16px, superchat colours `#E75252 #A1B7F0 #8BD5FF #8DFFC6 #FAFF8D #FFCA10 #EAA0E8`, delete icon `icon_trash_can` on hover, text `#4D23CD`, width 380.
- Tweeter loader: 8 frames 18×18 (`icon_loading_poketter_000…007`), no text.
- Stream timer and graphs are library-only (no game source found).

## CSS conventions

- **Prefix:** all new components use `nso-` (e.g. `nso-btn`, `nso-modal`, `nso-tabs`, `nso-titlebar`, `nso-status`, `nso-feed`)
- **BEM-like:** `nso-btn--ghost`, `nso-modal__content`, `nso-tabs__tab--active`
- **State toggling:** CSS class switches (e.g. `nso-sidebar--open`, `nso-modal--open`, `nso-accordion--open`)
- **Utilities:** `u-` prefix (e.g. `u-mt16`, `u-flex`, `u-w-full`)
- **Icons:** `.nso-icon` base + modifier class sets `--nso-icon` CSS custom property
- **Legacy classes:** older game-port styles use non-prefixed names (`noonbutton`, `duskbutton`, `nightbutton`, `contact`, `profile`, `heading`, `f-row`, etc.) — do not rename these
- **Overriding legacy:** legacy rules in `base.css` have high specificity and sometimes set `background-image` (navbuttons sprites). Override them in `components.css` at the end of the file, and use `!important` only for background-image/padding when specificity can't win (see `.nso-titlebar`)
- **Shared frame:** windows, tabs, the player and the sidebar use the same layered frame (outer border, teal layer, inner border). Build frames with nested elements, not stacked `box-shadow`s

## Brand palette

```css
--color-primary: #4D23CD   /* purple */
--color-secondary: #90F3E1 /* teal */
--color-accent: #EFCFEF    /* pink */
--color-bg: #FDF8FD        /* near-white */
```

Do not introduce new colors without reason. Game colours from the prefabs (above) are a valid reason. The palette is intentionally limited.

## Components added recently

- `.heading.nso-titlebar` (+ `.nso-titlebar__icon`, `.nso-titlebar__buttons`): standard window titlebar. Used by every demo window heading and the sidebar.
- `.nso-feed` (+ `.nso-feed__loading`, `.nso-feed__empty`): post list with a queue (`NSO.feedPush`), open/fade reveal and reply reveal. Posts are `.nso-tweet` cards, see the Tweeter canon above.
- `.nso-player` (+ `--sm`): music player. Frame, titlebar, cover slot (`.nso-player__cover`, swap `♪` for an `<img>`), marquee title (`.nso-player__title--scroll`), play button, volume slider. The game's `MediaPlayer.cs` has no artwork.
- `.nso-status` (+ `__icon`, `__head`, `__diff--up/down`, `__new`): status row with icon, name, value, change arrows and a bar.
- `.nso-loader` (+ `--lg`): 8-frame loader, colour baked into the frames (`#1403A6`).
- `.nso-tabs` (+ `__frame`, `__nav`, `__tab--active`): tabs with the window frame.
- `.nso-accordion`: grid-rows animation (0fr → 1fr), arrow rotates.
- Stream chat (`.nso-stream__chat-msg`): comment rows with superchat colour variants `nso-stream__chat-msg--red|blue|cyan|lightgreen|yellow|orange|magenta`; click deletes (fade out).

## Motion

Animations come from the game where the source gives timings: window open and reveal use `steps()`-style pixel timing, feed reveal uses `PoketterCell.Show()` (1000 ms scale, 300 ms fade). Everything is disabled under `prefers-reduced-motion: reduce`.

## JS (`examples/nso.js`, global `window.NSO`)

- `NSO.init()` runs all `init*` methods on DOM ready.
- `NSO.switchBg(cls)`: sets the day/dusk/night class (`noonbg|duskbg|nightbg`) on the root `.nightbg/.noonbg/.duskbg` element.
- `NSO.feedPush(feed, node)`: queues a post node into `.nso-feed`; `NSO.feedPump(feed)` drains the queue one by one.
- `NSO.randomKusoripu()`: returns a random reply-avatar path (same list as `TweetFetcher._suteakaIconList`).
- `NSO.initProgressBars()`: canvas graphs for `.nso-progress` (history per element).
- `NSO.initPlayer()`: play toggle, volume readout, marquee calculation for `.nso-player`.
- `NSO.initStreamChat()`: click-to-delete on `.nso-stream__chat-msg`.
- `NSO.closeSidebar(sel)`, `NSO.initAccordions()`, `NSO.initTabs()`, `NSO.initToast()`, `NSO.initSfx()` as before.

## Key quirks

- `base.css` contains duplicated style blocks (copy-paste from game port). Leave them alone unless actively consolidating — they're not bugs.
- `.profile .table-section > .inner` has `padding: 8px` (from `components.css`). Windows that need edge-to-edge content must reset it (`.jine-panel`, `.nso-sidebar` do).
- `.nso-sidebar` and `.jine-panel` have their own overrides at the end of `components.css`; check there before changing shared window rules.
- `.nso-progress` canvas colours come from the CSS variables `--nso-progress-track/fill/line`; the bars in `components.css` (`.nso-progress-bar`) use palette/game colours.
- Icon system: each icon class sets `--nso-icon: url(...)` on a CSS custom property; `.nso-icon` uses `background: var(--nso-icon)`. Icon size via `--nso-icon-size`.
- Background day/dusk/night switching: `NSO.switchBg` toggles the classes on the root element. The day/dusk/night art is `::before` on the root; `.container` has its own tile background that covers it in the centre, so the theme only shows at the edges unless `.container` is made transparent (see the notes in `components.css`).
- The pixel-art aesthetic is intentional: `image-rendering: pixelated`, bitmap font, custom cursor.
- Game-specific terminology in class names (`JINE`, `shinanegen`, `Tweeter`, `Poketter`) is canonical — do not "translate" to generic names.
- Distribution via CDN: `cdn.jsdelivr.net/gh/ArThirtyFour/NeedyWebUI@main/nso_ui.css`. Note: the CDN serves the last pushed commit, not the working tree.
- highlight.js theme (`css/hljs-nso.css`) uses brand palette colors on `#2a1b4d` background — load highlight.js core from CDN separately, theme is included in `nso_ui.css`.
