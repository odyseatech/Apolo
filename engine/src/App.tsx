/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Engine3DScene } from './components/3d/Engine3DScene';
import { FloatingSidebarMenu } from './components/FloatingSidebarMenu';
import {
  CameraViewPreset as EngineCameraPreset,
  EngineMaterialMode,
  PerformanceMetrics
} from './types/engine';
import { computeLiveMetrics } from './utils/enginePhysics';

export default function App() {
  // Engine State
  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [engineTargetRpm, setEngineTargetRpm] = useState(1200);
  const [engineCurrentRpm, setEngineCurrentRpm] = useState(1200);
  const [engineLoadPercent, setEngineLoadPercent] = useState(75);
  const [engineMaterialMode, setEngineMaterialMode] = useState<EngineMaterialMode>('reference-gray');
  const [engineCameraPreset, setEngineCameraPreset] = useState<EngineCameraPreset>('isometric');
  const [engineExplodePercent, setEngineExplodePercent] = useState(0);
  const [engineMetrics, setEngineMetrics] = useState<PerformanceMetrics>(() =>
    computeLiveMetrics(1200, 1200, 75)
  );

  // Engine RPM Simulation Loop
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSec = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      setEngineCurrentRpm((prevRpm) => {
        if (!isEngineRunning) {
          return Math.max(0, prevRpm - deltaSec * 800);
        }
        const rpmDiff = engineTargetRpm - prevRpm;
        const rate = rpmDiff > 0 ? 1200 : 900;
        return Math.round(prevRpm + Math.sign(rpmDiff) * Math.min(Math.abs(rpmDiff), deltaSec * rate));
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isEngineRunning, engineTargetRpm]);

  // Telemetry Metrics Calculation
  useEffect(() => {
    setEngineMetrics((prev) => {
      return computeLiveMetrics(engineCurrentRpm, engineTargetRpm, engineLoadPercent, prev, 0.05);
    });
  }, [engineCurrentRpm, engineTargetRpm, engineLoadPercent, isEngineRunning]);

  // Engine Power Toggle
  const handleToggleEnginePower = () => {
    if (isEngineRunning) {
      setIsEngineRunning(false);
    } else {
      setIsEngineRunning(true);
      if (engineTargetRpm < 650) setEngineTargetRpm(650);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* 3D Engine Scene - Full Viewport */}
      <Engine3DScene
        rpm={engineCurrentRpm}
        isRunning={isEngineRunning}
        loadPercent={engineLoadPercent}
        egtCelsius={engineMetrics.egtCelsius}
        materialMode={engineMaterialMode}
        cameraPreset={engineCameraPreset}
        explodePercent={engineExplodePercent}
        onChangeExplode={setEngineExplodePercent}
        onChangeCameraPreset={setEngineCameraPreset}
        onChangeMaterialMode={setEngineMaterialMode}
      />

      {/* Left Sidebar Menu with Tuning, Tweaks & Controls */}
      <FloatingSidebarMenu
        isRunning={isEngineRunning}
        onTogglePower={handleToggleEnginePower}
        targetRpm={engineTargetRpm}
        currentRpm={engineCurrentRpm}
        onChangeTargetRpm={setEngineTargetRpm}
        loadPercent={engineLoadPercent}
        onChangeLoadPercent={setEngineLoadPercent}
        metrics={engineMetrics}
        explodePercent={engineExplodePercent}
        onChangeExplode={setEngineExplodePercent}
        materialMode={engineMaterialMode}
        onChangeMaterialMode={setEngineMaterialMode}
        cameraPreset={engineCameraPreset}
        onChangeCameraPreset={setEngineCameraPreset}
      />
    </div>
  );
}
