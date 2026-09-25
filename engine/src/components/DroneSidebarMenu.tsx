import React, { useState } from 'react';
import {
  DroneCameraPreset,
  DroneMaterialMode
} from '../types/drone';
import {
  Power,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DroneSidebarMenuProps {
  isRunning: boolean;
  onTogglePower: () => void;
  explodePercent: number;
  onChangeExplode: (val: number) => void;
  materialMode: DroneMaterialMode;
  onChangeMaterialMode: (mode: DroneMaterialMode) => void;
  cameraPreset: DroneCameraPreset;
  onChangeCameraPreset: (preset: DroneCameraPreset) => void;
}

export const DroneSidebarMenu: React.FC<DroneSidebarMenuProps> = ({
  isRunning,
  onTogglePower,
  explodePercent,
  onChangeExplode,
  materialMode,
  onChangeMaterialMode,
  cameraPreset,
  onChangeCameraPreset
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      aria-label="Panel lateral de ajustes de cámara y dron"
      className={`absolute left-3 top-3 bottom-3 z-30 flex transition-all duration-300 pointer-events-auto select-none ${
        isCollapsed ? 'w-12' : 'w-72 sm:w-80'
      }`}
    >
      {/* Icon Rail (Clean Borderless Glass) */}
      <div className="w-12 bg-[#091322]/40 backdrop-blur-2xl rounded-2xl flex flex-col items-center py-3.5 justify-between shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.35)] z-10">
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Master Arm / Disarm button */}
          <button
            onClick={onTogglePower}
            title={isRunning ? 'Detener Rotores' : 'Armar Rotores (Despegue)'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isRunning
                ? 'bg-white text-neutral-950 shadow-lg'
                : 'bg-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.16] backdrop-blur-md'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>

          <div className="w-5 h-px bg-white/10 my-0.5" />

          {/* Sidebar Toggle Icon */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Ajustes de Cámara y Dron"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors bg-white/20 text-white shadow-inner backdrop-blur-md"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir Menú' : 'Colapsar Menú'}
          className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-neutral-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Menu Panel */}
      {!isCollapsed && (
        <div className="flex-1 bg-[#091322]/40 backdrop-blur-3xl rounded-r-2xl ml-[-8px] pl-4 pr-3.5 py-4 flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.45)] overflow-y-auto custom-scrollbar space-y-4">
          {/* Header with Title and Flight State Dot */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-xs font-bold text-white tracking-wider uppercase drop-shadow-sm">
              Ajustes de Cámara
            </h3>

            {/* Flight Motor State Dot */}
            <div
              className="flex items-center gap-2"
              title={isRunning ? 'Rotores Armados (En Vuelo)' : 'Dron en Reposo'}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isRunning
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse'
                    : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                }`}
              />
            </div>
          </div>

          {/* 1. Camera Views */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'isometric', label: 'Isométrica (3/4)' },
              { id: 'front-gimbal', label: 'Cámara Gimbal' },
              { id: 'top-rotors', label: 'Superior Hélices' },
              { id: 'bottom-sensors', label: 'Sensores VPS' },
              { id: 'rear-battery', label: 'Batería LiPo' },
              { id: 'motor-detail', label: 'Detalle Motor' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => onChangeCameraPreset(cam.id as DroneCameraPreset)}
                className={`p-2.5 rounded-xl text-left truncate text-xs transition-all backdrop-blur-md ${
                  cameraPreset === cam.id
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'bg-white/[0.06] text-neutral-200 hover:text-white hover:bg-white/[0.14]'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* 2. Explosionar */}
          <div className="bg-white/[0.06] backdrop-blur-md p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-200 font-semibold">
                Explosionar
              </span>
              <span className="text-xs font-mono font-bold text-white tabular-nums">
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
              className="w-full h-1.5 bg-white/20 rounded-lg accent-white cursor-pointer"
              title="Separación de componentes del dron"
            />
          </div>

          {/* 3. Material Finish Modes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-neutral-200 uppercase tracking-wider block px-0.5">
              Modelo
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onChangeMaterialMode('dji-white')}
                className={`p-2.5 rounded-xl text-left text-xs transition-all backdrop-blur-md ${
                  materialMode === 'dji-white'
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'bg-white/[0.06] text-neutral-200 hover:text-white hover:bg-white/[0.14]'
                }`}
              >
                <span>Blanco DJI</span>
              </button>

              <button
                onClick={() => onChangeMaterialMode('stealth-dark')}
                className={`p-2.5 rounded-xl text-left text-xs transition-all backdrop-blur-md ${
                  materialMode === 'stealth-dark'
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'bg-white/[0.06] text-neutral-200 hover:text-white hover:bg-white/[0.14]'
                }`}
              >
                <span>Gris Stealth</span>
              </button>

              <button
                onClick={() => onChangeMaterialMode('blueprint')}
                className={`p-2.5 rounded-xl text-left text-xs transition-all backdrop-blur-md ${
                  materialMode === 'blueprint'
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'bg-white/[0.06] text-neutral-200 hover:text-white hover:bg-white/[0.14]'
                }`}
              >
                <span>Plano Mecánico</span>
              </button>

              <button
                onClick={() => onChangeMaterialMode('thermal')}
                className={`p-2.5 rounded-xl text-left text-xs transition-all backdrop-blur-md ${
                  materialMode === 'thermal'
                    ? 'bg-white text-black font-semibold shadow-lg'
                    : 'bg-white/[0.06] text-neutral-200 hover:text-white hover:bg-white/[0.14]'
                }`}
              >
                <span>Mapa Térmico</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
