import * as THREE from "three";
import URDFLoader, { type URDFRobot } from "urdf-loader";
import type { ModelPart } from "./model";

function applyWhiteCoverColors(geometry: THREE.BufferGeometry): void {
  const positions = geometry.getAttribute("position");
  const colors = new Float32Array(positions.count * 3);
  const blackFinish = new THREE.Color(0x25282b);
  const whiteFinish = new THREE.Color(0xefefeb);
  // The pinned STL meshes combine covers and joints. Approximate the cover
  // region in mesh-local metres, retaining black ends around both joint axes.
  for (let vertexIndex = 0; vertexIndex < positions.count; vertexIndex++) {
    const axialPosition = positions.getZ(vertexIndex);
    const color =
      axialPosition >= 0.065 && axialPosition <= 0.24
        ? whiteFinish
        : blackFinish;
    color.toArray(colors, vertexIndex * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

function loadYamRobot(): Promise<URDFRobot> {
  return new Promise((resolve, reject) => {
    const loadingManager = new THREE.LoadingManager();
    let loadedRobot: URDFRobot | undefined;
    loadingManager.onError = (failedUrl) => {
      reject(new Error(`Could not load YAM model asset: ${failedUrl}`));
    };
    // URDFLoader's own callback precedes completion of its STL requests.
    loadingManager.onLoad = () => {
      if (loadedRobot) resolve(loadedRobot);
      else reject(new Error("The YAM model did not contain a robot."));
    };
    const loader = new URDFLoader(loadingManager);
    loader.parseCollision = false;
    loader.load(
      `${import.meta.env.BASE_URL}models/i2rt-yam/yam.urdf`,
      (robot) => {
        loadedRobot = robot;
      },
      undefined,
      reject,
    );
  });
}

export async function loadYamArms(parts: ModelPart[]): Promise<void> {
  const robotTemplate = await loadYamRobot();
  // Right-handed change of basis: URDF X -> depth, Y -> width, Z -> up.
  const coordinateRotation = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
  );
  for (const armPart of parts.filter(
    (part) => part.description.category === "arms",
  )) {
    const robot = robotTemplate.clone();
    robot.setRotationFromMatrix(coordinateRotation);
    robot.setJointValues({
      joint1: 0,
      joint2: Math.PI / 3,
      joint3: Math.PI / 3,
      joint4: 0,
      joint5: 0,
      joint6: 0,
      joint7: -0.02,
      joint8: -0.02,
    });
    const whiteCoverObjects = new Set<THREE.Object3D>();
    for (const linkName of ["link2", "link3"]) {
      for (const child of robot.links[linkName]?.children ?? []) {
        if (child.type !== "URDFVisual") continue;
        child.traverse((object) => whiteCoverObjects.add(object));
      }
    }
    robot.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const hasWhiteCover = whiteCoverObjects.has(object);
      if (hasWhiteCover) {
        object.geometry = object.geometry.clone();
        applyWhiteCoverColors(object.geometry);
      }
      // Match original I2RT YAM white covers and black hardware.
      // Independent materials keep highlighting isolated to each arm.
      const material = new THREE.MeshStandardMaterial({
        color: hasWhiteCover ? 0xffffff : 0x25282b,
        vertexColors: hasWhiteCover,
        roughness: 0.48,
        metalness: 0.35,
      });
      object.material = material;
      object.castShadow = true;
      object.receiveShadow = true;
      object.userData.partId = armPart.description.id;
      const surface = object as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshStandardMaterial
      >;
      armPart.surfaces.push(surface);
    });
    armPart.object.add(robot);
  }
}
