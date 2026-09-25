import * as THREE from 'three';
import { DroneMaterialMode } from '../../types/drone';
import { createBlueprintShaderMaterial } from './BlueprintShaderMaterial';
import { createThermalShaderMaterial } from './ThermalShaderMaterial';

export interface Drone3DParts {
  rootGroup: THREE.Group;
  topShellGroup: THREE.Group;
  bottomShellGroup: THREE.Group;
  batteryGroup: THREE.Group;
  gimbalGroup: THREE.Group;
  gimbalCamera: THREE.Group;
  mainboardGroup: THREE.Group;
  armsGroup: THREE.Group;
  propellers: THREE.Group[];
  leds: THREE.Mesh[];
  gimbalPitchGroup: THREE.Group;
  applyMaterialMode: (mode: DroneMaterialMode) => void;
  updateExplode: (percent: number) => void;
  updatePropellerRotation: (deltaAngle: number) => void;
  updateGimbalTilt: (tiltRad: number) => void;
}

export function createDJIMavicMiniModel(): Drone3DParts {
  const rootGroup = new THREE.Group();
  rootGroup.scale.set(3.2, 3.2, 3.2); // Scale up for ideal viewport presentation
  rootGroup.position.set(0, 0, 0);

  // Groups for exploded view
  const topShellGroup = new THREE.Group();
  const bottomShellGroup = new THREE.Group();
  const batteryGroup = new THREE.Group();
  const gimbalGroup = new THREE.Group();
  const gimbalCamera = new THREE.Group();
  const gimbalPitchGroup = new THREE.Group();
  const mainboardGroup = new THREE.Group();
  const armsGroup = new THREE.Group();
  const propellers: THREE.Group[] = [];
  const leds: THREE.Mesh[] = [];

  // Material Palette (Realistic DJI Mavic Mini)
  const baseMaterials = {
    djiWhiteShell: new THREE.MeshStandardMaterial({
      color: 0xE6E8EB,
      roughness: 0.38,
      metalness: 0.08
    }),
    darkComposite: new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.5,
      metalness: 0.2
    }),
    carbonArm: new THREE.MeshStandardMaterial({
      color: 0x2A2D32,
      roughness: 0.45,
      metalness: 0.3
    }),
    motorBellSilver: new THREE.MeshStandardMaterial({
      color: 0xD4D8DE,
      roughness: 0.25,
      metalness: 0.85
    }),
    motorCoilCopper: new THREE.MeshStandardMaterial({
      color: 0xB85D19,
      roughness: 0.3,
      metalness: 0.8
    }),
    propellerGray: new THREE.MeshStandardMaterial({
      color: 0x3A3D42,
      roughness: 0.4,
      metalness: 0.1
    }),
    propellerTipOrange: new THREE.MeshStandardMaterial({
      color: 0xE85D04,
      roughness: 0.4,
      metalness: 0.1
    }),
    cameraBody: new THREE.MeshStandardMaterial({
      color: 0x18191C,
      roughness: 0.35,
      metalness: 0.4
    }),
    cameraLensGlass: new THREE.MeshPhysicalMaterial({
      color: 0x051525,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    }),
    heatsinkAluminum: new THREE.MeshStandardMaterial({
      color: 0x8C929D,
      roughness: 0.3,
      metalness: 0.9
    }),
    pcbGreen: new THREE.MeshStandardMaterial({
      color: 0x164E22,
      roughness: 0.4,
      metalness: 0.3
    }),
    goldContacts: new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.2,
      metalness: 0.95
    }),
    rubberDampers: new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.9,
      metalness: 0.05
    }),
    ledGreen: new THREE.MeshBasicMaterial({
      color: 0x10B981
    }),
    ledRed: new THREE.MeshBasicMaterial({
      color: 0xEF4444
    }),
    opticalSensorGlass: new THREE.MeshStandardMaterial({
      color: 0x0E1A2B,
      roughness: 0.1,
      metalness: 0.8
    })
  };

  // Helper geometry creators
  const createBox = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const createCyl = (
    rTop: number,
    rBot: number,
    h: number,
    segs: number,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, segs);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  // -------------------------------------------------------------
  // 1. MAIN FUSELAGE / TOP SHELL
  // -------------------------------------------------------------
  const topMainBody = createBox(0.24, 0.08, 0.46, baseMaterials.djiWhiteShell, [0, 0.02, 0]);
  const noseCone = createBox(0.18, 0.06, 0.12, baseMaterials.djiWhiteShell, [0, 0.01, 0.26]);
  const tailNose = createBox(0.20, 0.07, 0.10, baseMaterials.djiWhiteShell, [0, 0.02, -0.25]);
  const topCoverBevel = createBox(0.22, 0.03, 0.42, baseMaterials.djiWhiteShell, [0, 0.06, 0]);
  
  // Power button on top
  const powerBtn = createCyl(0.025, 0.025, 0.01, 24, baseMaterials.darkComposite, [0, 0.075, -0.05]);
  const powerLed = createCyl(0.008, 0.008, 0.012, 16, baseMaterials.ledGreen, [0, 0.076, -0.05]);
  
  // DJI Signature Branding Accent Stripe
  const brandPlate = createBox(0.08, 0.002, 0.18, baseMaterials.darkComposite, [0, 0.076, 0.1]);

  topShellGroup.add(topMainBody, noseCone, tailNose, topCoverBevel, powerBtn, powerLed, brandPlate);

  // -------------------------------------------------------------
  // 2. BOTTOM SHELL, HEATSINK & VPS SENSORS
  // -------------------------------------------------------------
  const bottomPlate = createBox(0.22, 0.04, 0.44, baseMaterials.djiWhiteShell, [0, -0.04, 0]);
  const heatsink = createBox(0.14, 0.02, 0.22, baseMaterials.heatsinkAluminum, [0, -0.06, -0.02]);
  
  // Heatsink fins
  for (let f = -0.08; f <= 0.08; f += 0.02) {
    const fin = createBox(0.004, 0.012, 0.20, baseMaterials.heatsinkAluminum, [f, -0.07, -0.02]);
    bottomShellGroup.add(fin);
  }

  // VPS Optical Flow camera & Dual Ultrasonic / IR Sensors
  const vpsCameraMount = createBox(0.06, 0.02, 0.06, baseMaterials.darkComposite, [0, -0.065, 0.12]);
  const vpsLens = createCyl(0.015, 0.015, 0.01, 16, baseMaterials.opticalSensorGlass, [0, -0.075, 0.12]);
  const usSensorLeft = createCyl(0.018, 0.018, 0.012, 20, baseMaterials.darkComposite, [-0.05, -0.065, 0.06]);
  const usSensorRight = createCyl(0.018, 0.018, 0.012, 20, baseMaterials.darkComposite, [0.05, -0.065, 0.06]);
  
  // Rear Status Beacon LED
  const rearLedGeo = createCyl(0.015, 0.015, 0.02, 16, baseMaterials.ledGreen, [0, -0.02, -0.28], [Math.PI / 2, 0, 0]);
  leds.push(rearLedGeo);

  bottomShellGroup.add(bottomPlate, heatsink, vpsCameraMount, vpsLens, usSensorLeft, usSensorRight, rearLedGeo);

  // -------------------------------------------------------------
  // 3. INTERNAL FLIGHT CONTROLLER MAINBOARD & ESC
  // -------------------------------------------------------------
  const pcbBoard = createBox(0.18, 0.01, 0.32, baseMaterials.pcbGreen, [0, -0.005, 0.02]);
  const imuShieldBox = createBox(0.05, 0.02, 0.05, baseMaterials.heatsinkAluminum, [0, 0.01, 0.08]);
  const escFets1 = createBox(0.04, 0.015, 0.06, baseMaterials.darkComposite, [-0.06, 0.005, -0.04]);
  const escFets2 = createBox(0.04, 0.015, 0.06, baseMaterials.darkComposite, [0.06, 0.005, -0.04]);
  const gpsPatch = createBox(0.06, 0.015, 0.06, baseMaterials.goldContacts, [0, 0.01, -0.10]);
  
  mainboardGroup.add(pcbBoard, imuShieldBox, escFets1, escFets2, gpsPatch);

  // -------------------------------------------------------------
  // 4. INTELLIGENT FLIGHT BATTERY PACK (2S LiPo 2400mAh)
  // -------------------------------------------------------------
  const batteryBody = createBox(0.16, 0.06, 0.24, baseMaterials.darkComposite, [0, 0.01, -0.16]);
  const batteryLatch = createBox(0.08, 0.02, 0.03, baseMaterials.djiWhiteShell, [0, 0.04, -0.28]);
  
  // 4 Battery gauge green LEDs on rear
  for (let i = 0; i < 4; i++) {
    const x = -0.045 + i * 0.03;
    const bLed = createCyl(0.005, 0.005, 0.01, 12, baseMaterials.ledGreen, [x, 0.01, -0.282], [Math.PI / 2, 0, 0]);
    batteryGroup.add(bLed);
  }
  batteryGroup.add(batteryBody, batteryLatch);

  // -------------------------------------------------------------
  // 5. 3-AXIS MOTORIZED CAMERA GIMBAL & 2.7K SENSOR
  // -------------------------------------------------------------
  // Rubber vibration isolation bracket
  const damperPlate = createBox(0.09, 0.015, 0.09, baseMaterials.rubberDampers, [0, -0.02, 0.26]);
  
  // Yaw motor & bracket
  const yawMotor = createCyl(0.022, 0.022, 0.02, 20, baseMaterials.motorBellSilver, [0, -0.04, 0.26]);
  const rollArm = createBox(0.07, 0.015, 0.02, baseMaterials.darkComposite, [0.025, -0.06, 0.26]);
  const rollMotor = createCyl(0.018, 0.018, 0.018, 20, baseMaterials.motorBellSilver, [0.06, -0.06, 0.26], [0, 0, Math.PI / 2]);
  
  gimbalGroup.add(damperPlate, yawMotor, rollArm, rollMotor);

  // Pitch gimbal assembly & Camera
  gimbalPitchGroup.position.set(0, -0.06, 0.26);
  const cameraHousing = createBox(0.07, 0.06, 0.06, baseMaterials.cameraBody, [0, 0, 0]);
  const lensBarrel = createCyl(0.022, 0.022, 0.025, 24, baseMaterials.cameraBody, [0, 0, 0.038], [Math.PI / 2, 0, 0]);
  const lensGlass = createCyl(0.018, 0.018, 0.005, 24, baseMaterials.cameraLensGlass, [0, 0, 0.051], [Math.PI / 2, 0, 0]);
  const lensGoldRing = createCyl(0.023, 0.023, 0.004, 24, baseMaterials.goldContacts, [0, 0, 0.035], [Math.PI / 2, 0, 0]);
  
  gimbalCamera.add(cameraHousing, lensBarrel, lensGlass, lensGoldRing);
  gimbalPitchGroup.add(gimbalCamera);
  gimbalGroup.add(gimbalPitchGroup);

  // -------------------------------------------------------------
  // 6. 4 FOLDING ARMS & BRUSHLESS MOTORS
  // -------------------------------------------------------------
  // Arm layout coordinates: Front Left, Front Right, Rear Left, Rear Right
  const armConfigs = [
    { name: 'FL', x: -0.42, y: 0.04, z: 0.38, rotY: -0.42, isFront: true },
    { name: 'FR', x: 0.42, y: 0.04, z: 0.38, rotY: 0.42, isFront: true },
    { name: 'RL', x: -0.46, y: -0.01, z: -0.32, rotY: 0.35, isFront: false },
    { name: 'RR', x: 0.46, y: -0.01, z: -0.32, rotY: -0.35, isFront: false }
  ];

  armConfigs.forEach((cfg, idx) => {
    const armAssembly = new THREE.Group();
    
    // Carbon fiber arm beam
    const armLength = Math.hypot(cfg.x, cfg.z) * 0.75;
    const armBeam = createBox(0.035, 0.028, armLength, baseMaterials.carbonArm, [cfg.x * 0.45, cfg.y, cfg.z * 0.45]);
    armBeam.lookAt(cfg.x, cfg.y, cfg.z);
    
    // Front landing leg stubs
    if (cfg.isFront) {
      const legStub = createCyl(0.012, 0.008, 0.12, 16, baseMaterials.djiWhiteShell, [cfg.x * 0.85, cfg.y - 0.06, cfg.z * 0.85]);
      const navLed = createCyl(0.008, 0.008, 0.01, 16, baseMaterials.ledRed, [cfg.x * 0.85, cfg.y - 0.115, cfg.z * 0.85]);
      armAssembly.add(legStub, navLed);
      leds.push(navLed);
    }

    // Brushless 1406 Outrunner Motor
    const motorGroup = new THREE.Group();
    motorGroup.position.set(cfg.x, cfg.y, cfg.z);

    const motorStator = createCyl(0.042, 0.042, 0.035, 24, baseMaterials.motorCoilCopper, [0, 0, 0]);
    const motorBell = createCyl(0.048, 0.048, 0.040, 24, baseMaterials.motorBellSilver, [0, 0.01, 0]);
    const motorShaft = createCyl(0.008, 0.008, 0.065, 16, baseMaterials.motorBellSilver, [0, 0.02, 0]);
    const motorCap = createCyl(0.035, 0.035, 0.015, 20, baseMaterials.darkComposite, [0, 0.035, 0]);
    
    motorGroup.add(motorStator, motorBell, motorShaft, motorCap);

    // Dual Folding Propeller Blades
    const propGroup = new THREE.Group();
    propGroup.position.set(cfg.x, cfg.y + 0.042, cfg.z);

    const propHub = createCyl(0.024, 0.024, 0.012, 20, baseMaterials.darkComposite, [0, 0, 0]);
    
    // Blade 1
    const blade1 = createBox(0.032, 0.004, 0.22, baseMaterials.propellerGray, [0, 0, 0.11]);
    const blade1Tip = createBox(0.032, 0.005, 0.04, baseMaterials.propellerTipOrange, [0, 0, 0.20]);
    // Blade 2
    const blade2 = createBox(0.032, 0.004, 0.22, baseMaterials.propellerGray, [0, 0, -0.11]);
    const blade2Tip = createBox(0.032, 0.005, 0.04, baseMaterials.propellerTipOrange, [0, 0, -0.20]);

    propGroup.add(propHub, blade1, blade1Tip, blade2, blade2Tip);
    propellers.push(propGroup);

    armAssembly.add(armBeam, motorGroup, propGroup);
    armsGroup.add(armAssembly);
  });

  // Assemble into root group
  rootGroup.add(topShellGroup, bottomShellGroup, batteryGroup, gimbalGroup, mainboardGroup, armsGroup);

  // -------------------------------------------------------------
  // EXPLODED VIEW KINEMATICS
  // -------------------------------------------------------------
  const updateExplode = (percent: number) => {
    const t = Math.max(0, Math.min(1, percent / 100));

    // Top shell moves UP
    topShellGroup.position.y = t * 0.65;

    // Bottom shell moves DOWN
    bottomShellGroup.position.y = -t * 0.55;

    // Battery moves REARWARD
    batteryGroup.position.z = -t * 0.70;
    batteryGroup.position.y = t * 0.10;

    // Camera Gimbal moves FORWARD & DOWN
    gimbalGroup.position.z = t * 0.55;
    gimbalGroup.position.y = -t * 0.40;

    // Arms and motors expand OUTWARD symmetrically
    armsGroup.children.forEach((armChild, i) => {
      const cfg = armConfigs[i];
      if (cfg) {
        armChild.position.x = cfg.x * t * 0.85;
        armChild.position.z = cfg.z * t * 0.85;
        armChild.position.y = (cfg.isFront ? 0.15 : -0.10) * t;
      }
    });

    // Propellers elevate above motors
    propellers.forEach((p) => {
      p.position.y = (armConfigs[0]?.y || 0) + 0.042 + t * 0.35;
    });

    // Mainboard floats subtly in the center
    mainboardGroup.position.y = t * 0.12;
  };

  // -------------------------------------------------------------
  // PROPELLER ROTATION LOGIC
  // -------------------------------------------------------------
  let currentPropAngle = 0;
  const updatePropellerRotation = (deltaAngle: number) => {
    currentPropAngle += deltaAngle;
    propellers.forEach((prop, i) => {
      // Alternate CW and CCW quadcopter rotation
      const dir = (i === 0 || i === 3) ? 1 : -1;
      prop.rotation.y = currentPropAngle * dir;
    });
  };

  // Gimbal pitch adjustment
  const updateGimbalTilt = (tiltRad: number) => {
    gimbalPitchGroup.rotation.x = tiltRad;
  };

  // -------------------------------------------------------------
  // SHADER / MATERIAL MODE SWITCHER
  // -------------------------------------------------------------
  const blueprintMat = createBlueprintShaderMaterial();
  const thermalMat = createThermalShaderMaterial(0.25);

  const stealthMaterials = {
    shell: new THREE.MeshStandardMaterial({ color: 0x1A1C20, roughness: 0.35, metalness: 0.4 }),
    carbon: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.5, metalness: 0.6 }),
    motor: new THREE.MeshStandardMaterial({ color: 0x2C3038, roughness: 0.2, metalness: 0.9 })
  };

  const applyMaterialMode = (mode: DroneMaterialMode) => {
    rootGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (mode === 'blueprint') {
          child.material = blueprintMat;
        } else if (mode === 'thermal') {
          child.material = thermalMat;
        } else if (mode === 'stealth-dark') {
          child.material = stealthMaterials.shell;
        } else {
          // Restore default DJI White
          if (topShellGroup.children.includes(child) || bottomShellGroup.children.includes(child)) {
            child.material = baseMaterials.djiWhiteShell;
          } else {
            child.material = baseMaterials.darkComposite;
          }
        }
      }
    });
  };

  return {
    rootGroup,
    topShellGroup,
    bottomShellGroup,
    batteryGroup,
    gimbalGroup,
    gimbalCamera,
    gimbalPitchGroup,
    mainboardGroup,
    armsGroup,
    propellers,
    leds,
    applyMaterialMode,
    updateExplode,
    updatePropellerRotation,
    updateGimbalTilt
  };
}
