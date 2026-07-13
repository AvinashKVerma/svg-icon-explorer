import type { PlaygroundState } from "@/types/icon";

// -------------------------------------------------------------------------
// Attribute name conversion: kebab-case/SVG attrs -> camelCase JSX props
// -------------------------------------------------------------------------
const ATTR_MAP: Record<string, string> = {
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-miterlimit": "strokeMiterlimit",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "text-anchor": "textAnchor",
  "xlink:href": "xlinkHref",
  class: "className",
};

function attrsToJsx(source: string): string {
  let out = source;
  for (const [from, to] of Object.entries(ATTR_MAP)) {
    out = out.replaceAll(`${from}=`, `${to}=`);
  }
  // self-closing void-ish tags used inside icon svgs are already fine in JSX
  // strip comments (not valid inside JSX children as-is)
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  return out;
}

/** Strip the outer <svg ...> wrapper, returning just its inner content. */
export function extractInner(svgSource: string): string {
  const match = svgSource.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match ? match[1].trim() : svgSource.trim();
}

export function extractOpeningTagAttrs(svgSource: string): string {
  const match = svgSource.match(/<svg([^>]*)>/i);
  return match ? match[1].trim() : "";
}

// -------------------------------------------------------------------------
// Copy format generators
// -------------------------------------------------------------------------

export function toJsx(svgSource: string, componentName = "Icon"): string {
  const inner = attrsToJsx(extractInner(svgSource));
  return `function ${componentName}(props) {\n  return (\n    <svg {...props}>\n      ${inner}\n    </svg>\n  );\n}\n\nexport default ${componentName};\n`;
}

export function toTsx(svgSource: string, componentName = "Icon"): string {
  const inner = attrsToJsx(extractInner(svgSource));
  const attrs = extractOpeningTagAttrs(svgSource);
  const viewBoxMatch = attrs.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
  return `import type { SVGProps } from "react";

export default function ${componentName}(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="${viewBox}" fill="currentColor" {...props}>
      ${inner}
    </svg>
  );
}
`;
}

export function toDynamicComponent(svgSource: string, componentName = "Icon"): string {
  const inner = attrsToJsx(extractInner(svgSource));
  const attrs = extractOpeningTagAttrs(svgSource);
  const viewBoxMatch = attrs.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
  const isStroke = /stroke=["'](?!none)/.test(svgSource);

  return `import type { SVGProps } from "react";

export interface ${componentName}Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function ${componentName}({
  size = 24,
  color = "currentColor",
  ...props
}: ${componentName}Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="${viewBox}"
      ${isStroke ? 'fill="none"\n      stroke={color}' : "fill={color}"}
      {...props}
    >
      ${inner}
    </svg>
  );
}
`;
}

export function toPathOnly(svgSource: string): string {
  const matches = svgSource.match(/<path[^>]*\/?>/gi) ?? [];
  return matches.join("\n");
}

export function toJson(record: {
  id: string;
  name: string;
  pack: string;
  category: string | null;
  path: string;
  viewBox: string;
}): string {
  return JSON.stringify(record, null, 2);
}

/** Very small, dependency-free "optimizer": strips comments, collapses
 *  whitespace, drops empty groups and default/redundant attrs. This runs
 *  client-side; a real SVGO pass happens in the build script for bulk data. */
export function lightOptimize(svgSource: string): string {
  let out = svgSource;
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/\s+/g, " ");
  out = out.replace(/>\s+</g, "><");
  out = out.replace(/\s*(xmlns:xlink="[^"]*")\s*(?![\s\S]*xlink:)/g, ""); // drop unused xlink ns
  out = out.replace(/<g>\s*<\/g>/g, "");
  out = out.trim();
  return out;
}

// -------------------------------------------------------------------------
// Playground: apply live transform to raw svg source for on-screen preview
// -------------------------------------------------------------------------
export function applyPlaygroundStyle(svgSource: string, state: PlaygroundState): string {
  const inner = extractInner(svgSource);
  const attrs = extractOpeningTagAttrs(svgSource);
  const viewBoxMatch = attrs.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
  const hasStroke = /stroke=["'](?!none)/.test(svgSource);

  const transforms: string[] = [];
  if (state.rotation) transforms.push(`rotate(${state.rotation}deg)`);
  transforms.push(`scale(${state.scale * (state.flipH ? -1 : 1)}, ${state.scale * (state.flipV ? -1 : 1)})`);

  const style = [
    `width:${state.size}px`,
    `height:${state.size}px`,
    `opacity:${state.opacity}`,
    `transform:${transforms.join(" ")}`,
  ].join(";");

  const fillAttr = hasStroke ? `fill="none"` : `fill="${state.fillColor}"`;
  const strokeAttrs = hasStroke
    ? `stroke="${state.strokeColor}" stroke-width="${state.strokeWidth}"`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" style="${style}" ${fillAttr} ${strokeAttrs}>${inner}</svg>`;
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
