// Audio Synthesizer for Reminder Notifications using Web Audio API
// Optimized for loud, crisp, and clean mobile speaker playback

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private customAudioDataUri: string | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Create a compressor node to maximize perceived loudness without speaker distortion
  private createMasterChain(ctx: AudioContext): { input: GainNode; output: AudioNode } {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(6, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.15, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.95, ctx.currentTime); // High volume (95%)

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    return { input: masterGain, output: compressor };
  }

  // Play a loud and clean notification tone
  playPreset(preset: 'chime' | 'bell' | 'ping') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const { input } = this.createMasterChain(ctx);

      if (preset === 'chime') {
        // 3-note melodic bright chime (D5 -> G5 -> B5) - upbeat, loud, and modern
        this.playPluckNote(ctx, input, 587.33, now, 0.45);
        this.playPluckNote(ctx, input, 783.99, now + 0.12, 0.45);
        this.playPluckNote(ctx, input, 987.77, now + 0.24, 0.7);
      } else if (preset === 'bell') {
        // Resonant acoustic reminder bell with rich harmonics
        this.playResonantBell(ctx, input, 659.25, now, 1.2);
      } else if (preset === 'ping') {
        // Double crisp ping (high presence 1318.5Hz -> 1760Hz)
        this.playPingTone(ctx, input, 1318.51, now, 0.22);
        this.playPingTone(ctx, input, 1760.00, now + 0.12, 0.45);
      }
    } catch (e) {
      console.warn('Could not play synthesized audio:', e);
    }
  }

  private playPluckNote(ctx: AudioContext, destination: AudioNode, freq: number, startTime: number, duration: number) {
    // Primary body oscillator (sine)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Harmonic presence oscillator (triangle for clarity and projection on small phone speakers)
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, startTime);

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.85, startTime + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  private playPingTone(ctx: AudioContext, destination: AudioNode, freq: number, startTime: number, duration: number) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.9, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playResonantBell(ctx: AudioContext, destination: AudioNode, baseFreq: number, startTime: number, duration: number) {
    // Harmonic frequencies for a real metal bell chime
    const harmonics = [1, 2.01, 3.02, 4.15];
    const amps = [0.85, 0.45, 0.25, 0.12];

    harmonics.forEach((h, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * h, startTime);

      const amp = amps[idx];
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration / (idx * 0.7 + 1)));

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  playCustomAudio(dataUri: string) {
    try {
      if (this.customAudioDataUri !== dataUri || !this.customAudio) {
        this.customAudio = new Audio(dataUri);
        this.customAudioDataUri = dataUri;
      }
      this.customAudio.volume = 1.0; // Full volume
      this.customAudio.currentTime = 0;
      this.customAudio.play().catch(e => console.warn('Audio play error:', e));
    } catch (e) {
      console.warn('Custom audio playback failed:', e);
    }
  }

  playSelectedSound(soundType: 'system' | 'chime' | 'bell' | 'ping' | 'custom', customUri?: string) {
    if (soundType === 'custom' && customUri) {
      this.playCustomAudio(customUri);
    } else if (soundType === 'chime' || soundType === 'bell' || soundType === 'ping') {
      this.playPreset(soundType);
    } else {
      // System / default fallback tone: loud melodic chime
      this.playPreset('chime');
    }
  }
}

export const SoundService = new SoundManager();
