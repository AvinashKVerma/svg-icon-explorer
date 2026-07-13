// Generates a small, original sample icon library so the app has real
// SVG files to scan on first run. Replace / supplement the `icons/`
// folder with your real ~60,000-icon collection — the shape of the
// folders (pack/category/*.svg or pack/*.svg) is all scan-icons.ts cares about.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../icons/", import.meta.url).pathname;

// Simple original glyphs defined as path data on a 24x24 grid.
const GLYPHS = {
  home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 17-5.6-5.6",
  heart: "M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4a5.6 5.6 0 0 1 6.4 3 5.6 5.6 0 0 1 6.4-3C22 4.5 23.6 8 22 11.7 19.5 16.4 12 21 12 21Z",
  star: "M12 2l3 6.5 7 .9-5.1 4.9 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9Z",
  user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-8 9c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5a8 8 0 0 0-.2-1.8l2-1.6-2-3.4-2.4.9a8 8 0 0 0-3-1.8L14 2h-4l-.4 2.3a8 8 0 0 0-3 1.8l-2.4-.9-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .6.1 1.2.2 1.8l-2 1.6 2 3.4 2.4-.9c.9.8 1.9 1.4 3 1.8L10 22h4l.4-2.3c1.1-.4 2.1-1 3-1.8l2.4.9 2-3.4-2-1.6c.1-.6.2-1.2.2-1.8Z",
  bell: "M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Zm4.3 9a1.7 1.7 0 0 0 3.4 0",
  calendar: "M4 9h16M7 3v4m10-4v4M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  mail: "M3 6h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Zm0 0 9 7 9-7",
  cloud: "M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 10.5 4 4 0 0 1 17 18H7Z",
  sun: "M12 4v2m0 12v2m8-8h-2M6 12H4m12.9-6.9-1.4 1.4M6.5 17.5l-1.4 1.4m0-13.8 1.4 1.4M17.5 17.5l1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13",
  download: "M12 3v12m0 0-4-4m4 4 4-4M4 19h16",
  upload: "M12 15V3m0 0 4 4m-4-4-4 4M4 19h16",
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Zm11-14 3 3",
  copy: "M9 9h10v10H9zM5 15V5h10",
  check: "M4 12.5 9.5 18 20 6",
  x: "M5 5l14 14M19 5 5 19",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  arrowRight: "M4 12h16m0 0-6-6m6 6-6 6",
  arrowLeft: "M20 12H4m0 0 6-6m-6 6 6 6",
  arrowUp: "M12 20V4m0 0-6 6m6-6 6 6",
  arrowDown: "M12 4v16m0 0 6-6m-6 6-6-6",
  lock: "M6 11h12v9H6v-9Zm3 0V7a3 3 0 0 1 6 0v4",
  unlock: "M6 11h12v9H6v-9Zm3 0V7a3 3 0 0 1 5.6-1.5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z",
  eyeOff: "M3 3l18 18M10.6 10.7a3.2 3.2 0 0 0 4.5 4.5M6.7 6.9C4.5 8.3 3 10.5 2 12c0 0 3.5 7 10 7 1.7 0 3.2-.4 4.4-1.1M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 7.4 10 7.4a17 17 0 0 1-3 3.9",
  folder: "M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z",
  file: "M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm9 0v5h5",
  link: "M9.5 14.5 14.5 9.5M8 16l-2.5 2.5a3.5 3.5 0 0 1-5-5L3 11m13-3 2.5-2.5a3.5 3.5 0 0 1 5 5L21 13",
  filter: "M4 5h16l-6 8v6l-4-2v-4Z",
  refresh: "M4 12a8 8 0 0 1 14.3-5M20 12a8 8 0 0 1-14.3 5M4 4v5h5m6 11v-5h5",
  play: "M6 4v16l14-8Z",
  pause: "M7 4h4v16H7zM13 4h4v16h-4z",
  clock: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-13v5l3.5 2",
  map: "M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2Zm0 0v16m6-14v16",
  camera: "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
  chatBubble: "M4 5h16v11H9l-5 4V5Z",
  tag: "M12.5 3H4v8.5L14.5 22 21 15.5 10.5 5H12.5Zm-4 5.5h.01",
  shield: "M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6Z",
  wifi: "M2 8.5a16 16 0 0 1 20 0M5.5 12a11 11 0 0 1 13 0M9 15.5a6 6 0 0 1 6 0M12 19h.01",
  battery: "M3 9h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Zm17 2h2v2h-2",
  printer: "M6 8V3h12v5M6 17H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-2M6 13h12v8H6z",
  bookmark: "M6 3h12v18l-6-4-6 4Z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  paperclip: "M21 10.5 12.5 19a4 4 0 0 1-5.7-5.7L15 5a2.8 2.8 0 0 1 4 4l-8.4 8.4a1.4 1.4 0 0 1-2-2L16 8",
};

const BRAND_GLYPHS = {
  github: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.6 1 1.5 1 2.6 0 3.8-2.4 4.6-4.6 4.9.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5A10 10 0 0 0 12 2Z",
  slack: "M9 3a2 2 0 1 1 2 2H9V3Zm0 5H4a2 2 0 1 0 2 2V8h3Zm10-3a2 2 0 1 0-2 2h2V5Zm-5 5v7a2 2 0 1 1-2-2v-5h2Zm3 1a2 2 0 1 1 2 2h-2v-2Zm-1 5h5a2 2 0 1 0-2-2v2h-3Zm-3-11h7a2 2 0 1 0-2-2v2h-5Z",
  figma: "M9 2h6a3 3 0 0 1 0 6H9zM9 8h6a3 3 0 0 1 0 6H9zM9 14h4.5a3 3 0 1 1-3 3v-3ZM6 8a3 3 0 0 0 0 6h3V8z",
  google: "M21 12.2c0-.7-.1-1.4-.2-2H12v4h5a4.3 4.3 0 0 1-1.9 2.8v2.3h3A9 9 0 0 0 21 12.2ZM12 21c2.4 0 4.5-.8 6-2.2l-3-2.3c-.8.6-1.9 1-3 1a5.2 5.2 0 0 1-4.9-3.6H4v2.4A9 9 0 0 0 12 21ZM7.1 13.9a5.4 5.4 0 0 1 0-3.8V7.7H4a9 9 0 0 0 0 8.2Zm4.9-9.1c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 4 7.7l3.1 2.4A5.2 5.2 0 0 1 12 4.8Z",
  apple: "M16.4 12.6c0-2.1 1.7-3.1 1.8-3.2a4 4 0 0 0-3.1-1.7c-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.7A4.2 4.2 0 0 0 5.3 10c-1.5 2.7-.4 6.6 1.1 8.8.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2a10 10 0 0 0 1.2-2.6 4 4 0 0 1-2.5-3.6ZM14.1 5.7a3.7 3.7 0 0 0 .9-2.7 3.9 3.9 0 0 0-2.5 1.3 3.5 3.5 0 0 0-.9 2.6c1 .1 1.9-.4 2.5-1.2Z",
  x_twitter: "M4 4l7.5 9.6L4.2 20h2l6-6.6 4.8 6.6H21l-7.9-10.2L20 4h-2l-5.5 6-4.4-6H4Z",
};

function svg(pathD, { stroke = true } = {}) {
  const attrs = stroke
    ? `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="currentColor"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${attrs}>\n  <path d="${pathD}" />\n</svg>\n`;
}

function write(dir, name, content) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.svg`), content, "utf8");
}

const outlineDir = join(ROOT, "sample-outline");
const solidDir = join(ROOT, "sample-solid");
const brandsDir = join(ROOT, "sample-brands");

let count = 0;
for (const [name, d] of Object.entries(GLYPHS)) {
  write(outlineDir, kebab(name), svg(d, { stroke: true }));
  write(solidDir, kebab(name), svg(d, { stroke: false }));
  count += 2;
}
for (const [name, d] of Object.entries(BRAND_GLYPHS)) {
  write(brandsDir, kebab(name), svg(d, { stroke: false }));
  count += 1;
}

function kebab(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/_/g, "-").toLowerCase();
}

console.log(`Generated ${count} sample icons across 3 packs in ${ROOT}`);
