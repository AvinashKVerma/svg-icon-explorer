import { ICON_FORMATTERS, PACK_PREFIX, pascalCase } from "./icon-formatters";

/**
 * Generates the React component name for an icon.
 *
 * Example:
 * lucide + arrow-right
 * => LuArrowRight
 *
 * fontawesome + regular + address-book
 * => FaRegAddressBook
 */

export function getComponentName(pack: string, category: string | null, slug: string, filePath?: string): string {
  const formatterKey = PACK_PREFIX[pack] ?? pack.trim().toLowerCase();

  const formatter = ICON_FORMATTERS[formatterKey];

  if (!formatter) {
    return pascalCase(slug);
  }

  return formatter(slug, category, filePath);
}

export function resolveIconMetadata(pack: string, category: string | null, slug: string, relPath: string) {
  const key = pack.trim().toLowerCase();
  const formatter = ICON_FORMATTERS[key];

  let componentName = slug;

  if (formatter) {
    componentName = formatter(slug, relPath);
  }

  return {
    componentName,
    filename: `${componentName}.svg`,
  };
}
