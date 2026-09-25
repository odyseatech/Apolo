import React from 'react';
import { DroneTelemetryMetrics } from '../types/drone';
import {
  Gauge,
  Zap,
  BatteryCharging,
  Wind,
  Activity,
  Compass,
  ArrowUp,
  Thermometer,
  ShieldCheck
} from 'lucide-react';

interface DroneTelemetryGaugesProps {
  metrics: DroneTelemetryMetrics;
  isRunning: boolean;
}

export const DroneTelemetryGauges: React.FC<DroneTelemetryGaugesProps> = ({ metrics, isRunning }) => {
  const {
    rotorRpm,
    throttlePercent,
    altitudeMeters,
    speedMs,
    verticalSpeedMs,
    batteryPercent,
    batteryVoltageVolts,
    currentDrawAmps,
    powerWatts,
    thrustGrams,
    flightTimeSeconds,
    gpsSatellites,
    signalOcuSyncPercent,
    motorTempCelsius,
    opticalFlowHealth
  } = metrics;

  // Arc calculation for circular tachometer
  const rpmPercent = Math.min(100, (rotorRpm / 14000) * 100);

  const getFlightStatus = () => {
    if (!isRunning || rotorRpm === 0) return { label: 'Motores Desarmados (En Reposo)', color: 'text-neutral-400' };
    if (throttlePercent < 30) return { label: 'Ralentí Pre-Vuelo (Armado)', color: 'text-neutral-200' };
    if (throttlePercent <= 65) return { label: 'Vuelo Estacionario Nominal', color: 'text-cyan-300' };
    return { label: 'Máxima Potencia Modo Sport', color: 'text-amber-300' };
  };

  const statusInfo = getFlightStatus();

  return (
    <div className="space-y-3 select-none">
      {/* Primary Tier: 3 High-Impact Key Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Tacómetro 4x Rotores Brushless */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-medium">
              <Gauge className="w-4 h-4 text-cyan-300" />
              <span>Tacómetro 4x Rotores</span>
            </div>
            <span className={`text-[10px] font-mono font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center justify-around my-2.5">
            {/* Circular Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  className="stroke-white/10"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  className="transition-all duration-300 stroke-cyan-400"
                  strokeWidth="7"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * rpmPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-mono font-bold text-white tracking-tight tabular-nums">
                  {Math.round(rotorRpm).toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">RPM</span>
              </div>
            </div>

            {/* Thrust Output readout */}
            <div className="flex flex-col gap-1 text-right">
              <div className="text-[10px] text-neutral-400 uppercase">Empuje Total</div>
              <div className="text-lg font-mono font-bold text-white tabular-nums">
                {Math.round(thrustGrams)} <span className="text-xs text-cyan-300 font-normal">g</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                Ratio T/W: {(thrustGrams / 249).toFixed(2)}x
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-neutral-400 border-t border-white/[0.08] pt-2 font-mono">
            <span>0 RPM</span>
            <span>7,000 RPM</span>
            <span>14,000 RPM (Pico)</span>
          </div>
        </div>

        {/* 2. Altímetro & Velocidad de Vuelo */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-medium">
              <ArrowUp className="w-4 h-4 text-emerald-400" />
              <span>Cinemática & Altitud</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-semibold">
              Barómetro + GPS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-[10px] text-neutral-400 uppercase">Altitud Relativa</div>
              <div className="text-xl font-mono font-bold text-white tabular-nums mt-0.5">
                {altitudeMeters.toFixed(1)} <span className="text-xs text-emerald-400 font-normal">m</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                {(altitudeMeters * 3.28084).toFixed(0)} ft AGL
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-[10px] text-neutral-400 uppercase">Velocidad Vuelo</div>
              <div className="text-xl font-mono font-bold text-white tabular-nums mt-0.5">
                {speedMs.toFixed(1)} <span className="text-xs text-cyan-300 font-normal">m/s</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                {(speedMs * 3.6).toFixed(1)} km/h
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-neutral-400 border-t border-white/[0.08] pt-2 font-mono">
            <span>V. Vertical: {verticalSpeedMs > 0 ? `+${verticalSpeedMs.toFixed(1)}` : verticalSpeedMs.toFixed(1)} m/s</span>
            <span>Distancia Home: {(altitudeMeters * 1.4).toFixed(0)} m</span>
          </div>
        </div>

        {/* 3. Batería Inteligente LiPo & Potencia Eléctrica */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-medium">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span>Batería Inteligente LiPo</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              2S 2400mAh
            </span>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                {Math.round(batteryPercent)}<span className="text-sm text-neutral-300 font-normal">%</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                {batteryVoltageVolts.toFixed(2)} V • {currentDrawAmps.toFixed(1)} A
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-mono font-bold text-cyan-300 tabular-nums">
                {powerWatts.toFixed(0)} <span className="text-xs text-neutral-300 font-normal">W</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                Consumo Instantáneo
              </div>
            </div>
          </div>

          {/* Battery Level Progress Bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                batteryPercent > 30 ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
              style={{ width: `${batteryPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-neutral-400 border-t border-white/[0.08] pt-2 font-mono mt-2">
            <span>Autonomía: {Math.max(0, Math.floor((30 * batteryPercent) / 100))} min</span>
            <span>T. Vuelo: {Math.floor(flightTimeSeconds / 60)}m {flightTimeSeconds % 60}s</span>
          </div>
        </div>
      </div>

      {/* Secondary Tier: 4 Individual Brushless Motors & Health Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { pos: 'FL (Frontal Izq)', dir: 'CW', temp: motorTempCelsius + 1.2, thrust: thrustGrams * 0.25 },
          { pos: 'FR (Frontal Der)', dir: 'CCW', temp: motorTempCelsius - 0.8, thrust: thrustGrams * 0.25 },
          { pos: 'RL (Trasero Izq)', dir: 'CCW', temp: motorTempCelsius + 0.4, thrust: thrustGrams * 0.25 },
          { pos: 'RR (Trasero Der)', dir: 'CW', temp: motorTempCelsius - 0.2, thrust: thrustGrams * 0.25 }
        ].map((motor, idx) => (
          <div key={idx} className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-neutral-300 font-semibold">
              <span className="truncate">{motor.pos}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                {motor.dir}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-mono font-bold text-white tabular-nums">
                {Math.round(motor.thrust)}g
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {motor.temp.toFixed(1)}°C
              </span>
            </div>

            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${rpmPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
