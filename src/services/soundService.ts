// Audio Synthesizer for Reminder Notifications using Web Audio API

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

  // Play a chime/bell synthesizer tone
  playPreset(preset: 'chime' | 'bell' | 'ping') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (preset === 'chime') {
        // Double tone melodic chime (E5 -> A5)
        this.playTone(ctx, 659.25, now, 0.4, 'sine');
        this.playTone(ctx, 880.00, now + 0.15, 0.6, 'sine');
      } else if (preset === 'bell') {
        // Resonant bell sound with harmonics
        this.playHarmonicBell(ctx, 523.25, now, 1.2);
      } else if (preset === 'ping') {
        // High crisp ping (C6)
        this.playTone(ctx, 1046.50, now, 0.35, 'triangle');
      }
    } catch (e) {
      console.warn('Could not play synthesized audio:', e);
    }
  }

  private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, type: OscillatorType) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playHarmonicBell(ctx: AudioContext, baseFreq: number, startTime: number, duration: number) {
    const harmonics = [1, 2, 3, 4.2];
    const amplitudes = [0.25, 0.15, 0.08, 0.04];

    harmonics.forEach((h, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, startTime);

      const amp = amplitudes[idx];
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(amp, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration / (idx + 1)));

      osc.connect(gain);
      gain.connect(ctx.destination);

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
      // System default - in web audio we play pleasant gentle chime as fallback
      this.playPreset('chime');
    }
  }
}

export const SoundService = new SoundManager();

