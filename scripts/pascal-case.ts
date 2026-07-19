/**
 * Replacement for camelcase(rawName, { pascalCase: true })
 * used by react-icons.
 */

export function pascalCase(input: string): string {
  return input
    .replace(/\.[^.]+$/, "")
    .replace(/&/g, " And ")
    .replace(/['\u2019]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^\d/.test(word)) {
        return word.charAt(0) + word.slice(1);
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}
