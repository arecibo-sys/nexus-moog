// Presets.js — Factory patches + preset management

export const Presets = {
  factory: [
    // === BASSES ===
    {
      name: 'Sub Boom', category: 'Bass',
      params: {
        osc1: { type: 'sine', octave: -1, semitone: 0, fine: 0, level: 0.9, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sawtooth', octave: -1, semitone: 0, fine: 5, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: -2, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 400, filterResonance: 0.6, filterDrive: 1.5, filterMode: 0,
        filterEnvAmount: 0.8, filterEnvPolarity: 1, filterKeyTrack: 0.3,
        filterEnv: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.2, curve: 'exp' },
        ampEnv: { attack: 0.005, decay: 0.1, sustain: 0.9, release: 0.15, curve: 'exp' },
        lfo: { rate: 0.5, depth: 0, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.8,
        fx: { distortion: { enabled: false, amount: 0.3, tone: 0.5 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.5 }, delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.3, sync: false }, reverb: { enabled: false, size: 0.5, decay: 2.0, mix: 0.3 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Acid Squelch', category: 'Bass',
      params: {
        osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: 0, level: 0.8, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'square', octave: 0, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: -1, semitone: 0, fine: 0, level: 0.2, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 300, filterResonance: 0.85, filterDrive: 2.0, filterMode: 0,
        filterEnvAmount: 0.9, filterEnvPolarity: 1, filterKeyTrack: 0.2,
        filterEnv: { attack: 0.001, decay: 0.12, sustain: 0.1, release: 0.15, curve: 'exp' },
        ampEnv: { attack: 0.001, decay: 0.1, sustain: 0.8, release: 0.1, curve: 'exp' },
        lfo: { rate: 4, depth: 0, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: true, time: 0.05, mode: 'constant-time' },
        masterVolume: 0.75,
        fx: { distortion: { enabled: true, amount: 0.4, tone: 0.6 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.5 }, delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.2, sync: false }, reverb: { enabled: false, size: 0.3, decay: 1.0, mix: 0.15 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Reese Bass', category: 'Bass',
      params: {
        osc1: { type: 'sawtooth', octave: -1, semitone: 0, fine: -7, level: 0.7, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sawtooth', octave: -1, semitone: 0, fine: 7, level: 0.7, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'square', octave: -1, semitone: 0, fine: 0, level: 0.2, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 800, filterResonance: 0.4, filterDrive: 1.2, filterMode: 0,
        filterEnvAmount: 0.3, filterEnvPolarity: 1, filterKeyTrack: 0.5,
        filterEnv: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.4, curve: 'exp' },
        ampEnv: { attack: 0.02, decay: 0.2, sustain: 0.9, release: 0.5, curve: 'exp' },
        lfo: { rate: 0.3, depth: 0.1, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.8,
        fx: { distortion: { enabled: true, amount: 0.2, tone: 0.4 }, chorus: { enabled: true, rate: 0.3, depth: 0.5, mix: 0.4 }, delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.2, sync: false }, reverb: { enabled: false, size: 0.4, decay: 1.5, mix: 0.2 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    // === LEADS ===
    {
      name: 'Supersaw Lead', category: 'Lead',
      params: {
        osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: -5, level: 0.6, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sawtooth', octave: 0, semitone: 0, fine: 7, level: 0.6, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sawtooth', octave: 1, semitone: 0, fine: 12, level: 0.4, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 3000, filterResonance: 0.2, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.3, filterEnvPolarity: 1, filterKeyTrack: 0.5,
        filterEnv: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.4, curve: 'exp' },
        ampEnv: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.4, curve: 'exp' },
        lfo: { rate: 5, depth: 0.05, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.05, mode: 'constant-time' },
        masterVolume: 0.7,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.6, depth: 0.4, mix: 0.5 }, delay: { enabled: true, time: 0.375, feedback: 0.35, mix: 0.25, sync: false }, reverb: { enabled: true, size: 0.5, decay: 2.0, mix: 0.25 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Neo Lead', category: 'Lead',
      params: {
        osc1: { type: 'square', octave: 0, semitone: 0, fine: 0, level: 0.7, pulseWidth: 0.3, enabled: true },
        osc2: { type: 'sawtooth', octave: 0, semitone: 12, fine: 0, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: 1, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: false },
        oscSync: true, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 2500, filterResonance: 0.35, filterDrive: 1.3, filterMode: 0,
        filterEnvAmount: 0.4, filterEnvPolarity: 1, filterKeyTrack: 0.6,
        filterEnv: { attack: 0.01, decay: 0.25, sustain: 0.6, release: 0.3, curve: 'exp' },
        ampEnv: { attack: 0.02, decay: 0.15, sustain: 0.85, release: 0.35, curve: 'exp' },
        lfo: { rate: 6, depth: 0.03, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: true, time: 0.08, mode: 'constant-time' },
        masterVolume: 0.75,
        fx: { distortion: { enabled: true, amount: 0.15, tone: 0.7 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.4 }, delay: { enabled: true, time: 0.3, feedback: 0.3, mix: 0.2, sync: false }, reverb: { enabled: true, size: 0.4, decay: 1.5, mix: 0.2 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Waterfall Lead', category: 'Lead',
      params: {
        osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: 0, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'triangle', octave: 0, semitone: 7, fine: 3, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sine', octave: 1, semitone: 0, fine: 0, level: 0.4, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 4000, filterResonance: 0.25, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.2, filterEnvPolarity: 1, filterKeyTrack: 0.7,
        filterEnv: { attack: 0.1, decay: 0.5, sustain: 0.8, release: 0.8, curve: 'exp' },
        ampEnv: { attack: 0.3, decay: 0.3, sustain: 0.9, release: 1.2, curve: 'exp' },
        lfo: { rate: 8, depth: 0.08, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.7,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 1.2, depth: 0.6, mix: 0.6 }, delay: { enabled: true, time: 0.375, feedback: 0.5, mix: 0.35, sync: false }, reverb: { enabled: true, size: 0.7, decay: 3.0, mix: 0.4 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    // === PADS ===
    {
      name: 'Cosmic Pad', category: 'Pad',
      params: {
        osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: -3, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sawtooth', octave: 0, semitone: 0, fine: 4, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: 1, semitone: 7, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0.05, noiseColor: 'pink', oscFM: 0,
        filterCutoff: 1200, filterResonance: 0.15, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.3, filterEnvPolarity: 1, filterKeyTrack: 0.3,
        filterEnv: { attack: 1.5, decay: 1.0, sustain: 0.7, release: 2.0, curve: 'exp' },
        ampEnv: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 3.0, curve: 'exp' },
        lfo: { rate: 0.3, depth: 0.15, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.6,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.4, depth: 0.5, mix: 0.5 }, delay: { enabled: true, time: 0.5, feedback: 0.4, mix: 0.3, sync: false }, reverb: { enabled: true, size: 0.8, decay: 4.0, mix: 0.5 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Glass Pad', category: 'Pad',
      params: {
        osc1: { type: 'triangle', octave: 0, semitone: 0, fine: 0, level: 0.6, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sine', octave: 1, semitone: 12, fine: 2, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sine', octave: 2, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 5000, filterResonance: 0.1, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.1, filterEnvPolarity: 1, filterKeyTrack: 0.8,
        filterEnv: { attack: 0.8, decay: 0.5, sustain: 0.9, release: 1.5, curve: 'exp' },
        ampEnv: { attack: 1.0, decay: 0.5, sustain: 0.9, release: 2.0, curve: 'exp' },
        lfo: { rate: 0.2, depth: 0.05, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.65,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.3, depth: 0.3, mix: 0.4 }, delay: { enabled: true, time: 0.75, feedback: 0.3, mix: 0.25, sync: false }, reverb: { enabled: true, size: 0.7, decay: 3.5, mix: 0.45 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'String Machine', category: 'Pad',
      params: {
        osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: -4, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sawtooth', octave: 0, semitone: 0, fine: 4, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sawtooth', octave: -1, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0.03, noiseColor: 'pink', oscFM: 0,
        filterCutoff: 2000, filterResonance: 0.2, filterDrive: 1.1, filterMode: 0,
        filterEnvAmount: 0.2, filterEnvPolarity: 1, filterKeyTrack: 0.5,
        filterEnv: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 0.8, curve: 'exp' },
        ampEnv: { attack: 0.4, decay: 0.3, sustain: 0.9, release: 0.8, curve: 'exp' },
        lfo: { rate: 0.4, depth: 0.08, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.65,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.8, depth: 0.6, mix: 0.6 }, delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.2, sync: false }, reverb: { enabled: true, size: 0.6, decay: 2.5, mix: 0.35 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    // === KEYS ===
    {
      name: 'Electric Piano', category: 'Keys',
      params: {
        osc1: { type: 'sine', octave: 0, semitone: 0, fine: 0, level: 0.7, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'triangle', octave: 1, semitone: 7, fine: 0, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sine', octave: 2, semitone: 0, fine: 0, level: 0.2, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0.02, noiseColor: 'white', oscFM: 0,
        filterCutoff: 3000, filterResonance: 0.1, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.2, filterEnvPolarity: 1, filterKeyTrack: 0.7,
        filterEnv: { attack: 0.005, decay: 0.3, sustain: 0.3, release: 0.4, curve: 'exp' },
        ampEnv: { attack: 0.005, decay: 0.5, sustain: 0.5, release: 0.5, curve: 'exp' },
        lfo: { rate: 4, depth: 0.02, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.7,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.5, depth: 0.4, mix: 0.4 }, delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.15, sync: false }, reverb: { enabled: true, size: 0.4, decay: 1.5, mix: 0.2 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Clavinet', category: 'Keys',
      params: {
        osc1: { type: 'sawtooth', octave: 0, semitone: 0, fine: 0, level: 0.6, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'square', octave: 0, semitone: 12, fine: 0, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: 0, semitone: 0, fine: 0, level: 0.2, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0.05, noiseColor: 'white', oscFM: 0,
        filterCutoff: 1800, filterResonance: 0.3, filterDrive: 1.3, filterMode: 0,
        filterEnvAmount: 0.5, filterEnvPolarity: 1, filterKeyTrack: 0.6,
        filterEnv: { attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.1, curve: 'exp' },
        ampEnv: { attack: 0.001, decay: 0.2, sustain: 0.4, release: 0.1, curve: 'exp' },
        lfo: { rate: 4, depth: 0, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.7,
        fx: { distortion: { enabled: true, amount: 0.25, tone: 0.6 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.3 }, delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.15, sync: false }, reverb: { enabled: true, size: 0.3, decay: 1.0, mix: 0.15 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    // === FX ===
    {
      name: 'Sci-Fi ZAP', category: 'FX',
      params: {
        osc1: { type: 'sawtooth', octave: 2, semitone: 0, fine: 0, level: 0.7, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'square', octave: 2, semitone: 0, fine: 0, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: 3, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: false },
        oscSync: true, ringMod: true, noiseLevel: 0.1, noiseColor: 'white', oscFM: 0,
        filterCutoff: 500, filterResonance: 0.95, filterDrive: 2.0, filterMode: 0,
        filterEnvAmount: 1.0, filterEnvPolarity: 1, filterKeyTrack: 0,
        filterEnv: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.3, curve: 'exp' },
        ampEnv: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.3, curve: 'exp' },
        lfo: { rate: 10, depth: 0.3, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: true, time: 0.3, mode: 'constant-time' },
        masterVolume: 0.6,
        fx: { distortion: { enabled: true, amount: 0.5, tone: 0.8 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.5 }, delay: { enabled: true, time: 0.2, feedback: 0.5, mix: 0.4, sync: false }, reverb: { enabled: true, size: 0.6, decay: 2.0, mix: 0.3 }, bitcrusher: { enabled: true, bits: 6, mix: 0.5 } },
      }
    },
    {
      name: 'Laser Sweep', category: 'FX',
      params: {
        osc1: { type: 'sawtooth', octave: 1, semitone: 0, fine: 0, level: 0.6, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'square', octave: 1, semitone: 0, fine: 7, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sawtooth', octave: 2, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0.5,
        filterCutoff: 800, filterResonance: 0.8, filterDrive: 1.5, filterMode: 0,
        filterEnvAmount: 0.9, filterEnvPolarity: -1, filterKeyTrack: 0,
        filterEnv: { attack: 0.01, decay: 1.0, sustain: 0, release: 0.5, curve: 'exp' },
        ampEnv: { attack: 0.01, decay: 1.0, sustain: 0, release: 0.5, curve: 'exp' },
        lfo: { rate: 13, depth: 0.2, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: true, time: 0.5, mode: 'constant-time' },
        masterVolume: 0.55,
        fx: { distortion: { enabled: false, amount: 0.3, tone: 0.5 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.5 }, delay: { enabled: true, time: 0.15, feedback: 0.6, mix: 0.35, sync: false }, reverb: { enabled: true, size: 0.7, decay: 2.5, mix: 0.35 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Wind Howl', category: 'FX',
      params: {
        osc1: { type: 'triangle', octave: 0, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sine', octave: 0, semitone: 0, fine: 3, level: 0.3, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'sine', octave: 0, semitone: 0, fine: -3, level: 0.3, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0.6, noiseColor: 'pink', oscFM: 0,
        filterCutoff: 600, filterResonance: 0.5, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.5, filterEnvPolarity: 1, filterKeyTrack: 0,
        filterEnv: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0, curve: 'exp' },
        ampEnv: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 3.0, curve: 'exp' },
        lfo: { rate: 0.3, depth: 0.5, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.5,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.2, depth: 0.4, mix: 0.5 }, delay: { enabled: true, time: 0.4, feedback: 0.4, mix: 0.3, sync: false }, reverb: { enabled: true, size: 0.9, decay: 5.0, mix: 0.5 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    // === PLUCK ===
    {
      name: 'Crystal Pluck', category: 'Pluck',
      params: {
        osc1: { type: 'triangle', octave: 0, semitone: 0, fine: 0, level: 0.7, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sine', octave: 1, semitone: 12, fine: 0, level: 0.5, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: 0, semitone: 0, fine: 5, level: 0.3, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 3000, filterResonance: 0.3, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.6, filterEnvPolarity: 1, filterKeyTrack: 0.5,
        filterEnv: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3, curve: 'exp' },
        ampEnv: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3, curve: 'exp' },
        lfo: { rate: 5, depth: 0.02, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: false, time: 0.1, mode: 'constant-time' },
        masterVolume: 0.7,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.3 }, delay: { enabled: true, time: 0.375, feedback: 0.4, mix: 0.3, sync: false }, reverb: { enabled: true, size: 0.5, decay: 2.0, mix: 0.3 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    {
      name: 'Harp Glissando', category: 'Pluck',
      params: {
        osc1: { type: 'triangle', octave: 0, semitone: 0, fine: 0, level: 0.6, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'sine', octave: 1, semitone: 0, fine: 0, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: 0, semitone: 7, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: true },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 4000, filterResonance: 0.15, filterDrive: 1.0, filterMode: 0,
        filterEnvAmount: 0.4, filterEnvPolarity: 1, filterKeyTrack: 0.6,
        filterEnv: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.5, curve: 'exp' },
        ampEnv: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.5, curve: 'exp' },
        lfo: { rate: 4, depth: 0.01, destination: 'pitch', type: 'sine', sync: false },
        glide: { enabled: true, time: 0.02, mode: 'constant-time' },
        masterVolume: 0.65,
        fx: { distortion: { enabled: false, amount: 0.2, tone: 0.5 }, chorus: { enabled: true, rate: 0.4, depth: 0.3, mix: 0.3 }, delay: { enabled: true, time: 0.375, feedback: 0.35, mix: 0.25, sync: false }, reverb: { enabled: true, size: 0.6, decay: 2.5, mix: 0.35 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
    // === SEQUENCES ===
    {
      name: 'Sequence Pulse', category: 'Sequence',
      params: {
        osc1: { type: 'square', octave: -1, semitone: 0, fine: 0, level: 0.7, pulseWidth: 0.5, enabled: true },
        osc2: { type: 'square', octave: -1, semitone: 0, fine: 7, level: 0.4, pulseWidth: 0.5, enabled: true },
        osc3: { type: 'triangle', octave: -2, semitone: 0, fine: 0, level: 0.3, pulseWidth: 0.5, enabled: false },
        oscSync: false, ringMod: false, noiseLevel: 0, noiseColor: 'white', oscFM: 0,
        filterCutoff: 500, filterResonance: 0.7, filterDrive: 1.8, filterMode: 0,
        filterEnvAmount: 0.7, filterEnvPolarity: 1, filterKeyTrack: 0.3,
        filterEnv: { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.08, curve: 'exp' },
        ampEnv: { attack: 0.001, decay: 0.08, sustain: 0.7, release: 0.08, curve: 'exp' },
        lfo: { rate: 1, depth: 0.1, destination: 'filter', type: 'sine', sync: false },
        glide: { enabled: true, time: 0.03, mode: 'constant-time' },
        masterVolume: 0.7,
        fx: { distortion: { enabled: true, amount: 0.3, tone: 0.5 }, chorus: { enabled: false, rate: 0.5, depth: 0.3, mix: 0.4 }, delay: { enabled: false, time: 0.3, feedback: 0.3, mix: 0.2, sync: false }, reverb: { enabled: false, size: 0.3, decay: 1.0, mix: 0.15 }, bitcrusher: { enabled: false, bits: 8, mix: 0.5 } },
      }
    },
  ],

  categories() {
    return [...new Set(this.factory.map(p => p.category))];
  },

  byCategory(cat) {
    return this.factory.filter(p => p.category === cat);
  },

  byName(name) {
    return this.factory.find(p => p.name === name);
  },

  saveCustom(name, params) {
    const custom = JSON.parse(localStorage.getItem('nexus-custom-presets') || '[]');
    custom.push({ name, params, custom: true });
    localStorage.setItem('nexus-custom-presets', JSON.stringify(custom));
  },

  loadCustom() {
    return JSON.parse(localStorage.getItem('nexus-custom-presets') || '[]');
  },

  deleteCustom(name) {
    const custom = JSON.parse(localStorage.getItem('nexus-custom-presets') || '[]');
    const filtered = custom.filter(p => p.name !== name);
    localStorage.setItem('nexus-custom-presets', JSON.stringify(filtered));
  },

  exportPreset(params) {
    return JSON.stringify(params, null, 2);
  },

  importPreset(json) {
    return JSON.parse(json);
  },
};