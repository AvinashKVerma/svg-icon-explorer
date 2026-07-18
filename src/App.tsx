import { useEffect, useMemo } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useIconStore } from "@/store/icon-store";
import { useThemeEffect } from "@/hooks/use-theme";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { TopBar } from "@/features/topbar";
import { Sidebar } from "@/features/sidebar/sidebar";
import { IconGrid } from "@/features/grid/icon-grid";
import { MultiSelectBar } from "@/features/grid/multi-select-bar";
import { RightPanel } from "@/features/preview/right-panel";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  const init = useIconStore((s) => s.init);
  const loading = useIconStore((s) => s.loading);
  const error = useIconStore((s) => s.error);
  const allIcons = useIconStore((s) => s.allIcons);
  const selectedIconId = useIconStore((s) => s.selectedIconId);
  const query = useIconStore((s) => s.query);
  const selectedPacks = useIconStore((s) => s.selectedPacks);
  const selectedCategories = useIconStore((s) => s.selectedCategories);
  const showFavoritesOnly = useIconStore((s) => s.showFavoritesOnly);
  const getFilteredIcons = useIconStore((s) => s.getFilteredIcons);

  useThemeEffect();

  useEffect(() => {
    init();
  }, [init]);

  // Recompute whenever any filter-relevant slice changes.
  const filteredIcons = useMemo(
    () => getFilteredIcons(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIcons, query, selectedPacks, selectedCategories, showFavoritesOnly, getFilteredIcons],
  );

  useKeyboardShortcuts(filteredIcons);

  const selectedIcon = filteredIcons.find((i) => i.id === selectedIconId) ?? null;

  console.log(selectedIcon);
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-canvas text-ink-dim">
        <Loader2 size={22} className="animate-spin text-accent" />
        <p className="text-sm">Scanning your icon collection…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center text-ink-dim">
        <AlertTriangle size={22} className="text-danger" />
        <p className="text-sm">Couldn't load generated/manifest.json</p>
        <p className="max-w-md text-xs text-ink-faint">
          Run <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">npm run scan</code> to generate the
          manifest from your <code className="font-mono">icons/</code> folder, then reload.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#fbfbfb] text-ink">
        <TopBar resultCount={filteredIcons.length} />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <MultiSelectBar allIcons={allIcons} />
            <div className="min-h-0 flex-1">
              <IconGrid icons={filteredIcons} />
            </div>
          </div>
          <RightPanel icon={selectedIcon} />
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
