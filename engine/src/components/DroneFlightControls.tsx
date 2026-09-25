import React from 'react';
import { DroneFlightPreset } from '../types/drone';
import {
  Power,
  Volume2,
  VolumeX,
  Gauge,
  Wind,
  Navigation,
  Compass,
  Radio
} from 'lucide-react';

export const DRONE_FLIGHT_PRESETS: DroneFlightPreset[] = [
  {
    id: 'landing-pad',
    name: 'Reposo / Helipad',
    badge: '0 RPM',
    desc: 'Motores en espera sobre plataforma de despegue',
    rotorRpm: 0,
    throttle: 0,
    altitude: 0,
    speed: 0
  },
  {
    id: 'stable-hover',
    name: 'Hover Estable',
    badge: '5,800 RPM',
    desc: 'Vuelo estacionario con posicionamiento por satélite y VPS',
    rotorRpm: 5800,
    throttle: 42,
    altitude: 12.5,
    speed: 0.2
  },
  {
    id: 'cinematic',
    name: 'Modo Cine',
    badge: '7,400 RPM',
    desc: 'Desplazamiento suave para grabación cinematográfica fluida',
    rotorRpm: 7400,
    throttle: 55,
    altitude: 45.0,
    speed: 4.0
  },
  {
    id: 'sport-max',
    name: 'Modo Sport',
    badge: '13,200 RPM',
    desc: 'Máxima aceleración e inclinación a 13 m/s con 4x brushless',
    rotorRpm: 13200,
    throttle: 95,
    altitude: 120.0,
    speed: 13.0
  },
  {
    id: 'rth',
    name: 'Retorno a Casa (RTH)',
    badge: '8,200 RPM',
    desc: 'Ascenso a altura de seguridad y navegación autónoma al punto HOME',
    rotorRpm: 8200,
    throttle: 65,
    altitude: 50.0,
    speed: 8.5
  }
];

interface DroneFlightControlsProps {
  isRunning: boolean;
  onTogglePower: () => void;
  throttlePercent: number;
  onChangeThrottle: (val: number) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: DroneFlightPreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (val: number) => void;
}

export const DroneFlightControls: React.FC<DroneFlightControlsProps> = ({
  isRunning,
  onTogglePower,
  throttlePercent,
  onChangeThrottle,
  activePresetId,
  onSelectPreset,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4.5 flex flex-col gap-4 select-none shadow-2xl">
      {/* Top Bar: Flight Master Arm & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.12]">
        {/* Arming / Ignition Master Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePower}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-neutral-800/80 text-neutral-200 border border-white/10 hover:bg-neutral-800'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            <Power className={`w-4 h-4 ${isRunning ? 'text-emerald-400' : 'text-black'}`} />
            <span>{isRunning ? 'PARADA DE MOTORES' : 'ARMAR Y DESPEGAR'}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-neutral-300">
              {isRunning ? 'ROTORES EN MARCHA' : 'DESARMADO'}
            </span>
          </div>
        </div>

        {/* Audio Sound FX Engine Controls */}
        <div className="flex items-center gap-2 bg-white/[0.06] px-3 py-1.5 rounded-xl border border-white/10">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Activar Sonido Rotores' : 'Silenciar'}
            className="p-1 text-neutral-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-white bg-white/20 rounded cursor-pointer"
            title="Volumen del audio aeroespacial"
          />
          <span className="text-[10px] font-mono text-neutral-400 w-7 text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Flight Presets Row */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-300" />
          <span>Modos de Vuelo & Perfiles de Misión</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {DRONE_FLIGHT_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'glass-pill-active scale-[1.02]'
                    : 'glass-card-interactive'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                </div>
                <div
                  className={`text-[10px] font-mono mt-0.5 ${
                    isSelected ? 'text-neutral-800 font-semibold' : 'text-cyan-300'
                  }`}
                >
                  {preset.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Throttle Interactive Slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Throttle (Acelerador / Potencia de Rotores) */}
        <div className="glass-card p-3.5 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
              <Gauge className="w-4 h-4 text-cyan-300" />
              <span>Acelerador / Throttle</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-white tabular-nums">
                {throttlePercent}%
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={throttlePercent}
            onChange={(e) => onChangeThrottle(parseInt(e.target.value, 10))}
            className="w-full h-2 accent-white bg-white/10 rounded-lg cursor-pointer"
            title="Control continuo de empuje y potencia de los 4 rotores"
          />

          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>0% Ralentí</span>
            <span>45% Hover</span>
            <span>100% Sport</span>
          </div>
        </div>

        {/* Flight Navigation Quick Stats */}
        <div className="glass-card p-3.5 rounded-xl flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>OcuSync 2.0</span>
            </div>
            <div className="text-sm font-mono font-bold text-white mt-1">98% / HD</div>
            <div className="text-[10px] text-emerald-400 font-mono">Señal Óptima</div>
          </div>

          <div className="w-px h-10 bg-white/10" />

          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Compass className="w-3 h-3 text-cyan-300" />
              <span>GPS / GLONASS</span>
            </div>
            <div className="text-sm font-mono font-bold text-white mt-1">18 Satélites</div>
            <div className="text-[10px] text-cyan-300 font-mono">Precisión ±0.1m</div>
          </div>

          <div className="w-px h-10 bg-white/10" />

          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Wind className="w-3 h-3 text-amber-400" />
              <span>Resistencia Viento</span>
            </div>
            <div className="text-sm font-mono font-bold text-white mt-1">8.0 m/s</div>
            <div className="text-[10px] text-amber-400 font-mono">Escala 4 Beaufort</div>
          </div>
        </div>
      </div>
    </div>
  );
};
