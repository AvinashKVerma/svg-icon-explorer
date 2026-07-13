export interface IconRecord {
  id: string;
  pack: string;
  packLabel: string;
  category: string | null;
  name: string;
  filename: string;
  path: string;
  viewBox: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  keywords: string[];
}

export type CopyFormat =
  | "svg"
  | "svg-optimized"
  | "jsx"
  | "tsx"
  | "component"
  | "path"
  | "json";

export type GridDensity = "small" | "medium" | "large";

export type Theme = "light" | "dark" | "system";

export type Background = "white" | "dark" | "checkerboard" | "transparent";

export interface PlaygroundState {
  size: number;
  strokeWidth: number;
  fillColor: string;
  strokeColor: string;
  rotation: number;
  opacity: number;
  scale: number;
  flipH: boolean;
  flipV: boolean;
  background: Background;
}
