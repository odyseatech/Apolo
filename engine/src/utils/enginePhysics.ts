import { PerformanceMetrics } from '../types/engine';

// Caterpillar C15 ACERT Heavy Duty Industrial Engine Specifications
// Displacement: 15.2 L (928 cu in)
// Inline 6-Cylinder 4-Stroke Diesel
// Bore x Stroke: 137.2 mm x 171.4 mm
// Compression Ratio: 18.0:1

export const MAX_ENGINE_RPM = 2200;
export const IDLE_ENGINE_RPM = 650;
export const RATED_ENGINE_RPM = 1800;

export function calculateMaxTorqueAtRpm(rpm: number): number {
  if (rpm < 500) return 600;
  // Caterpillar C15 torque curve:
  // 600 - 1000 RPM: Rising steeply from 1600 to 2600 Nm
  // 1200 - 1420 RPM: Peak torque plateau at ~2779 Nm (2050 lb-ft)
  // 1500 - 1800 RPM: Gracefully tapering down from 2650 to 2470 Nm
  // 1800 - 2100 RPM: 2470 to 2000 Nm
  // 2100 - 2200 RPM: Governing cutoff drop to 1600 Nm
  if (rpm <= 1000) {
    const t = (rpm - 600) / 400;
    return 1650 + (2600 - 1650) * Math.sin(t * (Math.PI / 2));
  } else if (rpm <= 1400) {
    const t = (rpm - 1000) / 400;
    return 2600 + (2779 - 2600) * Math.sin(t * (Math.PI / 2));
  } else if (rpm <= 1800) {
    const t = (rpm - 1400) / 400;
    return 2779 - (2779 - 2470) * (t * t);
  } else {
    const t = (rpm - 1800) / 400;
    return 2470 - (2470 - 1600) * Math.sqrt(Math.min(1, Math.max(0, t)));
  }
}

export function calculateMaxHpAtRpm(rpm: number): number {
  const maxTorqueNm = calculateMaxTorqueAtRpm(rpm);
  // HP = (Torque in Nm * RPM) / 7127
  return (maxTorqueNm * rpm) / 7127;
}

export function generateDynoCurvePoints(): Array<{ rpm: number; torqueNm: number; powerHp: number }> {
  const points: Array<{ rpm: number; torqueNm: number; powerHp: number }> = [];
  for (let r = 600; r <= 2200; r += 50) {
    const maxTorque = calculateMaxTorqueAtRpm(r);
    const maxHp = (maxTorque * r) / 7127;
    points.push({
      rpm: r,
      torqueNm: Math.round(maxTorque),
      powerHp: Math.round(maxHp)
    });
  }
  return points;
}

export function computeLiveMetrics(
  currentRpm: number,
  targetRpm: number,
  loadPercent: number,
  prevMetrics?: PerformanceMetrics,
  deltaSec: number = 0.05
): PerformanceMetrics {
  const isRunning = currentRpm > 100;
  
  if (!isRunning) {
    return {
      rpm: 0,
      targetRpm: 0,
      loadPercent: 0,
      torqueNm: 0,
      torqueLbFt: 0,
      powerHp: 0,
      powerKw: 0,
      turboBoostPsi: 0,
      turboBoostBar: 0,
      turboRpm: 0,
      egtCelsius: 24,
      oilPressurePsi: 0,
      coolantTempCelsius: 24,
      fuelRateLitersPerHour: 0,
      bsfcGramsPerKwh: 0,
      airflowCfm: 0,
      thermalEfficiencyPercent: 0,
      vibrationLevelMmS: 0
    };
  }

  const effectiveLoad = Math.max(0.05, Math.min(1.0, loadPercent / 100));
  const maxTorqueAtRpm = calculateMaxTorqueAtRpm(currentRpm);

  // Dynamic Torque based on load
  const frictionTorque = 120 + (currentRpm / 2200) * 180;
  const grossTorque = maxTorqueAtRpm * (0.15 + 0.85 * effectiveLoad);
  const netTorque = Math.max(frictionTorque, grossTorque);
  const torqueLbFt = netTorque * 0.737562;

  // Power
  const powerHp = (netTorque * currentRpm) / 7127;
  const powerKw = powerHp * 0.7457;

  // Turbocharger boost with realistic spool lag simulation
  // Max boost is ~38.5 PSI at high RPM and high load
  const targetBoostPsi = (Math.pow(currentRpm / 2000, 1.6) * Math.pow(effectiveLoad, 1.3) * 38.5);
  const prevBoost = prevMetrics ? prevMetrics.turboBoostPsi : 0;
  const spoolSpeed = 3.5; // spool response rate
  const turboBoostPsi = Math.max(0, prevBoost + (targetBoostPsi - prevBoost) * Math.min(1, deltaSec * spoolSpeed));
  const turboBoostBar = turboBoostPsi * 0.0689476;
  const turboRpm = Math.round(20000 + (turboBoostPsi / 38.5) * 88000);

  // Exhaust Gas Temperature (EGT)
  // 180°C at idle, reaching up to 680-720°C under maximum sustained load
  const targetEgt = 180 + Math.pow(effectiveLoad, 1.1) * 460 + (currentRpm / 2200) * 80;
  const prevEgt = prevMetrics ? prevMetrics.egtCelsius : 200;
  const thermalLag = 0.8;
  const egtCelsius = prevEgt + (targetEgt - prevEgt) * Math.min(1, deltaSec * thermalLag);

  // Oil Pressure (mechanical gear pump driven by crankshaft)
  // 28-32 psi at idle up to 68-72 psi at high RPM
  const oilPressurePsi = 26 + (currentRpm / 2200) * 42 + (Math.sin(Date.now() / 300) * 0.8);

  // Coolant Temperature
  const targetCoolant = 84 + (effectiveLoad * 11) + ((currentRpm - 650) / 1550) * 4;
  const prevCoolant = prevMetrics ? prevMetrics.coolantTempCelsius : 85;
  const coolantTempCelsius = prevCoolant + (targetCoolant - prevCoolant) * Math.min(1, deltaSec * 0.2);

  // Fuel Flow (L/hour)
  // Base idle fuel + power-derived fuel
  const baseIdleFuel = 3.2; // L/h at 650 RPM
  const loadFuel = (powerHp * 0.178) * effectiveLoad;
  const fuelRateLitersPerHour = Math.max(2.8, baseIdleFuel + loadFuel);

  // BSFC (Brake Specific Fuel Consumption in g/kWh)
  // Diesel sweet spot is around 198-210 g/kWh at 1200-1500 RPM with 70-85% load
  const bsfcBase = 205;
  const rpmPenalty = Math.abs(currentRpm - 1350) / 1000 * 25;
  const loadPenalty = Math.pow(1 - effectiveLoad, 2) * 60;
  const bsfcGramsPerKwh = Math.round(bsfcBase + rpmPenalty + loadPenalty);

  // Airflow in CFM (15.2 L engine)
  const atmosphericCfm = (15.2 * 61.0237 * currentRpm) / (2 * 1728) * 0.88;
  const airflowCfm = Math.round(atmosphericCfm * (1 + turboBoostPsi / 14.7));

  // Thermal Efficiency
  const thermalEfficiencyPercent = Math.min(44.5, Math.max(26.0, 42.0 - (bsfcGramsPerKwh - 200) * 0.15));

  // Vibration Level (mm/s RMS)
  const vibrationLevelMmS = 1.2 + (currentRpm / 2200) * 3.8 + (effectiveLoad * 2.2) + Math.random() * 0.3;

  return {
    rpm: currentRpm,
    targetRpm,
    loadPercent,
    torqueNm: Math.round(netTorque),
    torqueLbFt: Math.round(torqueLbFt),
    powerHp: Math.round(powerHp),
    powerKw: Math.round(powerKw),
    turboBoostPsi: parseFloat(turboBoostPsi.toFixed(1)),
    turboBoostBar: parseFloat(turboBoostBar.toFixed(2)),
    turboRpm,
    egtCelsius: Math.round(egtCelsius),
    oilPressurePsi: Math.round(oilPressurePsi),
    coolantTempCelsius: Math.round(coolantTempCelsius),
    fuelRateLitersPerHour: parseFloat(fuelRateLitersPerHour.toFixed(1)),
    bsfcGramsPerKwh,
    airflowCfm,
    thermalEfficiencyPercent: parseFloat(thermalEfficiencyPercent.toFixed(1)),
    vibrationLevelMmS: parseFloat(vibrationLevelMmS.toFixed(1))
  };
}
