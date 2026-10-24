// Procedural Web Audio Synthesizer & 16-Step Beat Sequencer
// Generates vintage 808 sub kicks, snappy snares, acoustic/drill hats, vinyl crackle, and game SFX

export interface BeatStep {
  kick: boolean;
  snare: boolean;
  hihat: boolean;
  sample: boolean;
}

class BeatAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private vinylNode: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // 16-Step Sequencer State
  private isSequencerPlaying: boolean = false;
  private bpm: number = 94;
  private currentStep: number = 0;
  private sequencerTimer: number | null = null;
  private onStepCallback: ((step: number) => void) | null = null;

  private pattern: BeatStep[] = [
    { kick: true, snare: false, hihat: true, sample: true },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: false, snare: true, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: true, snare: false, hihat: true, sample: true },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: true, snare: false, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: true },
    { kick: true, snare: false, hihat: true, sample: false },
    { kick: false, snare: true, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: false, snare: false, hihat: true, sample: false },
    { kick: true, snare: false, hihat: true, sample: false },
  ];

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.startVinylCrackle();
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(60, Math.min(200, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setPatternStep(stepIndex: number, track: keyof BeatStep, active: boolean) {
    if (this.pattern[stepIndex]) {
      this.pattern[stepIndex][track] = active;
    }
  }

  public getPattern(): BeatStep[] {
    return this.pattern;
  }

  public setOnStepCallback(cb: (step: number) => void) {
    this.onStepCallback = cb;
  }

  // Toggle Sequencer
  public toggleSequencer(): boolean {
    this.init();
    if (this.isSequencerPlaying) {
      this.stopSequencer();
      return false;
    } else {
      this.startSequencer();
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isSequencerPlaying;
  }

  private startSequencer() {
    if (!this.ctx) return;
    this.isSequencerPlaying = true;
    this.currentStep = 0;
    this.scheduleNextStep();
  }

  private stopSequencer() {
    this.isSequencerPlaying = false;
    if (this.sequencerTimer) {
      window.clearTimeout(this.sequencerTimer);
      this.sequencerTimer = null;
    }
  }

  private scheduleNextStep = () => {
    if (!this.isSequencerPlaying || !this.ctx) return;

    // Trigger sounds for current step
    const step = this.pattern[this.currentStep];
    if (step) {
      if (step.kick) this.play808(48, 0.45);
      if (step.snare) this.playSnare();
      if (step.hihat) this.playHiHat(false);
      if (step.sample) this.playSampleStab();
    }

    if (this.onStepCallback) {
      this.onStepCallback(this.currentStep);
    }

    this.currentStep = (this.currentStep + 1) % 16;

    // 16th note timing: (60 / bpm) / 4 seconds
    const intervalMs = ((60 / this.bpm) / 4) * 1000;
    this.sequencerTimer = window.setTimeout(this.scheduleNextStep, intervalMs);
  };

  // Deep resonant 808 sub bass drop
  public play808(freq: number = 55, decay: number = 0.8) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2.2, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + decay);
    } catch (e) {}
  }

  // Punchy boom-bap / acoustic snare
  public playSnare() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
      oscGain.gain.setValueAtTime(0.6, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.12);

      const bufferSize = this.ctx.sampleRate * 0.18;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain!);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.18);
    } catch (e) {}
  }

  // Crisp Hi-Hat / Triplet
  public playHiHat(isOpen: boolean = false) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const duration = isOpen ? 0.25 : 0.04;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(8000, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      source.start(now);
      source.stop(now + duration);
    } catch (e) {}
  }

  // Sample Stab (Rhodes / Cowbell)
  public playSampleStab(freq: number = 392) {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // Stem collected chime
  public playStemCollect() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [329.63, 440, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.4, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.35);
      });
    } catch (e) {}
  }

  // Landmark discovery fanfare
  public playLandmarkDiscovered() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [220, 277.18, 329.63, 440];
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.8);
      });
      this.play808(45, 1.2);
    } catch (e) {}
  }

  // Engine boost whoosh
  public playBoost() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // Vinyl surface crackle
  private startVinylCrackle() {
    if (!this.ctx) return;
    try {
      const sampleRate = this.ctx.sampleRate;
      const length = sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < length; i++) {
        const noise = (Math.random() * 2 - 1) * 0.015;
        const isPop = Math.random() < 0.0003;
        const pop = isPop ? (Math.random() > 0.5 ? 0.35 : -0.35) : 0;
        data[i] = noise + pop;
      }

      this.vinylNode = this.ctx.createBufferSource();
      this.vinylNode.buffer = buffer;
      this.vinylNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.vinylNode.connect(filter);
      filter.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain!);

      this.vinylNode.start();
    } catch (e) {}
  }
}

export const beatAudio = new BeatAudioEngine();
