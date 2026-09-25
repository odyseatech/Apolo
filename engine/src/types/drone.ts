export type DroneCameraPreset =
  | 'isometric'
  | 'front-gimbal'
  | 'top-rotors'
  | 'bottom-sensors'
  | 'rear-battery'
  | 'motor-detail';

export type DroneMaterialMode =
  | 'dji-white'
  | 'stealth-dark'
  | 'blueprint'
  | 'thermal';

export interface DroneTelemetryMetrics {
  rotorRpm: number;
  throttlePercent: number;
  altitudeMeters: number;
  speedMs: number;
  verticalSpeedMs: number;
  batteryPercent: number;
  batteryVoltageVolts: number;
  currentDrawAmps: number;
  powerWatts: number;
  thrustGrams: number;
  flightTimeSeconds: number;
  gpsSatellites: number;
  signalOcuSyncPercent: number;
  motorTempCelsius: number;
  opticalFlowHealth: number;
}

export interface DroneFlightPreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  rotorRpm: number;
  throttle: number;
  altitude: number;
  speed: number;
}
