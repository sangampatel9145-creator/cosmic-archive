'use client';

type Cue = 'hover' | 'select' | 'warp' | 'discovery';

/**
 * All audio is synthesised at runtime with the Web Audio API, so the experience
 * has no media assets to load and nothing to fail on a slow network.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  private padVoices: OscillatorNode[] = [];
  private musicEnabled = false;
  private sfxEnabled = true;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.context) return this.context;

    const Ctor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;

    try {
      const context = new Ctor();
      const master = context.createGain();
      master.gain.value = 0.6;
      master.connect(context.destination);
      this.context = context;
      this.master = master;
      return context;
    } catch {
      return null;
    }
  }

  resume(): void {
    const context = this.ensureContext();
    if (context && context.state === 'suspended') {
      void context.resume();
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (enabled) this.startPad();
    else this.stopPad();
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  private startPad(): void {
    const context = this.ensureContext();
    if (!context || !this.master || this.padGain) return;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.055, context.currentTime + 4);

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.6;

    gain.connect(filter);
    filter.connect(this.master);

    // A slow, slightly detuned drone in a minor ninth.
    const frequencies = [55, 82.4, 110, 164.8, 220.5];
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = (index - 2) * 4;

      const voiceGain = context.createGain();
      voiceGain.gain.value = 0.5 / frequencies.length;

      const lfo = context.createOscillator();
      lfo.frequency.value = 0.03 + index * 0.011;
      const lfoGain = context.createGain();
      lfoGain.gain.value = 0.35 / frequencies.length;
      lfo.connect(lfoGain);
      lfoGain.connect(voiceGain.gain);

      oscillator.connect(voiceGain);
      voiceGain.connect(gain);
      oscillator.start();
      lfo.start();

      this.padVoices.push(oscillator, lfo);
    });

    this.padGain = gain;
  }

  private stopPad(): void {
    if (!this.context || !this.padGain) return;
    const now = this.context.currentTime;
    this.padGain.gain.cancelScheduledValues(now);
    this.padGain.gain.setValueAtTime(this.padGain.gain.value, now);
    this.padGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);

    const voices = this.padVoices;
    const gain = this.padGain;
    this.padVoices = [];
    this.padGain = null;

    window.setTimeout(() => {
      voices.forEach((voice) => {
        try {
          voice.stop();
          voice.disconnect();
        } catch {
          /* already stopped */
        }
      });
      gain.disconnect();
    }, 1400);
  }

  play(cue: Cue): void {
    if (!this.sfxEnabled) return;
    const context = this.ensureContext();
    if (!context || !this.master) return;
    if (context.state === 'suspended') return;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3;

    switch (cue) {
      case 'hover':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(1180, now + 0.12);
        filter.frequency.value = 1400;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        oscillator.stop(now + 0.24);
        break;
      case 'select':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(320, now);
        oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.25);
        filter.frequency.value = 900;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        oscillator.stop(now + 0.52);
        break;
      case 'warp':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(90, now);
        oscillator.frequency.exponentialRampToValueAtTime(1400, now + 1.6);
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 1.6);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.075, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
        oscillator.stop(now + 2.05);
        break;
      case 'discovery':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.14);
        oscillator.frequency.setValueAtTime(987.77, now + 0.28);
        filter.frequency.value = 2200;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        oscillator.stop(now + 0.92);
        break;
    }

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  dispose(): void {
    this.stopPad();
    if (this.context) {
      void this.context.close();
      this.context = null;
      this.master = null;
    }
  }

  get isMusicEnabled(): boolean {
    return this.musicEnabled;
  }
}

export const audioEngine = new AudioEngine();
export type { Cue as AudioCue };
