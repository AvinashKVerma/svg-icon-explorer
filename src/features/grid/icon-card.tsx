import { memo } from "react";
import { Star } from "lucide-react";
import type { IconRecord, GridDensity } from "@/types/icon";
import { IconGlyph } from "@/components/icon-glyph";
import { cn } from "@/lib/cn";

const DENSITY_GLYPH_SIZE: Record<GridDensity, number> = {
  small: 18,
  medium: 24,
  large: 32,
};

interface IconCardProps {
  icon: IconRecord;
  density: GridDensity;
  selected: boolean;
  multiSelected: boolean;
  favorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  onToggleFavorite: () => void;
}

export const IconCard = memo(function IconCard({
  icon,
  density,
  selected,
  multiSelected,
  favorite,
  onClick,
  onToggleFavorite,
}: IconCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onClick}
        title={icon.name}
        className={cn(
          "bg-white w-full group relative flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-left transition-all duration-100",
          "border-transparent hover:border-border hover:bg-surface-2",
          selected && "border-accent bg-accent-dim hover:border-accent",
          multiSelected && !selected && "border-accent/40 bg-accent-dim/50",
        )}
      >
        <div
          className="flex h-10 w-full items-center justify-center text-ink transition-transform duration-150 group-hover:scale-110"
          style={{ ["--gs" as string]: `${DENSITY_GLYPH_SIZE[density]}px` }}
        >
          <IconGlyph
            path={icon.path}
            fallbackSize={DENSITY_GLYPH_SIZE[density]}
            className="[&>svg]:h-(--gs) [&>svg]:w-(--gs)"
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            "absolute top-1 right-1 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100",
            "hover:bg-surface-3",
            favorite && "opacity-100",
          )}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={12} className={favorite ? "fill-favorite text-favorite" : "text-ink-faint"} />
        </button>
      </button>
      {density !== "small" && <span className="w-full truncate text-center text-[11px] text-ink-dim">{icon.name}</span>}
    </div>
  );
});
