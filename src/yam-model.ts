import * as THREE from "three";
import URDFLoader, { type URDFRobot } from "urdf-loader";
import type { ModelPart } from "./model";

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
    robot.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      // Independent standard materials preserve each URDF colour and allow
      // arm-level highlighting without highlighting the other clone.
      const sourceMaterial = Array.isArray(object.material)
        ? object.material[0]
        : object.material;
      const sourceColor =
        sourceMaterial && "color" in sourceMaterial
          ? sourceMaterial.color
          : undefined;
      const material = new THREE.MeshStandardMaterial({
        color: sourceColor instanceof THREE.Color ? sourceColor : 0xb8c2c7,
        roughness: 0.62,
        metalness: 0.2,
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
