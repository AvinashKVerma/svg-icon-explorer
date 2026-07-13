import { useState } from "react";
import JSZip from "jszip";
import { X, Download, Loader2 } from "lucide-react";
import type { IconRecord } from "@/types/icon";
import { loadSvgSource } from "@/lib/svg-loader";
import { useIconStore } from "@/store/icon-store";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function MultiSelectBar({ allIcons }: { allIcons: IconRecord[] }) {
  const multiSelectedIds = useIconStore((s) => s.multiSelectedIds);
  const clearMultiSelect = useIconStore((s) => s.clearMultiSelect);
  const [exporting, setExporting] = useState(false);

  if (multiSelectedIds.size === 0) return null;

  const selected = allIcons.filter((i) => multiSelectedIds.has(i.id));

  async function exportZip() {
    setExporting(true);
    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();
      for (const icon of selected) {
        const source = await loadSvgSource(icon.path);
        let filename = `${icon.name.replace(/\s+/g, "-")}.svg`;
        let n = 2;
        while (usedNames.has(filename)) filename = `${icon.name.replace(/\s+/g, "-")}-${n++}.svg`;
        usedNames.add(filename);
        zip.file(filename, source);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `icons-${selected.length}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Exported ${selected.length} icons`);
    } catch {
      toast("Export failed — try again", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border bg-accent-dim px-4 py-2">
      <span className="text-sm text-ink">{selected.length} selected</span>
      <span className="text-xs text-ink-faint">⌘/Ctrl+click icons to add or remove</span>
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={clearMultiSelect}>
          <X size={13} /> Clear
        </Button>
        <Button size="sm" onClick={exportZip} disabled={exporting}>
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Export ZIP
        </Button>
      </div>
    </div>
  );
}
