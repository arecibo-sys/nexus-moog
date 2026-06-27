// Voice.js — Per-voice DSP: oscillators, envelopes, filter routing

import { LadderFilter } from './LadderFilter.js';

export class Voice {
  constructor(ctx, params, midiNote, velocity, sharedLadder) {
    this.ctx = ctx;
    this.params = params;
    this.midiNote = midiNote;
    this.velocity = velocity / 127;
    this.active = true;
    this.released = false;
    this.sharedLadder = sharedLadder;

    this.oscillators = [];
    this.gains = [];
    this.envelopeGain = null;
    this.filterNode = null;
    this.noiseNode = null;
    this.lfoNode = null;
    this.lfoGain = null;
    this.output = ctx.createGain();
    this.output.gain.value = 1.0;

    this.build();
  }

  build() {
    const ctx = this.ctx;
    const freq = this.midiToFreq(this.midiNote);

    // --- Oscillators ---
    for (let i = 0; i < 3; i++) {
      const oscKey = `osc${i + 1}`;
      const oscParams = this.params[oscKey];
      if (!oscParams.enabled) continue;

      const osc = ctx.createOscillator();
      osc.type = oscParams.type === 'pwm' ? 'square' : oscParams.type;
      const oscFreq = freq * Math.pow(2, oscParams.octave + oscParams.semitone / 12 + oscParams.fine / 1200);
      osc.frequency.value = oscFreq;

      // PWM via LFO or manual
      if (oscParams.type === 'pwm') {
        // We'll use a custom periodic wave for PWM
        this.applyPWM(osc, oscParams.pulseWidth);
      }

      const gain = ctx.createGain();
      gain.gain.value = oscParams.level * this.velocity;

      osc.connect(gain);

      // Oscillator sync: osc2 syncs to osc1
      if (i === 1 && this.params.oscSync && this.oscillators.length > 0) {
        // Hard sync: restart osc2 on osc1 cycle — Web Audio doesn't have native sync,
        // approximate by frequency modulation
      }

      this.oscillators.push({ osc, gain, params: oscParams, baseFreq: oscFreq });
    }

    // Ring mod between osc1 and osc2
    if (this.params.ringMod && this.oscillators.length >= 2) {
      const ringMod = ctx.createGain();
      ringMod.gain.value = 0;
      this.oscillators[1].osc.connect(ringMod.gain);
      this.oscillators[0].osc.connect(ringMod);
      this.oscillators[0].gain.disconnect();
      this.oscillators[0].osc.connect(this.oscillators[0].gain);
      ringMod.connect(this.oscillators[0].gain);
      this.ringMod = ringMod;
    }

    // --- Noise ---
    if (this.params.noiseLevel > 0) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const color = this.params.noiseColor;
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        if (color === 'white') {
          data[i] = Math.random() * 2 - 1;
        } else if (color === 'pink') {
          // Paul Kellet's pink noise approximation
          const white = Math.random() * 2 - 1;
          lastOut = 0.98 * lastOut + 0.02 * white;
          data[i] = lastOut * 3.5;
        } else { // red/brown
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 6;
        }
      }
      this.noiseNode = ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = this.params.noiseLevel * this.velocity;
      this.noiseNode.connect(noiseGain);
      this.noiseGain = noiseGain;
    }

    // --- Filter ---
    // Each voice gets its own ladder filter instance for polyphonic filtering
    if (this.sharedLadder && !this.sharedLadder.fallback) {
      this.filterNode = this.sharedLadder.createNode({
        cutoff: this.params.filterCutoff,
        resonance: this.params.filterResonance,
        drive: this.params.filterDrive,
        mode: this.params.filterMode,
      });
    } else {
      // Fallback to biquad filter if worklet not available
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = this.params.filterMode === 1 ? 'bandpass' : (this.params.filterMode === 2 ? 'highpass' : 'lowpass');
      this.filterNode.frequency.value = this.params.filterCutoff;
      this.filterNode.Q.value = this.params.filterResonance * 10;
      this.usingBiquad = true;
    }

    // Connect oscillators to filter
    this.oscillators.forEach(({ gain }) => gain.connect(this.filterNode));
    if (this.noiseGain) this.noiseGain.connect(this.filterNode);

    // --- Filter Envelope ---
    this.filterEnvGain = ctx.createGain();
    this.filterEnvGain.gain.value = 0;
    this.filterNode.connect(this.filterEnvGain); // not used directly, env modulates cutoff param

    // Apply filter envelope to cutoff
    this.applyFilterEnvelope();

    // --- Amplitude Envelope ---
    this.envelopeGain = ctx.createGain();
    this.envelopeGain.gain.value = 0;
    this.filterNode.connect(this.envelopeGain);
    this.envelopeGain.connect(this.output);

    // --- LFO ---
    if (this.params.lfo.depth > 0) {
      this.lfoNode = ctx.createOscillator();
      this.lfoNode.type = this.params.lfo.type;
      this.lfoNode.frequency.value = this.params.lfo.rate;
      this.lfoGain = ctx.createGain();
      this.lfoGain.gain.value = this.params.lfo.depth;

      this.lfoNode.connect(this.lfoGain);

      switch (this.params.lfo.destination) {
        case 'pitch':
          this.oscillators.forEach(({ osc }) => this.lfoGain.connect(osc.frequency));
          break;
        case 'filter':
          this.lfoGain.connect(this.filterNode.parameters.get('cutoff'));
          break;
        case 'amp':
          this.lfoGain.connect(this.envelopeGain.gain);
          break;
        case 'pulseWidth':
          // Approximate — modulate frequency slightly for PWM effect
          this.oscillators.forEach(({ osc }) => this.lfoGain.connect(osc.frequency));
          break;
      }
    }

    // --- Glide ---
    if (this.params.glide.enabled) {
      // Set target frequencies with glide
      this.oscillators.forEach(({ osc, baseFreq }) => {
        osc.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + this.params.glide.time);
      });
    }
  }

  applyPWM(osc, width) {
    // Create a custom periodic wave approximating PWM
    const n = 64;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let i = 1; i < n; i++) {
      // Pulse wave Fourier series
      const w = width * Math.PI * 2;
      imag[i] = (2 / (i * Math.PI)) * Math.sin(i * w);
    }
    try {
      const wave = this.ctx.createPeriodicWave(real, imag);
      osc.setPeriodicWave(wave);
    } catch (e) {
      osc.type = 'square';
    }
  }

  applyFilterEnvelope() {
    const ctx = this.ctx;
    const env = this.params.filterEnv;
    const amt = this.params.filterEnvAmount * this.params.filterEnvPolarity;
    const baseCutoff = this.params.filterCutoff;
    const keyTrack = this.params.filterKeyTrack;
    const keyAmount = keyTrack > 0 ? (this.midiNote - 60) * keyTrack * 50 : 0;
    const peakCutoff = baseCutoff + amt * 8000 + keyAmount;
    const susCutoff = baseCutoff + amt * env.sustain * 8000 + keyAmount;

    const t = ctx.currentTime;
    const cutoffParam = this.usingBiquad ? this.filterNode.frequency : this.filterNode.parameters.get('cutoff');

    cutoffParam.setValueAtTime(baseCutoff + keyAmount, t);
    cutoffParam.linearRampToValueAtTime(peakCutoff, t + env.attack);
    if (env.curve === 'exp') {
      cutoffParam.exponentialRampToValueAtTime(Math.max(20, susCutoff), t + env.attack + env.decay);
    } else {
      cutoffParam.linearRampToValueAtTime(susCutoff, t + env.attack + env.decay);
    }
  }

  start() {
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const env = this.params.ampEnv;

    // Start oscillators
    this.oscillators.forEach(({ osc }) => osc.start(t));
    if (this.noiseNode) this.noiseNode.start(t);
    if (this.lfoNode) this.lfoNode.start(t);

    // Amplitude envelope
    const peak = this.velocity;
    this.envelopeGain.gain.setValueAtTime(0, t);
    this.envelopeGain.gain.linearRampToValueAtTime(peak, t + env.attack);
    if (env.curve === 'exp') {
      this.envelopeGain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak * env.sustain), t + env.attack + env.decay);
    } else {
      this.envelopeGain.gain.linearRampToValueAtTime(peak * env.sustain, t + env.attack + env.decay);
    }
  }

  release() {
    if (this.released) return;
    this.released = true;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const env = this.params.ampEnv;
    const currentLevel = this.envelopeGain.gain.value;

    // Filter envelope release
    const cutoffParam = this.usingBiquad ? this.filterNode.frequency : this.filterNode.parameters.get('cutoff');
    const baseCutoff = this.params.filterCutoff;
    const keyTrack = this.params.filterKeyTrack;
    const keyAmount = keyTrack > 0 ? (this.midiNote - 60) * keyTrack * 50 : 0;
    cutoffParam.cancelScheduledValues(t);
    cutoffParam.setValueAtTime(cutoffParam.value, t);
    if (this.params.filterEnv.curve === 'exp') {
      cutoffParam.exponentialRampToValueAtTime(Math.max(20, baseCutoff + keyAmount), t + env.release);
    } else {
      cutoffParam.linearRampToValueAtTime(baseCutoff + keyAmount, t + env.release);
    }

    // Amp envelope release
    this.envelopeGain.gain.cancelScheduledValues(t);
    this.envelopeGain.gain.setValueAtTime(currentLevel, t);
    if (env.curve === 'exp') {
      this.envelopeGain.gain.exponentialRampToValueAtTime(0.001, t + env.release);
    } else {
      this.envelopeGain.gain.linearRampToValueAtTime(0, t + env.release);
    }
  }

  stop() {
    const t = this.ctx.currentTime + 0.01;
    try {
      this.oscillators.forEach(({ osc }) => osc.stop(t));
      if (this.noiseNode) this.noiseNode.stop(t);
      if (this.lfoNode) this.lfoNode.stop(t);
    } catch (e) { /* already stopped */ }
    this.active = false;
  }

  kill() {
    try {
      this.envelopeGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.envelopeGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.oscillators.forEach(({ osc }) => {
        try { osc.stop(this.ctx.currentTime + 0.001); } catch (e) {}
      });
      if (this.noiseNode) { try { this.noiseNode.stop(this.ctx.currentTime + 0.001); } catch(e){} }
      if (this.lfoNode) { try { this.lfoNode.stop(this.ctx.currentTime + 0.001); } catch(e){} }
    } catch (e) {}
    this.active = false;
  }

  updateParams(params) {
    // Live param updates for active voice
    if (this.filterNode && !this.released) {
      if (this.usingBiquad) {
        this.filterNode.frequency.setTargetAtTime(params.filterCutoff, this.ctx.currentTime, 0.01);
        this.filterNode.Q.setTargetAtTime(params.filterResonance * 10, this.ctx.currentTime, 0.01);
      } else {
        const cutoffP = this.filterNode.parameters.get('cutoff');
        const resP = this.filterNode.parameters.get('resonance');
        const driveP = this.filterNode.parameters.get('drive');
        const modeP = this.filterNode.parameters.get('mode');
        cutoffP.setTargetAtTime(params.filterCutoff, this.ctx.currentTime, 0.01);
        resP.setTargetAtTime(params.filterResonance, this.ctx.currentTime, 0.01);
        driveP.setTargetAtTime(params.filterDrive, this.ctx.currentTime, 0.01);
        modeP.setTargetAtTime(params.filterMode, this.ctx.currentTime, 0.01);
      }
    }
  }

  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  connect(dest) {
    this.output.connect(dest);
  }

  disconnect() {
    this.output.disconnect();
  }
}