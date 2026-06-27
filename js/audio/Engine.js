// Engine.js — Main audio context, voice management, master chain

import { Voice } from './Voice.js';
import { EffectsRack } from './Effects.js';
import { NoteHandler } from './NoteHandler.js';
import { LadderFilter } from './LadderFilter.js';

export class Engine {
  constructor() {
    this.ctx = null;
    this.voices = new Map();
    this.maxVoices = 32;
    this.voiceQueue = [];
    this.params = this.defaultParams();
    this.effects = null;
    this.noteHandler = null;
    this.ladderFilter = null;
    this.masterGain = null;
    this.analyser = null;
    this.started = false;
  }

  defaultParams() {
    return {
      // Oscillators
      osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: 0, level: 0.7, pulseWidth: 0.5, enabled: true },
      osc2: { type: 'square', octave: 0, semitone: 7, fine: 0, level: 0.5, pulseWidth: 0.5, enabled: true },
      osc3: { type: 'triangle', octave: -1, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: false },
      oscSync: false,
      ringMod: false,
      // Mixer
      noiseLevel: 0,
      noiseColor: 'white',
      oscFM: 0,
      // Filter
      filterCutoff: 2000,
      filterResonance: 0.3,
      filterDrive: 1.0,
      filterMode: 0, // 0=LP, 1=BP, 2=HP
      filterEnvAmount: 0.5,
      filterEnvPolarity: 1,
      filterKeyTrack: 0.5,
      // Filter Envelope
      filterEnv: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5, curve: 'exp' },
      // Amp Envelope
      ampEnv: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.3, curve: 'exp' },
      // LFO
      lfo: { rate: 4, depth: 0, destination: 'pitch', type: 'sine', sync: false },
      // Glide
      glide: { enabled: false, time: 0.1, mode: 'constant-time' },
      // Master
      masterVolume: 0.8,
      glideEnabled: false,
      // Effects
      fx: {
        distortion: { enabled: false, amount: 0.3, tone: 0.5 },
        chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.5 },
        delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.3, sync: false },
        reverb: { enabled: false, size: 0.5, decay: 2.0, mix: 0.3 },
        bitcrusher: { enabled: false, bits: 8, mix: 0.5 },
      },
    };
  }

  async init() {
    if (this.started) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    await this.ctx.resume();

    // Load ladder filter worklet
    this.ladderFilter = new LadderFilter(this.ctx);
    await this.ladderFilter.load();

    // Master chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.params.masterVolume;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Effects rack
    this.effects = new EffectsRack(this.ctx);
    this.effects.setParams(this.params.fx);

    // Connect: voices -> effects -> masterGain -> analyser -> destination
    this.effects.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Note handler
    this.noteHandler = new NoteHandler(this);
    this.started = true;
  }

  noteOn(midiNote, velocity = 100) {
    if (!this.started) return;
    this.noteHandler.noteOn(midiNote, velocity);
  }

  noteOff(midiNote) {
    if (!this.started) return;
    this.noteHandler.noteOff(midiNote);
  }

  createVoice(midiNote, velocity) {
    // Voice stealing
    if (this.voices.size >= this.maxVoices) {
      const oldest = [...this.voices.keys()][0];
      this.killVoice(oldest);
    }
    const voice = new Voice(this.ctx, this.params, midiNote, velocity, this.ladderFilter);
    voice.connect(this.effects.input);
    voice.start();
    this.voices.set(midiNote, voice);
  }

  killVoice(midiNote) {
    const v = this.voices.get(midiNote);
    if (v) {
      v.kill();
      this.voices.delete(midiNote);
    }
  }

  releaseVoice(midiNote) {
    const v = this.voices.get(midiNote);
    if (v) {
      v.release();
      // Schedule cleanup after release time
      const releaseTime = this.params.ampEnv.release + 0.1;
      setTimeout(() => {
        v.stop();
        this.voices.delete(midiNote);
      }, releaseTime * 1000);
    }
  }

  setParam(path, value) {
    const parts = path.split('.');
    let obj = this.params;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;

    // Live update active voices for certain params
    if (parts[0] === 'masterVolume') {
      this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.01);
    }
    if (parts[0] === 'fx') {
      this.effects.setParams(this.params.fx);
    }
    // Update active voices
    this.voices.forEach(v => v.updateParams(this.params));
  }

  getParam(path) {
    const parts = path.split('.');
    let obj = this.params;
    for (const p of parts) {
      obj = obj[p];
    }
    return obj;
  }

  allNotesOff() {
    this.voices.forEach((v, k) => {
      v.kill();
    });
    this.voices.clear();
  }

  getAnalyser() {
    return this.analyser;
  }
}