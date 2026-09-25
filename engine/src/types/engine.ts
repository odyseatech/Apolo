export type EngineMaterialMode = 'reference-gray' | 'blueprint' | 'thermal';

export type ThermalPalette = 'rainbow' | 'ironbow' | 'lava';

export type CameraViewPreset = 'isometric' | 'turbo' | 'flywheel' | 'filters' | 'front-fan' | 'top-valves';

export interface PerformanceMetrics {
  rpm: number;
  targetRpm: number;
  loadPercent: number;
  torqueNm: number;
  torqueLbFt: number;
  powerHp: number;
  powerKw: number;
  turboBoostPsi: number;
  turboBoostBar: number;
  turboRpm: number;
  egtCelsius: number;
  oilPressurePsi: number;
  coolantTempCelsius: number;
  fuelRateLitersPerHour: number;
  bsfcGramsPerKwh: number;
  airflowCfm: number;
  thermalEfficiencyPercent: number;
  vibrationLevelMmS: number;
}

export interface EnginePreset {
  id: string;
  name: string;
  description: string;
  rpm: number;
  load: number;
  category: string;
}

export interface SubsystemComponent {
  id: string;
  name: string;
  englishName: string;
  category: 'induction' | 'fuel' | 'structural' | 'exhaust' | 'cooling' | 'electrical';
  position: [number, number, number]; // 3D coordinates for hotspot
  explodeOffset: [number, number, number]; // translation vector for exploded view
  summary: string;
  details: string[];
  specs: { label: string; value: string }[];
  maintenance: string;
  criticalTempOrPressure?: string;
  partNumber: string;
}

export interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'normal' | 'warning' | 'critical';
  system: string;
  action: string;
}
