/**
 * Audio disabled - Zero audio output under any circumstance
 */
class DieselEngineAudio {
  public init() {}
  public async start() {}
  public stop() {}
  public setVolume(_vol: number) {}
  public setMute(_muted: boolean) {}
  public update(_rpm: number, _load: number, _boostPsi: number) {}
}

export const engineAudio = new DieselEngineAudio();
