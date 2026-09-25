import React from 'react';
import { EnginePreset } from '../types/engine';
import { ENGINE_PRESETS } from '../data/engineSubsystems';
import {
  Power,
  Volume2,
  VolumeX,
  Gauge
} from 'lucide-react';

interface EngineDynoControlsProps {
  isRunning: boolean;
  onTogglePower: () => void;
  targetRpm: number;
  onChangeTargetRpm: (rpm: number) => void;
  loadPercent: number;
  onChangeLoad: (load: number) => void;
  activePresetId: string | null;
  onSelectPreset: (preset: EnginePreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
}

export const EngineDynoControls: React.FC<EngineDynoControlsProps> = ({
  isRunning,
  onTogglePower,
  targetRpm,
  onChangeTargetRpm,
  loadPercent,
  onChangeLoad,
  activePresetId,
  onSelectPreset,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume
}) => {
  return (
    <div className="bg-[#091322]/40 backdrop-blur-3xl rounded-2xl p-4.5 flex flex-col gap-4 select-none border border-white/10">
      {/* Top Bar: Ignition & Operating Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        {/* Ignition Master Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePower}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors ${
              isRunning
                ? 'bg-white/[0.08] hover:bg-white/[0.16] text-neutral-200 border border-white/10'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isRunning ? 'DETENER MOTOR' : 'ARRANCAR MOTOR'}</span>
          </button>

          {/* Engine Status Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-400' : 'bg-neutral-500'
              }`}
            />
            <span className="font-mono text-neutral-300 text-[11px]">
              {isRunning ? 'EN FUNCIONAMIENTO' : 'PARADO'}
            </span>
          </div>
        </div>

        {/* Audio Synthesizer Volume Controls */}
        <div className="flex items-center gap-2 bg-white/[0.04] px-2.5 py-1.5 rounded-lg">
          <button
            onClick={onToggleMute}
            className="text-neutral-400 hover:text-white transition-colors"
            title={isMuted ? 'Activar sonido de motor diésel' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg"
            title="Volumen del sonido diésel"
          />
          <span className="text-[10px] font-mono text-neutral-400 w-7 text-right">
            {isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Primary Throttle & Dynamometer Load Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Throttle (Acelerador) */}
        <div className="bg-white/[0.04] rounded-xl p-3.5 flex flex-col gap-2 border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <Gauge className="w-3.5 h-3.5 text-neutral-400" />
              <span>Acelerador (RPM)</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <button
                disabled={!isRunning}
                onClick={() => onChangeTargetRpm(Math.max(600, targetRpm - 50))}
                className="w-5 h-5 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] disabled:opacity-40 text-xs rounded text-white transition-colors"
              >
                -
              </button>
              <span className="text-sm font-bold text-white px-1.5 min-w-[65px] text-center tabular-nums">
                {targetRpm} RPM
              </span>
              <button
                disabled={!isRunning}
                onClick={() => onChangeTargetRpm(Math.min(2200, targetRpm + 50))}
                className="w-5 h-5 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] disabled:opacity-40 text-xs rounded text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <input
            type="range"
            min="600"
            max="2200"
            step="25"
            disabled={!isRunning}
            value={targetRpm}
            onChange={(e) => onChangeTargetRpm(parseInt(e.target.value, 10))}
            className="w-full accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg disabled:opacity-40"
          />

          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>600 Ralentí</span>
            <span>1200 Par Máx</span>
            <span>1800 Nominal</span>
            <span>2200 Gobernador</span>
          </div>
        </div>

        {/* Dynamometer Waterbrake Load */}
        <div className="bg-white/[0.04] rounded-xl p-3.5 flex flex-col gap-2 border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <Gauge className="w-3.5 h-3.5 text-neutral-400" />
              <span>Carga del Dinamómetro</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <button
                disabled={!isRunning}
                onClick={() => onChangeLoad(Math.max(0, loadPercent - 5))}
                className="w-5 h-5 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] disabled:opacity-40 text-xs rounded text-white transition-colors"
              >
                -
              </button>
              <span className="text-sm font-bold text-white px-1.5 min-w-[50px] text-center tabular-nums">
                {loadPercent}%
              </span>
              <button
                disabled={!isRunning}
                onClick={() => onChangeLoad(Math.min(100, loadPercent + 5))}
                className="w-5 h-5 flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.16] disabled:opacity-40 text-xs rounded text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            disabled={!isRunning}
            value={loadPercent}
            onChange={(e) => onChangeLoad(parseInt(e.target.value, 10))}
            className="w-full accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg disabled:opacity-40"
          />

          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>0% Sin Carga</span>
            <span>50% Media</span>
            <span>75% Dyno</span>
            <span>100% Plena Carga</span>
          </div>
        </div>
      </div>

      {/* Quick Operating Condition Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-300 font-medium">
          Regímenes de Operación Calibrados:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ENGINE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 rounded-xl text-left transition-colors ${
                  isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] text-neutral-300 border border-white/[0.06]'
                }`}
              >
                <div className={`text-xs font-semibold truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                  {preset.name}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                  {preset.rpm} RPM · {preset.load}%
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
