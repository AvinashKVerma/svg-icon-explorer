import Fuse from "fuse.js";
import type { IconRecord } from "@/types/icon";

let fuse: Fuse<IconRecord> | null = null;

self.onmessage = (event: MessageEvent) => {
  const message = event.data as
    | { type: "init"; records: IconRecord[] }
    | { type: "search"; query: string; requestId: number };

  if (message.type === "init") {
    fuse = new Fuse(message.records, {
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
    self.postMessage({ type: "ready" });
    return;
  }

  if (fuse) {
    const indices = fuse.search(message.query).map((result) => result.refIndex);
    self.postMessage({ type: "results", requestId: message.requestId, indices });
  }
};
