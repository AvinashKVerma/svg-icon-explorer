// src/lib/component-generator.ts
//
// Converts raw SVG markup into a ready-to-use React component source string.
// Pure string/DOM generation — no external libraries.

import type { ComponentGeneratorConfig } from "@/types/icon";

/** Maps kebab-case / namespaced SVG attribute names to their JSX equivalents. */
const SVG_ATTRIBUTE_NAME_MAP: Record<string, string> = {
  class: "className",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "color-rendering": "colorRendering",
  "dominant-baseline": "dominantBaseline",
  "enable-background": "enableBackground",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-size-adjust": "fontSizeAdjust",
  "font-stretch": "fontStretch",
  "font-style": "fontStyle",
  "font-variant": "fontVariant",
  "font-weight": "fontWeight",
  "glyph-orientation-horizontal": "glyphOrientationHorizontal",
  "glyph-orientation-vertical": "glyphOrientationVertical",
  "image-rendering": "imageRendering",
  "letter-spacing": "letterSpacing",
  "lighting-color": "lightingColor",
  "marker-end": "markerEnd",
  "marker-mid": "markerMid",
  "marker-start": "markerStart",
  "overline-position": "overlinePosition",
  "overline-thickness": "overlineThickness",
  "paint-order": "paintOrder",
  "pointer-events": "pointerEvents",
  "shape-rendering": "shapeRendering",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "strikethrough-position": "strikethroughPosition",
  "strikethrough-thickness": "strikethroughThickness",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "text-decoration": "textDecoration",
  "text-rendering": "textRendering",
  "underline-position": "underlinePosition",
  "underline-thickness": "underlineThickness",
  "unicode-bidi": "unicodeBidi",
  "word-spacing": "wordSpacing",
  "writing-mode": "writingMode",
  "xlink:actuate": "xlinkActuate",
  "xlink:arcrole": "xlinkArcrole",
  "xlink:href": "xlinkHref",
  "xlink:role": "xlinkRole",
  "xlink:show": "xlinkShow",
  "xlink:title": "xlinkTitle",
  "xlink:type": "xlinkType",
  "xml:base": "xmlBase",
  "xml:lang": "xmlLang",
  "xml:space": "xmlSpace",
  "xmlns:xlink": "xmlnsXlink",
  tabindex: "tabIndex",
  baseprofile: "baseProfile",
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  gradienttransform: "gradientTransform",
  gradientunits: "gradientUnits",
  spreadmethod: "spreadMethod",
  patterncontentunits: "patternContentUnits",
  patterntransform: "patternTransform",
  patternunits: "patternUnits",
  primitiveunits: "primitiveUnits",
  attributename: "attributeName",
  attributetype: "attributeType",
  repeatcount: "repeatCount",
  repeatdur: "repeatDur",
  calcmode: "calcMode",
  keytimes: "keyTimes",
  keysplines: "keySplines",
  startoffset: "startOffset",
  refx: "refX",
  refy: "refY",
  markerwidth: "markerWidth",
  markerheight: "markerHeight",
  markerunits: "markerUnits",
  diffuseconstant: "diffuseConstant",
  specularconstant: "specularConstant",
  specularexponent: "specularExponent",
  surfacescale: "surfaceScale",
  kernelmatrix: "kernelMatrix",
  kernelunitlength: "kernelUnitLength",
  edgemode: "edgeMode",
  stddeviation: "stdDeviation",
  numoctaves: "numOctaves",
  basefrequency: "baseFrequency",
  targetx: "targetX",
  targety: "targetY",
  limitingconeangle: "limitingConeAngle",
  pointsatx: "pointsAtX",
  pointsaty: "pointsAtY",
  pointsatz: "pointsAtZ",
};

function pad(level: number): string {
  return "  ".repeat(level);
}

function toPascalCase(input: string): string {
  const cleaned = input.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const pascal = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
  if (!pascal) return "Icon";
  return /^[0-9]/.test(pascal) ? `Icon${pascal}` : pascal;
}

function toCamelCase(input: string): string {
  return input.replace(/-([a-z0-9])/gi, (_match, char: string) => char.toUpperCase());
}

function jsxAttributeName(name: string): string {
  if (name.startsWith("data-") || name.startsWith("aria-")) return name;
  const mapped = SVG_ATTRIBUTE_NAME_MAP[name];
  if (mapped) return mapped;
  if (name.includes("-") || name.includes(":")) {
    return name.replace(/[-:]([a-zA-Z0-9])/g, (_match, char: string) => char.toUpperCase());
  }
  return name;
}

function isReplaceableColorValue(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed === "none") return false;
  if (trimmed === "transparent") return false;
  if (trimmed === "inherit") return false;
  if (trimmed.startsWith("url(")) return false;
  return true;
}

function formatStringAttr(name: string, value: string): string {
  if (value.includes('"') || value.includes("\\")) {
    return `${name}={${JSON.stringify(value)}}`;
  }
  return `${name}="${value}"`;
}

function parseInlineStyle(styleValue: string): Record<string, string> {
  const result: Record<string, string> = {};
  styleValue
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .forEach((declaration) => {
      const separatorIndex = declaration.indexOf(":");
      if (separatorIndex === -1) return;
      const rawProp = declaration.slice(0, separatorIndex).trim();
      const rawValue = declaration.slice(separatorIndex + 1).trim();
      if (!rawProp || !rawValue) return;
      const prop = rawProp.startsWith("--") ? rawProp : toCamelCase(rawProp);
      result[prop] = rawValue;
    });
  return result;
}

function styleObjectToLiteral(styleObj: Record<string, string>): string {
  const entries = Object.entries(styleObj);
  if (entries.length === 0) return "{}";
  const body = entries
    .map(([key, value]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      return `${safeKey}: ${JSON.stringify(value)}`;
    })
    .join(", ");
  return `{ ${body} }`;
}

function escapeJsxText(text: string): string {
  if (text.includes("{") || text.includes("}")) {
    return `{${JSON.stringify(text)}}`;
  }
  return text;
}

function parseSvgSource(svgSource: string): Element {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgSource.trim(), "image/svg+xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`Invalid SVG source: ${parserError.textContent?.trim() ?? "unknown parse error"}`);
  }
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg") {
    throw new Error("Invalid SVG source: root element must be <svg>.");
  }
  return root;
}

function collectRootAttributes(el: Element, config: ComponentGeneratorConfig): string[] {
  const attrs: string[] = [];
  let hadWidth = false;
  let hadHeight = false;
  let hadStyle = false;

  Array.from(el.attributes).forEach((attr) => {
    const { name, value } = attr;

    if (name === "class") {
      if (config.includeClassName) return;
      attrs.push(formatStringAttr("className", value));
      return;
    }

    if (name === "style") {
      hadStyle = true;
      const styleObj = parseInlineStyle(value);
      const literal = styleObjectToLiteral(styleObj);
      if (config.includeStyle) {
        attrs.push(Object.keys(styleObj).length > 0 ? `style={{ ...${literal}, ...style }}` : "style={style}");
      } else {
        attrs.push(`style={${literal}}`);
      }
      return;
    }

    if (name === "width") {
      hadWidth = true;
      if (config.removeDimensions) return;
      attrs.push(config.includeSize ? "width={size}" : formatStringAttr("width", value));
      return;
    }

    if (name === "height") {
      hadHeight = true;
      if (config.removeDimensions) return;
      attrs.push(config.includeSize ? "height={size}" : formatStringAttr("height", value));
      return;
    }

    if (name.toLowerCase() === "viewbox") {
      if (config.preserveViewBox) attrs.push(formatStringAttr("viewBox", value));
      return;
    }

    if (name === "xmlns" || name === "xmlns:xlink") {
      if (config.preserveXmlns) attrs.push(formatStringAttr(jsxAttributeName(name), value));
      return;
    }

    if ((name === "fill" || name === "stroke") && config.includeColor && isReplaceableColorValue(value)) {
      attrs.push(`${name}={color}`);
      return;
    }

    if (name === "stroke-width" && config.includeStrokeWidth) {
      attrs.push("strokeWidth={strokeWidth}");
      return;
    }

    attrs.push(formatStringAttr(jsxAttributeName(name), value));
  });

  if (!config.removeDimensions && config.includeSize) {
    if (!hadWidth) attrs.push("width={size}");
    if (!hadHeight) attrs.push("height={size}");
  }

  if (config.includeClassName) attrs.push("className={className}");
  if (config.includeStyle && !hadStyle) attrs.push("style={style}");

  if (config.includeTitle) {
    attrs.push("aria-hidden={title ? undefined : true}");
    attrs.push('role="img"');
  }

  if (config.useForwardRef) attrs.push("ref={ref}");
  if (config.spreadProps) attrs.push("{...props}");

  return attrs;
}

function processChildAttributes(el: Element, config: ComponentGeneratorConfig): string[] {
  const attrs: string[] = [];

  Array.from(el.attributes).forEach((attr) => {
    const { name, value } = attr;

    if (name === "class") {
      attrs.push(formatStringAttr("className", value));
      return;
    }

    if (name === "style") {
      const styleObj = parseInlineStyle(value);
      attrs.push(`style={${styleObjectToLiteral(styleObj)}}`);
      return;
    }

    if ((name === "fill" || name === "stroke") && config.includeColor && isReplaceableColorValue(value)) {
      attrs.push(`${name}={color}`);
      return;
    }

    if (name === "stroke-width" && config.includeStrokeWidth) {
      attrs.push("strokeWidth={strokeWidth}");
      return;
    }

    attrs.push(formatStringAttr(jsxAttributeName(name), value));
  });

  return attrs;
}

function formatAttrLines(attrs: string[], level: number): string {
  return attrs.map((attr) => `${pad(level)}${attr}`).join("\n");
}

function buildElementJsx(tag: string, attrs: string[], childMarkup: string, level: number): string {
  const attrLines = formatAttrLines(attrs, level + 1);

  if (!childMarkup) {
    if (attrs.length === 0) return `${pad(level)}<${tag} />`;
    if (attrs.length === 1) return `${pad(level)}<${tag} ${attrs[0]} />`;
    return `${pad(level)}<${tag}\n${attrLines}\n${pad(level)}/>`;
  }

  const openTag =
    attrs.length === 0
      ? `${pad(level)}<${tag}>`
      : attrs.length === 1
        ? `${pad(level)}<${tag} ${attrs[0]}>`
        : `${pad(level)}<${tag}\n${attrLines}\n${pad(level)}>`;

  return `${openTag}\n${childMarkup}\n${pad(level)}</${tag}>`;
}

function renderNode(node: ChildNode, config: ComponentGeneratorConfig, level: number): string {
  if (node.nodeType === Node.COMMENT_NODE) return "";

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").trim();
    if (!text) return "";
    return `${pad(level)}${escapeJsxText(text)}`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  if (el.tagName.toLowerCase() === "script") return "";

  const attrs = processChildAttributes(el, config);
  const childMarkup = renderChildren(el, config, level + 1);
  return buildElementJsx(el.tagName, attrs, childMarkup, level);
}

function renderChildren(parent: Element, config: ComponentGeneratorConfig, level: number): string {
  const parts: string[] = [];
  parent.childNodes.forEach((node) => {
    const rendered = renderNode(node, config, level);
    if (rendered) parts.push(rendered);
  });
  return parts.join("\n");
}

interface PropsType {
  declaration: string;
  typeRef: string;
}

function buildPropsType(config: ComponentGeneratorConfig, propsTypeName: string): PropsType {
  const styleType = config.includeImports ? "CSSProperties" : "Record<string, string | number>";

  const fields: string[] = [];
  if (config.includeSize) fields.push(`${pad(1)}size?: number;`);
  if (config.includeColor) fields.push(`${pad(1)}color?: string;`);
  if (config.includeStrokeWidth) fields.push(`${pad(1)}strokeWidth?: number;`);
  if (config.includeClassName) fields.push(`${pad(1)}className?: string;`);
  if (config.includeStyle) fields.push(`${pad(1)}style?: ${styleType};`);
  if (config.includeTitle) fields.push(`${pad(1)}title?: string;`);

  const canExtendSvgProps = config.spreadProps && config.includeSvgPropsImport && config.includeImports;
  const extendsClause = canExtendSvgProps ? ` extends Omit<SVGProps<SVGSVGElement>, "color" | "ref">` : "";

  if (fields.length === 0 && !config.spreadProps) {
    return { declaration: "", typeRef: "Record<string, never>" };
  }

  if (fields.length === 0 && config.spreadProps && !canExtendSvgProps) {
    return {
      declaration: `export type ${propsTypeName} = Record<string, unknown>;`,
      typeRef: propsTypeName,
    };
  }

  const body = fields.length > 0 ? `\n${fields.join("\n")}\n` : "\n";
  return {
    declaration: `export interface ${propsTypeName}${extendsClause} {${body}}`,
    typeRef: propsTypeName,
  };
}

function buildImportBlock(config: ComponentGeneratorConfig, needsSvgPropsType: boolean): string {
  if (!config.includeImports) return "";

  const valueImports: string[] = [];
  if (config.useForwardRef) valueImports.push("forwardRef");
  if (config.useMemo) valueImports.push("memo");

  const typeImports: string[] = [];
  if (config.language === "ts") {
    if (needsSvgPropsType) typeImports.push("SVGProps");
    if (config.includeStyle) typeImports.push("CSSProperties");
  }

  if (valueImports.length === 0 && typeImports.length === 0) return "";

  const specifiers = [...valueImports, ...typeImports.map((t) => `type ${t}`)];
  return `import { ${specifiers.join(", ")} } from "react";`;
}

/**
 * Generates the full source of a React component from raw SVG markup.
 * Pure string/DOM based — produces TS or JS, with configurable props,
 * ref forwarding, memoization, and export style.
 */
export function generateReactComponent(
  svgSource: string,
  componentName: string,
  config: ComponentGeneratorConfig,
): string {
  if (typeof DOMParser === "undefined") {
    throw new Error("generateReactComponent requires a DOM environment (DOMParser is unavailable).");
  }
  if (!svgSource || !svgSource.trim()) {
    throw new Error("generateReactComponent requires non-empty SVG source.");
  }

  const name = toPascalCase(componentName);
  const isTs = config.language === "ts";
  const svgElement = parseSvgSource(svgSource);

  const rootAttrs = collectRootAttributes(svgElement, config);
  const childrenMarkup = renderChildren(svgElement, config, 3);
  const titleMarkup = config.includeTitle ? `${pad(3)}{title ? <title>{title}</title> : null}` : "";
  const bodyChildren = [titleMarkup, childrenMarkup].filter(Boolean).join("\n");
  const svgJsx = buildElementJsx("svg", rootAttrs, bodyChildren, 2);
  const componentBody = `return (\n${svgJsx}\n${pad(1)});`;

  const propsTypeName = `${name}Props`;
  const propsType = isTs ? buildPropsType(config, propsTypeName) : { declaration: "", typeRef: "" };
  const canExtendSvgProps = config.spreadProps && config.includeSvgPropsImport && config.includeImports && isTs;
  const importBlock = buildImportBlock(config, canExtendSvgProps);

  const destructureFields: string[] = [];
  if (config.includeSize) destructureFields.push(`size = ${config.defaults.size}`);
  if (config.includeColor) destructureFields.push(`color = "${config.defaults.color}"`);
  if (config.includeStrokeWidth) {
    destructureFields.push(`strokeWidth = ${config.defaults.strokeWidth}`);
  }
  if (config.includeClassName) destructureFields.push("className");
  if (config.includeStyle) destructureFields.push("style");
  if (config.includeTitle) destructureFields.push("title");
  if (config.spreadProps) destructureFields.push("...props");

  const hasDestructure = destructureFields.length > 0;
  const destructurePattern = hasDestructure ? `{ ${destructureFields.join(", ")} }` : "";
  const isNamed = config.exportType === "named";

  let componentDeclaration: string;

  if (config.useForwardRef) {
    const propsParam = hasDestructure ? destructurePattern : "_";
    const generics = isTs ? `<SVGSVGElement, ${propsType.typeRef}>` : "";
    let expr = `forwardRef${generics}((${propsParam}, ref) => {\n${pad(1)}${componentBody}\n})`;
    if (config.useMemo) expr = `memo(${expr})`;
    componentDeclaration = `${isNamed ? "export " : ""}const ${name} = ${expr};\n${name}.displayName = "${name}";`;
  } else if (config.useMemo) {
    const params = hasDestructure ? `${destructurePattern}${isTs ? `: ${propsType.typeRef}` : ""}` : "";
    componentDeclaration = `${isNamed ? "export " : ""}const ${name} = memo(function ${name}(${params}) {\n${pad(1)}${componentBody}\n});`;
  } else {
    const params = hasDestructure ? `${destructurePattern}${isTs ? `: ${propsType.typeRef}` : ""}` : "";
    componentDeclaration = `${isNamed ? "export " : ""}function ${name}(${params}) {\n${pad(1)}${componentBody}\n}`;
  }

  const exportLine = isNamed ? "" : `export default ${name};`;

  const sections = [importBlock, isTs ? propsType.declaration : "", componentDeclaration, exportLine].filter(Boolean);

  const separator = config.prettier ? "\n\n" : "\n";
  return `${sections.join(separator)}\n`;
}
