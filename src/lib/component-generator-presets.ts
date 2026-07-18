import type { ComponentGeneratorConfig } from "@/types/icon";
import { DEFAULT_COMPONENT_GENERATOR } from "./component-generator-defaults";

export type ComponentGeneratorPreset = "react-ts" | "react-js" | "lucide" | "heroicons" | "shadcn" | "mui" | "minimal";

export interface ComponentGeneratorPresetDefinition {
  id: ComponentGeneratorPreset;
  label: string;
  description: string;
  config: ComponentGeneratorConfig;
}

const createPreset = (patch: Partial<ComponentGeneratorConfig>): ComponentGeneratorConfig => ({
  ...DEFAULT_COMPONENT_GENERATOR,
  ...patch,
  defaults: {
    ...DEFAULT_COMPONENT_GENERATOR.defaults,
    ...patch.defaults,
  },
});

export const COMPONENT_GENERATOR_PRESETS: Record<ComponentGeneratorPreset, ComponentGeneratorPresetDefinition> = {
  "react-ts": {
    id: "react-ts",
    label: "React (TypeScript)",
    description: "Standard TypeScript React component.",
    config: createPreset({
      language: "ts",
      includeImports: true,
      includeSvgPropsImport: true,
      exportType: "default",
    }),
  },

  "react-js": {
    id: "react-js",
    label: "React (JavaScript)",
    description: "Standard JavaScript React component.",
    config: createPreset({
      language: "js",
      includeImports: true,
      includeSvgPropsImport: false,
      exportType: "default",
    }),
  },

  lucide: {
    id: "lucide",
    label: "Lucide",
    description: "Lucide-style component.",
    config: createPreset({
      language: "ts",
      includeImports: true,
      includeSvgPropsImport: true,

      exportType: "named",

      useForwardRef: true,
      useMemo: false,

      includeSize: true,
      includeColor: true,
      includeStrokeWidth: true,

      includeClassName: true,
      includeStyle: false,
      includeTitle: false,

      spreadProps: true,

      defaults: {
        size: 24,
        color: "currentColor",
        strokeWidth: 2,
        componentName: "ICON",
      },
    }),
  },

  heroicons: {
    id: "heroicons",
    label: "Heroicons",
    description: "Heroicons-style component.",
    config: createPreset({
      language: "ts",
      includeImports: true,
      includeSvgPropsImport: true,

      exportType: "default",

      useForwardRef: true,

      includeSize: true,
      includeColor: true,
      includeStrokeWidth: false,

      includeClassName: true,
      includeStyle: false,
      includeTitle: false,

      spreadProps: true,

      defaults: {
        size: 24,
        color: "currentColor",
        strokeWidth: 2,
        componentName: "ICON",
      },
    }),
  },

  shadcn: {
    id: "shadcn",
    label: "shadcn/ui",
    description: "Compatible with shadcn/ui components.",
    config: createPreset({
      language: "ts",
      includeImports: true,
      includeSvgPropsImport: true,

      exportType: "default",

      useForwardRef: true,

      includeClassName: true,
      includeStyle: false,
      includeColor: true,
      includeSize: true,
      includeStrokeWidth: true,

      spreadProps: true,

      defaults: {
        size: 24,
        color: "currentColor",
        strokeWidth: 2,
        componentName: "ICON",
      },
    }),
  },

  mui: {
    id: "mui",
    label: "Material UI",
    description: "Material UI compatible component.",
    config: createPreset({
      language: "ts",
      includeImports: true,
      includeSvgPropsImport: true,

      exportType: "default",

      useForwardRef: true,
      useMemo: true,

      includeSize: true,
      includeColor: true,
      includeStrokeWidth: false,

      includeClassName: true,
      includeStyle: true,

      spreadProps: true,
    }),
  },

  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "Smallest possible React component.",
    config: createPreset({
      language: "ts",

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

      preserveXmlns: false,
      removeDimensions: true,
    }),
  },
};

export const COMPONENT_GENERATOR_PRESET_LIST = Object.values(COMPONENT_GENERATOR_PRESETS);

export function getComponentGeneratorPreset(preset: ComponentGeneratorPreset): ComponentGeneratorConfig {
  return structuredClone(COMPONENT_GENERATOR_PRESETS[preset].config);
}
