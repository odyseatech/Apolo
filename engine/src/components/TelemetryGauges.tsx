import React from 'react';
import { PerformanceMetrics } from '../types/engine';
import { Gauge, Zap, Flame, Droplets, Wind, Activity, Fuel, Thermometer, ShieldCheck } from 'lucide-react';

interface TelemetryGaugesProps {
  metrics: PerformanceMetrics;
  isRunning: boolean;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({ metrics, isRunning }) => {
  const {
    rpm,
    powerHp,
    powerKw,
    torqueNm,
    torqueLbFt,
    turboBoostPsi,
    turboBoostBar,
    turboRpm,
    egtCelsius,
    oilPressurePsi,
    coolantTempCelsius,
    fuelRateLitersPerHour,
    thermalEfficiencyPercent,
    bsfcGramsPerKwh
  } = metrics;

  // Arc calculation for circular tachometer
  const rpmPercent = Math.min(100, (rpm / 2400) * 100);
  const boostPercent = Math.min(100, (turboBoostPsi / 40) * 100);
  const egtPercent = Math.min(100, Math.max(0, ((egtCelsius - 100) / 650) * 100));

  const getRpmZone = () => {
    if (!isRunning || rpm === 0) return { label: 'Motor Detenido', color: 'text-neutral-500' };
    if (rpm < 800) return { label: 'Ralentí Bajo (650 RPM)', color: 'text-neutral-300' };
    if (rpm <= 1500) return { label: 'Zona Par Máximo (Pico 2,779 Nm)', color: 'text-emerald-400' };
    if (rpm <= 1900) return { label: 'Rango Potencia Nominal (625 HP)', color: 'text-amber-400' };
    return { label: 'Límite Gobernador / Alta', color: 'text-red-400' };
  };

  const zoneInfo = getRpmZone();

  return (
    <div className="space-y-3 select-none">
      {/* Primary Tier: 3 High-Impact Key Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Tacómetro Digital & Régimen */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <Gauge className="w-4 h-4 text-white" />
              <span>Tacómetro Principal</span>
            </div>
            <span className={`text-[10px] font-mono font-semibold ${zoneInfo.color}`}>
              {zoneInfo.label}
            </span>
          </div>

          <div className="flex items-center justify-around my-2.5">
            {/* Circular Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="188 63"
                  className="text-neutral-800/80"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={`${(rpmPercent / 100) * 188} 250`}
                  strokeLinecap="round"
                  className="text-white transition-all duration-150"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
                  {isRunning ? rpm : 0}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">RPM</span>
              </div>
            </div>

            {/* Quick Calibration Markers */}
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between gap-4 text-neutral-400">
                <span className="text-[11px]">Ralentí:</span>
                <span className="text-neutral-200">650 RPM</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-neutral-400">
                <span className="text-[11px]">Par Máx:</span>
                <span className="text-emerald-400 font-bold">1,200 RPM</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-neutral-400">
                <span className="text-[11px]">Potencia:</span>
                <span className="text-amber-400 font-bold">1,800 RPM</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-neutral-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150 rounded-full"
              style={{ width: `${rpmPercent}%` }}
            />
          </div>
        </div>

        {/* 2. Rendimiento Mecánico: Potencia & Par Motor */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <Zap className="w-4 h-4 text-white" />
              <span>Potencia y Par al Freno</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{thermalEfficiencyPercent}% Efic. Térmica</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Potencia */}
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 font-medium block">POTENCIA</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {isRunning ? powerHp : 0}
                </span>
                <span className="text-xs font-mono text-neutral-400">HP</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 tabular-nums block mt-0.5">
                {isRunning ? powerKw : 0} kW
              </span>
            </div>

            {/* Par Motor */}
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 font-medium block">PAR MOTOR</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {isRunning ? torqueNm.toLocaleString() : 0}
                </span>
                <span className="text-xs font-mono text-neutral-400">Nm</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 tabular-nums block mt-0.5">
                {isRunning ? torqueLbFt.toLocaleString() : 0} lb·ft
              </span>
            </div>
          </div>

          {/* Combined Output Bar */}
          <div className="w-full bg-neutral-800/60 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-white transition-all duration-150"
              style={{ width: `${Math.min(100, (powerHp / 625) * 100)}%` }}
            />
          </div>
        </div>

        {/* 3. Sobrealimentación & Térmica: Turbo Boost & EGT */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
              <Wind className="w-4 h-4 text-white" />
              <span>Turbo Boost & Gases Escape</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              Turbina: {isRunning ? `${(turboRpm / 1000).toFixed(0)}k RPM` : '0k'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Boost */}
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 font-medium block">PRESIÓN BOOST</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {isRunning ? turboBoostPsi.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs font-mono text-neutral-400">PSI</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 tabular-nums block mt-0.5">
                {isRunning ? turboBoostBar.toFixed(2) : '0.00'} bar
              </span>
            </div>

            {/* EGT */}
            <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 font-medium block">TEMP. EGT</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {isRunning ? egtCelsius : 24}
                </span>
                <span className="text-xs font-mono text-neutral-400">°C</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 tabular-nums block mt-0.5">
                {isRunning ? Math.round(egtCelsius * 1.8 + 32) : 75} °F
              </span>
            </div>
          </div>

          {/* Boost / EGT Safety Meter */}
          <div className="w-full bg-neutral-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150 rounded-full"
              style={{ width: `${boostPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Tier: 4 Compact Vital Fluid & Mechanical Monitors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Presión de Aceite */}
        <div className="glass-card rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900/80 flex items-center justify-center text-neutral-300">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-medium block">Presión Aceite</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {isRunning ? oilPressurePsi : 0}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">PSI</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-white/[0.04]">
            {isRunning && oilPressurePsi > 30 ? 'NORMAL' : 'OK'}
          </span>
        </div>

        {/* Temperatura de Refrigerante */}
        <div className="glass-card rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900/80 flex items-center justify-center text-neutral-300">
              <Thermometer className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-medium block">Refrigerante</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {isRunning ? coolantTempCelsius : 24}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">°C</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-white/[0.04]">
            85-98°C
          </span>
        </div>

        {/* Flujo de Combustible */}
        <div className="glass-card rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900/80 flex items-center justify-center text-neutral-300">
              <Fuel className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-medium block">Flujo Diésel</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {isRunning ? fuelRateLitersPerHour : '0.0'}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">L/h</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-white/[0.04]">
            {bsfcGramsPerKwh} g/kWh
          </span>
        </div>

        {/* Inyección Diésel MEUI */}
        <div className="glass-card rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900/80 flex items-center justify-center text-neutral-300">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-medium block">Inyección MEUI-C</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {isRunning ? Math.round(18000 + (rpm / 2200) * 12000).toLocaleString() : 0}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">PSI</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-white/[0.04]">
            30k MAX
          </span>
        </div>
      </div>
    </div>
  );
};
