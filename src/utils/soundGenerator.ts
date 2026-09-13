// Web Audio API generator for ambient focus sounds (no external audio files required)

class AmbientFocusAudio {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private soundType: 'rain' | 'brown' | 'binaural' = 'rain';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(type: 'rain' | 'brown' | 'binaural' = 'rain'): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(type);
      return true;
    }
  }

  public start(type: 'rain' | 'brown' | 'binaural' = 'rain') {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.soundType = type;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown' || type === 'rain') {
        // Brown/pink filter approximation for rain and deep study noise
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // boost volume
      } else {
        // Soft white/pink
        data[i] = white * 0.15;
      }
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to simulate soft raindrops / soothing ambiance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'rain' ? 800 : 400;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime); // gentle, soothing volume

    noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    noiseSource.start();
    this.noiseNode = noiseSource;
    this.isPlaying = true;
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch (e) {
        // ignore if already stopped
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getSoundType(): string {
    return this.soundType;
  }
}

export const ambientSound = new AmbientFocusAudio();
