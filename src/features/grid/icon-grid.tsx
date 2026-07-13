import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SearchX } from "lucide-react";

import type { GridDensity, IconRecord } from "@/types/icon";
import { useIconStore } from "@/store/icon-store";
import { IconCard } from "./icon-card";

const DENSITY_CONFIG: Record<
  GridDensity,
  {
    cell: number;
    columnGap: number;
    rowGap: number;
  }
> = {
  small: {
    cell: 68,
    columnGap: 6,
    rowGap: 8,
  },
  medium: {
    cell: 96,
    columnGap: 8,
    rowGap: 12,
  },
  large: {
    cell: 128,
    columnGap: 10,
    rowGap: 14,
  },
};

export function IconGrid({ icons }: { icons: IconRecord[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(6);

  const density = useIconStore((s) => s.gridDensity);
  const selectedIconId = useIconStore((s) => s.selectedIconId);
  const multiSelectedIds = useIconStore((s) => s.multiSelectedIds);
  const favorites = useIconStore((s) => s.favorites);

  const selectIcon = useIconStore((s) => s.selectIcon);
  const toggleMultiSelect = useIconStore((s) => s.toggleMultiSelect);
  const toggleFavorite = useIconStore((s) => s.toggleFavorite);
  const pushRecentlyUsed = useIconStore((s) => s.pushRecentlyUsed);

  const { cell, columnGap, rowGap } = DENSITY_CONFIG[density];

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const recompute = useCallback(() => {
    const width = parentRef.current?.clientWidth ?? 0;

    const cols = Math.max(1, Math.floor((width + columnGap) / (cell + columnGap)));

    setColumns(cols);
  }, [cell, columnGap]);

  useEffect(() => {
    recompute();

    const observer = new ResizeObserver(recompute);

    if (parentRef.current) {
      observer.observe(parentRef.current);
    }

    return () => observer.disconnect();
  }, [recompute]);

  const rowCount = Math.ceil(icons.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cell + rowGap,
    overscan: 8,
  });

  if (!icons.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-faint">
        <SearchX size={28} strokeWidth={1.5} />
        <p className="text-sm">No icons match your filters</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto px-4 py-3">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: rowVirtualizer.getTotalSize(),
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns;
          const end = Math.min(start + columns, icons.length);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                columnGap,
              }}
            >
              {icons.slice(start, end).map((icon) => (
                <IconCard
                  key={icon.id}
                  icon={icon}
                  density={density}
                  selected={selectedIconId === icon.id}
                  multiSelected={multiSelectedIds.has(icon.id)}
                  favorite={favoriteSet.has(icon.id)}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      toggleMultiSelect(icon.id);
                      return;
                    }

                    selectIcon(icon.id);
                    pushRecentlyUsed(icon.id);
                  }}
                  onToggleFavorite={() => toggleFavorite(icon.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
