import type { ComponentGeneratorConfig } from "@/types/icon";

const INDENT = "  ";

function pad(level: number): string {
  return INDENT.repeat(level);
}

function isTs(config: ComponentGeneratorConfig): boolean {
  return config.language === "ts";
}

function propsTypeName(componentName: string): string {
  return `${componentName}Props`;
}

/** Builds the destructured prop names configured for the component (ref excluded). */
function propNames(config: ComponentGeneratorConfig): string[] {
  const names: string[] = [];
  if (config.includeSize) names.push(`size = ${config.defaults.size}`);
  if (config.includeColor) names.push(`color = "${config.defaults.color}"`);
  if (config.includeStrokeWidth) names.push(`strokeWidth = ${config.defaults.strokeWidth}`);
  if (config.includeClassName) names.push("className");
  if (config.includeStyle) names.push("style");
  if (config.includeTitle) names.push("title");
  if (config.spreadProps) names.push("...props");
  return names;
}

/** Builds the `import ... from "react"` statement, or an empty string. */
export function buildImportBlock(config: ComponentGeneratorConfig): string {
  if (!config.includeImports) return "";

  const values: string[] = [];
  if (config.useForwardRef) values.push("forwardRef");
  if (config.useMemo) values.push("memo");

  const types: string[] = [];
  if (isTs(config)) {
    if (config.spreadProps && config.includeSvgPropsImport) types.push("SVGProps");
    if (config.includeStyle) types.push("CSSProperties");
  }

  const specifiers = [...values, ...types.map((t) => `type ${t}`)];
  if (specifiers.length === 0) return "";

  return `import { ${specifiers.join(", ")} } from "react";`;
}

/** Builds the trailing `export default X;` statement, or an empty string for named exports. */
export function buildExportBlock(componentName: string, config: ComponentGeneratorConfig): string {
  if (config.exportType === "named") return "";
  return `export default ${componentName};`;
}

/** Builds the TS props type/interface declaration, or an empty string for JS / no props. */
export function buildPropsType(componentName: string, config: ComponentGeneratorConfig): string {
  if (!isTs(config)) return "";

  const fields: string[] = [];
  const styleType = config.includeImports ? "CSSProperties" : "Record<string, string | number>";
  if (config.includeSize) fields.push(`${pad(1)}size?: number;`);
  if (config.includeColor) fields.push(`${pad(1)}color?: string;`);
  if (config.includeStrokeWidth) fields.push(`${pad(1)}strokeWidth?: number;`);
  if (config.includeClassName) fields.push(`${pad(1)}className?: string;`);
  if (config.includeStyle) fields.push(`${pad(1)}style?: ${styleType};`);
  if (config.includeTitle) fields.push(`${pad(1)}title?: string;`);

  const canExtendSvgProps = config.spreadProps && config.includeSvgPropsImport && config.includeImports;
  const extendsClause = canExtendSvgProps ? ` extends Omit<SVGProps<SVGSVGElement>, "color" | "ref">` : "";

  if (fields.length === 0 && !config.spreadProps) return "";
  if (fields.length === 0 && !canExtendSvgProps) {
    return `export type ${propsTypeName(componentName)} = Record<string, unknown>;`;
  }

  const body = fields.length > 0 ? `\n${fields.join("\n")}\n` : "\n";
  return `export interface ${propsTypeName(componentName)}${extendsClause} {${body}}`;
}

/** Builds the opening line(s) of the component declaration, up to (not including) its body. */
export function buildComponentSignature(componentName: string, config: ComponentGeneratorConfig): string {
  const names = propNames(config);
  const hasProps = names.length > 0;
  const pattern = hasProps ? `{ ${names.join(", ")} }` : "";
  const typeAnnotation = isTs(config) && hasProps ? `: ${propsTypeName(componentName)}` : "";
  const isNamed = config.exportType === "named";
  const exportKeyword = isNamed ? "export " : "";

  if (config.useForwardRef) {
    const param = hasProps ? `${pattern}${typeAnnotation}` : "_";
    const generics = isTs(config) ? `<SVGSVGElement, ${hasProps ? propsTypeName(componentName) : "unknown"}>` : "";
    const inner = `forwardRef${generics}((${param}, ref) => {`;
    return config.useMemo
      ? `${exportKeyword}const ${componentName} = memo(${inner}`
      : `${exportKeyword}const ${componentName} = ${inner}`;
  }

  const param = hasProps ? `${pattern}${typeAnnotation}` : "";
  if (config.useMemo) {
    return `${exportKeyword}const ${componentName} = memo(function ${componentName}(${param}) {`;
  }

  return `${exportKeyword}function ${componentName}(${param}) {`;
}

// /** Builds the closing of the component declaration, mirroring buildComponentSignature. */
// function buildComponentClosing(componentName: string, config: ComponentGeneratorConfig): string {
//   if (config.useForwardRef) {
//     const closing = config.useMemo ? "});" : "};";
//     return `${pad(1)}${config.useMemo ? "}))" : "})"};\n${componentName}.displayName = "${componentName}";`
//       .replace(/^.*$/m, config.useMemo ? `${pad(0)}}));` : `${pad(0)}});`)
//       .concat("");
//   }
//   if (config.useMemo) return `${pad(0)}});`;
//   return `${pad(0)}}`;
// }

/** Builds the `<svg ...>` opening tag from a pre-formatted attribute list. */
export function buildSvgOpeningTag(attrs: string[]): string {
  const level = 2;
  if (attrs.length === 0) return `${pad(level)}<svg>`;
  if (attrs.length === 1) return `${pad(level)}<svg ${attrs[0]}>`;
  const attrLines = attrs.map((attr) => `${pad(level + 1)}${attr}`).join("\n");
  return `${pad(level)}<svg\n${attrLines}\n${pad(level)}>`;
}

/** Builds the `</svg>` closing tag. */
export function buildSvgClosingTag(): string {
  return `${pad(2)}</svg>`;
}

/** Wraps the inner SVG markup in a `return (...)` statement, indented for the component body. */
export function buildComponentBody(innerSvg: string): string {
  return `${pad(1)}return (\n${innerSvg}\n${pad(1)});`;
}

/**
 * Assembles the full component declaration (signature, body, and matching closing)
 * for a single named or anonymous function/arrow expression.
 */
export function buildComponent(componentName: string, innerSvg: string, config: ComponentGeneratorConfig): string {
  const signature = buildComponentSignature(componentName, config);
  const body = buildComponentBody(innerSvg);

  if (config.useForwardRef) {
    const closeArrow = "})";
    const closeMemo = config.useMemo ? ")" : "";
    return `${signature}\n${body}\n${pad(0)}${closeArrow}${closeMemo};\n${componentName}.displayName = "${componentName}";`;
  }

  if (config.useMemo) {
    return `${signature}\n${body}\n${pad(0)}});`;
  }

  return `${signature}\n${body}\n${pad(0)}}`;
}

/** Joins non-empty parts into a final file, separated per the config's spacing preference. */
export function assembleComponent(parts: string[], config?: ComponentGeneratorConfig): string {
  const filtered = parts.map((part) => part.trim()).filter(Boolean);
  const separator = config?.prettier === false ? "\n" : "\n\n";
  return `${filtered.join(separator)}\n`;
}
