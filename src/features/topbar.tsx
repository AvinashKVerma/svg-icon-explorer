import { useEffect, useRef, useState } from "react";
import { Search, X, Sun, Moon, Monitor, LayoutGrid, Grid2x2, Grid3x3 } from "lucide-react";
import { useIconStore } from "@/store/icon-store";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import type { GridDensity, Theme } from "@/types/icon";

const DENSITY_ICONS: Record<GridDensity, React.ReactNode> = {
  small: <Grid3x3 size={14} />,
  medium: <Grid2x2 size={14} />,
  large: <LayoutGrid size={14} />,
};

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];
const THEME_ICON: Record<Theme, React.ReactNode> = {
  light: <Sun size={14} />,
  dark: <Moon size={14} />,
  system: <Monitor size={14} />,
};

export function TopBar({ resultCount }: { resultCount: number }) {
  const query = useIconStore((s) => s.query);
  const setQuery = useIconStore((s) => s.setQuery);
  const gridDensity = useIconStore((s) => s.gridDensity);
  const setGridDensity = useIconStore((s) => s.setGridDensity);
  const theme = useIconStore((s) => s.theme);
  const setTheme = useIconStore((s) => s.setTheme);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(query);

  // Updating the input is cheap; defer a search request until the user pauses typing.
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    if (inputValue === query) return;
    const timer = window.setTimeout(() => setQuery(inputValue), 180);
    return () => window.clearTimeout(timer);
  }, [inputValue, query, setQuery]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setInputValue("");
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setQuery]);

  return (
    <header className="flex h-13 shrink-0 items-center gap-3 border-b border-border bg-surface px-3">
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-canvas">
          <Search size={13} strokeWidth={2.5} />
        </div>
        <span className="hidden text-sm font-semibold text-ink sm:inline">SVG Icon Explorer</span>
      </div>

      <div className="relative flex-1 max-w-xl">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint" />
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search icons by name, pack, category…"
          className="h-8 w-full rounded-md border border-border bg-surface-2 pl-8 pr-16 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent"
        />
        {inputValue ? (
          <button
            onClick={() => {
              setInputValue("");
              setQuery("");
            }}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
          >
            <X size={13} />
          </button>
        ) : (
          <kbd className="absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-faint">
            ⌘K
          </kbd>
        )}
      </div>

      <span className="hidden text-xs text-ink-faint md:inline">{resultCount.toLocaleString()} results</span>

      <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface-2 p-0.5">
        {(["small", "medium", "large"] as GridDensity[]).map((d) => (
          <Tooltip key={d} content={`${d[0].toUpperCase()}${d.slice(1)} grid`}>
            <button
              onClick={() => setGridDensity(d)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-ink-faint transition-colors",
                gridDensity === d && "bg-surface-3 text-ink",
              )}
            >
              {DENSITY_ICONS[d]}
            </button>
          </Tooltip>
        ))}
      </div>

      <Tooltip content={`Theme: ${theme}`}>
        <button
          onClick={() => setTheme(THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % 3])}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-ink-dim hover:text-ink"
        >
          {THEME_ICON[theme]}
        </button>
      </Tooltip>
    </header>
  );
}
