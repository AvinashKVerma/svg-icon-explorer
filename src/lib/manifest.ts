import Fuse from "fuse.js";
import type { IconRecord } from "@/types/icon";

let manifestPromise: Promise<IconRecord[]> | null = null;

export function loadManifest(): Promise<IconRecord[]> {
  if (!manifestPromise) {
    manifestPromise = fetch("/generated/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        manifestPromise = null;
        throw err;
      });
  }
  return manifestPromise;
}

export function buildSearchIndex(records: IconRecord[]) {
  return new Fuse(records, {
    keys: [
      { name: "name", weight: 0.4 },
      { name: "pack", weight: 0.2 },
      { name: "packLabel", weight: 0.2 },
      { name: "category", weight: 0.15 },
      { name: "filename", weight: 0.15 },
      { name: "keywords", weight: 0.3 },
    ],
    threshold: 0.32,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}
