# SVG Icon Explorer

<<<<<<< HEAD
A local, desktop-first developer tool for browsing, searching, previewing,
customizing, and copying SVG icons from a folder of icon packs on disk —
built for collections in the tens of thousands. No backend, no bundled
icon libraries, nothing fetched from npm at runtime: it reads whatever
you put in `icons/`.

> **About the sample icons:** this download ships with ~116 small,
> original hand-authored icons (in `icons/sample-outline`,
> `icons/sample-solid`, `icons/sample-brands`) purely so the app has
> something to show the first time you run it. Swap or supplement
> `icons/` with your real ~60,000-icon collection — see below.

## Quick start

```bash
npm install
npm run dev
```

This runs `npm run scan` automatically before starting Vite, then opens
the app at `http://localhost:5173`.

## Using your real icon collection

1. Copy (or symlink) your icon packs into `icons/` at the project root.
   Either of these shapes is auto-detected per pack:

   ```
   icons/bootstrap/archive.svg              # pack/file.svg
   icons/fontawesome/solid/house.svg        # pack/category/file.svg
   icons/heroicons-2/24/outline/home.svg    # pack/category/subcategory/file.svg
   ```

2. Regenerate the manifest:

   ```bash
   npm run scan
   ```

   This walks `icons/` once, extracts each SVG's `viewBox`, size, and
   derived keywords, and writes `generated/manifest.json`. It does **not**
   inline the SVG bodies — at 60k icons that would make the manifest itself
   huge. The React app only ever reads this manifest; individual SVG files
   are fetched on demand (and cached in memory) when you select or scroll
   to them.

3. `npm run dev` (or `npm run build && npm run preview`).

For a real 60k-icon library, keep icons on disk and re-run `npm run scan`
whenever you add/remove packs — it typically finishes in well under a
second per thousand icons since it only reads small file headers, not
full parses.

## Architecture

```
scripts/
  scan-icons.ts            Node script: icons/ -> generated/manifest.json
  generate-sample-icons.mjs  Creates the bundled sample pack (safe to delete)

src/
  types/icon.ts             Shared types (IconRecord, CopyFormat, ...)
  store/icon-store.ts        Zustand store: manifest, filters, search,
                              selection, favorites, recents, settings
                              (persisted slice via localStorage)
  lib/
    manifest.ts               Manifest fetch + Fuse.js index
    svg-loader.ts              On-demand SVG fetch + in-memory cache
    jsx-utils.ts           SVG -> JSX/TSX/component/path/JSON/optimized
  hooks/
    use-copy-icon.ts           Copy-to-clipboard + download logic
    use-keyboard-shortcuts.ts  Arrow nav, Enter, Ctrl/Cmd+C, Esc
    use-theme.ts                Applies light/dark/system to <html>
    use-toast.ts                Toast notification store
  features/
    topbar.tsx                  Search, grid density, theme toggle
    sidebar/sidebar.tsx          Packs, categories, favorites, recents, stats
    grid/                        Virtualized grid (TanStack Virtual),
                                  icon card, multi-select + ZIP export
    preview/                     Right panel: metadata + copy formats
    playground/                  Live style/transform playground
  components/ui/                 Button, Checkbox, Tooltip, Slider, Toaster
```

The React app **never touches the filesystem**. It fetches
`/generated/manifest.json` once on load, and fetches `/icons/<path>`
lazily per icon (via the `public/icons` and `public/generated` symlinks
that point back at the project-root folders of the same name).

## Performance notes for 60,000+ icons

- **Virtualized grid** (`@tanstack/react-virtual`): only visible rows are
  mounted, regardless of collection size.
- **Lazy SVG loading**: raw SVG markup is fetched per-icon on first view
  and cached in memory (`src/lib/svg-loader.ts`) — never all at once.
- **Search**: Fuse.js is built once over the manifest (metadata only, no
  SVG bodies) and re-used across queries.
- **Manifest generated once, offline**: `npm run scan` is the only step
  that touches the filesystem; the running app is pure client-side reads.
- Grid card components are memoized; store selectors are field-scoped to
  avoid unrelated re-renders.

## Features

- Search (Ctrl/Cmd+K to focus), filter by pack/category, favorites,
  recently used, live stats
- Virtualized grid with 3 density levels
- Right panel: large preview, metadata (pack, category, filename, size,
  viewBox, optimized-vs-original size), favorite/download
- Copy as: SVG, lightly-optimized SVG, JSX, TSX, typed dynamic React
  component (`size`/`color` props), path-only, JSON metadata
- Live playground: size, stroke width, fill/stroke color, rotation,
  opacity, scale, flip H/V, background (white/dark/checkerboard/transparent)
- Multi-select (Ctrl/Cmd+click) + export selection as a `.zip`
- Keyboard shortcuts: Ctrl/Cmd+K search, ←/→ navigate, Enter copies the
  default format, Ctrl/Cmd+C copies selected icon, Esc closes
  search/deselects
- Light/dark/system theme, persisted grid density + default copy format
- Favorites, recently used, and recent-copy history persisted to
  `localStorage`

## Scope notes

A few of the brief's "extra features" are intentionally left as clear
extension points rather than fully built out, so the core browsing/search/
copy experience — the part used on every single interaction — could get
real engineering attention instead of being spread thin:

- **Sprite sheet generation**, **Vue component export**, and **React
  Native SVG export** are natural additions to `src/lib/jsx-utils.ts`
  (same pattern as the existing JSX/TSX/component generators) and
  `src/features/preview/copy-format-list.tsx`, but aren't wired in yet.
- **Drag-and-drop / paste-from-clipboard SVG inspection** would slot into
  a new `features/inspector` panel using the same `DetailsPanel` +
  `PlaygroundPanel` components against an ad-hoc `IconRecord`.
- The bundled **SVGO** dependency is installed but only used for a fast,
  dependency-light client-side "optimize" pass (`lightOptimize`); wiring
  full SVGO plugin config in is a drop-in swap in `jsx-utils.ts`.

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · Radix
primitives (shadcn-style components) · TanStack Virtual · Fuse.js ·
Zustand · React Router · Lucide (UI chrome only — never used for the
icon collection itself)
=======

> A modern, high-performance SVG icon explorer built for developers.

Browse, search, preview, customize, and copy **60,000+ SVG icons** from multiple popular icon libraries. Copy icons as **SVG**, **JSX**, **TSX**, or **React Components** with a single click.

---

## ✨ Features

- 🔍 Instant fuzzy search powered by Fuse.js
- ⚡ Virtualized rendering for smooth performance with large icon collections
- 🎨 Live icon playground
  - Resize
  - Stroke width
  - Fill color
  - Stroke color
  - Rotation
  - Scale
  - Opacity
  - Flip Horizontal / Vertical

- 📋 Copy in multiple formats
  - SVG
  - Optimized SVG
  - JSX
  - TSX
  - React Component
  - Path Only
  - JSON Metadata

- ❤️ Favorites
- 🕒 Recently Used
- 📂 Browse by icon pack
- 🏷 Browse by category
- 🌙 Light / Dark / System theme
- ⚙️ Configurable grid density
- ⌨️ Keyboard shortcuts
- 🚀 Built for large icon collections (60,000+ icons)

---

## Supported Icon Libraries

The explorer works with any folder containing SVG files and currently supports libraries such as:

- Ant Design Icons
- Bootstrap Icons
- Boxicons
- Circum Icons
- CSS.GG
- Devicons
- Flat Color Icons
- Font Awesome
- Font Awesome 6
- Game Icons
- Grommet Icons
- Heroicons
- Heroicons v2
- IcoMoon
- Line Awesome
- Material Design Icons
- Phosphor Icons
- Radix Icons
- Remix Icon
- Simple Icons
- Simple Line Icons
- Tabler Icons
- Themify Icons
- Typicons
- VS Code Icons
- Weather Icons

More icon packs can be added by simply placing SVG files inside the `icons/` directory.

---

# Screenshots

Coming soon.

---

# Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Zustand
- TanStack Virtual
- Fuse.js
- Lucide React

---

# Project Structure

```text
svg-icon-explorer
│
├── icons/
│   ├── fontawesome/
│   ├── heroicons/
│   ├── bootstrap/
│   └── ...
│
├── generated/
│   └── manifest.json
│
├── scripts/
│   └── scan-icons.ts
│
├── src/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   └── types/
│
└── public/
```

---

# Getting Started

## Clone the repository

```bash
git clone https://github.com/<your-username>/svg-icon-explorer.git
cd svg-icon-explorer
```

---

## Install dependencies

```bash
npm install
```

or

```bash
pnpm install
```

---

## Add your icon collection

Place your SVG libraries inside:

```text
icons/
```

Example:

```text
icons/
├── bootstrap/
├── fontawesome/
├── heroicons/
├── tabler-icons/
└── ...
```

---

## Generate the manifest

```bash
npm run scan
```

This scans the entire icon collection and generates:

```text
generated/manifest.json
```

The application reads this manifest for searching and browsing while loading individual SVG files only when required.

---

## Start the development server

```bash
npm run dev
```

---

# Search

Search supports:

- Icon name
- Filename
- Icon pack
- Category
- Keywords

Powered by Fuse.js for fast fuzzy matching.

---

# Performance

The application is designed to handle **60,000+ icons** efficiently.

Performance optimizations include:

- Virtualized rendering
- Lazy SVG loading
- Indexed search
- Memoized filtering
- Persistent application settings
- Efficient Zustand state management

---

# Roadmap

- [ ] SVG optimization with SVGO
- [ ] Export selected icons
- [ ] Sprite sheet generation
- [ ] React Native component generation
- [ ] Vue component generation
- [ ] Svelte component generation
- [ ] Icon comparison mode
- [ ] Plugin system
- [ ] Cloud icon collections
- [ ] Multi-language search
- [ ] Command Palette
- [ ] Custom icon collections
- [ ] Icon tagging
- [ ] Folder watching for automatic rescans

---

# Contributing

Contributions are welcome.

If you have suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request.

---

# License

MIT License.

---

Built with ❤️ for developers who work with SVG icons every day.

> > > > > > > 77b3a05856699add5ff75b07833f715975af2c5a
