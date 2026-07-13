// Lazy-loads raw SVG source for a given manifest path, with a simple
// in-memory cache so scrolling back over a card doesn't re-fetch.
// In dev/build, `icons/` is served from the project root as a static
// asset directory (see vite.config.ts `publicDir`-style alias below).

const cache = new Map<string, Promise<string>>();

export function loadSvgSource(path: string): Promise<string> {
  const cached = cache.get(path);
  if (cached) return cached;

  const promise = fetch(`/${path}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      return res.text();
    })
    .catch((err) => {
      cache.delete(path);
      throw err;
    });

  cache.set(path, promise);
  return promise;
}

export function clearSvgCache() {
  cache.clear();
}
