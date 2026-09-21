import {
  compactOptionalEndCaps,
  compactOptionalSlotNuts,
  compactPurchaseItems,
} from "./compact-bom";
import type { WorkcellLayout } from "./layout";
import type { ModelPart } from "./model";

interface ShoppingItem {
  name: string;
  quantity: string;
  detail: string;
  url?: string;
  profile?: string;
  suppliedLengthsMm?: number[];
  status: "Amazon" | "Supplier" | "Unresolved" | "Reuse / custom";
}

const additionalHardware: ShoppingItem[] = [
  {
    name: "Performance Tool W3982 deep-reach C-clamp",
    quantity: "4 singles · 2 arm beam + 2 frame · fit pending",
    detail:
      "Manufacturer specifies an 8-inch throat (203.2 mm) and 3-inch opening (76.2 mm); body, pads, screw and handle are approximate. Four clamps enter through the open front of the illustrative 1600 × 1250 × 35 mm table, whose front edge is 75 mm inside the enclosure. Required reach: 177.5 mm at the arm beam; 190.6 mm along the angled frame clamps; 65 mm clamped stack. Approximate frame pads leave only 2.5 mm wall clearance. Verify actual fit and support of the overhanging front posts/camera foot. Holding capacity under robot motion is unverified.",
    url: "https://www.amazon.com/dp/B01N0OM99E",
    status: "Amazon",
  },
  {
    name: "Arm plates, camera adapter and panel attachments",
    quantity: "Reuse where compatible; custom adapters if needed",
    detail:
      "Select two arm base plates and a camera mount compatible with the installed equipment. Their hole patterns must match the new profiles or use custom adapters. Do not assume the camera has a ¼-inch tripod thread. Wall screw lengths depend on the final panel and washer stack.",
    status: "Reuse / custom",
  },
];

export function getShoppingItems(): ShoppingItem[] {
  return [
    ...compactPurchaseItems.map(
      (item): ShoppingItem => ({
        name: item.partNumber,
        quantity: `${item.quantity} individual pieces`,
        detail: item.purpose,
        url: item.url,
        status: "Supplier",
        profile: item.profile,
        suppliedLengthsMm: item.lengthMm ? [item.lengthMm] : undefined,
      }),
    ),
    ...[...compactOptionalSlotNuts, ...compactOptionalEndCaps].map(
      (item): ShoppingItem => ({
        name: `${item.partNumber} · only if needed`,
        quantity: `${item.quantity} individual pieces · optional`,
        detail: item.purpose,
        url: item.url,
        status: "Supplier",
      }),
    ),
    {
      name: "Screws and washers",
      quantity: "36 bracket screws + 12 wall fixings",
      detail:
        "Brackets: M6 × 12 socket-head screws, matching MISUMI CBM6-12. Walls: 12 M6 screws and load-spreading washers. Panel screw lengths depend on actual panel/washer thickness and slot depth; verify engagement without bottoming. Ordinary hex nuts do not replace profile-specific T-nuts. Arm/camera fasteners depend on the final adapters.",
      status: "Reuse / custom",
    },
    {
      name: "Worktop retention tape",
      quantity: "Source suitable tape · no SKU selected",
      detail:
        "Tape limits worktop sliding; the existing table carries its weight. Keep the installed work surface at 30 mm above the table, accounting for any under-panel tape thickness. Wall panels remain bolted; robot and frame mounts remain clamped.",
      status: "Reuse / custom",
    },
    ...additionalHardware,
  ];
}

export function getBarProduct(
  extrusion: NonNullable<ModelPart["description"]["extrusion"]>,
) {
  return getShoppingItems().find(
    (item) =>
      item.profile === extrusion.profile &&
      item.suppliedLengthsMm?.includes(extrusion.lengthMm),
  );
}

export function renderShoppingList(
  container: HTMLElement,
  parts: ModelPart[],
  layout: WorkcellLayout,
) {
  const shoppingItems = getShoppingItems();
  const extrusionGroups = new Map<
    string,
    { profile: string; lengthMm: number; names: string[] }
  >();
  for (const part of parts) {
    const extrusion = part.description.extrusion;
    if (!extrusion) continue;
    const groupKey = `${extrusion.profile}-${extrusion.lengthMm}`;
    const group = extrusionGroups.get(groupKey) ?? { ...extrusion, names: [] };
    group.names.push(part.description.name);
    extrusionGroups.set(groupKey, group);
  }
  const groups = [...extrusionGroups.values()].sort(
    (first, second) =>
      first.profile.localeCompare(second.profile) ||
      second.lengthMm - first.lengthMm,
  );
  container.innerHTML = `
    <div class="eyebrow">ABC BOX / SUPPLIER-CUT FRAME</div>
    <h2>${layout.label}</h2>
    <p>For the model shown. Walls and the work panel are custom-cut later; the CSVs cover extrusions and selected frame hardware. Source the support table, arms, camera, panels, screws and adapters separately.</p>
    <p class="shopping-note">This is a proposed build list. Each bar is shown at the length you receive. MISUMI supplies the extrusions cut to your order. Arm/camera adapter fit and mounting loads still need resolution. The frame uses matching MISUMI profiles, brackets and slot nuts; panel fastener lengths follow the actual panel stack. Linked listings match the stated product specifications; live availability and selected variants may change.</p>
    <details class="build-details" open><summary>BOM downloads</summary><p>Check MISUMI’s quote for current prices and delivery dates.</p><p><a href="${import.meta.env.BASE_URL}misumi-compact-purchase.csv" download>Download bars + 18 bare brackets (CSV) ↓</a></p><p><a href="${import.meta.env.BASE_URL}misumi-compact-optional-nuts.csv" download>Compatible T-nuts — only if needed (CSV) ↓</a></p><p><a href="${import.meta.env.BASE_URL}misumi-compact-optional-caps.csv" download>Optional finishing caps (CSV) ↓</a></p><p><a href="${import.meta.env.BASE_URL}compact-build-list.md" target="_blank">Full build list, hardware checklist and panel details ↗</a></p></details>
    <h3 class="shopping-heading">Bars as purchased</h3>
    <table class="cut-table"><thead><tr><th>Profile</th><th>Length / mm</th><th>Qty</th></tr></thead><tbody>${groups.map((group) => `<tr><td>${group.profile}</td><td>${group.lengthMm}</td><td>${group.names.length}</td></tr>`).join("")}</tbody></table>
    <p class="muted">14 installed extrusions. Supplied lengths match the model exactly.</p>
    <button type="button" id="download-cut-list" class="secondary-button">Download received-parts list (CSV) ↓</button>
    <p><a href="${import.meta.env.BASE_URL}compact-build-list.md" download>Download build list (Markdown) ↓</a></p>
    <h3 class="shopping-heading">Shopping links</h3>
    <div class="shopping-cards">${shoppingItems
      .map(
        (item) => `
      <article class="shopping-card">
        <span class="confidence ${item.status === "Amazon" ? "simulation" : "proposed"}">${item.status}</span>
        <h3>${item.name}</h3><div class="shopping-quantity">${item.quantity}</div>
        <p>${item.detail}</p>
        ${item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">${item.status === "Supplier" ? "Configure at MISUMI" : "View on Amazon"} ↗</a>` : ""}
      </article>`,
      )
      .join("")}</div>
    <details class="build-details"><summary>Dimensions, panels and connectors</summary>
      <p>Frame: 1370 × 935 × 1280 mm. Between wall faces: 1370 × 935 mm; rails project 30 mm inward. Panels outside: 1390 × 945 × 1280 mm. Four 1280 mm posts, four 875 mm side rails and two 1310 mm rear rails use butt joints. Camera support lengths are proposed construction dimensions, not a verified ABC physical cut list.</p>
      <p>Walls bolt to the outside frame faces. Rectangular blanks: two 935 × 1280 × 10 mm sides and one 1390 × 1280 × 10 mm back; the back overlaps the side-panel edges. Four front-entry clamps avoid wall cutouts. The table front edge sits 75 mm inside the enclosure, leaving the front posts and 167.5 mm of the camera foot overhanging. Actual clamp fit and cantilever stability remain unverified. Wall bottoms are at tabletop height; 1250 mm is above the raised work plane. Worktop: 1270 × 582.5 × 30 mm, resting directly on the table and retained with tape. These are nominal dimensions; fit clearances and holes follow actual material and dry assembly.</p>
      <p>All 18 brackets, 12 wall fixings, 4 clamps and adapter placeholders are shown. Screw heads and nuts belong to their connector’s hover group. Optional finishing caps are not shown.</p>
    </details>
    <p class="muted"><a href="https://github.com/Hebbian-Robotics/abc-box" target="_blank" rel="noreferrer">Source code</a> · <a href="${import.meta.env.BASE_URL}LICENSE.txt" target="_blank">Project license</a> · <a href="${import.meta.env.BASE_URL}NOTICE.txt" target="_blank">Attribution</a> · <a href="${import.meta.env.BASE_URL}THIRD_PARTY_LICENSES.txt" target="_blank">Third-party licenses</a></p>
    <p class="muted">Sources: product pages linked above; ABC geometry in the model inspector. Check current supplier specifications, pricing and availability before ordering.</p>`;
  container
    .querySelector("#download-cut-list")
    ?.addEventListener("click", () => {
      const rows = [["Part", "Profile", "Supplied length (mm)", "Quantity"]];
      for (const part of parts) {
        const extrusion = part.description.extrusion;
        if (extrusion)
          rows.push([
            part.description.name,
            extrusion.profile,
            String(extrusion.lengthMm),
            "1",
          ]);
      }
      const csv = rows
        .map((row) =>
          row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
        )
        .join("\r\n");
      const downloadUrl = URL.createObjectURL(
        new Blob([csv], { type: "text/csv" }),
      );
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "abc-workcell-received-parts.csv";
      downloadLink.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    });
}
