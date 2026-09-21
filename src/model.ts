import * as THREE from "three";
import type { WorkcellLayout } from "./layout";
export type PartCategory =
  | "structure"
  | "camera"
  | "panels"
  | "arms"
  | "table"
  | "connectors";
export type Confidence =
  | "Simulation target"
  | "Manufacturer model"
  | "Proposed part"
  | "Illustrative";
export interface PartDescription {
  id: string;
  name: string;
  category: PartCategory;
  dimensions: string;
  confidence: Confidence;
  description: string;
  positionNote: string;
  purchaseUrl?: string;
  extrusion?: {
    profile: string;
    lengthMm: number;
  };
}
export interface ModelPart {
  description: PartDescription;
  object: THREE.Group;
  surfaces: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[];
  outlines: THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial>[];
}
export const palette = {
  structure: 0xc8cacc,
  camera: 0xc8cacc,
  panels: 0xf4f4f1,
  arms: 0xe8eeed,
  table: 0xbababa,
  connectors: 0xb2b4b6,
};
const hardwareFinishes = {
  slotShadow: 0x46484a,
  blackCoating: 0x252628,
  steel: 0xb8babc,
  unselectedAdapter: 0x949698,
};
export const targets = {
  armBaseHeight: 0.03,
  armDepth: 0.2525,
  armSpacing: 0.62,
  cameraDepth: 0.08600512,
  cameraHeight: 0.95432053,
};
export function createWorkcell(
  scene: THREE.Scene,
  layout: WorkcellLayout,
): ModelPart[] {
  const parts: ModelPart[] = [];
  function createPart(description: PartDescription): ModelPart {
    const object = new THREE.Group();
    object.name = description.id;
    scene.add(object);
    const part: ModelPart = { description, object, surfaces: [], outlines: [] };
    parts.push(part);
    return part;
  }
  function addSurface(
    part: ModelPart,
    geometry: THREE.BufferGeometry,
    position: THREE.Vector3,
    color: number,
  ): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: part.description.extrusion ? 0.45 : 0.62,
      metalness: part.description.extrusion ? 0.45 : 0.15,
    });
    const surface = new THREE.Mesh(geometry, material);
    surface.position.copy(position);
    surface.castShadow = true;
    surface.receiveShadow = true;
    surface.userData.partId = part.description.id;
    part.object.add(surface);
    part.surfaces.push(surface);
    return surface;
  }
  function addBox(
    part: ModelPart,
    dimensions: number[],
    position: number[],
    color: number,
  ) {
    const [width = 0.03, height = 0.03, depth = 0.03] = dimensions;
    return addSurface(
      part,
      new THREE.BoxGeometry(width, height, depth),
      new THREE.Vector3(...position),
      color,
    );
  }
  function addExtrusion(
    description: PartDescription,
    dimensions: number[],
    position: number[],
  ) {
    const sortedDimensions = dimensions
      .map((dimension) => Math.round(dimension * 1000))
      .sort((first, second) => first - second);
    const profile = `${sortedDimensions[0]}${sortedDimensions[1]}`;
    const lengthMm = sortedDimensions[2] ?? 0;
    const part = createPart({
      ...description,
      dimensions: `${profile} profile · ${lengthMm} mm supplied length · no trimming · silver clear anodize · ${sortedDimensions[0]} × ${sortedDimensions[1]} mm section`,
      extrusion: { profile, lengthMm },
    });
    // All purchased profiles have the same clear-anodized silver finish,
    // including the camera support; category colors are not physical finishes.
    addBox(part, dimensions, position, palette.structure);
    const [width = 0.03, height = 0.03, depth = 0.03] = dimensions;
    const [horizontal = 0, vertical = 0, longitudinal = 0] = position;
    // Recess lines communicate the slotted profile; they are not machining geometry.
    if (height > width && height > depth) {
      for (const side of [-1, 1]) {
        addBox(
          part,
          [0.006, height * 0.98, 0.001],
          [horizontal, vertical, longitudinal + side * (depth / 2 + 0.0005)],
          hardwareFinishes.slotShadow,
        );
      }
    } else if (width > depth) {
      for (const offset of [-0.025, 0, 0.025]) {
        if (Math.abs(offset) < depth / 2) {
          addBox(
            part,
            [width * 0.99, 0.001, 0.004],
            [horizontal, vertical + height / 2 + 0.0005, longitudinal + offset],
            hardwareFinishes.slotShadow,
          );
        }
      }
    } else {
      addBox(
        part,
        [0.006, 0.001, depth * 0.98],
        [horizontal, vertical + height / 2 + 0.0005, longitudinal],
        hardwareFinishes.slotShadow,
      );
    }
    return part;
  }
  const table = createPart({
    id: "existing-table",
    name: "Example support table",
    category: "table",
    dimensions: "1600 × 1250 mm shown · placeholder",
    confidence: "Illustrative",
    description:
      "Example table positioned with its front edge 75 mm inside the enclosure, allowing four clamps to enter through the open front. The front posts and camera mast overhang the table; this support arrangement requires physical stability verification.",
    positionNote:
      "Tabletop is the height datum. Front edge at depth 75 mm; front posts extend 75 mm beyond it, and the camera foot extends 167.5 mm beyond it. Check actual clamp dimensions and apron clearance before assembly.",
  });
  addBox(
    table,
    [1.6, 0.035, layout.tableDepth],
    [0, -0.0175, layout.tableFrontDepth + layout.tableDepth / 2],
    palette.table,
  );
  for (const horizontal of [-0.72, 0.72]) {
    for (const depth of [
      layout.tableFrontDepth + 0.075,
      layout.tableFrontDepth + layout.tableDepth - 0.095,
    ]) {
      addBox(
        table,
        [0.045, 0.715, 0.045],
        [horizontal, -0.3925, depth],
        0x97999b,
      );
    }
  }
  addExtrusion(
    {
      id: "arm-beam",
      name: "Shared arm-support beam",
      category: "structure",
      dimensions: "3090 profile · 1300 mm long",
      confidence: "Simulation target",
      description:
        "Both arm bases mount on this beam, laid flat with the 90 mm face on top. Order the beam at 1300 mm from MISUMI; it arrives at the modeled length. Beam dimensions come from ABC's station mesh. Attachment to the table and arm adapter holes remain to be designed.",
      positionNote:
        "Beam center is 252.5 mm into the box; its top is 30 mm above the table.",
    },
    [1.3, 0.03, 0.09],
    [0, 0.015, targets.armDepth],
  );
  addExtrusion(
    {
      id: "mast-foot",
      name: "Mast offset foot",
      category: "camera",
      dimensions: "GFS6-3030 profile · 300 mm supplied length",
      confidence: "Proposed part",
      description:
        "Short fore–aft member creates the L-shaped mast support and joins the arm beam. With front-entry clamps, 167.5 mm of this foot and the mast extend beyond the table edge. This cantilever and its bracket connections require stability verification.",
      positionNote:
        "Mast center is 252.5 mm toward the open side from the arm-base line.",
    },
    [0.03, 0.03, 0.3],
    [0, 0.015, 0.0575],
  );
  addExtrusion(
    {
      id: "camera-mast",
      name: "Single camera mast",
      category: "camera",
      dimensions: "GFS6-3030 profile · 1000 mm supplied length",
      confidence: "Proposed part",
      description:
        "One vertical mast, with adjustable camera mounting height. Replaces the two-upright simulation gate. Use the whole purchased 1000 mm bar; this is a proposed physical arrangement.",
      positionNote:
        "Starts on the 30 mm foot; extends to 1030 mm above the support table.",
    },
    [0.03, 1, 0.03],
    [0, 0.53, 0],
  );
  const cameraCenterHeight = targets.armBaseHeight + targets.cameraHeight;
  addExtrusion(
    {
      id: "camera-offset",
      name: "Camera offset member",
      category: "camera",
      dimensions: "GFS6-3030 profile · 100 mm supplied length",
      confidence: "Proposed part",
      description:
        "Short adjustable camera offset, pointing toward the workspace. Its bracket positions the optical center 86 mm forward of the mast. Details depend on the camera.",
      positionNote:
        "Camera optical center target: 954.3 mm above the arm-base surface.",
    },
    [0.03, 0.03, 0.1],
    [0, cameraCenterHeight - 0.045, 0.065],
  );
  const camera = createPart({
    id: "top-camera",
    name: "Overhead camera",
    category: "camera",
    dimensions: "Optical pose from ABC simulation",
    confidence: "Simulation target",
    description:
      "Target optical center is 954.3 mm above the arm-base surface, 166.5 mm behind the arm-base line, centered between the arms. Viewing axis is 30° forward from straight down. Body is illustrative.",
    positionNote: "Orange sight line is the optical axis, not a physical beam.",
  });
  const cameraBody = addBox(
    camera,
    [0.07, 0.037, 0.036],
    [0, cameraCenterHeight, targets.cameraDepth],
    hardwareFinishes.blackCoating,
  );
  cameraBody.rotation.x = Math.PI / 3;
  const cameraLens = addSurface(
    camera,
    new THREE.CylinderGeometry(0.008, 0.008, 0.006, 20),
    new THREE.Vector3(
      0,
      cameraCenterHeight - 0.018,
      targets.cameraDepth + 0.01,
    ),
    0x79bad2,
  );
  cameraLens.rotation.x = -Math.PI / 6;
  const sightLineEnd = new THREE.Vector3(
    0,
    targets.armBaseHeight,
    targets.cameraDepth + targets.cameraHeight / Math.sqrt(3),
  );
  const sightLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, cameraCenterHeight, targets.cameraDepth),
      sightLineEnd,
    ]),
    new THREE.LineDashedMaterial({
      color: 0xb76c30,
      dashSize: 0.025,
      gapSize: 0.014,
      transparent: true,
      opacity: 0.65,
    }),
  );
  sightLine.computeLineDistances();
  camera.object.add(sightLine);
  function addAngleBracket(
    id: string,
    name: string,
    corner: THREE.Vector3,
    railDirection: THREE.Vector3,
    postDirection: THREE.Vector3,
    jointDescription: string,
  ) {
    const part = createPart({
      id,
      name,
      category: "connectors",
      purchaseUrl:
        "https://us.misumi-ec.com/vona2/detail/110300442340/?HissuCode=HBLFSN6",
      dimensions: "MISUMI HBLFSN6 · 30 × 30 × 30 mm · 2 × M6 × 12 screws",
      confidence: "Proposed part",
      description: `${jointDescription} One MISUMI HBLFSN6 bracket in its natural cast-metal finish, two M6 × 12 socket-head screws (catalog reference CBM6-12), and two HNTT6-6 nuts. Reuse matching screws; purchase list contains bare brackets, not SET kits. Envelope follows the catalog; tabs, ribs and holes are simplified.`,
      positionNote:
        "Each silver bracket is a separate item. The two screw heads and hidden T-nuts belong to this connection; use Zoom to piece for a close view.",
    });
    // Local U/V point away from the inside corner; W spans the extrusion face.
    const bracketLength = 0.03;
    const bracketWidth = 0.03;
    const plateThickness = 0.004;
    const sideDirection = new THREE.Vector3().crossVectors(
      railDirection,
      postDirection,
    );
    part.object.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        railDirection,
        postDirection,
        sideDirection,
      ),
    );
    part.object.position.copy(corner);
    part.object.userData.inspectionDirection = railDirection
      .clone()
      .add(postDirection)
      .addScaledVector(sideDirection, 0.5)
      .normalize();
    addBox(
      part,
      [bracketLength, plateThickness, bracketWidth],
      [bracketLength / 2, plateThickness / 2, 0],
      palette.connectors,
    );
    addBox(
      part,
      [plateThickness, bracketLength, bracketWidth],
      [plateThickness / 2, bracketLength / 2, 0],
      palette.connectors,
    );
    const ribShape = new THREE.Shape();
    ribShape.moveTo(plateThickness, plateThickness);
    ribShape.lineTo(bracketLength, plateThickness);
    ribShape.lineTo(plateThickness, bracketLength);
    ribShape.closePath();
    for (const side of [-1, 1]) {
      addSurface(
        part,
        new THREE.ExtrudeGeometry(ribShape, {
          depth: 0.002,
          bevelEnabled: false,
        }),
        new THREE.Vector3(0, 0, side * (bracketWidth / 2 - 0.002)),
        palette.connectors,
      );
    }
    for (const [boltPosition, boltAxis, nutPosition] of [
      [
        new THREE.Vector3(0.018, 0.005, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0.018, -0.007, 0),
      ],
      [
        new THREE.Vector3(0.005, 0.018, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-0.007, 0.018, 0),
      ],
    ] as const) {
      const boltHead = addSurface(
        part,
        new THREE.CylinderGeometry(0.005, 0.005, 0.004, 6),
        boltPosition,
        hardwareFinishes.blackCoating,
      );
      boltHead.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        boltAxis,
      );
      const slotNut = addBox(
        part,
        [0.016, 0.006, 0.016],
        nutPosition.toArray(),
        hardwareFinishes.steel,
      );
      slotNut.quaternion.copy(boltHead.quaternion);
    }
  }
  for (const [sideName, horizontal] of [
    ["Left", -layout.postHorizontal],
    ["Right", layout.postHorizontal],
  ] as const) {
    for (const [endName, depth, direction] of [
      ["front", layout.sideRailStart, 1],
      ["rear", layout.sideRailStart + layout.sideRailLength, -1],
    ] as const) {
      for (const [levelName, height, verticalDirection] of [
        ["lower", 0.03, 1],
        ["upper", layout.frameHeight - 0.03, -1],
      ] as const) {
        addAngleBracket(
          `${sideName.toLowerCase()}-${endName}-${levelName}-side-bracket`,
          `${sideName} ${endName} ${levelName} side bracket`,
          new THREE.Vector3(horizontal, height, depth),
          new THREE.Vector3(0, 0, direction),
          new THREE.Vector3(0, verticalDirection, 0),
          "Connects the side rail to its upright; both bars arrive at the modeled length.",
        );
      }
    }
    for (const [levelName, height, verticalDirection] of [
      ["lower", 0.03, 1],
      ["upper", layout.frameHeight - 0.03, -1],
    ] as const) {
      addAngleBracket(
        `${sideName.toLowerCase()}-${levelName}-rear-bracket`,
        `${sideName} ${levelName} rear-rail bracket`,
        new THREE.Vector3(
          (Math.sign(horizontal) * layout.rearRailLength) / 2,
          height,
          layout.rearPostDepth,
        ),
        new THREE.Vector3(-Math.sign(horizontal), 0, 0),
        new THREE.Vector3(0, verticalDirection, 0),
        "Connects the rear rail to its upright, beside the independent side-rail bracket.",
      );
    }
  }
  for (const direction of [-1, 1]) {
    const sideName = direction === -1 ? "front" : "rear";
    addAngleBracket(
      `mast-${sideName}-bracket`,
      `Mast-to-foot ${sideName} bracket`,
      new THREE.Vector3(0, 0.03, direction * 0.015),
      new THREE.Vector3(0, 0, direction),
      new THREE.Vector3(0, 1, 0),
      "Braces the mast on top of its 300 mm foot.",
    );
    addAngleBracket(
      `foot-${direction === -1 ? "left" : "right"}-bracket`,
      `Foot-to-arm-beam ${direction === -1 ? "left" : "right"} bracket`,
      new THREE.Vector3(direction * 0.015, 0.015, 0.2075),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(direction, 0, 0),
      "Connects the side of the mast foot to the front face of the arm beam.",
    );
    addAngleBracket(
      `camera-offset-${direction === -1 ? "lower" : "upper"}-bracket`,
      `Camera-offset ${direction === -1 ? "lower" : "upper"} bracket`,
      new THREE.Vector3(
        0,
        cameraCenterHeight - 0.045 + direction * 0.015,
        0.015,
      ),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, direction, 0),
      "Connects the 100 mm camera offset to the vertical mast.",
    );
  }
  function addPanelFixing(
    id: string,
    name: string,
    surfacePosition: THREE.Vector3,
    outwardDirection: THREE.Vector3,
  ) {
    const part = createPart({
      id,
      name,
      category: "connectors",
      dimensions:
        "M6 + slot-8 nut · washer · screw length pending panel thickness",
      confidence: "Proposed part",
      description:
        "One of twelve wall fixings through the panel into a 3030 slot. Side panels attach to side rails; the back panel attaches to rear rails. M6 screw length follows the final panel and washer stack. Hole positions and material-dependent spacing remain to be detailed.",
      positionNote:
        "Screw/washer outlines are illustrative. The panel remains custom cut later; shown locations are a mounting proposal.",
    });
    part.object.position.copy(surfacePosition);
    part.object.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      outwardDirection,
    );
    addSurface(
      part,
      new THREE.CylinderGeometry(0.008, 0.008, 0.0015, 20),
      new THREE.Vector3(0, 0.00075, 0),
      hardwareFinishes.steel,
    );
    addSurface(
      part,
      new THREE.CylinderGeometry(0.0045, 0.0045, 0.004, 6),
      new THREE.Vector3(0, 0.0035, 0),
      hardwareFinishes.blackCoating,
    );
    addBox(part, [0.016, 0.006, 0.016], [0, -0.017, 0], hardwareFinishes.steel);
  }
  for (const side of [-1, 1]) {
    const sideName = side === -1 ? "Left" : "Right";
    for (const [endName, depth] of [
      ["front", 0.05],
      ["rear", 0.85],
    ] as const) {
      for (const [levelName, height] of [
        ["lower", 0.015],
        ["upper", 1.265],
      ] as const) {
        addPanelFixing(
          `${sideName.toLowerCase()}-${endName}-${levelName}-wall-fixing`,
          `${sideName} wall · ${endName} ${levelName} fixing`,
          new THREE.Vector3(
            side * (layout.sideWallHorizontal + layout.wallThickness / 2),
            height,
            depth,
          ),
          new THREE.Vector3(side, 0, 0),
        );
      }
    }
    for (const [levelName, height] of [
      ["lower", layout.lowerRearRailHeight],
      ["upper", layout.upperRearRailHeight],
    ] as const) {
      addPanelFixing(
        `rear-${sideName.toLowerCase()}-${levelName}-wall-fixing`,
        `Back wall · ${sideName.toLowerCase()} ${levelName} fixing`,
        new THREE.Vector3(side * 0.6, height, layout.panelOutsideDepth),
        new THREE.Vector3(0, 0, 1),
      );
    }
  }
  const cameraAdapter = createPart({
    id: "camera-adapter",
    name: "Camera mounting adapter · fit pending",
    category: "connectors",
    dimensions: "35 × 30 × 30 mm shown · placeholder",
    confidence: "Illustrative",
    description:
      "Adjustable adapter between the offset extrusion and the camera. Hole pattern, camera screw and tilt adjustment are not verified. This is a visible placeholder for the remaining connection, not a linked ready-made part.",
    positionNote:
      "Retains the ABC optical target; reuse a compatible camera bracket if it fits, otherwise detail an adapter.",
  });
  addBox(
    cameraAdapter,
    [0.035, 0.003, 0.03],
    [0, cameraCenterHeight - 0.0285, targets.cameraDepth],
    hardwareFinishes.unselectedAdapter,
  );
  addBox(
    cameraAdapter,
    [0.035, 0.0285, 0.003],
    [0, cameraCenterHeight - 0.01275, targets.cameraDepth - 0.0135],
    hardwareFinishes.unselectedAdapter,
  );
  for (const side of [-1, 1]) {
    const sideName = side === -1 ? "Left" : "Right";
    for (const [mountName, horizontal, depth, rotation] of [
      [
        "arm beam",
        side * layout.armClampHorizontal,
        targets.armDepth,
        Math.PI / 2,
      ],
      [
        "frame",
        side * layout.frameClampHorizontal,
        layout.frameClampDepth,
        Math.acos(-side * layout.frameClampInwardComponent),
      ],
    ] as const) {
      const tableClamp = createPart({
        id: `${sideName.toLowerCase()}-${mountName.replaceAll(" ", "-")}-clamp`,
        name: `${sideName} ${mountName} table clamp`,
        category: "connectors",
        dimensions:
          "203.2 mm throat · 76.2 mm max opening · body/pads approximate",
        confidence: "Proposed part",
        purchaseUrl: "https://www.amazon.com/dp/B01N0OM99E",
        description:
          "Performance Tool W3982: manufacturer-specified 8-inch throat and 3-inch opening. Body, pads, screw and handle are approximate, not manufacturer CAD. Four clamps enter from the open front: two for the arm beam and two angled inward for the side rails, avoiding panel cutouts in this proposed layout. Actual fit and holding capacity require verification; there are no rear hold-downs.",
        positionNote: `Table front edge at depth 75 mm. Required throat along this clamp is ${((1000 * (depth - layout.tableFrontDepth)) / Math.sin(rotation)).toFixed(1)} mm; clamped stack is 65 mm. Frame clamps angle inward to clear the lower rails, with about 2.5 mm nominal pad-to-wall clearance. Front posts and camera foot overhang the table.`,
      });
      tableClamp.object.position.set(horizontal, 0, depth);
      tableClamp.object.rotation.y = rotation;
      addBox(
        tableClamp,
        [0.2032, 0.02, 0.02],
        [0.1016, 0.065, 0],
        hardwareFinishes.blackCoating,
      );
      addBox(
        tableClamp,
        [0.02, 0.155, 0.025],
        [0.2132, -0.0025, 0],
        hardwareFinishes.blackCoating,
      );
      addBox(
        tableClamp,
        [0.2232, 0.02, 0.02],
        [0.1016, -0.08, 0],
        hardwareFinishes.blackCoating,
      );
      addBox(
        tableClamp,
        [0.024, 0.025, 0.024],
        [0, 0.0425, 0],
        hardwareFinishes.blackCoating,
      );
      addSurface(
        tableClamp,
        new THREE.CylinderGeometry(0.011, 0.011, 0.004, 16),
        new THREE.Vector3(0, -0.037, 0),
        hardwareFinishes.steel,
      );
      addSurface(
        tableClamp,
        new THREE.CylinderGeometry(0.0045, 0.0045, 0.105, 12),
        new THREE.Vector3(0, -0.0915, 0),
        hardwareFinishes.steel,
      );
      const handle = addSurface(
        tableClamp,
        new THREE.CylinderGeometry(0.003, 0.003, 0.06, 12),
        new THREE.Vector3(0, -0.137, 0),
        hardwareFinishes.steel,
      );
      handle.rotation.z = Math.PI / 2;
    }
  }
  const workSurface = createPart({
    id: "work-surface",
    name: "Work-surface panel",
    category: "panels",
    dimensions: `${Math.round(layout.workPanelWidth * 1000)} × ${Number((layout.workPanelDepth * 1000).toFixed(1))} × 30 mm · proposed worktop`,
    confidence: "Proposed part",
    description:
      "Task surface beyond the arm-support beam, sized to the frame. A 30 mm finished worktop rests directly on the existing table, with tape proposed to limit sliding. Its top aligns with the arm-base mounting plane. Material and tape are not yet specified; tape is not used to secure the robots or frame.",
    positionNote:
      "Top at +30 mm, starting 302.5 mm into the enclosure. Worktop edge clearance: 50 mm to the outside-mounted side/back walls and 20 mm to the inward frame faces. Worktop material, fit allowances and tape are selected before custom cutting.",
  });
  addBox(
    workSurface,
    [layout.workPanelWidth, 0.03, layout.workPanelDepth],
    [0, 0.015, 0.3025 + layout.workPanelDepth / 2],
    palette.panels,
  );
  const wallTop = layout.frameHeight;
  for (const side of [-1, 1]) {
    const sideName = side === -1 ? "left" : "right";
    const wall = createPart({
      id: `${sideName}-wall`,
      name: `${sideName === "left" ? "Left" : "Right"} enclosure wall`,
      category: "panels",
      dimensions: "935 × 1280 × 10 mm · rectangular panel",
      confidence: "Proposed part",
      description:
        "Rectangular panel bolted to the outside frame face. Panel centers at ±690 mm give 1370 mm between wall faces, 80 mm wider than ABC. Frame rails project 30 mm inward. Clamps enter through the open front, so no clamp cutouts are needed.",
      positionNote:
        "935 × 1280 × 10 mm nominal blank. Four outside-facing M6 fixings at depths 50/850 mm and heights 15/1265 mm. Confirm final dimensions, screw lengths and drilling against the assembled frame and selected material.",
    });
    addBox(
      wall,
      [layout.wallThickness, wallTop - layout.wallBottom, layout.frameDepth],
      [
        side * layout.sideWallHorizontal,
        (wallTop + layout.wallBottom) / 2,
        layout.frameDepth / 2,
      ],
      palette.panels,
    );
  }
  const rearPanelWidth = layout.rearPanelWidth;
  const backWall = createPart({
    id: "back-wall",
    name: "Back enclosure wall",
    category: "panels",
    dimensions: `${Math.round(rearPanelWidth * 1000)} × ${Math.round((wallTop - layout.wallBottom) * 1000)} × 10 mm · proposed panel`,
    confidence: "Proposed part",
    description:
      "Bolts to the rear-facing slots of the rear rails. Inside face at 935 mm depth, 40 mm farther back than ABC. The 1390 mm-wide back panel covers the rear edges of both side panels; its outside face is at 945 mm. Frame rails are inside the enclosure.",
    positionNote:
      "Panel and hole dimensions remain proposals for final custom cutting.",
  });
  addBox(
    backWall,
    [rearPanelWidth, wallTop - layout.wallBottom, 0.01],
    [0, (wallTop + layout.wallBottom) / 2, layout.rearWallDepth],
    palette.panels,
  );
  // Rails butt between full-height posts; rail lengths exclude both post widths.
  for (const [sideName, horizontal] of [
    ["Left", -layout.postHorizontal],
    ["Right", layout.postHorizontal],
  ] as const) {
    for (const [endName, depth] of [
      ["front", layout.frontPostDepth],
      ["rear", layout.rearPostDepth],
    ] as const) {
      addExtrusion(
        {
          id: `${sideName.toLowerCase()}-${endName}-post`,
          name: `${sideName} ${endName} upright`,
          category: "structure",
          dimensions: `GFS6-3030 profile · ${Math.round(layout.frameHeight * 1000)} mm`,
          confidence: "Proposed part",
          description:
            "Full-height corner post. Horizontal rails butt against its side faces. Use one whole supplied bar.",
          positionNote:
            "The bars are supplied at these lengths, with no trimming at home. Arm spacing and camera target follow the ABC simulation.",
        },
        [0.03, layout.frameHeight, 0.03],
        [horizontal, layout.frameHeight / 2, depth],
      );
    }
    for (const [levelName, height] of [
      ["lower", 0.015],
      ["upper", layout.upperSideRailHeight],
    ] as const) {
      addExtrusion(
        {
          id: `${sideName.toLowerCase()}-${levelName}-side-rail`,
          name: `${sideName} ${levelName} side rail`,
          category: "structure",
          dimensions: `GFS6-3030 profile · ${Math.round(layout.sideRailLength * 1000)} mm`,
          confidence: "Proposed part",
          description:
            "Side rail butts between the posts; the supplied length plus two 30 mm posts determines the outside depth.",
          positionNote: `${levelName === "lower" ? "Bottom" : "Top"} rail on the ${sideName.toLowerCase()} wall. Two bracket connections secure this rail between the posts.`,
        },
        [0.03, 0.03, layout.sideRailLength],
        [
          Math.sign(horizontal) * layout.sideRailHorizontal,
          height,
          layout.sideRailStart + layout.sideRailLength / 2,
        ],
      );
    }
  }
  for (const [levelName, height] of [
    ["lower", layout.lowerRearRailHeight],
    ["upper", layout.upperRearRailHeight],
  ] as const) {
    addExtrusion(
      {
        id: `rear-${levelName}-rail`,
        name: `Rear ${levelName} cross rail`,
        category: "structure",
        dimensions: `GFS6-3030 profile · ${Math.round(layout.rearRailLength * 1000)} mm`,
        confidence: "Proposed part",
        description:
          "Rear rail butts between the posts. Use the supplied bar without trimming; posts add 60 mm to outside width.",
        positionNote:
          "No corresponding cross rail spans the open front. The 1300 mm arm beam is a separate member inside this frame.",
      },
      [layout.rearRailLength, 0.03, 0.03],
      [0, height, layout.rearRailDepth],
    );
  }
  function addArm(side: number) {
    const armHorizontal = (side * targets.armSpacing) / 2;
    const sideName = side === -1 ? "Left" : "Right";
    const mountPlate = createPart({
      id: `${sideName.toLowerCase()}-adapter`,
      name: `${sideName} arm base plate`,
      category: "connectors",
      dimensions: "140 × 90 mm mounting-area outline · illustrative",
      confidence: "Illustrative",
      description:
        "Outline of a proposed mounting area only; no adapter thickness or bolt pattern is asserted. The URDF base sits at the +30 mm beam datum. Any actual plate thickness must be accounted for when aligning the arm-base and camera datums.",
      positionNote:
        "Arm-base center at ±310 mm across the box; 252.5 mm into it.",
    });
    const mountingOutline = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(
          armHorizontal - 0.07,
          0.0302,
          targets.armDepth - 0.045,
        ),
        new THREE.Vector3(
          armHorizontal + 0.07,
          0.0302,
          targets.armDepth - 0.045,
        ),
        new THREE.Vector3(
          armHorizontal + 0.07,
          0.0302,
          targets.armDepth + 0.045,
        ),
        new THREE.Vector3(
          armHorizontal - 0.07,
          0.0302,
          targets.armDepth + 0.045,
        ),
      ]),
      new THREE.LineBasicMaterial({ color: 0x60777f }),
    );
    mountPlate.object.add(mountingOutline);
    mountingOutline.userData.partId = mountPlate.description.id;
    mountPlate.outlines.push(mountingOutline);
    const arm = createPart({
      id: `${sideName.toLowerCase()}-arm`,
      name: `${sideName} I2RT YAM — URDF model`,
      category: "arms",
      dimensions: "YAM v1 · six revolute joints + parallel gripper",
      confidence: "Manufacturer model",
      description:
        "Official I2RT YAM v1 URDF and visual meshes, displayed at their original scale. Joint origins and axes come from the manufacturer model; the displayed working pose is illustrative. This is not a collision or mounting-load simulation.",
      positionNote:
        "Base at the +30 mm arm-beam datum, ±310 mm across the box and 252.5 mm into it. Confirm the exact hardware revision and any adapter thickness before using this model for physical clearances.",
    });
    arm.object.position.set(
      armHorizontal,
      targets.armBaseHeight,
      targets.armDepth,
    );
  }
  addArm(-1);
  addArm(1);
  return parts;
}
