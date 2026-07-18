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

export type CopyFormat = "svg" | "svg-optimized" | "jsx" | "tsx" | "component" | "path" | "json" | "configure";

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

export interface ComponentGeneratorConfig {
  language: "ts" | "js";

  includeImports: boolean;
  includeSvgPropsImport: boolean;

  exportType: "default" | "named";

  useForwardRef: boolean;
  useMemo: boolean;

  includeSize: boolean;
  includeColor: boolean;
  includeStrokeWidth: boolean;

  includeClassName: boolean;
  includeStyle: boolean;
  includeTitle: boolean;

  spreadProps: boolean;

  preserveViewBox: boolean;
  preserveXmlns: boolean;
  removeDimensions: boolean;

  prettier: boolean;

  defaults: {
    size: number;
    color: string;
    strokeWidth: number;
    componentName: string;
  };
}
