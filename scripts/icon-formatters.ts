/**
 * icon-formatters.ts
 *
 * Re-implements the exact component-naming logic from react-icons'
 * internal `icons.ts` (the file used to generate every pack in
 * https://github.com/react-icons/react-icons), with zero external
 * dependencies — no `camelcase` package.
 *
 * ---------------------------------------------------------------------------
 * HOW REACT-ICONS ACTUALLY NAMES THINGS (reverse-engineered from icons.ts)
 * ---------------------------------------------------------------------------
 * Every pack's raw SVG filename is first converted to PascalCase exactly the
 * way `camelcase(name, { pascalCase: true })` would (splitting on "-", "_",
 * ".", and whitespace). Only THEN does the pack's own `formatter` run, which
 * just prepends/appends a fixed prefix or suffix — except for a handful of
 * packs (Material Icons, Bootstrap, BoxIcons, Tabler, Heroicons, Ant Design,
 * Font Awesome) whose correct prefix depends on which *folder* / *file glob*
 * the SVG came from, not just its own filename.
 *
 * This file reproduces that two-stage process:
 *   1. `pascalCase()` — our from-scratch replacement for the camelcase pkg.
 *   2. `ICON_FORMATTERS` — one Formatter per pack id, replicating the
 *      prefix/suffix/edge-case logic from react-icons' icons.ts verbatim.
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT NOTE ON `category` / `filePath`
 * ---------------------------------------------------------------------------
 * react-icons' build script doesn't have a "category" concept explicitly —
 * instead, each pack lists MULTIPLE `contents` entries, each with its own
 * `files` glob AND its own `formatter`. E.g. Font Awesome has one glob for
 * `+(brands|solid)/*.svg` -> `Fa${name}`, and a separate glob for
 * `regular/*.svg` -> `FaReg${name}`.
 *
 * Since your scanner calls a single `getComponentName(pack, category, slug,
 * filePath)`, `category` is the stand-in for "which glob/content-block did
 * this file come from" (e.g. "solid", "outline", "regular", "brands",
 * "filled", "mini", "logos", etc.) — however your scanner derives that
 * (folder name is the most natural signal, and is what real react-icons
 * uses under the hood in every one of these cases).
 *
 * Every formatter below that needs this info:
 *   - normalizes `category` (case/whitespace-insensitive, so "Outline",
 *     "outline/", "24/outline" etc. all match), and
 *   - ALSO falls back to sniffing `filePath` and/or the raw `slug` itself
 *     when `category` doesn't cleanly resolve, so the formatter still does
 *     the right thing even if your scanner's categorization is loose.
 *
 * If your scanner's category strings differ from what's assumed here,
 * search for `normalizeCategory` usages below and adjust the string checks
 * to match your own folder-naming convention — the *underlying* naming
 * rule (verified against react-icons' real icons.ts) will still be exactly
 * right.
 */

// ---------------------------------------------------------------------------
// pascalCase(): from-scratch replacement for camelcase(name, {pascalCase:true})
// ---------------------------------------------------------------------------

/**
 * Strips a trailing ".svg" (case-insensitive) if present. Safe to call on
 * slugs that already have no extension.
 */
export function stripSvgExtension(input: string): string {
  return input.replace(/\.svg$/i, "");
}

/**
 * Converts a kebab-case / snake_case / dot.case / space separated / mixed
 * filename-like string into PascalCase, matching the observed behavior of
 * `camelcase(name, { pascalCase: true })` for every case covered by
 * react-icons' filenames:
 *
 *   arrow-right        -> ArrowRight
 *   arrow_right         -> ArrowRight
 *   arrow.right         -> ArrowRight
 *   arrow right         -> ArrowRight
 *   battery-charging-2  -> BatteryCharging2
 *   3d-cube             -> 3dCube
 *   github-actions      -> GithubActions
 *
 * Rules:
 *  - Split on runs of "-", "_", ".", or whitespace (these are the only
 *    separators camelcase treats specially — punctuation like "&" is left
 *    alone, which matters for packs like Circum Icons).
 *  - Capitalize the first letter of each resulting word.
 *  - A word that STARTS with a digit cannot have its first character
 *    "capitalized" (digits have no case), so that word is left completely
 *    untouched — this is why "3d-cube" becomes "3dCube" and not "3DCube".
 *  - Extension is NOT stripped here; call stripSvgExtension() first if your
 *    slug still has ".svg" on it (icon-formatters.ts does this internally
 *    for every pack, so you don't have to).
 */
export function pascalCase(input: string): string {
  if (!input) return "";

  const words = input.split(/[-_\s.]+/).filter(Boolean);
  if (words.length === 0) return "";

  return words
    .map((word) => {
      const firstChar = word.charAt(0);
      if (/[0-9]/.test(firstChar)) {
        // Can't capitalize a digit — leave the whole word as-is.
        return word;
      }
      return firstChar.toUpperCase() + word.slice(1);
    })
    .join("");
}

// ---------------------------------------------------------------------------
// Shared helpers used by multiple formatters
// ---------------------------------------------------------------------------

/** Lowercases + trims a category for loose matching. Handles null/undefined. */
function normalizeCategory(category: string | null | undefined): string {
  return (category ?? "").toLowerCase().trim();
}

/** True if `haystack` (category, filePath, or slug) loosely contains `needle`. */
function loosely(haystack: string | null | undefined, needle: string): boolean {
  return (haystack ?? "").toLowerCase().includes(needle.toLowerCase());
}

/** The base PascalCase name for a given raw slug (extension stripped first). */
function baseName(slug: string): string {
  return pascalCase(stripSvgExtension(slug));
}

// ---------------------------------------------------------------------------
// Formatter type + dispatch table
// ---------------------------------------------------------------------------

export const PACK_PREFIX: Record<string, keyof typeof ICON_FORMATTERS> = {
  "Circum-Icons": "ci",

  fontawesome: "fa",
  "fontawesome-6": "fa6",

  ionicons: "io",
  "ionicons-5": "io5",

  "material-design-icons": "md",

  typicons: "ti",
  octicons: "go",
  feather: "fi",
  lucide: "lu",

  "game-icons-inverted": "gi",
  "weather-icons": "wi",
  devicons: "di",

  "ant-design-icons": "ai",
  bootstrap: "bs",
  RemixIcon: "ri",
  "flat-color-icons": "fc",
  "grommet-icons": "gr",

  heroicons: "hi",
  "heroicons-2": "hi2",

  "simple-icons": "si",
  "simple-line-icons": "sl",
  "icomoon-free": "im",
  boxicons: "bi",
  "css.gg": "cg",
  "vscode-icons": "vsc",
  "tabler-icons": "tb",
  "themify-icons": "tfi",
  "radix-icons": "rx",
  "phosphor-icons": "pi",
  "line-awesome": "lia",
};

export type Formatter = (slug: string, category: string | null, filePath?: string) => string;

export const ICON_FORMATTERS: Record<string, Formatter> = {
  // -------------------------------------------------------------------
  // ci — Circum Icons
  // Original: (name) => `Ci${name}`.replace(/_/g, "").replace(/&/g, "And")
  // The extra .replace(/_/g,"") is defensive cleanup for any underscore
  // that might survive pascalCase in unusual filenames; "&" is NOT a
  // pascalCase separator, so it survives verbatim and gets swapped for
  // "And" here.
  // -------------------------------------------------------------------
  ci: (slug) => {
    const n = baseName(slug);
    return `Ci${n}`.replace(/_/g, "").replace(/&/g, "And");
  },

  // -------------------------------------------------------------------
  // fa / fa6 — Font Awesome 5 / 6
  // Two content blocks:
  //   +(brands|solid)/*.svg -> Fa${name}
  //   regular/*.svg         -> FaReg${name}
  // category is expected to be one of: "brands", "solid", "regular".
  // -------------------------------------------------------------------
  fa: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    const isRegular = cat === "regular" || loosely(filePath, "/regular/") || loosely(filePath, "\\regular\\");
    return isRegular ? `FaReg${n}` : `Fa${n}`;
  },
  fa6: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    const isRegular = cat === "regular" || loosely(filePath, "/regular/") || loosely(filePath, "\\regular\\");
    return isRegular ? `FaReg${n}` : `Fa${n}`;
  },

  // -------------------------------------------------------------------
  // io / io5 — Ionicons 4 / 5
  // Original: (name) => `Io${name}`
  // -------------------------------------------------------------------
  io: (slug) => `Io${baseName(slug)}`,
  io5: (slug) => `Io${baseName(slug)}`,

  // -------------------------------------------------------------------
  // md — Material Design icons
  // Original naming does NOT use the SVG's own filename at all (every
  // file is literally "24px.svg") — the icon's real name is the PARENT
  // FOLDER, e.g. ".../3d_rotation/materialicons/24px.svg".
  //   materialicons(twotone)/24px.svg  -> Md${camelcase(folderName)}
  //   materialiconsoutlined/24px.svg   -> MdOutline${camelcase(folderName)}
  // We extract the folder name from filePath when available (mirroring
  // react-icons' own regex), and fall back to the slug otherwise.
  // -------------------------------------------------------------------
  md: (slug, category, filePath) => {
    const folderName = extractMaterialIconFolderName(slug, filePath);
    const n = pascalCase(folderName);
    const cat = normalizeCategory(category);
    const isOutlined = cat.includes("outline") || loosely(filePath, "materialiconsoutlined");
    return isOutlined ? `MdOutline${n}` : `Md${n}`;
  },

  // -------------------------------------------------------------------
  // ti — Typicons
  // Original: (name) => `Ti${name}`
  // -------------------------------------------------------------------
  ti: (slug) => `Ti${baseName(slug)}`,

  // -------------------------------------------------------------------
  // go — Github Octicons
  // Original: (name) => `Go${name}`.replace("24", "")
  // Source files are named like "alert-24.svg", so after pascalCasing
  // ("Alert24") and prefixing ("GoAlert24"), the literal substring "24"
  // is stripped (String.replace with a string arg only replaces the
  // FIRST occurrence — replicated exactly here).
  // -------------------------------------------------------------------
  go: (slug) => `Go${baseName(slug)}`.replace("24", ""),

  // -------------------------------------------------------------------
  // fi — Feather
  // Original: (name) => `Fi${name}`
  // -------------------------------------------------------------------
  fi: (slug) => `Fi${baseName(slug)}`,

  // -------------------------------------------------------------------
  // lu — Lucide
  // Original: (name) => `Lu${name}`
  // -------------------------------------------------------------------
  lu: (slug) => `Lu${baseName(slug)}`,

  // -------------------------------------------------------------------
  // gi — Game Icons
  // Original: (name) => `Gi${name}`
  // -------------------------------------------------------------------
  gi: (slug) => `Gi${baseName(slug)}`,

  // -------------------------------------------------------------------
  // wi — Weather Icons
  // Original: (name) => name   (NO prefix at all!)
  // -------------------------------------------------------------------
  wi: (slug) => baseName(slug),

  // -------------------------------------------------------------------
  // di — Devicons
  // Original: (name) => `Di${name}`
  // -------------------------------------------------------------------
  di: (slug) => `Di${baseName(slug)}`,

  // -------------------------------------------------------------------
  // ai — Ant Design Icons
  // Three content blocks:
  //   filled/*.svg   -> AiFill${name}
  //   outlined/*.svg -> AiOutline${name}
  //   twotone/*.svg  -> AiTwotone${name}
  // -------------------------------------------------------------------
  ai: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    if (cat.includes("twotone") || loosely(filePath, "twotone")) {
      return `AiTwotone${n}`;
    }
    if (cat.includes("outline") || loosely(filePath, "outlined")) {
      return `AiOutline${n}`;
    }
    // default / "filled"
    return `AiFill${n}`;
  },

  // -------------------------------------------------------------------
  // bs — Bootstrap Icons
  // This is the trickiest one: classification is based on SUFFIX
  // PATTERNS IN THE RAW FILENAME, not on a folder:
  //   *-fill.svg     (but NOT *-reverse-fill.svg) -> BsFill${name}
  //   *-reverse.svg  (but NOT *-reverse-fill.svg) -> BsReverse${name}
  //   everything else                             -> Bs${name}
  // Note the pascalCased `name` KEEPS the "Fill"/"Reverse" suffix from
  // its own filename — the prefix is ADDITIONAL, not a replacement.
  // That's why "alarm-fill.svg" becomes "BsFillAlarmFill" (Fill appears
  // twice): once as the added prefix, once because it was baked into the
  // filename itself. This is exactly what react-icons produces.
  // -------------------------------------------------------------------
  bs: (slug) => {
    const raw = stripSvgExtension(slug).toLowerCase();
    const n = baseName(slug);
    const isReverseFill = /-reverse-fill$/.test(raw);
    if (/-fill$/.test(raw) && !isReverseFill) {
      return `BsFill${n}`;
    }
    if (/-reverse$/.test(raw) && !isReverseFill) {
      return `BsReverse${n}`;
    }
    return `Bs${n}`;
  },

  // -------------------------------------------------------------------
  // ri — Remix Icon
  // Original: (name) => `Ri${name}`
  // -------------------------------------------------------------------
  ri: (slug) => `Ri${baseName(slug)}`,

  // -------------------------------------------------------------------
  // fc — Flat Color Icons
  // Original: (name) => `Fc${name}`
  // -------------------------------------------------------------------
  fc: (slug) => `Fc${baseName(slug)}`,

  // -------------------------------------------------------------------
  // gr — Grommet-Icons
  // Original: (name) => `Gr${name}`
  // -------------------------------------------------------------------
  gr: (slug) => `Gr${baseName(slug)}`,

  // -------------------------------------------------------------------
  // hi — Heroicons (v1)
  // Two content blocks:
  //   solid/*.svg   -> Hi${name}
  //   outline/*.svg -> HiOutline${name}
  // -------------------------------------------------------------------
  hi: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    const isOutline = cat.includes("outline") || loosely(filePath, "/outline/");
    return isOutline ? `HiOutline${n}` : `Hi${n}`;
  },

  // -------------------------------------------------------------------
  // hi2 — Heroicons 2
  // Three content blocks:
  //   24/solid/*.svg   -> Hi${name}
  //   24/outline/*.svg -> HiOutline${name}
  //   20/solid/*.svg   -> HiMini${name}   (the 20px set is the "mini" set)
  // -------------------------------------------------------------------
  hi2: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    const isMini = cat.includes("mini") || cat.includes("20") || loosely(filePath, "/20/solid/");
    if (isMini) return `HiMini${n}`;
    const isOutline = cat.includes("outline") || loosely(filePath, "/24/outline/");
    return isOutline ? `HiOutline${n}` : `Hi${n}`;
  },

  // -------------------------------------------------------------------
  // si — Simple Icons
  // Original: (name) => `Si${name}`
  // -------------------------------------------------------------------
  si: (slug) => `Si${baseName(slug)}`,

  // -------------------------------------------------------------------
  // sl — Simple Line Icons
  // Original: (name) => `Sl${name}`
  // -------------------------------------------------------------------
  sl: (slug) => `Sl${baseName(slug)}`,

  // -------------------------------------------------------------------
  // im — IcoMoon Free
  // Original: (name) => `Im${name.slice(3)}`
  // Source files carry a 3-character numeric prefix, e.g. "001-home.svg".
  // pascalCase("001-home") -> "001Home" (the "001" word survives untouched
  // because it starts with a digit), and .slice(3) strips exactly that
  // 3-char numeric prefix off the front, leaving "Home" -> "ImHome".
  // -------------------------------------------------------------------
  im: (slug) => `Im${baseName(slug).slice(3)}`,

  // -------------------------------------------------------------------
  // bi — BoxIcons
  // Three content blocks, keyed by the raw filename's own "bx-" family
  // prefix (which pascalCase turns into a "Bx"/"Bxs"/"Bxl" leading
  // segment that then gets stripped back out before re-prefixing):
  //   svg/regular/*.svg -> Bi${name.replace("Bx", "")}
  //   svg/solid/*.svg   -> BiSolid${name.replace("Bxs", "")}
  //   svg/logos/*.svg   -> BiLogo${name.replace("Bxl", "")}
  // category is expected to be one of: "regular", "solid", "logos" — but
  // we also sniff the raw slug's own bx-/bxs-/bxl- prefix as a fallback.
  // -------------------------------------------------------------------
  bi: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    const raw = stripSvgExtension(slug).toLowerCase();

    const isLogos = cat.includes("logo") || loosely(filePath, "/logos/") || raw.startsWith("bxl-");
    if (isLogos) return `BiLogo${n.replace("Bxl", "")}`;

    const isSolid = cat === "solid" || loosely(filePath, "/solid/") || raw.startsWith("bxs-");
    if (isSolid) return `BiSolid${n.replace("Bxs", "")}`;

    // default / "regular"
    return `Bi${n.replace("Bx", "")}`;
  },

  // -------------------------------------------------------------------
  // cg — css.gg
  // Original: (name) => `Cg${name}`
  // -------------------------------------------------------------------
  cg: (slug) => `Cg${baseName(slug)}`,

  // -------------------------------------------------------------------
  // vsc — VS Code Icons (codicons)
  // Original: (name) => `Vsc${name}`
  // -------------------------------------------------------------------
  vsc: (slug) => `Vsc${baseName(slug)}`,

  // -------------------------------------------------------------------
  // tb — Tabler Icons
  // Two content blocks:
  //   icons/filled/*.svg  -> Tb${name}Filled   (suffix, NOT prefix!)
  //   icons/outline/*.svg -> Tb${name}
  // -------------------------------------------------------------------
  tb: (slug, category, filePath) => {
    const n = baseName(slug);
    const cat = normalizeCategory(category);
    const isFilled = cat.includes("filled") || loosely(filePath, "/filled/");
    return isFilled ? `Tb${n}Filled` : `Tb${n}`;
  },

  // -------------------------------------------------------------------
  // tfi — Themify Icons
  // Original: (name) => `Tfi${name}`
  // -------------------------------------------------------------------
  tfi: (slug) => `Tfi${baseName(slug)}`,

  // -------------------------------------------------------------------
  // rx — Radix Icons
  // Original: (name) => `Rx${camelcase(name, { pascalCase: true })}`
  // (the extra camelcase() call in the original is redundant since
  // `name` is already PascalCase by this point — reproduced faithfully
  // by just using our own baseName()).
  // -------------------------------------------------------------------
  rx: (slug) => `Rx${baseName(slug)}`,

  // -------------------------------------------------------------------
  // pi — Phosphor Icons
  // Original: (name) => `Pi${name}`
  // Weight variants (bold/duotone/fill/light/thin/regular) are baked
  // into the source filename itself (e.g. "caret-down-bold.svg"), so no
  // extra category logic is needed — the weight suffix rides along
  // inside `name` automatically.
  // -------------------------------------------------------------------
  pi: (slug) => `Pi${baseName(slug)}`,

  // -------------------------------------------------------------------
  // lia — Icons8 Line Awesome
  // Original: (name) => `Lia${name}`
  // -------------------------------------------------------------------
  lia: (slug) => `Lia${baseName(slug)}`,
};

// ---------------------------------------------------------------------------
// Material Icons folder-name extraction helper
// ---------------------------------------------------------------------------

/**
 * Extracts the "real" icon name for a Material Design Icons file, which
 * lives in the PARENT FOLDER of the SVG (every SVG is literally named
 * "24px.svg"), e.g.:
 *
 *   .../material-design-icons/src/action/3d_rotation/materialicons/24px.svg
 *   -> "3d_rotation"
 *
 * Mirrors react-icons' own regex:
 *   file.replace(/^.*\/([^/]+)\/materialicons[^/]*\/24px.svg$/i, "$1")
 *
 * Falls back to the slug itself if filePath isn't supplied or doesn't
 * match the expected structure (e.g. if your scanner already hands you
 * the folder name as the slug directly).
 */
function extractMaterialIconFolderName(slug: string, filePath?: string): string {
  if (filePath) {
    const normalized = filePath.replace(/\\/g, "/");
    const match = normalized.match(/\/([^/]+)\/materialicons[^/]*\/[^/]+$/i);
    if (match) return match[1];
  }
  return stripSvgExtension(slug);
}
