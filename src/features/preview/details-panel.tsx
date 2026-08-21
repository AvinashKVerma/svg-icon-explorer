import { useCallback, useEffect, useState } from "react";
import { Star, Download } from "lucide-react";
import type { IconRecord } from "@/types/icon";
import { loadSvgSource } from "@/lib/svg-loader";
import { lightOptimize, copyText } from "@/lib/jsx-utils";
import { useIconStore } from "@/store/icon-store";
import { useCopyIcon } from "@/hooks/use-copy-icon";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CopyFormatList } from "./copy-format-list";
import { ComponentGeneratorDialog } from "./component-generator-dialog";
import { pascalCase } from "@/lib/string-utils";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} KB`;
}

export function DetailsPanel({ icon }: { icon: IconRecord }) {
  const [source, setSource] = useState<string | null>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const favorites = useIconStore((s) => s.favorites);
  const toggleFavorite = useIconStore((s) => s.toggleFavorite);
  const { downloadIcon } = useCopyIcon();
  const isFavorite = favorites.includes(icon.id);

  const handleCopyName = useCallback(async () => {
    try {
      await copyText(icon.name);
      toast(`Copied "${icon.name}"`);
    } catch {
      toast("Couldn't copy — try again", "error");
    }
  }, [icon.name]);

  useEffect(() => {
    setSource(null);
    loadSvgSource(icon.path)
      .then(setSource)
      .catch(() => setSource(null));
  }, [icon.path]);

  const optimizedSize = source ? new Blob([lightOptimize(source)]).size : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="checkerboard-bg m-3 flex h-40 shrink-0 items-center justify-center rounded-lg border border-border">
        {source && (
          <div
            className="h-16 w-16 text-ink [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: source }}
          />
        )}
      </div>

      <div className="flex items-start justify-between gap-2 px-4">
        <div className="min-w-0">
          <h2
            className="truncate text-base font-semibold text-ink cursor-pointer hover:text-accent transition-colors"
            onClick={handleCopyName}
            title="Click to copy icon name"
          >
            {icon.name}
          </h2>
          <p className="text-xs text-ink-faint">
            {icon.packLabel}
            {icon.category ? ` · ${icon.category}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="outline" size="icon" onClick={() => toggleFavorite(icon.id)}>
            <Star size={14} className={isFavorite ? "fill-favorite text-favorite" : ""} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => downloadIcon(icon)}>
            <Download size={14} />
          </Button>
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs">
        <Metadatum label="Pack" value={icon.packLabel} />
        <Metadatum label="Category" value={icon.category ?? "—"} />
        <Metadatum label="Filename" value={icon.filename} mono />
        <Metadatum label="ViewBox" value={icon.viewBox} mono />
        <Metadatum label="Original size" value={formatBytes(icon.sizeBytes)} />
        <Metadatum label="Optimized size" value={optimizedSize !== null ? formatBytes(optimizedSize) : "…"} />
      </div>

      <div className="mt-4 flex-1 px-4 pb-4">
        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">Copy as</p>
        <CopyFormatList icon={icon} onOpenGenerator={() => setGeneratorOpen(true)} />
      </div>

      {generatorOpen && source && (
        <ComponentGeneratorDialog
          svg={source}
          defaultComponentName={pascalCase(icon.name)}
          onClose={() => setGeneratorOpen(false)}
        />
      )}
    </div>
  );
}

function Metadatum({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-ink-faint">{label}</p>
      <p className={`truncate text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
