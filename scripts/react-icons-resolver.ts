import path from "node:path";
import { icons } from "./icons"; // original react-icons icons.ts

export function resolveComponentName(pack: string, relPath: string): string {
  const def =
    icons.find((i) => i.id === pack) ??
    icons.find((i) => i.source?.type === "git" && i.source.localName.toLowerCase() === pack.toLowerCase()) ??
    icons.find((i) => i.name.toLowerCase() === pack.toLowerCase());

  if (!def) {
    throw new Error(`No react-icons definition found for "${pack}"`);
  }

  // filename without extension
  const rawName = path.basename(relPath, path.extname(relPath));

  // react-icons default behaviour
  const pascalName = rawName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join("");

  if (!def.contents.length) {
    return pascalName;
  }

  const content = def.contents[0];

  if (content.formatter) {
    return content.formatter(pascalName, relPath);
  }

  return pascalName;
}
