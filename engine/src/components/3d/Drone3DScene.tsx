import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { DroneCameraPreset, DroneMaterialMode } from '../../types/drone';
import { createDJIMavicMiniModel, Drone3DParts } from './DJIMavicMiniModel';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  Eye
} from 'lucide-react';

interface Drone3DSceneProps {
  rotorRpm: number;
  isRunning: boolean;
  materialMode: DroneMaterialMode;
  cameraPreset: DroneCameraPreset;
  explodePercent: number;
  onChangeExplode: (val: number) => void;
  onChangeCameraPreset: (preset: DroneCameraPreset) => void;
  onChangeMaterialMode: (mode: DroneMaterialMode) => void;
}

const DRONE_CAMERA_PRESETS: Record<DroneCameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  isometric: { pos: [-2.8, 1.8, 3.2], target: [0, 0, 0] },
  'front-gimbal': { pos: [0.0, 0.1, 2.4], target: [0, -0.05, 0.3] },
  'top-rotors': { pos: [0.0, 3.8, 0.01], target: [0, 0, 0] },
  'bottom-sensors': { pos: [0.0, -3.2, 0.5], target: [0, -0.1, 0] },
  'rear-battery': { pos: [0.0, 0.4, -2.8], target: [0, 0, -0.2] },
  'motor-detail': { pos: [-1.4, 0.6, 1.6], target: [-0.9, 0.1, 0.9] }
};

export const Drone3DScene: React.FC<Drone3DSceneProps> = ({
  rotorRpm,
  isRunning,
  materialMode,
  cameraPreset,
  explodePercent,
  onChangeExplode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const droneModelRef = useRef<Drone3DParts | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  const rotorRpmRef = useRef(rotorRpm);
  rotorRpmRef.current = rotorRpm;

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const controlsRef = useRef<{
    target: THREE.Vector3;
    isDragging: boolean;
    prevX: number;
    prevY: number;
    spherical: { radius: number; theta: number; phi: number };
  }>({
    target: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    prevX: 0,
    prevY: 0,
    spherical: { radius: 4.5, theta: 2.2, phi: 1.1 }
  });

  // Camera preset handler
  useEffect(() => {
    const config = DRONE_CAMERA_PRESETS[cameraPreset] || DRONE_CAMERA_PRESETS.isometric;
    const targetVec = new THREE.Vector3(...config.target);
    controlsRef.current.target.copy(targetVec);

    const eyeVec = new THREE.Vector3(...config.pos);
    const offset = new THREE.Vector3().subVectors(eyeVec, targetVec);
    const radius = offset.length();
    const phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));
    const theta = Math.atan2(offset.x, offset.z);

    controlsRef.current.spherical = { radius, theta, phi };
  }, [cameraPreset]);

  // Main Three.js setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2323FF);
    scene.fog = new THREE.FogExp2(0x2323FF, 0.025);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    camera.position.set(-2.8, 1.8, 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(-3, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x99bbff, 1.4);
    fillLight.position.set(3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Ground Studio Pedestal & Radial Grid
    const groundGeo = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1818dd,
      roughness: 0.85,
      metalness: 0.15
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.4;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.PolarGridHelper(5, 16, 8, 64, 0xffffff, 0x4040ff);
    gridHelper.position.y = -1.39;
    scene.add(gridHelper);

    // Create 3D Drone Model
    const droneParts = createDJIMavicMiniModel();
    scene.add(droneParts.rootGroup);
    droneModelRef.current = droneParts;

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Pointer orbit controls
    const controls = controlsRef.current;
    let isMouseDown = false;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
      isMouseDown = true;
      controls.isDragging = true;
      controls.prevX = e.clientX;
      controls.prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - controls.prevX;
      const dy = e.clientY - controls.prevY;
      controls.prevX = e.clientX;
      controls.prevY = e.clientY;

      controls.spherical.theta -= dx * 0.007;
      controls.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, controls.spherical.phi - dy * 0.007));
    };

    const onPointerUp = () => {
      isMouseDown = false;
      controls.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controls.spherical.radius = Math.max(1.8, Math.min(10.0, controls.spherical.radius + e.deltaY * 0.004));
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    sceneRef.current = scene;

    // Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Auto rotation
      if (autoRotate && !controls.isDragging) {
        controls.spherical.theta += 0.3 * delta;
      }

      // Propeller spin calculation
      const currentRpm = isRunningRef.current ? rotorRpmRef.current : 0;
      if (currentRpm > 0 && droneParts) {
        const radPerSec = (currentRpm / 60) * Math.PI * 2;
        droneParts.updatePropellerRotation(radPerSec * delta);
      }

      // Navigation LED blink
      const blinkOn = Math.sin(time * 0.006) > 0;
      droneParts.leds.forEach((led) => {
        led.visible = isRunningRef.current ? blinkOn : true;
      });

      // Update camera position from spherical
      const sp = controls.spherical;
      const x = controls.target.x + sp.radius * Math.sin(sp.phi) * Math.sin(sp.theta);
      const y = controls.target.y + sp.radius * Math.cos(sp.phi);
      const z = controls.target.z + sp.radius * Math.sin(sp.phi) * Math.cos(sp.theta);

      camera.position.set(x, y, z);
      camera.lookAt(controls.target);

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [autoRotate]);

  // Exploded view synchronization
  useEffect(() => {
    if (droneModelRef.current) {
      droneModelRef.current.updateExplode(explodePercent);
    }
  }, [explodePercent]);

  // Material mode synchronization
  useEffect(() => {
    if (droneModelRef.current) {
      droneModelRef.current.applyMaterialMode(materialMode);
    }
  }, [materialMode]);

  const handleResetCamera = useCallback(() => {
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.spherical = { radius: 4.5, theta: 2.2, phi: 1.1 };
    onChangeExplode(0);
  }, [onChangeExplode]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Controls in 3D Scene */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#0e0e4b]/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Detener Giro Automático' : 'Iniciar Giro 360°'}
          className={`p-2 rounded-xl text-xs font-medium transition-all ${
            autoRotate
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={handleResetCamera}
          title="Restablecer Vista"
          className="p-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
          className="p-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Interactive Drag Hint */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-[#0e0e4b]/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-neutral-300 font-mono shadow-lg">
        <Eye className="w-3.5 h-3.5 text-cyan-300" />
        <span>Arrastra para rotar • Rueda para zoom</span>
      </div>
    </div>
  );
};
