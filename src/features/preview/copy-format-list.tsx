import { Code2, Component, Waypoints, FileJson, Sparkles, Settings2 } from "lucide-react";
import type { CopyFormat, IconRecord } from "@/types/icon";
import { useCopyIcon } from "@/hooks/use-copy-icon";

const FORMATS: { format: CopyFormat; label: string; icon: React.ReactNode; hint: string }[] = [
  { format: "svg", label: "Copy SVG", icon: <Code2 size={14} />, hint: "Original markup" },
  {
    format: "svg-optimized",
    label: "Copy Optimized SVG",
    icon: <Sparkles size={14} />,
    hint: "Whitespace + comments stripped",
  },
  // { format: "jsx", label: "Copy JSX", icon: <Braces size={14} />, hint: "camelCase props" },
  // { format: "tsx", label: "Copy TSX", icon: <FileCode size={14} />, hint: "Typed component" },
  {
    format: "component",
    label: "Copy React Component",
    icon: <Component size={14} />,
    hint: "Uses saved generator settings",
  },
  { format: "path", label: "Copy Path Only", icon: <Waypoints size={14} />, hint: "<path> elements" },
  { format: "json", label: "Copy JSON", icon: <FileJson size={14} />, hint: "Metadata" },
  {
    format: "configure",
    label: "Configure Component Generator",
    icon: <Settings2 size={14} />,
    hint: "Customize before copying",
  },
];

interface CopyFormatListProps {
  icon: IconRecord;
  onOpenGenerator: () => void;
}

export function CopyFormatList({ icon, onOpenGenerator }: CopyFormatListProps) {
  const { copyIcon } = useCopyIcon();

  return (
    <div className="grid grid-cols-1 gap-1.5">
      {FORMATS.map((f) => (
        <button
          key={f.format}
          onClick={() => {
            if (f.format === "configure") {
              onOpenGenerator();
            } else {
              copyIcon(icon, f.format);
            }
          }}
          // onClick={() => copyIcon(icon, f.format)}
          className="group flex items-center gap-2.5 rounded-md border border-border bg-surface-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:border-accent/50 hover:bg-surface-3"
        >
          <span className="text-ink-faint group-hover:text-accent">{f.icon}</span>
          <span className="flex-1">{f.label}</span>
          <span className="text-[11px] text-ink-faint">{f.hint}</span>
        </button>
      ))}
    </div>
  );
}
