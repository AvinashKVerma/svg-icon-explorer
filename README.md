# SVG Icon Explorer

> A modern, high-performance SVG icon explorer built for developers.

Browse, search, preview, customize, and copy **60,000+ SVG icons** from multiple popular icon libraries. Copy icons as **SVG**, **JSX**, **TSX**, or **React Components** with a single click.

---

## ✨ Features

* 🔍 Instant fuzzy search powered by Fuse.js
* ⚡ Virtualized rendering for smooth performance with large icon collections
* 🎨 Live icon playground

  * Resize
  * Stroke width
  * Fill color
  * Stroke color
  * Rotation
  * Scale
  * Opacity
  * Flip Horizontal / Vertical
* 📋 Copy in multiple formats

  * SVG
  * Optimized SVG
  * JSX
  * TSX
  * React Component
  * Path Only
  * JSON Metadata
* ❤️ Favorites
* 🕒 Recently Used
* 📂 Browse by icon pack
* 🏷 Browse by category
* 🌙 Light / Dark / System theme
* ⚙️ Configurable grid density
* ⌨️ Keyboard shortcuts
* 🚀 Built for large icon collections (60,000+ icons)

---

## Supported Icon Libraries

The explorer works with any folder containing SVG files and currently supports libraries such as:

* Ant Design Icons
* Bootstrap Icons
* Boxicons
* Circum Icons
* CSS.GG
* Devicons
* Flat Color Icons
* Font Awesome
* Font Awesome 6
* Game Icons
* Grommet Icons
* Heroicons
* Heroicons v2
* IcoMoon
* Line Awesome
* Material Design Icons
* Phosphor Icons
* Radix Icons
* Remix Icon
* Simple Icons
* Simple Line Icons
* Tabler Icons
* Themify Icons
* Typicons
* VS Code Icons
* Weather Icons

More icon packs can be added by simply placing SVG files inside the `icons/` directory.

---

# Screenshots

Coming soon.

---

# Tech Stack

* React 19
* TypeScript
* Vite
* Tailwind CSS v4
* shadcn/ui
* Zustand
* TanStack Virtual
* Fuse.js
* Lucide React

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

* Icon name
* Filename
* Icon pack
* Category
* Keywords

Powered by Fuse.js for fast fuzzy matching.

---

# Performance

The application is designed to handle **60,000+ icons** efficiently.

Performance optimizations include:

* Virtualized rendering
* Lazy SVG loading
* Indexed search
* Memoized filtering
* Persistent application settings
* Efficient Zustand state management

---

# Roadmap

* [ ] SVG optimization with SVGO
* [ ] Export selected icons
* [ ] Sprite sheet generation
* [ ] React Native component generation
* [ ] Vue component generation
* [ ] Svelte component generation
* [ ] Icon comparison mode
* [ ] Plugin system
* [ ] Cloud icon collections
* [ ] Multi-language search
* [ ] Command Palette
* [ ] Custom icon collections
* [ ] Icon tagging
* [ ] Folder watching for automatic rescans

---

# Contributing

Contributions are welcome.

If you have suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request.

---

# License

MIT License.

---

Built with ❤️ for developers who work with SVG icons every day.
