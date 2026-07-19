/**
 * scan-icons.ts
 * ------------------------------------------------------------------
 * Walks icons/ once, parses every .svg file's metadata (NOT its full
 * body — the manifest stays small even at 60k+ icons), and writes
 * generated/manifest.json. The React app never touches the filesystem;
 * it only ever reads this manifest + lazy-fetches individual SVG files
 * by path when a user selects one.
 *
 * Supported folder shapes, both scanned automatically:
 *   icons/<pack>/<file>.svg                (e.g. bootstrap/archive.svg)
 *   icons/<pack>/<category>/<file>.svg      (e.g. fontawesome/solid/house.svg)
 *
 * Run: npm run scan  (or: npx tsx scripts/scan-icons.ts)
 * ------------------------------------------------------------------
 */
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { getComponentName } from "./component-name";

interface IconRecord {
  id: string;
  pack: string;
  packLabel: string;
  category: string | null;
  name: string;
  componentName: string;
  filename: string;
  path: string;
  viewBox: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  keywords: string[];
}

const ICONS_ROOT = join(process.cwd(), "icons");
const OUT_DIR = join(process.cwd(), "generated");
const OUT_FILE = join(OUT_DIR, "manifest.json");

function toLabel(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toName(slug: string): string {
  return slug.replace(/[-_]/g, " ").trim().toLowerCase();
}

function extractAttr(svgSource: string, attr: string): string | null {
  const m = svgSource.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
  return m ? m[1] : null;
}

function deriveKeywords(name: string, pack: string, category: string | null): string[] {
  const words = new Set<string>();
  for (const part of name.split(/[\s-_]+/)) if (part) words.add(part.toLowerCase());
  for (const part of pack.split(/[\s-_]+/)) if (part) words.add(part.toLowerCase());
  if (category) for (const part of category.split(/[\s-_]+/)) if (part) words.add(part.toLowerCase());
  return Array.from(words);
}

function walk(dir: string, depth: number, fn: (filePath: string, depth: number) => void) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, depth + 1, fn);
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".svg") {
      fn(full, depth);
    }
  }
}

function scan(): IconRecord[] {
  const records: IconRecord[] = [];
  let topLevel: string[] = [];
  try {
    topLevel = readdirSync(ICONS_ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    console.error(`No icons/ directory found at ${ICONS_ROOT}`);
    return records;
  }

  for (const pack of topLevel) {
    const packDir = join(ICONS_ROOT, pack);
    const packLabel = toLabel(pack);

    walk(packDir, 0, (filePath) => {
      const relPath = relative(ICONS_ROOT, filePath).split("\\").join("/");
      const segments = relPath.split("/"); // pack/[category/]file.svg
      const filename = basename(filePath);

      const { slug, category, variant } = extractIconMetadata(pack, segments, filename);

      if (pack === "material-design-icons") {
        const size = filename.replace(/\.svg$/i, "");

        if (size !== "24px") {
          return;
        }
      }

      let source = "";
      let sizeBytes = 0;
      try {
        const stat = statSync(filePath);
        sizeBytes = stat.size;
        source = readFileSync(filePath, "utf8");
      } catch {
        return;
      }

      const viewBox = extractAttr(source, "viewBox") ?? "0 0 24 24";
      const widthAttr = extractAttr(source, "width");
      const heightAttr = extractAttr(source, "height");
      const width = widthAttr && /^\d+(\.\d+)?$/.test(widthAttr) ? parseFloat(widthAttr) : null;
      const height = heightAttr && /^\d+(\.\d+)?$/.test(heightAttr) ? parseFloat(heightAttr) : null;
      ``;

      const componentName = getComponentName(pack, category, slug, relPath);
      const name = toName(slug);

      const id = [pack, category, variant, slug]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-");

      records.push({
        id,
        pack,
        packLabel,
        category,
        name: componentName,
        componentName,
        filename: componentName,
        path: `icons/${relPath}`,
        viewBox,
        width,
        height,
        sizeBytes,
        keywords: deriveKeywords(name, pack, category),
      });
    });
  }

  return records;
}

function main() {
  const start = Date.now();
  const records = scan();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(records), "utf8");

  const packs = new Map<string, number>();
  for (const r of records) packs.set(r.packLabel, (packs.get(r.packLabel) ?? 0) + 1);

  const ms = Date.now() - start;
  console.log(`\nScanned ${records.length} icons across ${packs.size} packs in ${ms}ms`);
  for (const [pack, n] of Array.from(packs.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pack.padEnd(28)} ${n}`);
  }
  console.log(`\nWrote ${relative(process.cwd(), OUT_FILE)}\n`);
}

main();

function extractIconMetadata(pack: string, segments: string[], filename: string) {
  let slug = filename.replace(/\.svg$/i, "");
  let category: string | null = segments.length > 2 ? segments.slice(1, -1).join("/") : null;

  let variant: string | null = null;

  switch (pack) {
    case "material-design-icons":
      // pack/src/category/icon/style/size.svg
      category = segments[2];
      slug = segments[3];
      variant = segments[4];
      break;
  }

  return { slug, category, variant };
}
