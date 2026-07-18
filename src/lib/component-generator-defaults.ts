import type { ComponentGeneratorConfig, PlaygroundState } from "@/types/icon";

export const DEFAULT_COMPONENT_GENERATOR: ComponentGeneratorConfig = {
  language: "ts",

  includeImports: true,
  includeSvgPropsImport: true,

  exportType: "default",

  useForwardRef: false,
  useMemo: false,

  includeSize: true,
  includeColor: true,
  includeStrokeWidth: true,

  includeClassName: true,
  includeStyle: true,
  includeTitle: false,

  spreadProps: true,

  preserveViewBox: true,
  preserveXmlns: false,
  removeDimensions: true,

  prettier: true,

  defaults: {
    size: 24,
    color: "currentColor",
    strokeWidth: 2,
    componentName: "ICON",
  },
};

export const DEFAULT_PLAYGROUND: PlaygroundState = {
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

export const REACT_JS_COMPONENT_GENERATOR: ComponentGeneratorConfig = {
  ...DEFAULT_COMPONENT_GENERATOR,
  language: "js",
};

export const LUCIDE_COMPONENT_GENERATOR: ComponentGeneratorConfig = {
  ...DEFAULT_COMPONENT_GENERATOR,

  exportType: "named",

  useForwardRef: true,
  useMemo: false,

  includeStrokeWidth: true,

  defaults: {
    size: 24,
    color: "currentColor",
    strokeWidth: 2,
    componentName: "ICON",
  },
};

export const HEROICONS_COMPONENT_GENERATOR: ComponentGeneratorConfig = {
  ...DEFAULT_COMPONENT_GENERATOR,

  useForwardRef: true,

  includeStrokeWidth: false,

  defaults: {
    size: 24,
    color: "currentColor",
    strokeWidth: 1.5,
    componentName: "ICON",
  },
};

export const MUI_COMPONENT_GENERATOR: ComponentGeneratorConfig = {
  ...DEFAULT_COMPONENT_GENERATOR,

  includeClassName: true,
  includeStyle: true,

  useForwardRef: true,
};

export const MINIMAL_COMPONENT_GENERATOR: ComponentGeneratorConfig = {
  language: "js",

  includeImports: false,
  includeSvgPropsImport: false,

  exportType: "default",

  useForwardRef: false,
  useMemo: false,

  includeSize: false,
  includeColor: false,
  includeStrokeWidth: false,

  includeClassName: false,
  includeStyle: false,
  includeTitle: false,

  spreadProps: false,

  preserveViewBox: true,
  preserveXmlns: false,
  removeDimensions: true,

  prettier: true,

  defaults: {
    size: 24,
    color: "currentColor",
    strokeWidth: 2,
    componentName: "ICON",
  },
};
