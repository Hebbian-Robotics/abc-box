export type LengthUnit = "mm" | "in";

export function formatLengthValue(
  millimetres: number,
  unit: LengthUnit,
): string {
  const convertedValue = unit === "in" ? millimetres / 25.4 : millimetres;
  return String(Number(convertedValue.toFixed(unit === "in" ? 2 : 4)));
}

// Convert explicitly unit-tagged display text only. Profile names, metric
// fastener designations, quantities and supplier part numbers stay unchanged.
export function formatMeasurementText(
  source: string,
  unit: LengthUnit,
): string {
  if (unit === "mm") return source;
  return source.replace(
    /(?<![\w.])([±+−-]?\d+(?:\.\d+)?(?:\s*(?:×|\/|and)\s*[±+−-]?\d+(?:\.\d+)?)*)\s*mm\b/g,
    (_measurement, values: string) =>
      `${values.replace(/\d+(?:\.\d+)?/g, (value) => formatLengthValue(Number(value), unit))} in`,
  );
}

export function getMeasurementTextNodes(root: HTMLElement): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text;
    if (/\d\s*mm\b/.test(textNode.data)) textNodes.push(textNode);
  }
  return textNodes;
}
