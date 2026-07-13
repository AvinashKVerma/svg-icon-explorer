import { useCallback } from "react";
import type { CopyFormat, IconRecord } from "@/types/icon";
import { loadSvgSource } from "@/lib/svg-loader";
import {
  toJsx,
  toTsx,
  toDynamicComponent,
  toPathOnly,
  toJson,
  lightOptimize,
  copyText,
} from "@/lib/svg-transform";
import { useIconStore } from "@/store/icon-store";
import { toast } from "@/hooks/use-toast";

function pascalCase(name: string): string {
  return name
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")
    .concat("Icon");
}

const FORMAT_LABEL: Record<CopyFormat, string> = {
  svg: "SVG",
  "svg-optimized": "Optimized SVG",
  jsx: "JSX",
  tsx: "TSX",
  component: "React component",
  path: "Path data",
  json: "JSON",
};

export function useCopyIcon() {
  const pushRecentCopy = useIconStore((s) => s.pushRecentCopy);

  const copyIcon = useCallback(
    async (icon: IconRecord, format: CopyFormat) => {
      try {
        const source = await loadSvgSource(icon.path);
        const componentName = pascalCase(icon.name);
        let output: string;

        switch (format) {
          case "svg":
            output = source;
            break;
          case "svg-optimized":
            output = lightOptimize(source);
            break;
          case "jsx":
            output = toJsx(source, componentName);
            break;
          case "tsx":
            output = toTsx(source, componentName);
            break;
          case "component":
            output = toDynamicComponent(source, componentName);
            break;
          case "path":
            output = toPathOnly(source);
            break;
          case "json":
            output = toJson({
              id: icon.id,
              name: icon.name,
              pack: icon.packLabel,
              category: icon.category,
              path: icon.path,
              viewBox: icon.viewBox,
            });
            break;
        }

        await copyText(output);
        pushRecentCopy(icon.id, format);
        toast(`Copied ${FORMAT_LABEL[format]}`);
      } catch {
        toast("Couldn't copy — try again", "error");
      }
    },
    [pushRecentCopy]
  );

  const downloadIcon = useCallback(async (icon: IconRecord) => {
    try {
      const source = await loadSvgSource(icon.path);
      const blob = new Blob([source], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${icon.name.replace(/\s+/g, "-")}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Downloaded SVG");
    } catch {
      toast("Couldn't download — try again", "error");
    }
  }, []);

  return { copyIcon, downloadIcon };
}
