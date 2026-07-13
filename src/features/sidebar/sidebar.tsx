import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Layers, Star, Clock, BarChart3, Shapes } from "lucide-react";
import { useIconStore } from "@/store/icon-store";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";

function SidebarSection({
  title,
  icon,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 py-2.5 first:pt-0 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wide text-ink-dim uppercase hover:text-ink"
      >
        <span className="text-ink-faint">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {count !== undefined && <span className="text-[10px] text-ink-faint">{count}</span>}
        <ChevronDown size={13} className={cn("text-ink-faint transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="mt-1.5 px-2">{children}</div>}
    </div>
  );
}

export function Sidebar() {
  const allIcons = useIconStore((s) => s.allIcons);
  const selectedPacks = useIconStore((s) => s.selectedPacks);
  const selectedCategories = useIconStore((s) => s.selectedCategories);
  const togglePack = useIconStore((s) => s.togglePack);
  const toggleCategory = useIconStore((s) => s.toggleCategory);
  const showFavoritesOnly = useIconStore((s) => s.showFavoritesOnly);
  const setShowFavoritesOnly = useIconStore((s) => s.setShowFavoritesOnly);
  const favorites = useIconStore((s) => s.favorites);
  const recentlyUsed = useIconStore((s) => s.recentlyUsed);
  const selectIcon = useIconStore((s) => s.selectIcon);
  const clearFilters = useIconStore((s) => s.clearFilters);

  // const packCounts = useMemo(() => {
  //   const map = new Map<string, { label: string; count: number }>();
  //   for (const icon of allIcons) {
  //     const cur = map.get(icon.pack);
  //     if (cur) cur.count++;
  //     else map.set(icon.pack, { label: icon.packLabel, count: 1 });
  //   }
  //   return Array.from(map.entries()).sort((a, b) => a[1].label.localeCompare(b[1].label));
  // }, [allIcons]);

  const packCounts = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();

    for (const icon of allIcons) {
      const existing = map.get(icon.pack);

      if (existing) {
        existing.count++;
      } else {
        map.set(icon.pack, {
          id: icon.pack,
          label: icon.packLabel,
          count: 1,
        });
      }
    }

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [allIcons]);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!packCounts.length) return;

    initialized.current = true;

    if (selectedPacks.size === 0) {
      togglePack(packCounts[0].id);
    }
  }, [packCounts, selectedPacks.size, togglePack]);

  const categoryCounts = useMemo(() => {
    const scoped = selectedPacks.size > 0 ? allIcons.filter((i) => selectedPacks.has(i.pack)) : allIcons;
    const map = new Map<string, number>();
    for (const icon of scoped) {
      if (!icon.category) continue;
      map.set(icon.category, (map.get(icon.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allIcons, selectedPacks]);

  const recentIcons = useMemo(
    () =>
      recentlyUsed
        .map((id) => allIcons.find((i) => i.id === id))
        .filter((i): i is NonNullable<typeof i> => Boolean(i))
        .slice(0, 8),
    [recentlyUsed, allIcons],
  );

  const hasActiveFilters = selectedPacks.size > 0 || selectedCategories.size > 0 || showFavoritesOnly;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-xs font-semibold text-ink-faint">{allIcons.length.toLocaleString()} icons</span>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[11px] text-accent hover:text-accent-strong">
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-col px-1">
        <SidebarSection title="Favorites" icon={<Star size={13} />} defaultOpen={false}>
          <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
            <Checkbox checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
            <span className="flex-1 text-ink-dim">Show favorites only</span>
            <span className="text-[11px] text-ink-faint">{favorites.length}</span>
          </label>
        </SidebarSection>

        <SidebarSection title="Recently used" icon={<Clock size={13} />} defaultOpen={false}>
          {recentIcons.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-ink-faint">Nothing yet</p>
          ) : (
            <div className="flex flex-col">
              {recentIcons.map((icon) => (
                <button
                  key={icon.id}
                  onClick={() => selectIcon(icon.id)}
                  className="truncate rounded-md px-2 py-1.5 text-left text-sm text-ink-dim hover:bg-surface-2 hover:text-ink"
                >
                  {icon.name}
                </button>
              ))}
            </div>
          )}
        </SidebarSection>

        <SidebarSection title="Packs" icon={<Layers size={13} />} count={packCounts.length}>
          <div className="flex flex-col">
            {/* {packCounts.map(([pack, { label, count }]) => (
              <label key={pack} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
                <Checkbox checked={selectedPacks.has(pack)} onCheckedChange={() => togglePack(pack)} />
                <span className="flex-1 truncate text-ink-dim">{label}</span>
                <span className="text-[11px] text-ink-faint">{count}</span>
              </label>
            ))} */}
            {packCounts.map((pack) => (
              <label
                key={pack.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2"
              >
                <Checkbox checked={selectedPacks.has(pack.id)} onCheckedChange={() => togglePack(pack.id)} />
                <span className="flex-1 truncate text-ink-dim">{pack.label}</span>
                <span className="text-[11px] text-ink-faint">{pack.count}</span>
              </label>
            ))}
          </div>
        </SidebarSection>

        {categoryCounts.length > 0 && (
          <SidebarSection
            title="Categories"
            icon={<Shapes size={13} />}
            count={categoryCounts.length}
            defaultOpen={false}
          >
            <div className="flex flex-col">
              {categoryCounts.map(([cat, count]) => (
                <label key={cat} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
                  <Checkbox checked={selectedCategories.has(cat)} onCheckedChange={() => toggleCategory(cat)} />
                  <span className="flex-1 truncate text-ink-dim">{cat}</span>
                  <span className="text-[11px] text-ink-faint">{count}</span>
                </label>
              ))}
            </div>
          </SidebarSection>
        )}

        <SidebarSection title="Statistics" icon={<BarChart3 size={13} />} defaultOpen={false}>
          <div className="flex flex-col gap-1.5 px-2 py-1.5 text-xs text-ink-dim">
            <div className="flex justify-between">
              <span>Total icons</span>
              <span className="text-ink">{allIcons.length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Packs</span>
              <span className="text-ink">{packCounts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Categories</span>
              <span className="text-ink">{categoryCounts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Favorites</span>
              <span className="text-ink">{favorites.length}</span>
            </div>
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
