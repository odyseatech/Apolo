import React, { useState } from 'react';
import {
  CameraViewPreset,
  EngineMaterialMode,
  PerformanceMetrics
} from '../types/engine';
import {
  Power,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

interface FloatingSidebarMenuProps {
  isRunning: boolean;
  onTogglePower: () => void;
  targetRpm: number;
  currentRpm: number;
  onChangeTargetRpm: (rpm: number) => void;
  loadPercent: number;
  onChangeLoadPercent: (load: number) => void;
  metrics: PerformanceMetrics;
  explodePercent: number;
  onChangeExplode: (val: number) => void;
  materialMode: EngineMaterialMode;
  onChangeMaterialMode: (mode: EngineMaterialMode) => void;
  cameraPreset: CameraViewPreset;
  onChangeCameraPreset: (preset: CameraViewPreset) => void;
}

export const FloatingSidebarMenu: React.FC<FloatingSidebarMenuProps> = ({
  isRunning,
  onTogglePower,
  targetRpm,
  currentRpm,
  onChangeTargetRpm,
  loadPercent,
  onChangeLoadPercent,
  metrics,
  explodePercent,
  onChangeExplode,
  materialMode,
  onChangeMaterialMode,
  cameraPreset,
  onChangeCameraPreset
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const rpmPresets = [
    { label: 'Ralentí', rpm: 650 },
    { label: 'Crucero', rpm: 1200 },
    { label: 'Torque', rpm: 1400 },
    { label: 'Nominal', rpm: 1800 },
    { label: 'Corte', rpm: 2100 }
  ];

  const loadPresets = [
    { label: '0%', load: 0 },
    { label: '25%', load: 25 },
    { label: '50%', load: 50 },
    { label: '75%', load: 75 },
    { label: '100%', load: 100 }
  ];

  return (
    <aside
      aria-label="Panel lateral de Ajustes y Tuning"
      className={`absolute left-3 top-3 bottom-3 z-30 flex transition-all duration-300 pointer-events-auto select-none ${
        isCollapsed ? 'w-11' : 'w-72 sm:w-80'
      }`}
    >
      {/* Icon Rail (Borderless) */}
      <div className="w-11 bg-neutral-900/80 backdrop-blur-2xl rounded-2xl flex flex-col items-center py-3 justify-between shrink-0 z-10 shadow-xl">
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Subtle Power Button */}
          <button
            onClick={onTogglePower}
            title={isRunning ? 'Apagar Motor' : 'Encender Motor'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isRunning
                ? 'bg-neutral-100 text-neutral-950'
                : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>

          <div className="w-4 h-px bg-neutral-800 my-0.5" />

          {/* Sidebar Toggle Icon */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Ajustes y Tuning"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors bg-neutral-800/80 text-neutral-300 hover:text-white"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir Menú' : 'Colapsar Menú'}
          className="w-8 h-8 rounded-xl bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Menu Panel (Borderless & Streamlined) */}
      {!isCollapsed && (
        <div className="flex-1 bg-neutral-900/85 backdrop-blur-2xl rounded-r-2xl ml-[-6px] pl-4 pr-3.5 py-4 flex flex-col overflow-y-auto custom-scrollbar space-y-4 shadow-2xl">
          {/* Header & Project Name */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-xs font-bold text-neutral-100 tracking-wider uppercase">
                CAT C15 Studio 3D
              </h2>
              <span className="text-[10px] text-neutral-400 block -mt-0.5">
                Simulador Diésel & Tuning
              </span>
            </div>

            {/* State Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-800/80 text-[10px] font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? 'bg-neutral-200' : 'bg-neutral-600'
                }`}
              />
              <span className={isRunning ? 'text-neutral-200' : 'text-neutral-500'}>
                {isRunning ? `${Math.round(currentRpm)} RPM` : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Clean Engine Power Button */}
          <button
            onClick={onTogglePower}
            className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors text-xs ${
              isRunning
                ? 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white'
                : 'bg-neutral-100 text-neutral-950 hover:bg-white font-medium'
            }`}
          >
            <span>{isRunning ? 'Apagar Motor' : 'Encender Motor'}</span>
            <span className="text-[10px] font-mono opacity-70">
              {isRunning ? 'En marcha' : 'Inactivo'}
            </span>
          </button>

          {/* Tuning: Velocidad (RPM) & Peso / Carga */}
          <div className="space-y-2.5">
            {/* Velocidad (RPM) */}
            <div className="bg-neutral-800/40 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">
                  Velocidad (RPM)
                </span>
                <span className="text-xs font-mono text-neutral-100 tabular-nums">
                  {targetRpm} <span className="text-[10px] text-neutral-400">RPM</span>
                </span>
              </div>

              <input
                type="range"
                min="600"
                max="2200"
                step="25"
                value={targetRpm}
                disabled={!isRunning}
                onChange={(e) => onChangeTargetRpm(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-neutral-700/80 rounded-lg accent-neutral-100 cursor-pointer disabled:opacity-40"
              />

              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {rpmPresets.map((preset) => {
                  const isActive = targetRpm === preset.rpm;
                  return (
                    <button
                      key={preset.label}
                      disabled={!isRunning}
                      onClick={() => onChangeTargetRpm(preset.rpm)}
                      className={`py-1 px-0.5 rounded-md text-[10px] font-mono transition-colors text-center truncate ${
                        isActive
                          ? 'bg-neutral-100 text-neutral-950 font-medium'
                          : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                      } disabled:opacity-30`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Peso / Carga */}
            <div className="bg-neutral-800/40 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">
                  Peso / Carga
                </span>
                <span className="text-xs font-mono text-neutral-100 tabular-nums">
                  {loadPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={loadPercent}
                disabled={!isRunning}
                onChange={(e) => onChangeLoadPercent(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-neutral-700/80 rounded-lg accent-neutral-100 cursor-pointer disabled:opacity-40"
              />

              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {loadPresets.map((p) => {
                  const isActive = loadPercent === p.load;
                  return (
                    <button
                      key={p.label}
                      disabled={!isRunning}
                      onClick={() => onChangeLoadPercent(p.load)}
                      className={`py-1 px-0.5 rounded-md text-[10px] font-mono transition-colors text-center ${
                        isActive
                          ? 'bg-neutral-100 text-neutral-950 font-medium'
                          : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                      } disabled:opacity-30`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Telemetry Display */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="bg-neutral-800/30 p-2 rounded-lg">
                <span className="text-[10px] text-neutral-400 block">Potencia</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-mono font-medium text-neutral-200 tabular-nums">
                    {Math.round(metrics.powerHp)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">HP</span>
                </div>
              </div>

              <div className="bg-neutral-800/30 p-2 rounded-lg">
                <span className="text-[10px] text-neutral-400 block">Torque</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-mono font-medium text-neutral-200 tabular-nums">
                    {Math.round(metrics.torqueLbFt)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">lb·ft</span>
                </div>
              </div>

              <div className="bg-neutral-800/30 p-2 rounded-lg">
                <span className="text-[10px] text-neutral-400 block">Turbo</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-mono font-medium text-neutral-200 tabular-nums">
                    {metrics.turboBoostPsi.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">PSI</span>
                </div>
              </div>

              <div className="bg-neutral-800/30 p-2 rounded-lg">
                <span className="text-[10px] text-neutral-400 block">Temp Escape</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-mono font-medium text-neutral-200 tabular-nums">
                    {Math.round(metrics.egtCelsius)}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Views */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block px-0.5">
              Vistas de Cámara
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'isometric', label: 'Isométrica' },
                { id: 'front-fan', label: 'Frontal' },
                { id: 'turbo', label: 'Turbo' },
                { id: 'filters', label: 'Filtros' },
                { id: 'flywheel', label: 'Volante' },
                { id: 'top-valves', label: 'Culata' }
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => onChangeCameraPreset(cam.id as CameraViewPreset)}
                  className={`p-2 rounded-xl text-left truncate text-xs transition-colors ${
                    cameraPreset === cam.id
                      ? 'bg-neutral-100 text-neutral-950 font-medium'
                      : 'bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/80'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>

          {/* Explosionar */}
          <div className="bg-neutral-800/40 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-medium">
                Explosionar
              </span>
              <span className="text-xs font-mono text-neutral-100 tabular-nums">
                {explodePercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={explodePercent}
              onChange={(e) => onChangeExplode(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-neutral-700/80 rounded-lg accent-neutral-100 cursor-pointer"
            />
          </div>

          {/* Material Finish Modes */}
          <div className="space-y-1.5 pb-1">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block px-0.5">
              Modelo
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => onChangeMaterialMode('reference-gray')}
                className={`p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                  materialMode === 'reference-gray'
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/80'
                }`}
              >
                <span>Gris Fundición</span>
                {materialMode === 'reference-gray' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
                    Default
                  </span>
                )}
              </button>

              <button
                onClick={() => onChangeMaterialMode('blueprint')}
                className={`p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                  materialMode === 'blueprint'
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/80'
                }`}
              >
                <span>Blueprint</span>
                <span className={`text-[10px] font-mono ${materialMode === 'blueprint' ? 'text-neutral-700' : 'text-neutral-400'}`}>CAD</span>
              </button>

              <button
                onClick={() => onChangeMaterialMode('thermal')}
                className={`p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                  materialMode === 'thermal'
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'bg-neutral-800/60 text-neutral-300 hover:text-white hover:bg-neutral-700/80'
                }`}
              >
                <span>Mapa Térmico</span>
                <span className={`text-[10px] font-mono ${materialMode === 'thermal' ? 'text-neutral-700' : 'text-neutral-400'}`}>EGT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
