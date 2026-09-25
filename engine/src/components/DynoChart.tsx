import React, { useMemo } from 'react';
import { generateDynoCurvePoints } from '../utils/enginePhysics';

interface DynoChartProps {
  currentRpm: number;
  currentTorqueNm: number;
  currentPowerHp: number;
  isRunning: boolean;
}

export const DynoChart: React.FC<DynoChartProps> = ({
  currentRpm,
  currentTorqueNm,
  currentPowerHp,
  isRunning
}) => {
  const dynoPoints = useMemo(() => generateDynoCurvePoints(), []);

  // Dimensions
  const width = 640;
  const height = 260;
  const padding = { top: 28, right: 55, bottom: 38, left: 60 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // X scale: RPM from 600 to 2200
  const minRpm = 600;
  const maxRpm = 2200;
  const getX = (rpm: number) => padding.left + ((rpm - minRpm) / (maxRpm - minRpm)) * graphWidth;

  // Y1 scale: Torque (0 to 3000 Nm)
  const maxTorque = 3000;
  const getYTorque = (torque: number) => padding.top + graphHeight - (torque / maxTorque) * graphHeight;

  // Y2 scale: Power (0 to 700 HP)
  const maxHp = 700;
  const getYHp = (hp: number) => padding.top + graphHeight - (hp / maxHp) * graphHeight;

  // SVG Paths
  const torquePath = useMemo(() => {
    return dynoPoints.reduce((acc, pt, i) => {
      const x = getX(pt.rpm);
      const y = getYTorque(pt.torqueNm);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [dynoPoints]);

  const powerPath = useMemo(() => {
    return dynoPoints.reduce((acc, pt, i) => {
      const x = getX(pt.rpm);
      const y = getYHp(pt.powerHp);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [dynoPoints]);

  // Torque fill area
  const torqueAreaPath = useMemo(() => {
    const baselineY = padding.top + graphHeight;
    const startX = getX(minRpm);
    const endX = getX(maxRpm);
    return `${torquePath} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
  }, [torquePath]);

  // Current Operating Coordinate
  const curX = getX(Math.max(minRpm, Math.min(maxRpm, currentRpm)));
  const curYTorque = getYTorque(currentTorqueNm);
  const curYHp = getYHp(currentPowerHp);

  return (
    <div className="bg-[#091322]/40 backdrop-blur-3xl rounded-2xl p-4.5 flex flex-col justify-between select-none border border-white/10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <h4 className="text-xs font-bold text-white tracking-wider uppercase">
            Curvas de Rendimiento (Dinamómetro)
          </h4>
          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Caterpillar C15 ACERT Industrial · 15.2L I-6
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-neutral-400 rounded-full" />
            <span className="text-neutral-300">Torque (Nm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-white rounded-full" />
            <span className="text-white font-semibold">Potencia (HP)</span>
          </div>
          {isRunning && (
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Operando</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Dyno Graph */}
      <div className="relative w-full overflow-hidden my-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="monoTorqueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and background */}
          {[600, 900, 1200, 1500, 1800, 2100].map((rpmVal) => {
            const x = getX(rpmVal);
            return (
              <g key={rpmVal}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + graphHeight}
                  stroke="#262626"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={padding.top + graphHeight + 16}
                  fill="#737373"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {rpmVal}
                </text>
              </g>
            );
          })}

          {/* Horizontal Grid lines */}
          {[0, 1000, 2000, 3000].map((tVal) => {
            const y = getYTorque(tVal);
            return (
              <g key={tVal}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#262626"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#a3a3a3"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tVal} Nm
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis (Horsepower) */}
          {[0, 200, 400, 600].map((hpVal) => {
            const y = getYHp(hpVal);
            return (
              <text
                key={hpVal}
                x={padding.left + graphWidth + 8}
                y={y + 3}
                fill="#ffffff"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="start"
              >
                {hpVal} HP
              </text>
            );
          })}

          {/* Highlight Peak Torque Zone (1200 - 1400 RPM) */}
          <rect
            x={getX(1200)}
            y={padding.top}
            width={getX(1400) - getX(1200)}
            height={graphHeight}
            fill="#ffffff"
            fillOpacity="0.03"
          />
          <text
            x={(getX(1200) + getX(1400)) / 2}
            y={padding.top + 12}
            fill="#a3a3a3"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
          >
            PAR MÁXIMO
          </text>

          {/* Highlight Rated Power Zone (1800 - 2100 RPM) */}
          <rect
            x={getX(1800)}
            y={padding.top}
            width={getX(2100) - getX(1800)}
            height={graphHeight}
            fill="#ffffff"
            fillOpacity="0.05"
          />
          <text
            x={(getX(1800) + getX(2100)) / 2}
            y={padding.top + 12}
            fill="#ffffff"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
          >
            POTENCIA NOMINAL
          </text>

          {/* Area Fill for Torque */}
          <path d={torqueAreaPath} fill="url(#monoTorqueGrad)" />

          {/* Torque Line Curve (Medium gray) */}
          <path
            d={torquePath}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Power Line Curve (Crisp solid white) */}
          <path
            d={powerPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Dynamic Operating Crosshair Indicator */}
          {isRunning && currentRpm >= minRpm && (
            <g className="transition-all duration-75">
              {/* Vertical RPM guideline */}
              <line
                x1={curX}
                y1={padding.top}
                x2={curX}
                y2={padding.top + graphHeight}
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.7"
              />

              {/* Point on Torque Curve */}
              <circle
                cx={curX}
                cy={curYTorque}
                r="5"
                fill="#9ca3af"
                stroke="#000000"
                strokeWidth="2"
              />

              {/* Point on Horsepower Curve */}
              <circle
                cx={curX}
                cy={curYHp}
                r="5"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2"
              />

              {/* Current operating label flag */}
              <g transform={`translate(${Math.min(curX, width - 140)}, ${Math.max(padding.top + 25, Math.min(curYHp, curYTorque) - 20)})`}>
                <rect
                  x="5"
                  y="-18"
                  width="125"
                  height="32"
                  rx="4"
                  fill="#000000"
                  stroke="#525252"
                  strokeWidth="1"
                />
                <text x="12" y="-4" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  {currentRpm} RPM · {currentPowerHp} HP
                </text>
                <text x="12" y="8" fill="#d4d4d4" fontSize="9" fontFamily="monospace">
                  {currentTorqueNm.toLocaleString()} Nm ({Math.round(currentTorqueNm * 0.737562)} lb·ft)
                </text>
              </g>
            </g>
          )}

          {/* X Axis label */}
          <text
            x={width / 2}
            y={height - 5}
            fill="#737373"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
          >
            Velocidad del Motor (RPM)
          </text>
        </svg>
      </div>

      {/* Footer Dyno Metrics Summary */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-xs">
        <div>
          <span className="text-neutral-400">Torque Máx: </span>
          <span className="font-semibold text-neutral-200 font-mono">2,779 Nm @ 1,200</span>
        </div>
        <div>
          <span className="text-neutral-400">Potencia Máx: </span>
          <span className="font-semibold text-white font-mono">625 HP @ 1,800-2,100</span>
        </div>
        <div>
          <span className="text-neutral-400">Gobernador: </span>
          <span className="font-semibold text-neutral-400 font-mono">2,150 - 2,200 RPM</span>
        </div>
      </div>
    </div>
  );
};
