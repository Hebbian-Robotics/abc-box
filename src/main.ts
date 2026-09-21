import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getLayout } from "./layout";
import {
  createWorkcell,
  type ModelPart,
  type PartCategory,
  targets,
} from "./model";
import { getBarProduct, renderShoppingList } from "./shopping";
import "./style.css";

function requireElement<ElementType extends HTMLElement>(
  selector: string,
): ElementType {
  const element = document.querySelector<ElementType>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
}
const selectedLayout = getLayout();
const frameDimensions = `${Math.round(selectedLayout.frameWidth * 1000)} × ${Math.round(selectedLayout.frameDepth * 1000)} × ${Math.round(selectedLayout.frameHeight * 1000)}`;
const application = requireElement<HTMLDivElement>("#app");
application.innerHTML = `
  <header class="app-header">
    <div class="identity"><span class="identity-mark" aria-hidden="true">⌖</span><div><div class="eyebrow">ABC / OPENYAM</div><h1>ABC Box</h1></div></div>
    <div class="header-note"><span class="status-dot"></span>Supplier-cut tabletop frame <span class="separator">/</span> Dimensions in mm</div>
  </header>
  <main class="workspace">
    <section class="viewer" aria-label="Interactive 3D workcell">
      <div id="viewport" tabindex="0" aria-label="3D model. Drag to rotate, scroll to zoom, right-drag to pan. Select parts from the parts list for keyboard access."></div>
      <nav class="view-toolbar" aria-label="View direction">
        <button type="button" data-view="perspective" class="active">Perspective</button>
        <button type="button" data-view="front">Front</button>
        <button type="button" data-view="side">Side</button>
        <button type="button" data-view="top">Top</button>
        <button type="button" id="reset-view" aria-label="Reset view">↺</button>
      </nav>
      <div class="model-caption"><span class="caption-line"></span>ABC WORKSPACE · COMPACT SUPPLIER-CUT FRAME</div>
      <div id="tooltip" role="tooltip" hidden></div>
      <div class="viewer-footer"><span>Drag to orbit · Scroll to zoom · Right-drag to pan</span><span>Hover to inspect · Click to pin</span></div>
      <div class="axis-key"><span class="axis-width">— Width</span><span class="axis-depth">— Depth into box</span><span class="axis-height">— Height</span></div>
    </section>
    <aside class="inspector" aria-label="Model controls and part information">
      <nav class="sidebar-tabs" aria-label="Sidebar section"><button type="button" id="assembly-tab" class="active" aria-pressed="true" aria-controls="assembly-panel">Assembly</button><button type="button" id="shopping-tab" aria-pressed="false" aria-controls="shopping-panel">Shopping list ↗</button></nav>
      <div id="assembly-panel">
      <section class="envelope"><div class="eyebrow">BARS AS PURCHASED</div><p class="muted">MISUMI · cut to length</p><div class="envelope-value">${Math.round(selectedLayout.interiorWidth * 1000)} × ${Math.round(selectedLayout.interiorDepth * 1000)}</div><div class="muted">Between wall faces · width × depth</div><div class="outer-envelope">ABC simulation clear interior: <strong>1290 × 895 mm</strong>.<br>Outside frame bars: <strong>${frameDimensions} mm</strong>.<br>Walls bolt to the outside of the frame; panels span 1390 × 945 mm overall. Frame rails project 30 mm inside the walls.<br>Extrusions arrive cut to the specified lengths.<br>Clamps and the camera foot extend beyond this frame envelope.</div></section>
      <section class="visibility-controls" aria-label="Visibility">
        <label><input id="ghost-walls" type="checkbox" checked />Transparent walls</label>
        <label><input id="show-walls" type="checkbox" checked />Show wall panels</label>
        <label><input id="show-work-panel" type="checkbox" checked />Show worktop</label>
        <label><input id="show-connectors" type="checkbox" checked />Show brackets &amp; fixings</label>
        <label><input id="show-arms" type="checkbox" checked />Show YAM models</label>
        <label><input id="show-table" type="checkbox" checked />Show existing table</label>
        <label><input id="show-dimensions" type="checkbox" checked />Show dimensions</label>
      </section>
      <p id="robot-model-status" class="muted" role="status">Loading I2RT YAM models…</p>
      <section class="selected-part" aria-live="polite">
        <div class="eyebrow">PART INSPECTOR <button type="button" id="clear-selection" aria-label="Clear pinned selection">×</button></div>
        <h2 id="part-name">Single camera mast</h2>
        <div id="part-confidence" class="confidence proposed">Proposed part</div>
        <p id="part-dimensions" class="part-dimensions"></p>
        <p id="part-description"></p>
        <p id="part-position" class="part-position"></p><a id="part-product" target="_blank" rel="noreferrer" hidden>Buy this piece ↗</a><button type="button" id="focus-part" class="secondary-button">Zoom to piece</button><button type="button" id="part-shopping" class="secondary-button">See purchasing list ↗</button>
      </section>
      <section class="parts-section"><div class="section-title"><h2>Explore the assembly</h2><span id="part-count"></span></div><div id="part-list"></div></section>
      <details class="model-notes"><summary>What this model assumes</summary><p>The camera target comes from ABC’s simulation: 954.3 mm above the arm-base plane, 166.5 mm behind the arm-base line, looking 30° forward from vertical.</p><p>Each extrusion is individually selectable. Its supplied length and profile match the model. Supplier-finished pieces arrive ready to assemble. Arms use the official I2RT YAM v1 URDF and meshes at original scale; the pose is illustrative. Mounting-area outlines, camera adapters, frame joints and the support table remain schematic. Account for real adapter thickness before aligning datums. The frame uses butt joints and MISUMI HBLFSN6 brackets. Wall blanks extend down to the table so the lower rails can support them: 1280 mm total, 1250 mm above the work plane. Panel fixings and four removable table clamps are shown. The clamps use W3982 advertised throat/opening dimensions; their bodies and pads are approximate, with only about 2.5 mm nominal frame-pad clearance to the walls. Detailed adapter fit and mounting capacity still need verification. The walls bolt to the outside frame faces, giving 1370 × 935 mm between wall planes: 80 mm wider and 40 mm deeper than ABC. Rails project 30 mm inside the walls. All walls are rectangular. Clamps enter from the open front; the frame clamps angle inward to clear the lower rails. The table front edge sits 75 mm inside the box, leaving the front posts and 167.5 mm of the camera foot overhanging. Actual clamp fit and cantilever stability are unverified. This frame is a proposed construction around the simulation targets, not a verified physical ABC cut list. Actual panel thickness and joinery are detailed separately.</p><p>The 30 mm worktop rests on your table and aligns with the arm beam; tape is proposed to limit sliding. The existing table supports the worktop, arm beam and rear portion of the frame; the front overhang has no floor beneath it.</p><a href="https://abc.bot/abc.pdf#page=23" target="_blank" rel="noreferrer">ABC physical setup reference ↗</a></details>
      </div><section id="shopping-panel" hidden aria-label="Shopping list and supplied lengths"></section>
    </aside>
  </main>`;
const viewport = requireElement<HTMLDivElement>("#viewport");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xedf2f5);
const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 30);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "low-power",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
viewport.append(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.48, 0.38);
controls.minDistance = 0.35;
controls.maxDistance = 7;
controls.maxPolarAngle = Math.PI * 0.92;
controls.enableDamping = false;
scene.add(new THREE.HemisphereLight(0xffffff, 0x9baeba, 2.8));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
keyLight.position.set(-2, 4, -2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -2;
keyLight.shadow.camera.right = 2;
keyLight.shadow.camera.top = 2;
keyLight.shadow.camera.bottom = -2;
keyLight.shadow.normalBias = 0.015;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xc6def1, 1.6);
fillLight.position.set(2, 2, 3);
scene.add(fillLight);
const grid = new THREE.GridHelper(5, 50, 0xb5c5cf, 0xd7e0e6);
grid.position.y = -0.754;
scene.add(grid);
const parts = createWorkcell(scene, selectedLayout);
const partsById = new Map(parts.map((part) => [part.description.id, part]));
renderShoppingList(requireElement("#shopping-panel"), parts, selectedLayout);
function showSidebarPanel(panelName: "assembly" | "shopping") {
  for (const name of ["assembly", "shopping"] as const) {
    const isActive = name === panelName;
    requireElement(`#${name}-panel`).hidden = !isActive;
    const button = requireElement(`#${name}-tab`);
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
  requireElement(".inspector").scrollTop = 0;
}
for (const panelName of ["assembly", "shopping"] as const) {
  requireElement(`#${panelName}-tab`).addEventListener("click", () =>
    showSidebarPanel(panelName),
  );
}
requireElement("#part-shopping").addEventListener("click", () =>
  showSidebarPanel("shopping"),
);
const dimensionsGroup = new THREE.Group();
scene.add(dimensionsGroup);
function addDimension(
  start: THREE.Vector3,
  end: THREE.Vector3,
  label: string,
  color = 0x486675,
) {
  const lineMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    depthTest: false,
  });
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([start, end]),
    lineMaterial,
  );
  line.renderOrder = 10;
  dimensionsGroup.add(line);
  const direction = end.clone().sub(start).normalize();
  const perpendicular =
    Math.abs(direction.y) > 0.8
      ? new THREE.Vector3(0.018, 0, 0)
      : new THREE.Vector3(0, 0.018, 0);
  for (const point of [start, end]) {
    const tick = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        point.clone().sub(perpendicular),
        point.clone().add(perpendicular),
      ]),
      lineMaterial,
    );
    tick.renderOrder = 10;
    dimensionsGroup.add(tick);
  }
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 640;
  labelCanvas.height = 96;
  const context = labelCanvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#f9fcfd";
  context.beginPath();
  context.roundRect(2, 8, 636, 80, 16);
  context.fill();
  context.font = "500 46px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = new THREE.Color(color).getStyle();
  context.fillText(label, 320, 49, 608);
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: labelTexture,
      depthTest: false,
      transparent: true,
      toneMapped: false,
    }),
  );
  sprite.position.copy(start).add(end).multiplyScalar(0.5);
  sprite.position.y += 0.034;
  sprite.scale.set(0.43, 0.0645, 1);
  sprite.renderOrder = 11;
  dimensionsGroup.add(sprite);
}
addDimension(
  new THREE.Vector3(
    -selectedLayout.interiorWidth / 2,
    selectedLayout.frameHeight + 0.07,
    selectedLayout.rearPostDepth,
  ),
  new THREE.Vector3(
    selectedLayout.interiorWidth / 2,
    selectedLayout.frameHeight + 0.07,
    selectedLayout.rearPostDepth,
  ),
  `${Math.round(selectedLayout.interiorWidth * 1000)} mm · wall-to-wall`,
);
addDimension(
  new THREE.Vector3(selectedLayout.frameWidth / 2 + 0.07, 0.045, 0),
  new THREE.Vector3(
    selectedLayout.frameWidth / 2 + 0.07,
    0.045,
    selectedLayout.interiorDepth,
  ),
  `${Math.round(selectedLayout.interiorDepth * 1000)} mm · to rear wall`,
);
addDimension(
  new THREE.Vector3(
    -selectedLayout.frameWidth / 2 - 0.09,
    0,
    selectedLayout.rearPostDepth,
  ),
  new THREE.Vector3(
    -selectedLayout.frameWidth / 2 - 0.09,
    selectedLayout.frameHeight,
    selectedLayout.rearPostDepth,
  ),
  `${Math.round(selectedLayout.frameHeight * 1000)} mm · frame height`,
);
addDimension(
  new THREE.Vector3(-0.31, 0.12, 0.15),
  new THREE.Vector3(0.31, 0.12, 0.15),
  "620 mm · arm bases",
);
addDimension(
  new THREE.Vector3(-0.43, 0.015, 0),
  new THREE.Vector3(-0.43, 0.015, selectedLayout.tableFrontDepth),
  `${Math.round(selectedLayout.tableFrontDepth * 1000)} mm · table-edge inset`,
  0xa35c28,
);
addDimension(
  new THREE.Vector3(-0.12, 0.03, -0.12),
  new THREE.Vector3(-0.12, 0.03 + targets.cameraHeight, -0.12),
  "954 mm · optical height",
  0xa35c28,
);
addDimension(
  new THREE.Vector3(0.18, 0.1, targets.cameraDepth),
  new THREE.Vector3(0.18, 0.1, targets.armDepth),
  "166.5 mm · setback",
  0xa35c28,
);
const tooltip = requireElement<HTMLDivElement>("#tooltip");
let pinnedPart: ModelPart | undefined;
let hoveredPart: ModelPart | undefined;
let ghostWalls = true;
let visibleWalls = true;
let visibleWorkPanel = true;
const highlightedMaterials = new Set<THREE.MeshStandardMaterial>();
const visibleCategories = new Set<PartCategory>([
  "connectors",
  "structure",
  "camera",
  "panels",
  "arms",
  "table",
]);
function render() {
  renderer.render(scene, camera);
}
controls.addEventListener("change", render);
function updateMaterialHighlight(part?: ModelPart) {
  for (const material of highlightedMaterials) {
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;
  }
  highlightedMaterials.clear();
  for (const candidate of parts) {
    for (const outline of candidate.outlines) {
      outline.material.color.setHex(candidate === part ? 0x2b90aa : 0x60777f);
    }
  }
  for (const surface of part?.surfaces ?? []) {
    surface.material.emissive.setHex(0x2b90aa);
    surface.material.emissiveIntensity = 0.35;
    highlightedMaterials.add(surface.material);
  }
  document
    .querySelectorAll<HTMLButtonElement>(".part-button")
    .forEach((button) => {
      button.classList.toggle(
        "selected",
        button.dataset.partId === part?.description.id,
      );
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.partId === pinnedPart?.description.id),
      );
    });
  render();
}
function inspectPart(part: ModelPart) {
  const description = part.description;
  const productLink = requireElement<HTMLAnchorElement>("#part-product");
  const purchaseUrl =
    description.purchaseUrl ??
    (description.extrusion
      ? getBarProduct(description.extrusion)?.url
      : undefined);
  productLink.hidden = !purchaseUrl;
  if (purchaseUrl) productLink.href = purchaseUrl;
  requireElement("#focus-part").dataset.partId = description.id;
  requireElement("#part-name").textContent = description.name;
  requireElement("#part-dimensions").textContent = description.dimensions;
  requireElement("#part-description").textContent = description.description;
  requireElement("#part-position").textContent = description.positionNote;
  requireElement("#part-shopping").hidden = !description.extrusion;
  const confidence = requireElement("#part-confidence");
  confidence.textContent = description.confidence;
  confidence.className = `confidence ${description.confidence === "Simulation target" ? "simulation" : description.confidence === "Illustrative" ? "illustrative" : "proposed"}`;
}
const categoryNames: Record<PartCategory, string> = {
  connectors: "Brackets, clamps & fixings",
  camera: "Camera support",
  structure: "Frame & mounting",
  panels: "Enclosure panels",
  arms: "I2RT YAM models",
  table: "Existing table",
};
const partList = requireElement<HTMLDivElement>("#part-list");
for (const category of [
  "camera",
  "structure",
  "connectors",
  "panels",
  "arms",
  "table",
] as const) {
  const groupLabel = document.createElement("h3");
  groupLabel.textContent = categoryNames[category];
  partList.append(groupLabel);
  for (const part of parts.filter(
    (candidate) => candidate.description.category === category,
  )) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "part-button";
    button.dataset.partId = part.description.id;
    button.innerHTML = `<span class="part-dot ${category}"></span><span>${part.description.name}${part.description.extrusion ? `<small class="part-list-dimensions">${part.description.extrusion.profile} · ${part.description.extrusion.lengthMm} mm</small>` : ""}</span><span class="part-arrow">↗</span>`;
    button.addEventListener("click", () => {
      pinnedPart = part;
      inspectPart(part);
      updateMaterialHighlight(part);
    });
    button.addEventListener("mouseenter", () => updateMaterialHighlight(part));
    button.addEventListener("mouseleave", () =>
      updateMaterialHighlight(pinnedPart),
    );
    partList.append(button);
  }
}
requireElement("#part-count").textContent = `${parts.length} items`;
function updateVisibility() {
  for (const part of parts) {
    const isWall = part.description.id.endsWith("-wall");
    const isWorkPanel = part.description.id === "work-surface";
    part.object.visible =
      visibleCategories.has(part.description.category) &&
      (!isWall || visibleWalls) &&
      (!isWorkPanel || visibleWorkPanel);
    for (const surface of part.surfaces) {
      surface.material.transparent = isWall && ghostWalls;
      surface.material.opacity = isWall && ghostWalls ? 0.75 : 1;
      surface.material.depthWrite = !(isWall && ghostWalls);
      surface.castShadow = !(isWall && ghostWalls);
    }
  }
  render();
}
requireElement<HTMLInputElement>("#ghost-walls").addEventListener(
  "change",
  (event) => {
    ghostWalls = (event.currentTarget as HTMLInputElement).checked;
    updateVisibility();
  },
);
requireElement<HTMLInputElement>("#show-walls").addEventListener(
  "change",
  (event) => {
    visibleWalls = (event.currentTarget as HTMLInputElement).checked;
    updateVisibility();
  },
);
requireElement<HTMLInputElement>("#show-work-panel").addEventListener(
  "change",
  (event) => {
    visibleWorkPanel = (event.currentTarget as HTMLInputElement).checked;
    updateVisibility();
  },
);
for (const [selector, category] of [
  ["#show-connectors", "connectors"],
  ["#show-arms", "arms"],
  ["#show-table", "table"],
] as const) {
  requireElement<HTMLInputElement>(selector).addEventListener(
    "change",
    (event) => {
      if ((event.currentTarget as HTMLInputElement).checked)
        visibleCategories.add(category);
      else visibleCategories.delete(category);
      updateVisibility();
    },
  );
}
requireElement<HTMLInputElement>("#show-dimensions").addEventListener(
  "change",
  (event) => {
    dimensionsGroup.visible = (event.currentTarget as HTMLInputElement).checked;
    render();
  },
);
const viewPositions: Record<string, THREE.Vector3> = {
  perspective: new THREE.Vector3(2.45, 1.95, -2.7),
  front: new THREE.Vector3(0, 0.5, -3.7),
  side: new THREE.Vector3(3.5, 0.6, 0.43),
  top: new THREE.Vector3(0, 3.9, 0.399),
};
function setView(viewName: string) {
  const position = viewPositions[viewName];
  if (!position) return;
  camera.up.set(0, 1, 0);
  camera.position.copy(position);
  controls.target.set(0, selectedLayout.frameHeight / 2 - 0.1, 0.4);
  controls.update();
  document
    .querySelectorAll<HTMLButtonElement>("[data-view]")
    .forEach((button) => {
      const active = button.dataset.view === viewName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  render();
}
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-view]",
)) {
  button.addEventListener("click", () =>
    setView(button.dataset.view ?? "perspective"),
  );
}
requireElement("#reset-view").addEventListener("click", () =>
  setView("perspective"),
);
requireElement("#focus-part").addEventListener("click", () => {
  const part = partsById.get(
    requireElement("#focus-part").dataset.partId ?? "",
  );
  if (!part) return;
  const bounds = new THREE.Box3().setFromObject(part.object);
  if (bounds.isEmpty()) return;
  const center = bounds.getCenter(new THREE.Vector3());
  const extent = bounds.getSize(new THREE.Vector3()).length();
  const preferredDirection = part.object.userData.inspectionDirection;
  const direction =
    preferredDirection instanceof THREE.Vector3
      ? preferredDirection.clone()
      : camera.position.clone().sub(controls.target).normalize();
  dimensionsGroup.visible = false;
  requireElement<HTMLInputElement>("#show-dimensions").checked = false;
  controls.minDistance = 0.08;
  controls.target.copy(center);
  camera.position
    .copy(center)
    .addScaledVector(direction, Math.max(0.18, extent * 2.4));
  controls.update();
  render();
});
requireElement("#clear-selection").addEventListener("click", () => {
  pinnedPart = undefined;
  updateMaterialHighlight();
  const defaultPart = partsById.get("camera-mast");
  if (defaultPart) inspectPart(defaultPart);
});
const raycaster = new THREE.Raycaster();
raycaster.params.Line.threshold = 0.004;
const normalizedPointer = new THREE.Vector2();
let pointerDownPosition = new THREE.Vector2();
function pickPart(event: PointerEvent): ModelPart | undefined {
  const bounds = renderer.domElement.getBoundingClientRect();
  normalizedPointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
  );
  raycaster.setFromCamera(normalizedPointer, camera);
  const visibleSurfaces = parts
    .filter((part) => part.object.visible)
    .flatMap((part): THREE.Object3D[] => [...part.surfaces, ...part.outlines]);
  const intersections = raycaster.intersectObjects(visibleSurfaces, false);
  const preferredIntersection = ghostWalls
    ? (intersections.find(
        (intersection) =>
          !String(intersection.object.userData.partId).endsWith("-wall"),
      ) ?? intersections[0])
    : intersections[0];
  return preferredIntersection
    ? partsById.get(String(preferredIntersection.object.userData.partId))
    : undefined;
}
renderer.domElement.addEventListener("pointermove", (event) => {
  if (event.buttons !== 0) {
    tooltip.hidden = true;
    return;
  }
  hoveredPart = pickPart(event);
  updateMaterialHighlight(hoveredPart ?? pinnedPart);
  if (!hoveredPart) {
    tooltip.hidden = true;
    return;
  }
  if (!pinnedPart) inspectPart(hoveredPart);
  const bounds = viewport.getBoundingClientRect();
  tooltip.replaceChildren();
  const name = document.createElement("strong");
  name.textContent = hoveredPart.description.name;
  const dimensions = document.createElement("span");
  dimensions.textContent = hoveredPart.description.dimensions;
  const confidence = document.createElement("small");
  confidence.textContent = hoveredPart.description.confidence;
  tooltip.append(name, dimensions, confidence);
  tooltip.hidden = false;
  tooltip.style.left = `${Math.max(8, Math.min(event.clientX - bounds.left + 16, bounds.width - tooltip.offsetWidth - 12))}px`;
  tooltip.style.top = `${Math.max(8, Math.min(event.clientY - bounds.top + 16, bounds.height - tooltip.offsetHeight - 12))}px`;
});
renderer.domElement.addEventListener("pointerleave", () => {
  hoveredPart = undefined;
  tooltip.hidden = true;
  updateMaterialHighlight(pinnedPart);
});
renderer.domElement.addEventListener("pointerdown", (event) => {
  pointerDownPosition = new THREE.Vector2(event.clientX, event.clientY);
});
renderer.domElement.addEventListener("pointerup", (event) => {
  if (
    pointerDownPosition.distanceTo(
      new THREE.Vector2(event.clientX, event.clientY),
    ) > 5
  )
    return;
  pinnedPart = pickPart(event);
  if (pinnedPart) inspectPart(pinnedPart);
  updateMaterialHighlight(pinnedPart);
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    pinnedPart = undefined;
    tooltip.hidden = true;
    updateMaterialHighlight();
  }
});
new ResizeObserver(() => {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.fov = THREE.MathUtils.radToDeg(
    2 *
      Math.atan(
        Math.tan(THREE.MathUtils.degToRad(19)) / Math.min(1, camera.aspect),
      ),
  );
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  render();
}).observe(viewport);
updateVisibility();
setView("perspective");
const initialPart = partsById.get("camera-mast");
if (initialPart) inspectPart(initialPart);
document.documentElement.dataset.viewerReady = "true";
document.documentElement.dataset.robotModelState = "loading";
void import("./yam-model")
  .then(({ loadYamArms }) => loadYamArms(parts))
  .then(() => {
    requireElement("#robot-model-status").textContent =
      "I2RT YAM v1 · manufacturer URDF and meshes loaded";
    document.documentElement.dataset.robotModelState = "ready";
    updateVisibility();
    updateMaterialHighlight(hoveredPart ?? pinnedPart);
  })
  .catch((error: unknown) => {
    console.error("Could not load I2RT YAM models", error);
    requireElement("#robot-model-status").textContent =
      "YAM models could not load. Reload to retry; frame and BOM remain available.";
    document.documentElement.dataset.robotModelState = "error";
  });
