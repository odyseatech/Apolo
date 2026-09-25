import * as THREE from 'three';
import { EngineMaterialMode } from '../../types/engine';
import { createThermalShaderMaterial } from './ThermalShaderMaterial';
import { createBlueprintShaderMaterial } from './BlueprintShaderMaterial';
import {
  createCastIronBumpTexture,
  createMachinedSteelBumpTexture,
  createPaintOrangePeelTexture
} from './ProceduralTextures';

export interface ExplodedPartItem {
  name: string;
  group: THREE.Group;
  basePos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  guideAxis?: 'Y' | 'X' | 'Z';
}

export interface EngineModelParts {
  rootGroup: THREE.Group;
  fanGroup: THREE.Group;
  flywheelGroup: THREE.Group;
  crankshaftGroup: THREE.Group;
  pistons: {
    rod: THREE.Mesh;
    piston: THREE.Mesh;
    combustionGlow: THREE.PointLight;
    cylinderIndex: number;
    baseY: number;
  }[];
  turboImpellerGroup: THREE.Group;
  subsystemGroups: { [subsystemId: string]: THREE.Group };
  materials: { [key: string]: THREE.Material };
  guideLinesGroup: THREE.Group;
  updateMaterials: (
    mode: EngineMaterialMode,
    egt: number,
    load: number,
    isTransparent?: boolean,
    transparencyOpacity?: number
  ) => void;
  updateAnimation: (
    rpm: number,
    delta: number,
    isRunning: boolean,
    explodeAmount: number,
    load?: number,
    egt?: number
  ) => void;
}

export function createCaterpillarEngineModel(): EngineModelParts {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CAT_C15_ENGINE_ROOT';

  const explodedParts: ExplodedPartItem[] = [];

  function registerExplodedPart(
    name: string,
    group: THREE.Group,
    explodeOffset: [number, number, number],
    guideAxis: 'Y' | 'X' | 'Z' = 'Y'
  ): THREE.Group {
    explodedParts.push({
      name,
      group,
      basePos: group.position.clone(),
      explodeOffset: new THREE.Vector3(...explodeOffset),
      guideAxis
    });
    return group;
  }

  // Generate realistic procedural PBR bump maps
  const castIronBump = createCastIronBumpTexture();
  const machinedSteelBump = createMachinedSteelBumpTexture();
  const paintBump = createPaintOrangePeelTexture();

  // Master High-Fidelity PBR Materials (Authentic Caterpillar Factory Specs)
  const materials: { [key: string]: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial } = {
    catYellow: new THREE.MeshPhysicalMaterial({
      color: 0xDCA000,
      roughness: 0.26,
      metalness: 0.14,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
      bumpMap: paintBump,
      bumpScale: 0.0006,
      name: 'catYellow'
    }),
    castGray: new THREE.MeshStandardMaterial({
      color: 0x6E747C,
      roughness: 0.65,
      metalness: 0.35,
      bumpMap: castIronBump,
      bumpScale: 0.003,
      name: 'castGray'
    }),
    darkCastIron: new THREE.MeshStandardMaterial({
      color: 0x1E2024,
      roughness: 0.76,
      metalness: 0.42,
      bumpMap: castIronBump,
      bumpScale: 0.004,
      name: 'darkCastIron'
    }),
    machinedSteel: new THREE.MeshStandardMaterial({
      color: 0xC8CFD8,
      roughness: 0.18,
      metalness: 0.92,
      bumpMap: machinedSteelBump,
      bumpScale: 0.001,
      name: 'machinedSteel'
    }),
    polishedChrome: new THREE.MeshPhysicalMaterial({
      color: 0xF8FAFC,
      roughness: 0.05,
      metalness: 0.99,
      clearcoat: 0.85,
      clearcoatRoughness: 0.05,
      name: 'polishedChrome'
    }),
    darkRubber: new THREE.MeshStandardMaterial({
      color: 0x121316,
      roughness: 0.88,
      metalness: 0.06,
      bumpMap: paintBump,
      bumpScale: 0.002,
      name: 'darkRubber'
    }),
    exhaustSteel: new THREE.MeshStandardMaterial({
      color: 0x483C35,
      roughness: 0.80,
      metalness: 0.45,
      bumpMap: castIronBump,
      bumpScale: 0.004,
      name: 'exhaustSteel'
    }),
    copperBrass: new THREE.MeshPhysicalMaterial({
      color: 0xD08232,
      roughness: 0.24,
      metalness: 0.88,
      clearcoat: 0.3,
      name: 'copperBrass'
    }),
    whiteFilter: new THREE.MeshPhysicalMaterial({
      color: 0xDCA000,
      roughness: 0.24,
      metalness: 0.14,
      clearcoat: 0.5,
      name: 'whiteFilter'
    }),
    internalSteel: new THREE.MeshStandardMaterial({
      color: 0xDCE1E8,
      roughness: 0.19,
      metalness: 0.94,
      bumpMap: machinedSteelBump,
      bumpScale: 0.001,
      name: 'internalSteel'
    }),
    pistonGold: new THREE.MeshStandardMaterial({
      color: 0xE4BA42,
      roughness: 0.20,
      metalness: 0.86,
      bumpMap: machinedSteelBump,
      bumpScale: 0.001,
      name: 'pistonGold'
    })
  };

  // Helper: Extruded rounded box with smooth corner fillets (removes squared box look)
  function createRoundedBox(
    w: number,
    h: number,
    d: number,
    radius: number,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const r = Math.min(radius, w / 2 - 0.01, h / 2 - 0.01);
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
      depth: Math.max(0.01, d - r * 2),
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: r,
      bevelThickness: r
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Helper: Smooth cylinder with high tessellation
  function createCyl(
    rTop: number,
    rBot: number,
    height: number,
    segs: number,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(rTop, rBot, height, Math.max(segs, 24));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Helper: Smooth 3D curved tube from spline points
  function createCurvedTube(
    points: [number, number, number][],
    radius: number,
    mat: THREE.Material,
    radialSegs = 16
  ): THREE.Mesh {
    const vPoints = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vPoints, false, 'catmullrom', 0.5);
    const geo = new THREE.TubeGeometry(curve, points.length * 10, radius, radialSegs, false);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Helper: Smooth torus ring (for flanges, seals, hose beads)
  function createTorus(
    radius: number,
    tube: number,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const geo = new THREE.TorusGeometry(radius, tube, 16, 32);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  const subsystemGroups: { [id: string]: THREE.Group } = {
    'block-core': new THREE.Group(),
    'rocker-covers': new THREE.Group(),
    'turbocharger': new THREE.Group(),
    'flywheel': new THREE.Group(),
    'fuel-filtration': new THREE.Group(),
    'intake-manifold': new THREE.Group(),
    'exhaust-manifold': new THREE.Group(),
    'oil-pan': new THREE.Group(),
    'cooling-fan-drive': new THREE.Group(),
    'ecm-module': new THREE.Group(),
    'internals': new THREE.Group(),
  };

  const zPositions = [-0.85, -0.51, -0.17, 0.17, 0.51, 0.85];

  // ==========================================
  // 1. ENGINE BLOCK & CRANKCASE (Bloque Esculpido con Curvas y Cilindros)
  // ==========================================
  const blockCoreGrp = registerExplodedPart('Bloque Central', new THREE.Group(), [0, 0, 0], 'Y');
  blockCoreGrp.userData.baseTemp = 0.48;
  subsystemGroups['block-core'].add(blockCoreGrp);

  // Main central cast block core with rounded fillets (removes flat brick effect)
  const mainBlockFilleted = createRoundedBox(0.86, 0.74, 2.26, 0.08, materials.catYellow, [0, 0.12, 0]);
  blockCoreGrp.add(mainBlockFilleted);

  // Machined top deck with rounded perimeter chamfer
  const topDeckFilleted = createRoundedBox(0.84, 0.12, 2.18, 0.04, materials.castGray, [0, 0.55, 0]);
  blockCoreGrp.add(topDeckFilleted);

  // Sculpted cylindrical outer water jackets along the engine block flanks (iconic Caterpillar barrel shape)
  zPositions.forEach((zPos) => {
    // Left & right curved cylinder bulging walls
    const cylWallL = createCyl(0.24, 0.24, 0.62, 24, materials.catYellow, [-0.36, 0.14, zPos], [0, 0, 0]);
    const cylWallR = createCyl(0.24, 0.24, 0.62, 24, materials.catYellow, [0.36, 0.14, zPos], [0, 0, 0]);
    cylWallL.scale.set(0.65, 1.0, 1.0);
    cylWallR.scale.set(0.65, 1.0, 1.0);
    blockCoreGrp.add(cylWallL, cylWallR);

    // Bored cylinder openings on top deck
    const boreRecess = createCyl(0.145, 0.145, 0.14, 32, materials.darkCastIron, [0, 0.56, zPos]);
    const boreRing = createTorus(0.145, 0.012, materials.machinedSteel, [0, 0.61, zPos], [Math.PI / 2, 0, 0]);
    blockCoreGrp.add(boreRecess, boreRing);

    // Realistic round freeze plugs with machined dished centers on right side
    const plugBoss = createCyl(0.065, 0.065, 0.03, 24, materials.catYellow, [0.44, 0.24, zPos], [0, 0, Math.PI / 2]);
    const plugCore = createCyl(0.052, 0.048, 0.04, 24, materials.machinedSteel, [0.45, 0.24, zPos], [0, 0, Math.PI / 2]);
    blockCoreGrp.add(plugBoss, plugCore);
  });

  // Structural curved stiffening cross-ribs on block flanks
  for (let z = -0.92; z <= 0.92; z += 0.34) {
    const ribL = createRoundedBox(0.06, 0.58, 0.05, 0.02, materials.catYellow, [-0.45, 0.12, z]);
    const ribR = createRoundedBox(0.06, 0.58, 0.05, 0.02, materials.catYellow, [0.45, 0.12, z]);
    blockCoreGrp.add(ribL, ribR);
  }

  // Sculpted chassis mounting brackets with rounded gusset plates
  const mountPadFL = createRoundedBox(0.22, 0.16, 0.20, 0.03, materials.catYellow, [-0.54, -0.15, -0.6]);
  const mountPadFR = createRoundedBox(0.22, 0.16, 0.20, 0.03, materials.catYellow, [0.54, -0.15, -0.6]);
  const mountPadRL = createRoundedBox(0.22, 0.16, 0.20, 0.03, materials.catYellow, [-0.54, -0.15, 0.7]);
  const mountPadRR = createRoundedBox(0.22, 0.16, 0.20, 0.03, materials.catYellow, [0.54, -0.15, 0.7]);
  blockCoreGrp.add(mountPadFL, mountPadFR, mountPadRL, mountPadRR);

  // Heavy lifting eyes with smooth curved toroidal ring hooks
  const liftEyeRingF = createTorus(0.08, 0.024, materials.catYellow, [0.38, 0.84, -0.88], [0, Math.PI / 2, 0]);
  const liftEyeBaseF = createCyl(0.05, 0.05, 0.10, 16, materials.darkCastIron, [0.38, 0.74, -0.88]);
  const liftEyeRingR = createTorus(0.08, 0.024, materials.catYellow, [-0.38, 0.84, 0.88], [0, Math.PI / 2, 0]);
  const liftEyeBaseR = createCyl(0.05, 0.05, 0.10, 16, materials.darkCastIron, [-0.38, 0.74, 0.88]);
  blockCoreGrp.add(liftEyeRingF, liftEyeBaseF, liftEyeRingR, liftEyeBaseR);

  // ==========================================
  // 2. WET CYLINDER LINERS (6 Camisas de Cilindro Húmedas con Bordes Mecanizados)
  // Explode UP +Y by 1.25
  // ==========================================
  const linersGrp = registerExplodedPart('6 Camisas de Cilindro Húmedas', new THREE.Group(), [0, 1.25, 0], 'Y');
  linersGrp.userData.baseTemp = 0.52;
  zPositions.forEach((zPos) => {
    const liner = createCyl(0.138, 0.138, 0.68, 32, materials.machinedSteel, [0, 0.34, zPos]);
    const flange = createCyl(0.148, 0.148, 0.06, 32, materials.polishedChrome, [0, 0.66, zPos]);
    const oRing1 = createTorus(0.139, 0.008, materials.darkRubber, [0, 0.16, zPos], [Math.PI / 2, 0, 0]);
    const oRing2 = createTorus(0.139, 0.008, materials.darkRubber, [0, 0.10, zPos], [Math.PI / 2, 0, 0]);
    linersGrp.add(liner, flange, oRing1, oRing2);
  });
  subsystemGroups['block-core'].add(linersGrp);

  // ==========================================
  // 3. CYLINDER HEAD GASKET (Junta MLS Multicapa con Anillos de Fuego)
  // Explodes UP +Y by 2.3
  // ==========================================
  const headGasketGrp = registerExplodedPart('Junta de Culata MLS', new THREE.Group(), [0, 2.3, 0], 'Y');
  headGasketGrp.userData.baseTemp = 0.72;
  const headGasket = createRoundedBox(0.85, 0.024, 2.18, 0.04, materials.copperBrass, [0, 0.65, 0]);
  headGasketGrp.add(headGasket);
  zPositions.forEach((zPos) => {
    const fireRing = createTorus(0.142, 0.012, materials.machinedSteel, [0, 0.65, zPos], [Math.PI / 2, 0, 0]);
    headGasketGrp.add(fireRing);
  });
  subsystemGroups['rocker-covers'].add(headGasketGrp);

  // ==========================================
  // 4. CYLINDER HEAD (Culata Esculpida con Pasajes Curvos)
  // Explodes UP +Y by 3.4
  // ==========================================
  const cylHeadGrp = registerExplodedPart('Culata de Cilindros', new THREE.Group(), [0, 3.4, 0], 'Y');
  cylHeadGrp.userData.baseTemp = 0.65;
  const cylHeadMesh = createRoundedBox(0.88, 0.36, 2.20, 0.06, materials.catYellow, [0, 0.85, 0]);
  cylHeadGrp.add(cylHeadMesh);

  // Head bolt pillars and machined bosses
  for (let z = -0.96; z <= 0.96; z += 0.32) {
    const bL = createCyl(0.022, 0.022, 0.40, 16, materials.machinedSteel, [-0.40, 0.85, z]);
    const bR = createCyl(0.022, 0.022, 0.40, 16, materials.machinedSteel, [0.40, 0.85, z]);
    const capL = createCyl(0.032, 0.032, 0.03, 16, materials.darkCastIron, [-0.40, 1.04, z]);
    const capR = createCyl(0.032, 0.032, 0.03, 16, materials.darkCastIron, [0.40, 1.04, z]);
    cylHeadGrp.add(bL, bR, capL, capR);
  }
  subsystemGroups['rocker-covers'].add(cylHeadGrp);

  // ==========================================
  // 5. VALVES & SPRINGS (24 Válvulas y Resortes Helicoidales)
  // Explodes UP +Y by 4.4
  // ==========================================
  const valvesGrp = registerExplodedPart('24 Válvulas y Resortes', new THREE.Group(), [0, 4.4, 0], 'Y');
  valvesGrp.userData.baseTemp = 0.78;
  zPositions.forEach((zPos) => {
    // 2 Intake + 2 Exhaust valves per cylinder with flared disc crowns
    const vIn1 = createCyl(0.044, 0.012, 0.20, 20, materials.internalSteel, [-0.18, 0.90, zPos - 0.06]);
    const vIn2 = createCyl(0.044, 0.012, 0.20, 20, materials.internalSteel, [-0.18, 0.90, zPos + 0.06]);
    const vEx1 = createCyl(0.038, 0.012, 0.20, 20, materials.exhaustSteel, [0.18, 0.90, zPos - 0.06]);
    const vEx2 = createCyl(0.038, 0.012, 0.20, 20, materials.exhaustSteel, [0.18, 0.90, zPos + 0.06]);

    // Dual nested valve springs with retainers
    const sp1 = createCyl(0.034, 0.034, 0.13, 16, materials.machinedSteel, [-0.18, 0.98, zPos - 0.06]);
    const sp2 = createCyl(0.034, 0.034, 0.13, 16, materials.machinedSteel, [-0.18, 0.98, zPos + 0.06]);
    const sp3 = createCyl(0.034, 0.034, 0.13, 16, materials.machinedSteel, [0.18, 0.98, zPos - 0.06]);
    const sp4 = createCyl(0.034, 0.034, 0.13, 16, materials.machinedSteel, [0.18, 0.98, zPos + 0.06]);

    const ret1 = createCyl(0.038, 0.030, 0.03, 16, materials.darkCastIron, [-0.18, 1.05, zPos - 0.06]);
    const ret2 = createCyl(0.038, 0.030, 0.03, 16, materials.darkCastIron, [-0.18, 1.05, zPos + 0.06]);
    const ret3 = createCyl(0.038, 0.030, 0.03, 16, materials.darkCastIron, [0.18, 1.05, zPos - 0.06]);
    const ret4 = createCyl(0.038, 0.030, 0.03, 16, materials.darkCastIron, [0.18, 1.05, zPos + 0.06]);

    valvesGrp.add(vIn1, vIn2, vEx1, vEx2, sp1, sp2, sp3, sp4, ret1, ret2, ret3, ret4);
  });
  subsystemGroups['rocker-covers'].add(valvesGrp);

  // ==========================================
  // 6. MEUI FUEL INJECTORS (6 Inyectores con Solenoide)
  // Explodes UP +Y by 5.2
  // ==========================================
  const injectorsGrp = registerExplodedPart('6 Inyectores MEUI-C', new THREE.Group(), [0, 5.2, 0], 'Y');
  injectorsGrp.userData.baseTemp = 0.55;
  zPositions.forEach((zPos) => {
    const injNozzle = createCyl(0.012, 0.006, 0.12, 16, materials.polishedChrome, [0, 0.85, zPos]);
    const injBody = createCyl(0.028, 0.024, 0.22, 20, materials.machinedSteel, [0, 0.98, zPos]);
    const injSolenoid = createRoundedBox(0.062, 0.075, 0.062, 0.015, materials.darkRubber, [0, 1.10, zPos]);
    const injTappet = createCyl(0.018, 0.018, 0.05, 16, materials.polishedChrome, [0, 1.16, zPos]);
    injectorsGrp.add(injNozzle, injBody, injSolenoid, injTappet);
  });
  subsystemGroups['rocker-covers'].add(injectorsGrp);

  // ==========================================
  // 7. ROCKER ARMS & SHAFTS (Balancines Curvados y Varillas)
  // Explodes UP +Y by 6.0
  // ==========================================
  const rockerArmsGrp = registerExplodedPart('Eje de Balancines y Varillas', new THREE.Group(), [0, 6.0, 0], 'Y');
  rockerArmsGrp.userData.baseTemp = 0.68;
  const rockerShaft = createCyl(0.028, 0.028, 2.12, 24, materials.polishedChrome, [0, 1.12, 0], [Math.PI / 2, 0, 0]);
  rockerArmsGrp.add(rockerShaft);

  zPositions.forEach((zPos) => {
    // Forged curved rocker arms with pivot eye
    const arm1 = createRoundedBox(0.24, 0.045, 0.038, 0.012, materials.internalSteel, [0, 1.14, zPos - 0.06]);
    const arm2 = createRoundedBox(0.24, 0.045, 0.038, 0.012, materials.internalSteel, [0, 1.14, zPos + 0.06]);
    const pivotEye1 = createCyl(0.038, 0.038, 0.042, 16, materials.machinedSteel, [0, 1.14, zPos - 0.06], [Math.PI / 2, 0, 0]);
    const pivotEye2 = createCyl(0.038, 0.038, 0.042, 16, materials.machinedSteel, [0, 1.14, zPos + 0.06], [Math.PI / 2, 0, 0]);

    const pushrod1 = createCyl(0.009, 0.009, 0.44, 12, materials.machinedSteel, [-0.22, 0.94, zPos - 0.06]);
    const pushrod2 = createCyl(0.009, 0.009, 0.44, 12, materials.machinedSteel, [-0.22, 0.94, zPos + 0.06]);
    rockerArmsGrp.add(arm1, arm2, pivotEye1, pivotEye2, pushrod1, pushrod2);
  });
  subsystemGroups['rocker-covers'].add(rockerArmsGrp);

  // ==========================================
  // 8. 3 SPLIT VALVE COVERS (3 Tapas de Balancines Seccionadas C15 con Respiradero y Boca de Llenado)
  // Explode UP +Y in an staggered arch (6.8 to 7.4)
  // ==========================================
  const valveCoverPositions = [
    { z: -0.68, name: 'Tapa Delantera (Cilindros 1-2)', hasFiller: true },
    { z: 0.0, name: 'Tapa Central (Cilindros 3-4)', hasFiller: false },
    { z: 0.68, name: 'Tapa Trasera (Cilindros 5-6)', hasFiller: false }
  ];

  valveCoverPositions.forEach((vc, idx) => {
    const archY = 6.8 + (idx === 1 ? 0.4 : 0.1);
    const coverGroup = registerExplodedPart(vc.name, new THREE.Group(), [0, archY, 0], 'Y');
    coverGroup.userData.baseTemp = 0.58;

    // Main cast flanged cover body with rounded corner bevels
    const coverBase = createRoundedBox(0.74, 0.22, 0.62, 0.05, materials.catYellow, [0, 1.18, vc.z]);

    // Top structural longitudinal stiffening ridges
    const ridge1 = createRoundedBox(0.04, 0.04, 0.54, 0.015, materials.catYellow, [-0.18, 1.30, vc.z]);
    const ridge2 = createRoundedBox(0.04, 0.04, 0.54, 0.015, materials.catYellow, [0.18, 1.30, vc.z]);
    coverGroup.add(coverBase, ridge1, ridge2);

    // Front cover has the iconic tall oil filler neck and yellow twist cap + breather canister
    if (vc.hasFiller) {
      const fillerNeck = createCyl(0.065, 0.065, 0.18, 24, materials.catYellow, [-0.22, 1.36, vc.z - 0.16]);
      const fillerCap = createCyl(0.082, 0.076, 0.05, 24, materials.catYellow, [-0.22, 1.46, vc.z - 0.16]);
      const breatherCan = createCyl(0.075, 0.075, 0.16, 24, materials.catYellow, [0.20, 1.36, vc.z + 0.12]);
      const breatherCap = createCyl(0.085, 0.08, 0.04, 24, materials.catYellow, [0.20, 1.45, vc.z + 0.12]);
      coverGroup.add(fillerNeck, fillerCap, breatherCan, breatherCap);
    } else {
      // Stamped inspection plug
      const plug = createCyl(0.05, 0.05, 0.03, 20, materials.catYellow, [0, 1.30, vc.z]);
      coverGroup.add(plug);
    }

    // Perimeter mounting flange hex bolts
    const boltCoords = [
      [-0.32, vc.z - 0.26],
      [0.32, vc.z - 0.26],
      [-0.32, vc.z + 0.26],
      [0.32, vc.z + 0.26],
      [-0.32, vc.z],
      [0.32, vc.z]
    ];
    boltCoords.forEach(([bx, bz]) => {
      const bolt = createCyl(0.014, 0.014, 0.035, 12, materials.machinedSteel, [bx, 1.28, bz]);
      coverGroup.add(bolt);
    });

    subsystemGroups['rocker-covers'].add(coverGroup);
  });

  // ==========================================
  // 9. INTERNAL KINEMATICS (Pistones de Corona Curva, Bielas en H, Cigüeñal con Contrapesos)
  // ==========================================
  const pistonsAssemblyGrp = registerExplodedPart('6 Pistones Forjados', new THREE.Group(), [0, 1.85, 0], 'Y');
  pistonsAssemblyGrp.userData.baseTemp = 0.84;
  const pistonsData: {
    rod: THREE.Mesh;
    piston: THREE.Mesh;
    combustionGlow: THREE.PointLight;
    cylinderIndex: number;
    baseY: number;
  }[] = [];

  const crankAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3, (4 * Math.PI) / 3, (2 * Math.PI) / 3, 0];

  zPositions.forEach((zPos, i) => {
    // Piston crown with re-entrant toroidal combustion bowl
    const piston = createCyl(0.126, 0.126, 0.18, 32, materials.pistonGold, [0, 0.45, zPos]);
    // Recessed combustion bowl inside the top of the crown (local coords relative to piston)
    const bowlTorus = createTorus(0.065, 0.018, materials.darkCastIron, [0, 0.08, 0], [Math.PI / 2, 0, 0]);
    // 3 Compression and oil scraper rings properly seated around the piston body
    const ring1 = createTorus(0.127, 0.005, materials.machinedSteel, [0, 0.05, 0], [Math.PI / 2, 0, 0]);
    const ring2 = createTorus(0.127, 0.005, materials.machinedSteel, [0, 0.01, 0], [Math.PI / 2, 0, 0]);
    const ring3 = createTorus(0.127, 0.005, materials.machinedSteel, [0, -0.03, 0], [Math.PI / 2, 0, 0]);
    // Wrist pin (local coords relative to piston)
    const wristPin = createCyl(0.032, 0.032, 0.14, 20, materials.polishedChrome, [0, -0.04, 0], [0, 0, Math.PI / 2]);
    piston.add(bowlTorus, ring1, ring2, ring3, wristPin);

    // Forged H-beam connecting rod with curved small-end and split big-end cap
    const rod = createRoundedBox(0.044, 0.48, 0.034, 0.012, materials.internalSteel, [0, 0.20, zPos]);
    const rodSmallEye = createCyl(0.046, 0.046, 0.040, 20, materials.copperBrass, [0, 0.22, 0], [Math.PI / 2, 0, 0]);
    const rodBigCap = createCyl(0.062, 0.062, 0.052, 24, materials.machinedSteel, [0, -0.22, 0], [Math.PI / 2, 0, 0]);
    rod.add(rodSmallEye, rodBigCap);

    const combustionLight = new THREE.PointLight(0xFF6600, 0, 0.8, 2.2);
    combustionLight.position.set(0, 0.65, zPos);

    pistonsAssemblyGrp.add(piston, rod, combustionLight);
    pistonsData.push({ rod, piston, combustionGlow: combustionLight, cylinderIndex: i, baseY: 0.45 });
  });
  subsystemGroups['internals'].add(pistonsAssemblyGrp);

  // Crankshaft Assembly with Elliptical Curved Counterweights
  const crankAssemblyGrp = registerExplodedPart('Cigüeñal Forjado Contrabalanceado', new THREE.Group(), [0, -1.35, 0], 'Y');
  crankAssemblyGrp.userData.baseTemp = 0.62;
  const crankshaftGroup = new THREE.Group();
  crankshaftGroup.position.set(0, -0.15, 0);

  const crankMain = createCyl(0.072, 0.072, 2.18, 32, materials.internalSteel, [0, 0, 0], [Math.PI / 2, 0, 0]);
  crankshaftGroup.add(crankMain);

  zPositions.forEach((zPos, i) => {
    const angle = crankAngles[i];
    const throwRadius = 0.14;
    const crankPin = createCyl(0.054, 0.054, 0.12, 24, materials.polishedChrome, [
      Math.cos(angle) * throwRadius,
      Math.sin(angle) * throwRadius,
      zPos
    ], [Math.PI / 2, 0, 0]);
    crankshaftGroup.add(crankPin);

    // Elliptical curved counterweight lobes
    const cheek1 = createRoundedBox(0.14, 0.34, 0.05, 0.03, materials.internalSteel, [
      -Math.cos(angle) * 0.12,
      -Math.sin(angle) * 0.12,
      zPos - 0.07
    ], [0, 0, angle]);
    const cheek2 = createRoundedBox(0.14, 0.34, 0.05, 0.03, materials.internalSteel, [
      -Math.cos(angle) * 0.12,
      -Math.sin(angle) * 0.12,
      zPos + 0.07
    ], [0, 0, angle]);
    crankshaftGroup.add(cheek1, cheek2);
  });
  crankAssemblyGrp.add(crankshaftGroup);
  subsystemGroups['internals'].add(crankAssemblyGrp);

  // 7 Main Bearing Caps (curved semicircular saddles)
  const mainCapsGrp = registerExplodedPart('7 Tapas de Bancada Principal', new THREE.Group(), [0, -2.2, 0], 'Y');
  mainCapsGrp.userData.baseTemp = 0.58;
  for (let z = -1.02; z <= 1.02; z += 0.34) {
    const cap = createRoundedBox(0.54, 0.13, 0.08, 0.03, materials.darkCastIron, [0, -0.22, z]);
    const capArch = createCyl(0.08, 0.08, 0.08, 20, materials.internalSteel, [0, -0.16, z], [Math.PI / 2, 0, 0]);
    const boltL = createCyl(0.016, 0.016, 0.18, 12, materials.machinedSteel, [-0.22, -0.22, z]);
    const boltR = createCyl(0.016, 0.016, 0.18, 12, materials.machinedSteel, [0.22, -0.22, z]);
    mainCapsGrp.add(cap, capArch, boltL, boltR);
  }
  subsystemGroups['internals'].add(mainCapsGrp);

  // ==========================================
  // 10. OIL PAN & LUBRICATION (Cárter con Batea Curva y Aletas de Refrigeración)
  // Explodes DOWN -Y
  // ==========================================
  const oilGasketGrp = registerExplodedPart('Junta de Cárter de Aceite', new THREE.Group(), [0, -2.85, 0], 'Y');
  oilGasketGrp.userData.baseTemp = 0.50;
  const oilGasket = createRoundedBox(0.90, 0.024, 2.22, 0.04, materials.copperBrass, [0, -0.3, 0]);
  oilGasketGrp.add(oilGasket);
  subsystemGroups['oil-pan'].add(oilGasketGrp);

  const oilPickupGrp = registerExplodedPart('Bomba de Aceite y Chupador', new THREE.Group(), [0, -3.4, 0.35], 'Y');
  oilPickupGrp.userData.baseTemp = 0.54;
  const pumpBody = createRoundedBox(0.22, 0.22, 0.24, 0.04, materials.darkCastIron, [0, -0.4, 0.2]);
  const pickupTube = createCurvedTube([
    [0, -0.45, 0.2],
    [0.05, -0.65, 0.3],
    [0, -0.78, 0.4]
  ], 0.028, materials.machinedSteel);
  const pickupScreen = createCyl(0.12, 0.12, 0.06, 24, materials.darkCastIron, [0, -0.82, 0.4]);
  oilPickupGrp.add(pumpBody, pickupTube, pickupScreen);
  subsystemGroups['oil-pan'].add(oilPickupGrp);

  // Sculpted Oil Pan with radiused corners and curved sump bowl
  const oilPanGrp = registerExplodedPart('Cárter de Aceite Estructural', new THREE.Group(), [0, -4.2, 0], 'Y');
  oilPanGrp.userData.baseTemp = 0.54;

  const panUpperFlange = createRoundedBox(0.92, 0.08, 2.24, 0.05, materials.catYellow, [0, -0.35, 0]);
  const panFrontShallow = createRoundedBox(0.76, 0.28, 0.94, 0.06, materials.catYellow, [0, -0.52, -0.55]);
  const panRearDeepSump = createRoundedBox(0.78, 0.50, 1.08, 0.08, materials.catYellow, [0, -0.66, 0.45]);
  const sumpCurvedBelly = createCyl(0.38, 0.38, 1.06, 24, materials.catYellow, [0, -0.88, 0.45], [Math.PI / 2, 0, 0]);
  sumpCurvedBelly.scale.set(1.0, 0.3, 1.0);

  const drainPlug = createCyl(0.032, 0.032, 0.04, 6, materials.copperBrass, [0, -0.96, 0.75], [0, 0, 0]);
  const drainWasher = createTorus(0.034, 0.008, materials.copperBrass, [0, -0.95, 0.75], [Math.PI / 2, 0, 0]);

  // Cooling fins along the sump belly
  for (let z = 0.12; z <= 0.82; z += 0.14) {
    const fin = createRoundedBox(0.74, 0.03, 0.024, 0.008, materials.catYellow, [0, -0.95, z]);
    oilPanGrp.add(fin);
  }
  oilPanGrp.add(panUpperFlange, panFrontShallow, panRearDeepSump, sumpCurvedBelly, drainPlug, drainWasher);
  subsystemGroups['oil-pan'].add(oilPanGrp);

  // ==========================================
  // 11. EXHAUST MANIFOLD (Múltiple Seccionado con Runners Curvos de 90°)
  // Explodes LEFT -X by 2.2
  // ==========================================
  const exhaustManifoldGrp = registerExplodedPart('Múltiple de Escape Seccionado', new THREE.Group(), [-2.2, 0.25, 0], 'X');
  exhaustManifoldGrp.userData.baseTemp = 0.88;

  // Main tubular exhaust collector logs
  const exhLog1 = createCyl(0.088, 0.088, 0.94, 24, materials.exhaustSteel, [-0.58, 0.52, -0.45], [Math.PI / 2, 0, 0]);
  const exhLog2 = createCyl(0.088, 0.088, 0.94, 24, materials.exhaustSteel, [-0.58, 0.52, 0.45], [Math.PI / 2, 0, 0]);
  const exhSlipJoint = createCyl(0.104, 0.104, 0.14, 24, materials.exhaustSteel, [-0.58, 0.52, 0], [Math.PI / 2, 0, 0]);
  const exhBandRing = createTorus(0.106, 0.012, materials.machinedSteel, [-0.58, 0.52, 0], [0, 0, 0]);
  exhaustManifoldGrp.add(exhLog1, exhLog2, exhSlipJoint, exhBandRing);

  // 6 curved tubular exhaust runners curving from head ports into the collector
  zPositions.forEach((zPos) => {
    const runner = createCurvedTube([
      [-0.44, 0.52, zPos],
      [-0.50, 0.52, zPos],
      [-0.58, 0.52, zPos]
    ], 0.052, materials.exhaustSteel, 20);
    const flange = createRoundedBox(0.03, 0.14, 0.12, 0.02, materials.exhaustSteel, [-0.43, 0.52, zPos]);
    exhaustManifoldGrp.add(runner, flange);
  });

  // Curved turbine riser throat
  const exhTurboRiser = createCurvedTube([
    [-0.58, 0.52, -0.15],
    [-0.68, 0.58, -0.15],
    [-0.78, 0.65, -0.15]
  ], 0.088, materials.exhaustSteel, 24);
  const riserFlange = createRoundedBox(0.16, 0.16, 0.04, 0.02, materials.exhaustSteel, [-0.79, 0.66, -0.15], [0, 0, 0.4]);
  exhaustManifoldGrp.add(exhTurboRiser, riserFlange);
  subsystemGroups['exhaust-manifold'].add(exhaustManifoldGrp);

  // ==========================================
  // 12. TURBOCHARGER (Caracol Espiral Volumétrico y Tuberías Curvadas)
  // ==========================================
  const compHousingCenter = [-0.95, 0.65, -0.4];

  // Helper: Generates an authentic curved spiral snail volute for turbo
  function createVolumetricTurboVolute(mat: THREE.Material, scale = 1, isColdSide = true): THREE.Group {
    const voluteGrp = new THREE.Group();
    const steps = 18;
    const spiralPoints: [number, number, number][] = [];

    for (let s = 0; s <= steps; s++) {
      const angle = (s / steps) * Math.PI * 1.85;
      const r = (0.12 + 0.14 * (s / steps)) * scale;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = (isColdSide ? -0.06 : 0.06) * (s / steps) * scale;
      spiralPoints.push([x, y, z]);
    }

    const tubeRadius = (isColdSide ? 0.075 : 0.068) * scale;
    const voluteTube = createCurvedTube(spiralPoints, tubeRadius, mat, 20);
    voluteGrp.add(voluteTube);

    // Tangent discharge nozzle
    const lastP = spiralPoints[spiralPoints.length - 1];
    const nozzle = createCyl(tubeRadius * 1.05, tubeRadius * 0.95, 0.22 * scale, 24, mat, [lastP[0] + 0.05, lastP[1] + 0.08, lastP[2]], [0.3, 0, -0.7]);
    voluteGrp.add(nozzle);

    return voluteGrp;
  }

  // 12a. Turbine Housing (Caracol de escape): Explodes to [-3.4, 0.6, 0.4]
  const turboTurbineGrp = registerExplodedPart('Turbina de Escape Turbo', new THREE.Group(), [-3.4, 0.6, 0.4], 'X');
  turboTurbineGrp.userData.baseTemp = 0.96;
  const turbineVolute = createVolumetricTurboVolute(materials.exhaustSteel, 1.05, false);
  turbineVolute.position.set(compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] + 0.38);
  turbineVolute.rotation.set(0, Math.PI, 0);

  const turbineExhaustFlange = createCyl(0.18, 0.18, 0.14, 24, materials.exhaustSteel, [compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] + 0.56], [Math.PI / 2, 0, 0]);
  const turbineVBand = createTorus(0.185, 0.016, materials.machinedSteel, [compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] + 0.50], [0, 0, 0]);
  turboTurbineGrp.add(turbineVolute, turbineExhaustFlange, turbineVBand);
  subsystemGroups['turbocharger'].add(turboTurbineGrp);

  // 12b. CHRA Central Cartridge: Explodes to [-3.5, 0.6, 0.0]
  const turboChraGrp = registerExplodedPart('Cartucho Central CHRA', new THREE.Group(), [-3.5, 0.6, 0.0], 'X');
  turboChraGrp.userData.baseTemp = 0.75;
  const chra = createCyl(0.12, 0.12, 0.22, 24, materials.darkCastIron, [compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] + 0.15], [Math.PI / 2, 0, 0]);
  const oilFeed = createCurvedTube([
    [compHousingCenter[0] + 0.04, compHousingCenter[1] + 0.35, compHousingCenter[2] + 0.15],
    [compHousingCenter[0] + 0.02, compHousingCenter[1] + 0.22, compHousingCenter[2] + 0.15],
    [compHousingCenter[0], compHousingCenter[1] + 0.12, compHousingCenter[2] + 0.15]
  ], 0.018, materials.copperBrass);
  turboChraGrp.add(chra, oilFeed);
  subsystemGroups['turbocharger'].add(turboChraGrp);

  // 12c. Compressor Impeller Wheel (Spinning impeller)
  const turboImpellerGrp = registerExplodedPart('Rueda Compresora (Impeller)', new THREE.Group(), [-3.6, 0.6, -0.4], 'X');
  turboImpellerGrp.userData.baseTemp = 0.40;
  const turboImpellerGroup = new THREE.Group();
  const impHub = createCyl(0.03, 0.09, 0.14, 24, materials.polishedChrome, [compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] - 0.08], [Math.PI / 2, 0, 0]);
  turboImpellerGroup.add(impHub);
  for (let b = 0; b < 10; b++) {
    const angle = (b / 10) * Math.PI * 2;
    const blade = createRoundedBox(0.014, 0.085, 0.065, 0.006, materials.machinedSteel, [
      compHousingCenter[0] + Math.cos(angle) * 0.1,
      compHousingCenter[1] + Math.sin(angle) * 0.1,
      compHousingCenter[2] - 0.08
    ], [0, 0, angle + 0.45]);
    turboImpellerGroup.add(blade);
  }
  turboImpellerGrp.add(turboImpellerGroup);
  subsystemGroups['turbocharger'].add(turboImpellerGrp);

  // 12d. Compressor Scroll Housing (Caracol Espiral Compresor)
  const turboCompGrp = registerExplodedPart('Caracol Compresor de Admisión', new THREE.Group(), [-3.8, 0.6, -0.85], 'X');
  turboCompGrp.userData.baseTemp = 0.32;
  const compVolute = createVolumetricTurboVolute(materials.machinedSteel, 1.15, true);
  compVolute.position.set(compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] - 0.14);

  // Flared velocity stack intake horn with toroidal bellmouth
  const compInletHorn = createCyl(0.18, 0.22, 0.18, 32, materials.machinedSteel, [compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] - 0.36], [Math.PI / 2, 0, 0]);
  const bellmouthLip = createTorus(0.22, 0.016, materials.machinedSteel, [compHousingCenter[0], compHousingCenter[1], compHousingCenter[2] - 0.45], [0, 0, 0]);
  turboCompGrp.add(compVolute, compInletHorn, bellmouthLip);
  subsystemGroups['turbocharger'].add(turboCompGrp);

  // 12e. Wastegate Actuator
  const turboWastegateGrp = registerExplodedPart('Actuador Wastegate', new THREE.Group(), [-4.2, 1.3, 0.2], 'X');
  turboWastegateGrp.userData.baseTemp = 0.80;
  const wastegateCanister = createCyl(0.07, 0.07, 0.16, 24, materials.machinedSteel, [compHousingCenter[0] - 0.22, compHousingCenter[1] + 0.18, compHousingCenter[2] + 0.12], [0, 0, Math.PI / 3]);
  const wastegateDome = createCyl(0.07, 0.01, 0.04, 24, materials.machinedSteel, [compHousingCenter[0] - 0.26, compHousingCenter[1] + 0.22, compHousingCenter[2] + 0.12], [0, 0, Math.PI / 3]);
  const wastegateRod = createCyl(0.009, 0.009, 0.28, 12, materials.polishedChrome, [compHousingCenter[0] - 0.16, compHousingCenter[1] + 0.14, compHousingCenter[2] + 0.26], [0.3, 0, 0.8]);
  turboWastegateGrp.add(wastegateCanister, wastegateDome, wastegateRod);
  subsystemGroups['turbocharger'].add(turboWastegateGrp);

  // 12f. Mandrel-Bent Curved Boost Charge Pipe
  const boostPipeGrp = registerExplodedPart('Tubería de Sobrealimentación (Boost)', new THREE.Group(), [-2.5, 2.3, -0.3], 'Y');
  boostPipeGrp.userData.baseTemp = 0.42;
  const boostPipe = createCurvedTube([
    [-0.92, 0.88, -0.35],
    [-0.85, 1.05, -0.28],
    [-0.68, 1.15, -0.18],
    [-0.52, 1.08, -0.12]
  ], 0.088, materials.machinedSteel, 24);
  const coupler1 = createTorus(0.092, 0.018, materials.darkRubber, [-0.90, 0.90, -0.35], [0.4, 0, -0.6]);
  const coupler2 = createTorus(0.092, 0.018, materials.darkRubber, [-0.54, 1.09, -0.13], [0, 0, -Math.PI / 3]);
  boostPipeGrp.add(boostPipe, coupler1, coupler2);
  subsystemGroups['turbocharger'].add(boostPipeGrp);

  // 12g. Cyclonic Air Cleaner
  const turboAirCleanerGrp = registerExplodedPart('Filtro de Aire Ciclónico', new THREE.Group(), [-4.6, 0.8, -1.6], 'X');
  turboAirCleanerGrp.userData.baseTemp = 0.06;
  const airCleaner = createCyl(0.24, 0.24, 0.50, 32, materials.darkCastIron, [compHousingCenter[0], compHousingCenter[1] + 0.05, compHousingCenter[2] - 0.54], [Math.PI / 2, 0, 0]);
  const airCleanerRib1 = createTorus(0.245, 0.012, materials.machinedSteel, [compHousingCenter[0], compHousingCenter[1] + 0.05, compHousingCenter[2] - 0.40], [0, 0, 0]);
  const airCleanerRib2 = createTorus(0.245, 0.012, materials.machinedSteel, [compHousingCenter[0], compHousingCenter[1] + 0.05, compHousingCenter[2] - 0.65], [0, 0, 0]);
  const airIntakeCap = createCyl(0.19, 0.24, 0.10, 24, materials.darkRubber, [compHousingCenter[0], compHousingCenter[1] + 0.05, compHousingCenter[2] - 0.82], [Math.PI / 2, 0, 0]);
  turboAirCleanerGrp.add(airCleaner, airCleanerRib1, airCleanerRib2, airIntakeCap);
  subsystemGroups['turbocharger'].add(turboAirCleanerGrp);

  // ==========================================
  // 13. INTAKE MANIFOLD & CHARGE AIR S-PIPE (Múltiple de Admisión C15 con Entrada Central y Tubo Negro de Carga)
  // Explodes RIGHT (+X) by 2.2
  // ==========================================
  const intakeManifoldGrp = registerExplodedPart('Múltiple de Admisión de Aluminio', new THREE.Group(), [2.2, 0.75, 0], 'X');
  intakeManifoldGrp.userData.baseTemp = 0.36;
  const intakePlenum = createCyl(0.12, 0.12, 1.95, 24, materials.catYellow, [-0.42, 0.92, 0.05], [Math.PI / 2, 0, 0]);
  const plenumCapF = createCyl(0.12, 0.02, 0.08, 24, materials.catYellow, [-0.42, 0.92, -0.95], [Math.PI / 2, 0, 0]);
  const plenumCapR = createCyl(0.02, 0.12, 0.08, 24, materials.catYellow, [-0.42, 0.92, 1.05], [Math.PI / 2, 0, 0]);

  // Central upward inlet horn with clamped flange (Matches Photo 2)
  const intakeHornElbow = createCurvedTube([
    [-0.42, 0.92, 0.0],
    [-0.52, 0.98, 0.0],
    [-0.56, 1.15, 0.0]
  ], 0.095, materials.catYellow, 20);
  const intakeHornFlange = createTorus(0.10, 0.016, materials.machinedSteel, [-0.56, 1.16, 0.0], [Math.PI / 2, 0, 0]);

  intakeManifoldGrp.add(intakePlenum, plenumCapF, plenumCapR, intakeHornElbow, intakeHornFlange);

  // Large iconic black powder-coated S-curve charge air transfer pipe (Matches Photo 1)
  const sChargePipe = createCurvedTube([
    [-0.56, 1.15, 0.0],
    [-0.58, 1.05, 0.25],
    [-0.54, 0.75, 0.45],
    [-0.52, 0.35, 0.40],
    [-0.52, -0.15, 0.35]
  ], 0.068, materials.darkRubber, 24);

  // Polished stainless band clamps along the black pipe (Matches Photo 1)
  const clamp1 = createTorus(0.072, 0.012, materials.polishedChrome, [-0.56, 0.98, 0.30], [0.3, 0, 0]);
  const clamp2 = createTorus(0.072, 0.012, materials.polishedChrome, [-0.52, 0.15, 0.37], [0, 0, 0]);
  intakeManifoldGrp.add(sChargePipe, clamp1, clamp2);

  zPositions.forEach((zPos) => {
    const runner = createCurvedTube([
      [-0.42, 0.92, zPos],
      [-0.36, 0.91, zPos],
      [-0.30, 0.90, zPos]
    ], 0.048, materials.catYellow, 16);
    intakeManifoldGrp.add(runner);
  });
  const mapSensor = createRoundedBox(0.06, 0.06, 0.08, 0.015, materials.darkRubber, [-0.48, 1.05, -0.3]);
  intakeManifoldGrp.add(mapSensor);
  subsystemGroups['intake-manifold'].add(intakeManifoldGrp);

  // ==========================================
  // 14. FUEL FILTRATION & COOLERS (Filtros Dobles CAT 1R-0749 y Enfriador)
  // ==========================================
  const filterBracketGrp = registerExplodedPart('Soporte de Filtros y Bomba Manual', new THREE.Group(), [2.6, -0.15, 0.35], 'X');
  filterBracketGrp.userData.baseTemp = 0.22;
  const filterBracket = createRoundedBox(0.26, 0.18, 0.58, 0.04, materials.darkCastIron, [0.55, -0.22, 0.35]);
  const primePump = createCyl(0.038, 0.038, 0.10, 20, materials.darkRubber, [0.62, -0.11, 0.15]);
  const primeKnob = createCyl(0.045, 0.045, 0.025, 20, materials.catYellow, [0.62, -0.05, 0.15]);
  filterBracketGrp.add(filterBracket, primePump, primeKnob);
  subsystemGroups['fuel-filtration'].add(filterBracketGrp);

  // Primary Fuel Filter CAT 1R-0749 (Yellow canister with CAT branding accent)
  const filter1Grp = registerExplodedPart('Filtro de Combustible Primario CAT 1R-0749', new THREE.Group(), [3.2, -1.2, 0.15], 'Y');
  filter1Grp.userData.baseTemp = 0.15;
  const filter1 = createCyl(0.115, 0.115, 0.44, 32, materials.catYellow, [0.62, -0.48, 0.2]);
  const filter1Dome = createCyl(0.115, 0.04, 0.06, 32, materials.catYellow, [0.62, -0.72, 0.2]);
  const filter1Cap = createCyl(0.12, 0.12, 0.06, 32, materials.darkCastIron, [0.62, -0.25, 0.2]);
  const filter1Drain = createCyl(0.025, 0.025, 0.05, 16, materials.darkRubber, [0.62, -0.77, 0.2]);
  filter1Grp.add(filter1, filter1Dome, filter1Cap, filter1Drain);
  subsystemGroups['fuel-filtration'].add(filter1Grp);

  // Secondary Fuel Filter CAT 1R-0749
  const filter2Grp = registerExplodedPart('Filtro Secundario CAT 1R-0749', new THREE.Group(), [3.2, -1.2, 0.6], 'Y');
  filter2Grp.userData.baseTemp = 0.16;
  const filter2 = createCyl(0.115, 0.115, 0.44, 32, materials.catYellow, [0.62, -0.48, 0.48]);
  const filter2Dome = createCyl(0.115, 0.04, 0.06, 32, materials.catYellow, [0.62, -0.72, 0.48]);
  const filter2Cap = createCyl(0.12, 0.12, 0.06, 32, materials.darkCastIron, [0.62, -0.25, 0.48]);
  const filter2Drain = createCyl(0.025, 0.025, 0.05, 16, materials.darkRubber, [0.62, -0.77, 0.48]);
  filter2Grp.add(filter2, filter2Dome, filter2Cap, filter2Drain);
  subsystemGroups['fuel-filtration'].add(filter2Grp);

  // Oil Cooler Exchanger Tube (Tubular exchanger with rounded end bells)
  const oilCoolerGrp = registerExplodedPart('Enfriador de Aceite Tubular', new THREE.Group(), [2.7, -0.2, -0.3], 'X');
  oilCoolerGrp.userData.baseTemp = 0.58;
  const oilCoolerTube = createCyl(0.092, 0.092, 1.28, 24, materials.catYellow, [0.52, -0.18, -0.2], [Math.PI / 2, 0, 0]);
  const oilCoolerEndCapF = createCyl(0.11, 0.06, 0.10, 24, materials.catYellow, [0.52, -0.18, -0.85], [Math.PI / 2, 0, 0]);
  const oilCoolerEndCapR = createCyl(0.06, 0.11, 0.10, 24, materials.catYellow, [0.52, -0.18, 0.45], [Math.PI / 2, 0, 0]);
  oilCoolerGrp.add(oilCoolerTube, oilCoolerEndCapF, oilCoolerEndCapR);
  subsystemGroups['fuel-filtration'].add(oilCoolerGrp);

  // Coolant bypass tube (curved tube with rubber connector elbows)
  const coolantBypassGrp = registerExplodedPart('Tubería de Bypass de Refrigerante', new THREE.Group(), [2.2, 0.45, -0.3], 'X');
  coolantBypassGrp.userData.baseTemp = 0.38;
  const coolantBypassPipe = createCurvedTube([
    [0.52, 0.12, 0.42],
    [0.52, 0.06, 0.10],
    [0.52, 0.05, -0.40],
    [0.42, 0.08, -0.80]
  ], 0.046, materials.catYellow, 20);
  coolantBypassGrp.add(coolantBypassPipe);
  subsystemGroups['fuel-filtration'].add(coolantBypassGrp);

  // ==========================================
  // 15. FRONT ACCESSORY DRIVE & AERODYNAMIC FAN (Poleas Mecanizadas y Aspas Curvadas)
  // Explodes FORWARD (-Z)
  // ==========================================
  const timingCoverGrp = registerExplodedPart('Tapa Frontal de Distribución', new THREE.Group(), [0, 0.18, -1.8], 'Z');
  timingCoverGrp.userData.baseTemp = 0.30;
  const frontTimingCover = createRoundedBox(0.90, 0.98, 0.18, 0.06, materials.catYellow, [0, 0.18, -1.2]);
  timingCoverGrp.add(frontTimingCover);
  subsystemGroups['cooling-fan-drive'].add(timingCoverGrp);

  // Timing gears with concentric teeth rims
  const timingGearsGrp = registerExplodedPart('Engranajes de Distribución', new THREE.Group(), [0, 0.18, -2.5], 'Z');
  timingGearsGrp.userData.baseTemp = 0.45;
  const camGear = createCyl(0.24, 0.24, 0.06, 40, materials.machinedSteel, [0, 0.55, -1.25], [Math.PI / 2, 0, 0]);
  const camGearRing = createTorus(0.24, 0.012, materials.darkCastIron, [0, 0.55, -1.25], [0, 0, 0]);
  const idlerGear = createCyl(0.18, 0.18, 0.06, 32, materials.machinedSteel, [0.22, 0.18, -1.25], [Math.PI / 2, 0, 0]);
  const crankGear = createCyl(0.14, 0.14, 0.06, 28, materials.machinedSteel, [0, -0.22, -1.25], [Math.PI / 2, 0, 0]);
  timingGearsGrp.add(camGear, camGearRing, idlerGear, crankGear);
  subsystemGroups['cooling-fan-drive'].add(timingGearsGrp);

  // Harmonic Damper Pulley with V-grooves
  const crankDamperGrp = registerExplodedPart('Polea Damper Amortiguadora', new THREE.Group(), [0, -0.22, -3.2], 'Z');
  crankDamperGrp.userData.baseTemp = 0.28;
  const crankDamperPulley = createCyl(0.26, 0.26, 0.14, 36, materials.darkCastIron, [0, -0.22, -1.35], [Math.PI / 2, 0, 0]);
  const damperGroove1 = createTorus(0.262, 0.012, materials.darkRubber, [0, -0.22, -1.32], [0, 0, 0]);
  const damperGroove2 = createTorus(0.262, 0.012, materials.darkRubber, [0, -0.22, -1.38], [0, 0, 0]);
  const crankBolt = createCyl(0.055, 0.055, 0.06, 6, materials.machinedSteel, [0, -0.22, -1.43], [Math.PI / 2, 0, 0]);
  crankDamperGrp.add(crankDamperPulley, damperGroove1, damperGroove2, crankBolt);
  subsystemGroups['cooling-fan-drive'].add(crankDamperGrp);

  // Centrifugal Water Pump with curved volute housing
  const waterPumpGrp = registerExplodedPart('Bomba de Agua Centrífuga', new THREE.Group(), [0.95, 0.15, -2.8], 'Z');
  waterPumpGrp.userData.baseTemp = 0.40;
  const waterPumpHousing = createRoundedBox(0.34, 0.34, 0.22, 0.05, materials.catYellow, [0.28, 0.15, -1.25]);
  const waterPumpVolute = createTorus(0.12, 0.045, materials.catYellow, [0.28, 0.15, -1.30], [0, 0, 0]);
  const waterPumpPulley = createCyl(0.15, 0.15, 0.10, 28, materials.darkCastIron, [0.28, 0.15, -1.38], [Math.PI / 2, 0, 0]);
  waterPumpGrp.add(waterPumpHousing, waterPumpVolute, waterPumpPulley);
  subsystemGroups['cooling-fan-drive'].add(waterPumpGrp);

  // 24V Heavy Duty Alternator with ventilated cylindrical casing
  const altGrp = registerExplodedPart('Alternador de 24V', new THREE.Group(), [1.25, 0.75, -2.8], 'Z');
  altGrp.userData.baseTemp = 0.32;
  const alternatorBody = createCyl(0.15, 0.15, 0.26, 28, materials.machinedSteel, [0.42, 0.58, -1.15], [Math.PI / 2, 0, 0]);
  const altFrontBezel = createCyl(0.16, 0.16, 0.04, 28, materials.darkCastIron, [0.42, 0.58, -1.27], [Math.PI / 2, 0, 0]);
  const altPulley = createCyl(0.095, 0.095, 0.08, 24, materials.darkCastIron, [0.42, 0.58, -1.33], [Math.PI / 2, 0, 0]);
  altGrp.add(alternatorBody, altFrontBezel, altPulley);
  subsystemGroups['cooling-fan-drive'].add(altGrp);

  // Poly-V Belt (smooth tangent loop)
  const beltGrp = registerExplodedPart('Correa Trapezoidal Poly-V', new THREE.Group(), [0.2, 0.2, -3.7], 'Z');
  beltGrp.userData.baseTemp = 0.34;
  const beltLoop = createCurvedTube([
    [0.42, 0.58, -1.35],
    [0.35, 0.36, -1.35],
    [0.28, 0.15, -1.35],
    [0.14, -0.04, -1.35],
    [0.0, -0.22, -1.35],
    [-0.18, 0.18, -1.35],
    [0.0, 0.38, -1.35],
    [0.42, 0.58, -1.35]
  ], 0.022, materials.darkRubber, 12);
  beltGrp.add(beltLoop);
  subsystemGroups['cooling-fan-drive'].add(beltGrp);

  // 8-Blade Cooling Fan with Aerodynamic Curved Airfoil Blades
  const fanAssemblyGrp = registerExplodedPart('Ventilador Soplador de 8 Aspas', new THREE.Group(), [0, 0.25, -4.5], 'Z');
  fanAssemblyGrp.userData.baseTemp = 0.20;
  const fanGroup = new THREE.Group();
  fanGroup.position.set(0, 0.25, -1.48);

  const fanHub = createCyl(0.17, 0.17, 0.09, 32, materials.darkCastIron, [0, 0, 0], [Math.PI / 2, 0, 0]);
  const fanHubFins = createTorus(0.175, 0.015, materials.machinedSteel, [0, 0, 0], [0, 0, 0]);
  fanGroup.add(fanHub, fanHubFins);

  // Aerodynamic curved airfoil fan blades with camber and pitch angle
  for (let f = 0; f < 8; f++) {
    const angle = (f / 8) * Math.PI * 2;
    const bladeGroup = new THREE.Group();
    bladeGroup.rotation.z = angle;

    // Curved airfoil profile
    const bladeMesh = createRoundedBox(0.12, 0.44, 0.022, 0.008, materials.darkRubber, [0, 0.34, 0]);
    bladeMesh.rotation.y = 0.42; // Pitch / angle of attack (camber)
    bladeMesh.rotation.z = 0.08;

    bladeGroup.add(bladeMesh);
    fanGroup.add(bladeGroup);
  }
  fanAssemblyGrp.add(fanGroup);
  subsystemGroups['cooling-fan-drive'].add(fanAssemblyGrp);

  // ==========================================
  // 16. FLYWHEEL & BELL HOUSING (Campana Cónica SAE #1 y Volante Rectificado)
  // Explodes REARWARD (+Z)
  // ==========================================
  const bellHousingGrp = registerExplodedPart('Campana de Volante SAE #1', new THREE.Group(), [0, 0.05, 2.2], 'Z');
  bellHousingGrp.userData.baseTemp = 0.28;

  // Flared conical bell transition
  const bellHousingCone = createCyl(0.67, 0.62, 0.28, 48, materials.catYellow, [0, 0.05, 1.25], [Math.PI / 2, 0, 0]);
  const bellHousingRim = createCyl(0.70, 0.70, 0.08, 48, materials.catYellow, [0, 0.05, 1.36], [Math.PI / 2, 0, 0]);
  const bellHousingBackplate = createRoundedBox(1.18, 1.12, 0.08, 0.08, materials.catYellow, [0, 0.02, 1.18]);
  bellHousingGrp.add(bellHousingCone, bellHousingRim, bellHousingBackplate);

  for (let b = 0; b < 16; b++) {
    const angle = (b / 16) * Math.PI * 2;
    const bolt = createCyl(0.015, 0.015, 0.04, 12, materials.machinedSteel, [
      Math.cos(angle) * 0.63,
      0.05 + Math.sin(angle) * 0.63,
      1.38
    ], [Math.PI / 2, 0, 0]);
    bellHousingGrp.add(bolt);
  }

  // Heavy 24V Starter Motor Assembly mounted to lower side of bellhousing
  const starterBody = createCyl(0.12, 0.12, 0.44, 24, materials.darkCastIron, [0.46, -0.22, 1.05], [Math.PI / 2, 0, 0]);
  const starterNose = createCyl(0.09, 0.12, 0.14, 24, materials.catYellow, [0.46, -0.22, 1.28], [Math.PI / 2, 0, 0]);
  const starterSolenoid = createCyl(0.065, 0.065, 0.28, 20, materials.darkCastIron, [0.46, -0.09, 1.02], [Math.PI / 2, 0, 0]);
  const starterTerminals = createCyl(0.018, 0.018, 0.04, 12, materials.copperBrass, [0.46, -0.09, 0.86], [Math.PI / 2, 0, 0]);
  bellHousingGrp.add(starterBody, starterNose, starterSolenoid, starterTerminals);

  subsystemGroups['flywheel'].add(bellHousingGrp);

  // Starter ring gear with precision beveled gear teeth
  const ringGearGrp = registerExplodedPart('Corona Dentada de Arranque', new THREE.Group(), [0, 0.05, 3.2], 'Z');
  ringGearGrp.userData.baseTemp = 0.26;
  const ringGear = createCyl(0.56, 0.56, 0.045, 64, materials.darkCastIron, [0, 0.05, 1.32], [Math.PI / 2, 0, 0]);
  const ringBevel = createTorus(0.56, 0.014, materials.machinedSteel, [0, 0.05, 1.32], [0, 0, 0]);
  ringGearGrp.add(ringGear, ringBevel);
  subsystemGroups['flywheel'].add(ringGearGrp);

  // Rotating Flywheel Disc with recessed clutch face (Matches Photo 1)
  const flywheelSubGroup = registerExplodedPart('Disco Volante de Inercia', new THREE.Group(), [0, 0.05, 4.0], 'Z');
  flywheelSubGroup.userData.baseTemp = 0.26;
  const flywheelDisc = createCyl(0.53, 0.53, 0.09, 48, materials.machinedSteel, [0, 0.05, 1.35], [Math.PI / 2, 0, 0]);
  const flywheelRecess = createCyl(0.42, 0.42, 0.04, 40, materials.darkCastIron, [0, 0.05, 1.38], [Math.PI / 2, 0, 0]);
  const crankHubCenter = createCyl(0.14, 0.14, 0.08, 24, materials.machinedSteel, [0, 0.05, 1.39], [Math.PI / 2, 0, 0]);
  const pilotBore = createCyl(0.045, 0.045, 0.06, 20, materials.darkCastIron, [0, 0.05, 1.41], [Math.PI / 2, 0, 0]);
  flywheelSubGroup.add(flywheelDisc, flywheelRecess, crankHubCenter, pilotBore);

  // 12 Chrome Hex Hub Bolts in circular pattern (Matches Photo 1)
  for (let c = 0; c < 12; c++) {
    const angle = (c / 12) * Math.PI * 2;
    const cBolt = createCyl(0.016, 0.016, 0.035, 12, materials.polishedChrome, [
      Math.cos(angle) * 0.095,
      0.05 + Math.sin(angle) * 0.095,
      1.42
    ], [Math.PI / 2, 0, 0]);
    flywheelSubGroup.add(cBolt);
  }
  subsystemGroups['flywheel'].add(flywheelSubGroup);

  // ==========================================
  // 17. ECM ADEM A4 MODULE
  // ==========================================
  const ecmGrp = registerExplodedPart('Módulo de Control Electrónico ADEM A4', new THREE.Group(), [-2.5, -0.1, 0.85], 'X');
  ecmGrp.userData.baseTemp = 0.22;
  const ecmBox = createRoundedBox(0.12, 0.40, 0.48, 0.03, materials.machinedSteel, [-0.52, -0.05, 0.45]);
  const ecmPlate = createRoundedBox(0.02, 0.36, 0.44, 0.02, materials.darkCastIron, [-0.58, -0.05, 0.45]);
  const ecmPlug1 = createRoundedBox(0.08, 0.12, 0.14, 0.015, materials.darkRubber, [-0.5, 0.06, 0.35]);
  const ecmPlug2 = createRoundedBox(0.08, 0.12, 0.14, 0.015, materials.darkRubber, [-0.5, -0.11, 0.35]);
  ecmGrp.add(ecmBox, ecmPlate, ecmPlug1, ecmPlug2);
  subsystemGroups['ecm-module'].add(ecmGrp);

  // Add all subsystem groups to rootGroup
  Object.values(subsystemGroups).forEach((grp) => rootGroup.add(grp));

  const guideLinesGroup = new THREE.Group();
  guideLinesGroup.name = 'EXPLODED_GUIDE_LINES';
  rootGroup.add(guideLinesGroup);

  // Smooth materials updates for Reference Gray, Blueprint, and Dynamic Thermal
  function updateMaterials(
    mode: EngineMaterialMode,
    egt: number,
    load: number,
    isTransparent: boolean = false,
    transparencyOpacity: number = 0.28
  ) {
    const isThermal = mode === 'thermal';
    const isBlueprint = mode === 'blueprint';
    
    // Dynamic Heat Multiplier (0.0 cold/rest -> 0.22 idle -> 0.65 medium -> 1.0 max stress)
    const thermalEgtFactor = Math.max(0.0, Math.min(1.0, (egt - 24) / 660));
    const thermalLoadFactor = Math.max(0.0, Math.min(1.0, load / 100));
    const heatMultiplier = Math.max(0.0, Math.min(1.0, thermalEgtFactor * 0.70 + thermalLoadFactor * 0.30));

    if (isThermal) {
      rootGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!mesh.userData.origMaterial) {
            mesh.userData.origMaterial = mesh.material;
          }

          if (!mesh.userData.thermalMaterial) {
            let temp = 0.5;
            let curr: THREE.Object3D | null = mesh;
            while (curr && curr !== rootGroup) {
              if (curr.userData && curr.userData.baseTemp !== undefined) {
                temp = curr.userData.baseTemp;
                break;
              }
              curr = curr.parent;
            }
            mesh.userData.thermalMaterial = createThermalShaderMaterial(temp);
          }

          const mat = mesh.userData.thermalMaterial as THREE.ShaderMaterial;
          mat.uniforms.uHeatFactor.value = heatMultiplier;
          mesh.material = mat;
        }
      });
      return;
    }

    if (isBlueprint) {
      rootGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (!mesh.userData.origMaterial) {
            mesh.userData.origMaterial = mesh.material;
          }

          if (!mesh.userData.blueprintMaterial) {
            mesh.userData.blueprintMaterial = createBlueprintShaderMaterial();
          }

          mesh.material = mesh.userData.blueprintMaterial as THREE.ShaderMaterial;
        }
      });
      return;
    }

    // Restore original physical materials
    rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.origMaterial) {
          mesh.material = mesh.userData.origMaterial;
        }
      }
    });

    // Default and Reference-Gray Industrial Cast Metal finish
    materials.catYellow.color.setHex(0x787F88);
    materials.catYellow.roughness = 0.52;
    materials.catYellow.metalness = 0.32;
    materials.darkCastIron.color.setHex(0x22252A);
    materials.exhaustSteel.color.setHex(0x4C433C);
    materials.machinedSteel.color.setHex(0xC8CFD8);
    materials.whiteFilter.color.setHex(0x787F88);

    // Transparency settings for outer casing vs high-contrast opaque internals
    if (isTransparent) {
      const outerOpacity = Math.max(0.10, Math.min(0.45, transparencyOpacity));

      // Outer layers: translucent glass/acrylic look with depthWrite false
      materials.catYellow.transparent = true;
      materials.catYellow.opacity = outerOpacity;
      materials.catYellow.depthWrite = false;
      materials.catYellow.roughness = 0.15;
      materials.catYellow.metalness = 0.1;

      materials.darkCastIron.transparent = true;
      materials.darkCastIron.opacity = Math.min(0.28, outerOpacity + 0.05);
      materials.darkCastIron.depthWrite = false;
      materials.darkCastIron.roughness = 0.2;

      materials.castGray.transparent = true;
      materials.castGray.opacity = outerOpacity;
      materials.castGray.depthWrite = false;
      materials.castGray.roughness = 0.15;

      materials.exhaustSteel.transparent = true;
      materials.exhaustSteel.opacity = Math.min(0.30, outerOpacity + 0.06);
      materials.exhaustSteel.depthWrite = false;

      materials.machinedSteel.transparent = true;
      materials.machinedSteel.opacity = Math.min(0.35, outerOpacity + 0.08);
      materials.machinedSteel.depthWrite = false;

      materials.whiteFilter.transparent = true;
      materials.whiteFilter.opacity = outerOpacity;
      materials.whiteFilter.depthWrite = false;

      // Internal moving core: 100% Opaque, High-Specularity, Razor-Sharp Clarity
      materials.internalSteel.transparent = false;
      materials.internalSteel.opacity = 1.0;
      materials.internalSteel.depthWrite = true;
      materials.internalSteel.roughness = 0.18;
      materials.internalSteel.metalness = 0.95;
      materials.internalSteel.color.setHex(0xE2E8F0);

      materials.polishedChrome.transparent = false;
      materials.polishedChrome.opacity = 1.0;
      materials.polishedChrome.depthWrite = true;
      materials.polishedChrome.roughness = 0.08;
      materials.polishedChrome.metalness = 0.98;
      materials.polishedChrome.color.setHex(0xFFFFFF);

      materials.pistonGold.transparent = false;
      materials.pistonGold.opacity = 1.0;
      materials.pistonGold.depthWrite = true;
      materials.pistonGold.roughness = 0.20;
      materials.pistonGold.metalness = 0.88;
      materials.pistonGold.color.setHex(0xF59E0B);
    } else {
      materials.catYellow.transparent = false;
      materials.catYellow.opacity = 1.0;
      materials.catYellow.depthWrite = true;

      materials.darkCastIron.transparent = false;
      materials.darkCastIron.opacity = 1.0;
      materials.darkCastIron.depthWrite = true;

      materials.castGray.transparent = false;
      materials.castGray.opacity = 1.0;
      materials.castGray.depthWrite = true;

      materials.exhaustSteel.transparent = false;
      materials.exhaustSteel.opacity = 1.0;
      materials.exhaustSteel.depthWrite = true;

      materials.machinedSteel.transparent = false;
      materials.machinedSteel.opacity = 1.0;
      materials.machinedSteel.depthWrite = true;

      materials.whiteFilter.transparent = false;
      materials.whiteFilter.opacity = 1.0;
      materials.whiteFilter.depthWrite = true;

      materials.internalSteel.transparent = false;
      materials.internalSteel.opacity = 1.0;
      materials.internalSteel.depthWrite = true;

      materials.pistonGold.transparent = false;
      materials.pistonGold.opacity = 1.0;
      materials.pistonGold.depthWrite = true;
    }

    // Dynamic Turbo & Exhaust Manifold Thermal Incandescence under Load
    if (mode === 'reference-gray') {
      const exMat = materials.exhaustSteel as THREE.MeshStandardMaterial;
      if (egt > 420 && load > 30) {
        const glowFactor = Math.min(1.0, ((egt - 420) / 230) * (load / 100));
        exMat.emissive.setHex(0xFF3B00);
        exMat.emissiveIntensity = glowFactor * 0.9;
      } else {
        exMat.emissive.setHex(0x000000);
        exMat.emissiveIntensity = 0;
      }
    }
  }

  // ==========================================
  // EXHAUST SMOKE PARTICLE SYSTEM
  // ==========================================
  function createSmokeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(190, 195, 200, 0.7)');
    grad.addColorStop(0.3, 'rgba(140, 145, 150, 0.4)');
    grad.addColorStop(0.7, 'rgba(90, 95, 100, 0.15)');
    grad.addColorStop(1, 'rgba(50, 55, 60, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  const smokeTexture = createSmokeTexture();
  const smokeParticlesGroup = new THREE.Group();
  smokeParticlesGroup.position.set(compHousingCenter[0], compHousingCenter[1] + 0.05, compHousingCenter[2] + 0.62);
  turboTurbineGrp.add(smokeParticlesGroup);

  const SMOKE_COUNT = 24;
  const smokeParticles: {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    active: boolean;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    maxLife: number;
    size: number;
    baseOpacity: number;
    rotSpeed: number;
  }[] = [];

  const smokeGeo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < SMOKE_COUNT; i++) {
    const pMat = new THREE.MeshBasicMaterial({
      map: smokeTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });
    const pMesh = new THREE.Mesh(smokeGeo, pMat);
    pMesh.visible = false;
    smokeParticlesGroup.add(pMesh);
    smokeParticles.push({
      mesh: pMesh,
      mat: pMat,
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 1.5,
      size: 0.2,
      baseOpacity: 0.25,
      rotSpeed: (Math.random() - 0.5) * 1.5
    });
  }

  let smokeSpawnTimer = 0;
  let crankRotation = 0;

  function updateAnimation(
    rpm: number,
    delta: number,
    isRunning: boolean,
    explodeAmount: number,
    load: number = 75,
    egt: number = 350
  ) {
    subsystemGroups['internals'].visible = true;

    // Smooth kinematic exploded view interpolation
    for (let i = 0; i < explodedParts.length; i++) {
      const part = explodedParts[i];
      part.group.position.set(
        part.basePos.x + part.explodeOffset.x * explodeAmount,
        part.basePos.y + part.explodeOffset.y * explodeAmount,
        part.basePos.z + part.explodeOffset.z * explodeAmount
      );
    }

    // Update Exhaust Smoke Particles (at maximum operation)
    const isMaxOperation = isRunning && ((rpm >= 1800) || (rpm >= 1400 && load >= 75) || (load >= 90));
    if (isMaxOperation) {
      smokeSpawnTimer += delta;
      const spawnInterval = 0.12;
      if (smokeSpawnTimer >= spawnInterval) {
        smokeSpawnTimer = 0;
        // Spawn an inactive particle
        const p = smokeParticles.find((part) => !part.active);
        if (p) {
          p.active = true;
          p.life = 0;
          p.maxLife = 1.2 + Math.random() * 0.6;
          p.x = (Math.random() - 0.5) * 0.04;
          p.y = (Math.random() - 0.5) * 0.04;
          p.z = 0;
          p.vx = -0.12 + (Math.random() - 0.5) * 0.08;
          p.vy = 0.35 + Math.random() * 0.25;
          p.vz = 0.28 + (Math.random() - 0.5) * 0.12;
          p.size = 0.15 + Math.random() * 0.08;
          p.baseOpacity = 0.18 + (load / 100) * 0.12; // subtle smoke ("poco")
          p.mesh.visible = true;
        }
      }
    }

    // Step active smoke particles
    smokeParticles.forEach((p) => {
      if (!p.active) return;
      p.life += delta;
      const progress = p.life / p.maxLife;
      if (progress >= 1.0) {
        p.active = false;
        p.mesh.visible = false;
        p.mat.opacity = 0;
      } else {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.mesh.position.set(p.x, p.y, p.z);
        const scale = p.size * (1.0 + progress * 2.8);
        p.mesh.scale.set(scale, scale, 1);
        p.mesh.rotation.z += p.rotSpeed * delta;
        const alpha = progress < 0.2 ? (progress / 0.2) : (1.0 - (progress - 0.2) / 0.8);
        p.mat.opacity = p.baseOpacity * Math.max(0, alpha);
      }
    });

    if (!isRunning || rpm <= 0) {
      rootGroup.position.set(0, 0, 0);
      rootGroup.rotation.set(0, 0, 0);
      pistonsData.forEach(({ rod, piston, combustionGlow, baseY }) => {
        piston.position.y = baseY;
        rod.position.y = baseY - 0.25;
        rod.position.x = 0;
        rod.rotation.z = 0;
        combustionGlow.intensity = 0;
      });
      return;
    }

    // Visual animation speed scaling:
    // Carefully mapped so idle (600 RPM) is a clear, rhythmic 1.2 rev/s,
    // and full throttle (2200 RPM) is a rapid, intense 6.5 rev/s without stroboscopic aliasing.
    const normalizedRpm = Math.max(0, (rpm - 600) / 1600); // 0.0 at 600rpm, 1.0 at 2200rpm
    const visualRevsPerSec = 1.2 + normalizedRpm * 5.3;
    const radDelta = visualRevsPerSec * Math.PI * 2 * delta;
    crankRotation = (crankRotation + radDelta) % (Math.PI * 2);

    const loadFactor = Math.max(0.0, Math.min(1.0, load / 100)); // 0.0 to 1.0

    // 1. Dynamic Torque Reaction Twist:
    // When load/weight is high, the engine torques and tilts on its mounts (up to ~2.5 degrees)
    const targetTorqueTwist = -loadFactor * 0.042; // negative roll around longitudinal axis
    
    // 2. Heavy Diesel 6-Cylinder Kinetic Block Vibration:
    // Firing order: 1-5-3-6-2-4 creates 3 power strokes per revolution (6th order harmonics)
    const powerStrokeHarmonic = crankRotation * 3.0;
    // Vibration amplitude scales with RPM and significantly with Weight/Load
    const baseVibAmp = 0.003 + (normalizedRpm * 0.006);
    const loadVibAmp = baseVibAmp * (0.5 + loadFactor * 1.8);
    
    const vibX = Math.sin(powerStrokeHarmonic) * loadVibAmp * 0.65;
    const vibY = Math.cos(powerStrokeHarmonic * 2.0) * loadVibAmp * 0.55;
    const vibRotZ = targetTorqueTwist + Math.sin(powerStrokeHarmonic) * (loadVibAmp * 0.4);

    rootGroup.position.x = vibX;
    rootGroup.position.y = vibY;
    rootGroup.rotation.z = vibRotZ;

    // 3. Pulleys, Fan and Flywheel Movement
    fanGroup.rotation.z += radDelta * 1.35;
    flywheelSubGroup.rotation.z -= radDelta;

    // 4. Turbo Impeller Speed accelerates dramatically with Load / Weight (Boost pressure)
    const turboBoostMultiplier = 3.5 + (loadFactor * 8.0) + (normalizedRpm * 4.0);
    turboImpellerGroup.rotation.z += radDelta * turboBoostMultiplier;
    crankshaftGroup.rotation.z = crankRotation;

    const stroke = 0.28;
    const rodLength = 0.52;

    // 5. Piston Reciprocation and Combustion Flare Dynamics
    pistonsData.forEach(({ rod, piston, combustionGlow, cylinderIndex, baseY }) => {
      const crankAngleOffset = crankAngles[cylinderIndex];
      const theta = crankRotation + crankAngleOffset;
      const crankY = Math.sin(theta) * (stroke / 2);
      const crankX = Math.cos(theta) * (stroke / 2);

      const pistonY = baseY + crankY;
      piston.position.y = pistonY;

      rod.position.y = pistonY - 0.25 + crankY / 2;
      rod.position.x = crankX / 2;
      rod.rotation.z = -Math.asin(crankX / rodLength);

      // Top Dead Center (TDC) Power Stroke Ignition Flash
      const isNearTdc = Math.sin(theta) > 0.85;
      if (isNearTdc && Math.sin((crankRotation * 0.5) + (cylinderIndex * 1.047)) > 0) {
        // Combustion flash scales from soft at idle to blazing under 100% load
        const pulseIntensity = 0.6 + (loadFactor * 2.8) + (normalizedRpm * 1.2);
        combustionGlow.intensity = pulseIntensity;
      } else {
        combustionGlow.intensity = THREE.MathUtils.lerp(combustionGlow.intensity, 0, delta * (14 + normalizedRpm * 12));
      }
    });
  }

  return {
    rootGroup,
    fanGroup,
    flywheelGroup: flywheelSubGroup,
    crankshaftGroup,
    pistons: pistonsData,
    turboImpellerGroup,
    subsystemGroups,
    materials,
    guideLinesGroup,
    updateMaterials,
    updateAnimation
  };
}
