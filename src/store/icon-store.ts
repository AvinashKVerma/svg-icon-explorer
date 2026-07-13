import { create } from "zustand";
import { persist } from "zustand/middleware";
import type Fuse from "fuse.js";
import type {
  IconRecord,
  GridDensity,
  Theme,
  CopyFormat,
  PlaygroundState,
} from "@/types/icon";
import { loadManifest, buildSearchIndex } from "@/lib/manifest";

interface RecentCopy {
  iconId: string;
  format: CopyFormat;
  at: number;
}

const DEFAULT_PLAYGROUND: PlaygroundState = {
  size: 96,
  strokeWidth: 1.8,
  fillColor: "#6366f1",
  strokeColor: "#6366f1",
  rotation: 0,
  opacity: 1,
  scale: 1,
  flipH: false,
  flipV: false,
  background: "checkerboard",
};

interface IconStoreState {
  // data
  allIcons: IconRecord[];
  loading: boolean;
  error: string | null;
  fuse: Fuse<IconRecord> | null;

  // filters
  query: string;
  selectedPacks: Set<string>;
  selectedCategories: Set<string>;
  showFavoritesOnly: boolean;

  // selection
  selectedIconId: string | null;
  multiSelectedIds: Set<string>;

  // persisted
  favorites: string[];
  recentlyUsed: string[]; // icon ids, most recent first
  recentCopies: RecentCopy[];
  gridDensity: GridDensity;
  defaultCopyFormat: CopyFormat;
  theme: Theme;
  animationsEnabled: boolean;
  playground: PlaygroundState;

  // actions
  init: () => Promise<void>;
  setQuery: (q: string) => void;
  togglePack: (pack: string) => void;
  toggleCategory: (cat: string) => void;
  clearFilters: () => void;
  setShowFavoritesOnly: (v: boolean) => void;
  selectIcon: (id: string | null) => void;
  toggleMultiSelect: (id: string) => void;
  clearMultiSelect: () => void;
  toggleFavorite: (id: string) => void;
  pushRecentlyUsed: (id: string) => void;
  pushRecentCopy: (iconId: string, format: CopyFormat) => void;
  setGridDensity: (d: GridDensity) => void;
  setDefaultCopyFormat: (f: CopyFormat) => void;
  setTheme: (t: Theme) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setPlayground: (patch: Partial<PlaygroundState>) => void;
  resetPlayground: () => void;

  // derived (computed via getters below, exposed as functions)
  getFilteredIcons: () => IconRecord[];
}

export const useIconStore = create<IconStoreState>()(
  persist(
    (set, get) => ({
      allIcons: [],
      loading: true,
      error: null,
      fuse: null,

      query: "",
      selectedPacks: new Set(),
      selectedCategories: new Set(),
      showFavoritesOnly: false,

      selectedIconId: null,
      multiSelectedIds: new Set(),

      favorites: [],
      recentlyUsed: [],
      recentCopies: [],
      gridDensity: "medium",
      defaultCopyFormat: "svg",
      theme: "system",
      animationsEnabled: true,
      playground: DEFAULT_PLAYGROUND,

      init: async () => {
        if (get().allIcons.length > 0) return;
        set({ loading: true, error: null });
        try {
          const records = await loadManifest();
          const fuse = buildSearchIndex(records);
          set({ allIcons: records, fuse, loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : "Failed to load icons",
            loading: false,
          });
        }
      },

      setQuery: (q) => set({ query: q }),

      togglePack: (pack) =>
        set((s) => {
          const next = new Set(s.selectedPacks);
          if (next.has(pack)) next.delete(pack);
          else next.add(pack);
          return { selectedPacks: next };
        }),

      toggleCategory: (cat) =>
        set((s) => {
          const next = new Set(s.selectedCategories);
          if (next.has(cat)) next.delete(cat);
          else next.add(cat);
          return { selectedCategories: next };
        }),

      clearFilters: () =>
        set({
          selectedPacks: new Set(),
          selectedCategories: new Set(),
          showFavoritesOnly: false,
          query: "",
        }),

      setShowFavoritesOnly: (v) => set({ showFavoritesOnly: v }),

      selectIcon: (id) => set({ selectedIconId: id }),

      toggleMultiSelect: (id) =>
        set((s) => {
          const next = new Set(s.multiSelectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { multiSelectedIds: next };
        }),

      clearMultiSelect: () => set({ multiSelectedIds: new Set() }),

      toggleFavorite: (id) =>
        set((s) => {
          const has = s.favorites.includes(id);
          return {
            favorites: has ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites],
          };
        }),

      pushRecentlyUsed: (id) =>
        set((s) => ({
          recentlyUsed: [id, ...s.recentlyUsed.filter((r) => r !== id)].slice(0, 50),
        })),

      pushRecentCopy: (iconId, format) =>
        set((s) => ({
          recentCopies: [{ iconId, format, at: Date.now() }, ...s.recentCopies].slice(0, 30),
        })),

      setGridDensity: (d) => set({ gridDensity: d }),
      setDefaultCopyFormat: (f) => set({ defaultCopyFormat: f }),
      setTheme: (t) => set({ theme: t }),
      setAnimationsEnabled: (v) => set({ animationsEnabled: v }),
      setPlayground: (patch) => set((s) => ({ playground: { ...s.playground, ...patch } })),
      resetPlayground: () => set({ playground: DEFAULT_PLAYGROUND }),

      getFilteredIcons: () => {
        const s = get();
        let base: IconRecord[];

        if (s.query.trim().length >= 2 && s.fuse) {
          base = s.fuse.search(s.query.trim()).map((r) => r.item);
        } else {
          base = s.allIcons;
        }

        if (s.selectedPacks.size > 0) {
          base = base.filter((icon) => s.selectedPacks.has(icon.pack));
        }
        if (s.selectedCategories.size > 0) {
          base = base.filter((icon) => icon.category && s.selectedCategories.has(icon.category));
        }
        if (s.showFavoritesOnly) {
          const favSet = new Set(s.favorites);
          base = base.filter((icon) => favSet.has(icon.id));
        }
        return base;
      },
    }),
    {
      name: "svg-icon-explorer",
      partialize: (s) => ({
        favorites: s.favorites,
        recentlyUsed: s.recentlyUsed,
        recentCopies: s.recentCopies,
        gridDensity: s.gridDensity,
        defaultCopyFormat: s.defaultCopyFormat,
        theme: s.theme,
        animationsEnabled: s.animationsEnabled,
        playground: s.playground,
      }),
    }
  )
);
