import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraViewPreset, EngineMaterialMode } from '../../types/engine';
import { createCaterpillarEngineModel, EngineModelParts } from './CaterpillarEngineModel';
import { createStudioEnvironmentMap, createContactShadowTexture } from './ProceduralTextures';
import {
  Info,
  Zap,
  Activity,
  CheckCircle2,
  ChevronRight,
  X
} from 'lucide-react';

interface Engine3DSceneProps {
  rpm: number;
  isRunning: boolean;
  loadPercent: number;
  egtCelsius: number;
  materialMode: EngineMaterialMode;
  cameraPreset: CameraViewPreset;
  explodePercent: number;
  onChangeExplode?: (val: number) => void;
  isTransparent?: boolean;
  onToggleTransparency?: () => void;
  transparencyOpacity?: number;
  onChangeCameraPreset?: (preset: CameraViewPreset) => void;
  onChangeMaterialMode?: (mode: EngineMaterialMode) => void;
}

// Key Component Annotation Definitions
interface ComponentLegend {
  id: string;
  name: string;
  category: string;
  tagColor: string;
  description: string;
  pos: [number, number, number];
  explodeDir: [number, number, number];
  cameraAlign: 'left' | 'right' | 'top' | 'bottom';
}

const ENGINE_LEGENDS: ComponentLegend[] = [
  {
    id: 'turbos',
    name: 'Turbocompresores en Serie ACERT™',
    category: 'Inducción Forzada',
    tagColor: 'from-amber-400 to-orange-500',
    description: 'Comprime el aire de admisión en dos etapas secuenciales generando hasta 36 PSI de presión de sobrealimentación.',
    pos: [-0.85, 0.72, -0.45],
    explodeDir: [-0.9, 0.4, -0.2],
    cameraAlign: 'left'
  },
  {
    id: 'valves',
    name: 'Culata y Tren de Válvulas',
    category: 'Distribución (4 Válv./Cil.)',
    tagColor: 'from-sky-400 to-blue-600',
    description: 'Controla con precisión milimétrica la admisión de aire frío y escape de gases mediante árbol de levas en culata.',
    pos: [0.0, 0.95, 0.25],
    explodeDir: [0, 0.8, 0],
    cameraAlign: 'top'
  },
  {
    id: 'ecm',
    name: 'Módulo Electrónico ECM ADEM™ A4',
    category: 'Control de Inyección',
    tagColor: 'from-emerald-400 to-teal-600',
    description: 'Gestiona la inyección múltiple MEUI-C en microsegundos y monitorea todos los sensores de presión y temperatura.',
    pos: [0.65, 0.15, 0.45],
    explodeDir: [0.7, 0, 0.2],
    cameraAlign: 'right'
  },
  {
    id: 'fan',
    name: 'Ventilador y Mando de Distribución',
    category: 'Refrigeración',
    tagColor: 'from-cyan-400 to-blue-500',
    description: 'Impulsa el caudal de enfriamiento a través del radiador y postenfriador ATAAC para estabilizar el régimen térmico.',
    pos: [0.0, 0.35, -1.35],
    explodeDir: [0, 0, -0.8],
    cameraAlign: 'bottom'
  },
  {
    id: 'filters',
    name: 'Filtros de Combustible Secundarios',
    category: 'Purificación 2 µm',
    tagColor: 'from-yellow-400 to-amber-600',
    description: 'Retienen partículas microscópicas y eliminan el agua del diésel antes de ingresar a la galería de alta presión.',
    pos: [0.68, -0.45, -0.25],
    explodeDir: [0.7, -0.2, -0.1],
    cameraAlign: 'right'
  },
  {
    id: 'exhaust',
    name: 'Múltiple de Escape de Tres Secciones',
    category: 'Escape & Termodinámica',
    tagColor: 'from-rose-400 to-red-600',
    description: 'Evacua los gases a más de 600 °C con juntas deslizantes de dilatación hacia la turbina de alta velocidad.',
    pos: [-0.58, 0.38, 0.45],
    explodeDir: [-0.6, 0.2, 0.3],
    cameraAlign: 'left'
  }
];

// Camera presets calibrated for the engine's geometry
const CAMERA_PRESETS: { [key in CameraViewPreset]: { pos: [number, number, number]; target: [number, number, number] } } = {
  isometric: {
    pos: [-3.6, 2.3, 3.8],
    target: [0.0, 0.2, 0.0]
  },
  turbo: {
    pos: [-2.8, 1.4, -0.6],
    target: [-0.9, 0.7, -0.4]
  },
  flywheel: {
    pos: [0.0, 0.5, 4.2],
    target: [0.0, 0.1, 1.2]
  },
  filters: {
    pos: [3.4, -0.2, 1.2],
    target: [0.6, -0.4, 0.3]
  },
  'front-fan': {
    pos: [0.0, 0.4, -4.2],
    target: [0.0, 0.2, -1.2]
  },
  'top-valves': {
    pos: [0.2, 4.5, 0.1],
    target: [0.0, 0.8, 0.0]
  }
};

export const Engine3DScene: React.FC<Engine3DSceneProps> = ({
  rpm,
  isRunning,
  loadPercent,
  egtCelsius,
  materialMode,
  cameraPreset,
  explodePercent,
  onChangeExplode,
  isTransparent = false,
  onToggleTransparency,
  transparencyOpacity = 0.28,
  onChangeCameraPreset,
  onChangeMaterialMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineModelRef = useRef<EngineModelParts | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Active expanded legend in focus
  const [selectedLegendId, setSelectedLegendId] = useState<string | null>(null);

  // Projected 2D screen positions for annotations
  const [projectedPoints, setProjectedPoints] = useState<
    { id: string; x: number; y: number; visible: boolean }[]
  >([]);

  // Dynamic animation values stored in refs to avoid stale closure in RAF animate loop
  const explodePercentRef = useRef(explodePercent);
  explodePercentRef.current = explodePercent;

  const rpmRef = useRef(rpm);
  rpmRef.current = rpm;

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const loadPercentRef = useRef(loadPercent);
  loadPercentRef.current = loadPercent;

  const egtCelsiusRef = useRef(egtCelsius);
  egtCelsiusRef.current = egtCelsius;

  const controlsRef = useRef<{
    target: THREE.Vector3;
    isDragging: boolean;
    prevX: number;
    prevY: number;
    spherical: { radius: number; theta: number; phi: number };
  }>({
    target: new THREE.Vector3(0, 0.2, 0),
    isDragging: false,
    prevX: 0,
    prevY: 0,
    spherical: { radius: 5.5, theta: 2.4, phi: 1.1 }
  });

  const [autoRotate, setAutoRotate] = useState(false);

  // Update target camera coords when preset changes
  useEffect(() => {
    const config = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.isometric;
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
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(-3.6, 2.3, 3.8);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // WebGL Renderer with transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    // Generate and attach studio environment map (IBL Reflections)
    const studioEnv = createStudioEnvironmentMap(renderer);
    scene.environment = studioEnv;

    // Lighting (Studio Three-Point + Rim Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff7ea, 2.6);
    keyLight.position.set(-4.5, 6.5, 4.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xaad0ff, 1.3);
    fillLight.position.set(4.5, 3.5, -3.5);
    scene.add(fillLight);

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(1.5, 5.5, -5.5);
    scene.add(rimLight);

    // Soft Ambient Occlusion Contact Shadow under the engine
    const shadowGeo = new THREE.PlaneGeometry(6.2, 8.4);
    const shadowTex = createContactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, -1.78, 0);
    scene.add(contactShadow);

    // Create 3D Engine Model
    const engineParts = createCaterpillarEngineModel();
    scene.add(engineParts.rootGroup);
    engineModelRef.current = engineParts;

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Mouse / Touch Orbit Controls implementation
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
      const deltaX = e.clientX - controls.prevX;
      const deltaY = e.clientY - controls.prevY;
      controls.prevX = e.clientX;
      controls.prevY = e.clientY;

      controls.spherical.theta -= deltaX * 0.007;
      controls.spherical.phi = Math.max(0.12, Math.min(Math.PI / 2 + 0.1, controls.spherical.phi - deltaY * 0.007));
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controls.spherical.radius = Math.max(2.2, Math.min(14.0, controls.spherical.radius + e.deltaY * 0.005));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let projectionThrottle = 0;

    const tempVec = new THREE.Vector3();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Auto rotation
      if (autoRotate && !isMouseDown) {
        controls.spherical.theta += delta * 0.25;
      }

      // Dynamic exploded view auto-framing
      const curExplode = explodePercentRef.current / 100;
      const zoomExpand = curExplode * 2.6;
      const effectiveRadius = controls.spherical.radius + zoomExpand;
      const effectiveTargetY = controls.target.y + curExplode * 0.7;

      const { theta, phi } = controls.spherical;
      const camX = controls.target.x + effectiveRadius * Math.sin(phi) * Math.sin(theta);
      const camY = effectiveTargetY + effectiveRadius * Math.cos(phi);
      const camZ = controls.target.z + effectiveRadius * Math.sin(phi) * Math.cos(theta);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(controls.target.x, effectiveTargetY, controls.target.z);

      const curRpm = rpmRef.current;
      const curIsRunning = isRunningRef.current;
      const curLoad = loadPercentRef.current;
      const curEgt = egtCelsiusRef.current;

      // Update 3D model kinematics across all separated components
      if (engineParts) {
        engineParts.updateAnimation(curRpm, delta, curIsRunning, curExplode, curLoad, curEgt);
      }

      // Project 3D coordinates to 2D screen pixels for interactive callout legends
      if (curIsRunning) {
        projectionThrottle++;
        if (projectionThrottle % 2 === 0 && container) {
          const w = container.clientWidth;
          const h = container.clientHeight;

          const points = ENGINE_LEGENDS.map((legend) => {
            tempVec.set(
              legend.pos[0] + legend.explodeDir[0] * curExplode,
              legend.pos[1] + legend.explodeDir[1] * curExplode,
              legend.pos[2] + legend.explodeDir[2] * curExplode
            );
            tempVec.project(camera);

            const isFront = tempVec.z < 1.0;
            const x = (tempVec.x * 0.5 + 0.5) * w;
            const y = (-(tempVec.y * 0.5) + 0.5) * h;

            return {
              id: legend.id,
              x,
              y,
              visible: isFront && x >= 20 && x <= w - 20 && y >= 20 && y <= h - 20
            };
          });

          setProjectedPoints(points);
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [autoRotate]);

  // Sync Material Mode and Transparency Settings
  useEffect(() => {
    if (engineModelRef.current) {
      engineModelRef.current.updateMaterials(
        materialMode,
        egtCelsius,
        loadPercent,
        isTransparent,
        transparencyOpacity
      );
    }
  }, [materialMode, egtCelsius, loadPercent, isTransparent, transparencyOpacity]);

  const peakHotspotTemp = Math.round(Math.max(680, egtCelsius * 1.06));

  const activeLegend = ENGINE_LEGENDS.find((l) => l.id === selectedLegendId);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden bg-neutral-950">
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* DISCRETE 3D ENGINE HOTSPOT BEACONS (Flat Minimalist Pins) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isRunning ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isRunning &&
          projectedPoints.map((pt) => {
            if (!pt.visible) return null;
            const legend = ENGINE_LEGENDS.find((l) => l.id === pt.id);
            if (!legend) return null;

            const isSelected = selectedLegendId === legend.id;

            return (
              <div
                key={legend.id}
                style={{
                  transform: `translate3d(${pt.x}px, ${pt.y}px, 0)`
                }}
                className="absolute left-0 top-0 pointer-events-auto transition-transform duration-75 z-20"
              >
                {/* Flat Minimalist Pin */}
                <button
                  onClick={() => setSelectedLegendId(isSelected ? null : legend.id)}
                  title={`Ver detalles de ${legend.name}`}
                  className="relative -left-2.5 -top-2.5 w-5 h-5 flex items-center justify-center cursor-pointer group focus:outline-none"
                >
                  <span
                    className={`w-3 h-3 rounded-full transition-all duration-150 border border-black/30 ${
                      isSelected
                        ? 'bg-white scale-125'
                        : 'bg-white/80 group-hover:bg-white group-hover:scale-110'
                    }`}
                  />
                </button>
              </div>
            );
          })}
      </div>

      {/* RIGHT-SIDE COMPONENT LEGEND DETAILS PANEL (Flat Modern Glass) */}
      {activeLegend && (
        <aside
          aria-label={`Detalles de ${activeLegend.name}`}
          className="absolute right-3 top-3 z-30 w-72 sm:w-80 pointer-events-auto select-none transition-all duration-300 animate-in fade-in slide-in-from-right-3"
        >
          <div className="w-full bg-[#091322]/40 backdrop-blur-3xl rounded-2xl p-4 flex flex-col border border-white/10 space-y-3">
            {/* Header: Category + Clean Close Button */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                  {activeLegend.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedLegendId(null)}
                title="Cerrar información de la pieza"
                className="w-7 h-7 rounded-xl bg-white/[0.08] hover:bg-white/[0.2] text-neutral-200 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Component Title (Pure White, Flat) */}
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {activeLegend.name}
              </h3>
            </div>

            {/* Function & Role Description Card */}
            <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
              <p className="text-xs text-neutral-200 leading-relaxed font-normal">
                {activeLegend.description}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* THERMAL MODE: Pure Rainbow Radiometric Scale (only visible when in thermal mode) */}
      {materialMode === 'thermal' && (
        <div
          className={`absolute ${
            activeLegend ? 'right-3 bottom-3 top-auto h-56' : 'right-4 top-6 bottom-6'
          } w-12 pointer-events-auto z-10 flex flex-col items-center justify-between glass-panel rounded-2xl p-2.5 shadow-2xl transition-all duration-300`}
        >
          {/* Max Hotspot Label */}
          <div className="text-center font-mono leading-none">
            <span className="text-[9px] uppercase tracking-wider text-red-400 block font-semibold">MAX</span>
            <span className="text-xs font-bold text-white block mt-0.5">{peakHotspotTemp}°C</span>
          </div>

          {/* Pure Rainbow Gradient Bar */}
          <div className="relative flex-1 w-3 my-2 rounded-full overflow-hidden border border-white/20 shadow-inner flex flex-col">
            <div className="w-full h-full bg-gradient-to-t from-[#140038] via-[#0033cc] via-[#00d4ff] via-[#0ce028] via-[#ffee00] via-[#ff6600] to-[#ffffff]" />
          </div>

          {/* Min Ambient Label */}
          <div className="text-center font-mono leading-none">
            <span className="text-xs font-bold text-cyan-300 block mb-0.5">25°C</span>
            <span className="text-[9px] uppercase tracking-wider text-cyan-400 block font-semibold">MIN</span>
          </div>
        </div>
      )}
    </div>
  );
};
