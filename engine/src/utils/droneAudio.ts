/**
 * Audio disabled - Zero audio output under any circumstance
 */
class DroneAudioSynthesizer {
  public init() {}
  public async start() {}
  public stop() {}
  public setVolume(_vol: number) {}
  public setMute(_muted: boolean) {}
  public updateRpm(_rpm: number) {}
}

export const droneAudio = new DroneAudioSynthesizer();
