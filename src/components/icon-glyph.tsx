import { useEffect, useState } from "react";
import { loadSvgSource } from "@/lib/svg-loader";

/** Renders raw SVG markup fetched on demand for a given manifest path. */
export function IconGlyph({
  path,
  className,
  fallbackSize = 20,
}: {
  path: string;
  className?: string;
  fallbackSize?: number;
}) {
  const [markup, setMarkup] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMarkup(null);
    setFailed(false);
    loadSvgSource(path)
      .then((src) => {
        if (!cancelled) setMarkup(src);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (failed) {
    return (
      <div
        className={className}
        style={{ width: fallbackSize, height: fallbackSize }}
        aria-hidden
      />
    );
  }

  if (!markup) {
    return (
      <div
        className={`${className ?? ""} animate-pulse rounded bg-surface-3`}
        style={{ width: fallbackSize, height: fallbackSize }}
      />
    );
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}
