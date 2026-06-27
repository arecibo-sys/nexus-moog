// Controller.js — UI ↔ Audio bridge, builds all controls, handles interaction

import { Knob } from './Knob.js';
import { Keyboard } from './Keyboard.js';
import { XYPad } from './XYPad.js';
import { Visualizer } from './Visualizer.js';
import { Presets } from '../presets/Presets.js';
import { Sequencer } from '../sequencer/Sequencer.js';

export class Controller {
  constructor(engine) {
    this.engine = engine;
    this.knobs = new Map();
    this.keyboard = null;
    this.xyPad = null;
    this.visualizer = null;
    this.sequencer = null;
    this.activePreset = null;
  }

  async init() {
    await this.engine.init();
    this.sequencer = new Sequencer(this.engine);
    this.buildVisualizer();
    this.buildOscillatorSection();
    this.buildMixerSection();
    this.buildFilterSection();
    this.buildEnvelopeSection();
    this.buildLFOSection();
    this.buildEffectsSection();
    this.buildMasterSection();
    this.buildKeyboard();
    this.buildXYPad();
    this.buildSequencer();
    this.buildPresetSelector();
    this.setupMIDI();
    this.setupKeyboardInput();
  }

  // ─── Visualizer ──────────────────────────────
  buildVisualizer() {
    const container = document.getElementById('visualizer');
    this.visualizer = new Visualizer(container, this.engine.getAnalyser());
  }

  // ─── Oscillators ──────────────────────────────
  buildOscillatorSection() {
    for (let i = 1; i <= 3; i++) {
      const section = document.getElementById(`osc${i}-section`);

      // Waveform selector
      const waveSelect = section.querySelector('.wave-select');
      waveSelect.addEventListener('change', (e) => {
        this.engine.setParam(`osc${i}.type`, e.target.value);
      });

      // Knobs
      this.addKnob(section, `osc${i}.octave`, { min: -3, max: 3, value: 0, step: 1, label: 'OCT' });
      this.addKnob(section, `osc${i}.semitone`, { min: -12, max: 12, value: 0, step: 1, label: 'SEMI' });
      this.addKnob(section, `osc${i}.fine`, { min: -50, max: 50, value: 0, step: 1, label: 'FINE' });
      this.addKnob(section, `osc${i}.level`, { min: 0, max: 1, value: 0.5, label: 'LEVEL' });
      this.addKnob(section, `osc${i}.pulseWidth`, { min: 0.05, max: 0.95, value: 0.5, label: 'PWM' });

      // Enable toggle
      const enableBtn = section.querySelector('.osc-enable');
      enableBtn.addEventListener('click', () => {
        const current = this.engine.getParam(`osc${i}.enabled`);
        this.engine.setParam(`osc${i}.enabled`, !current);
        enableBtn.classList.toggle('active', !current);
      });
    }

    // Sync & Ring Mod toggles
    document.getElementById('osc-sync-btn').addEventListener('click', (e) => {
      const val = !this.engine.getParam('oscSync');
      this.engine.setParam('oscSync', val);
      e.target.classList.toggle('active', val);
    });
    document.getElementById('ring-mod-btn').addEventListener('click', (e) => {
      const val = !this.engine.getParam('ringMod');
      this.engine.setParam('ringMod', val);
      e.target.classList.toggle('active', val);
    });
  }

  // ─── Mixer ───────────────────────────────────
  buildMixerSection() {
    const section = document.getElementById('mixer-section');
    this.addKnob(section, 'noiseLevel', { min: 0, max: 0.5, value: 0, label: 'NOISE' });

    const colorSelect = section.querySelector('.noise-color');
    colorSelect.addEventListener('change', (e) => {
      this.engine.setParam('noiseColor', e.target.value);
    });
  }

  // ─── Filter ──────────────────────────────────
  buildFilterSection() {
    const section = document.getElementById('filter-section');

    this.addKnob(section, 'filterCutoff', {
      min: 20, max: 20000, value: 2000, label: 'CUTOFF',
      format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`,
    });
    this.addKnob(section, 'filterResonance', { min: 0, max: 1.2, value: 0.3, label: 'RESO' });
    this.addKnob(section, 'filterDrive', { min: 0.1, max: 4, value: 1.0, label: 'DRIVE' });
    this.addKnob(section, 'filterEnvAmount', { min: 0, max: 1, value: 0.5, label: 'ENV AMT' });
    this.addKnob(section, 'filterKeyTrack', { min: 0, max: 1, value: 0.5, label: 'KEY TRK' });

    // Mode buttons
    const modes = ['LP', 'BP', 'HP'];
    modes.forEach((mode, idx) => {
      const btn = section.querySelector(`[data-filter-mode="${idx}"]`);
      btn.addEventListener('click', () => {
        this.engine.setParam('filterMode', idx);
        section.querySelectorAll('[data-filter-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Env polarity
    document.getElementById('filter-env-polarity').addEventListener('click', (e) => {
      const val = this.engine.getParam('filterEnvPolarity') * -1;
      this.engine.setParam('filterEnvPolarity', val);
      e.target.classList.toggle('negative', val < 0);
    });
  }

  // ─── Envelopes ───────────────────────────────
  buildEnvelopeSection() {
    const filterEnv = document.getElementById('filter-env-section');
    this.addKnob(filterEnv, 'filterEnv.attack', { min: 0.001, max: 5, value: 0.01, label: 'A', format: v => `${(v * 1000).toFixed(0)}ms` });
    this.addKnob(filterEnv, 'filterEnv.decay', { min: 0.001, max: 5, value: 0.3, label: 'D', format: v => `${(v * 1000).toFixed(0)}ms` });
    this.addKnob(filterEnv, 'filterEnv.sustain', { min: 0, max: 1, value: 0.5, label: 'S' });
    this.addKnob(filterEnv, 'filterEnv.release', { min: 0.001, max: 5, value: 0.5, label: 'R', format: v => `${(v * 1000).toFixed(0)}ms` });

    const ampEnv = document.getElementById('amp-env-section');
    this.addKnob(ampEnv, 'ampEnv.attack', { min: 0.001, max: 5, value: 0.01, label: 'A', format: v => `${(v * 1000).toFixed(0)}ms` });
    this.addKnob(ampEnv, 'ampEnv.decay', { min: 0.001, max: 5, value: 0.2, label: 'D', format: v => `${(v * 1000).toFixed(0)}ms` });
    this.addKnob(ampEnv, 'ampEnv.sustain', { min: 0, max: 1, value: 0.8, label: 'S' });
    this.addKnob(ampEnv, 'ampEnv.release', { min: 0.001, max: 5, value: 0.3, label: 'R', format: v => `${(v * 1000).toFixed(0)}ms` });

    // Curve toggle
    ['ampEnv', 'filterEnv'].forEach(env => {
      const btn = document.getElementById(`${env}-curve`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          const current = this.engine.getParam(`${env}.curve`);
          const next = current === 'exp' ? 'linear' : 'exp';
          this.engine.setParam(`${env}.curve`, next);
          e.target.textContent = next === 'exp' ? 'EXP' : 'LIN';
        });
      }
    });
  }

  // ─── LFO ─────────────────────────────────────
  buildLFOSection() {
    const section = document.getElementById('lfo-section');
    this.addKnob(section, 'lfo.rate', { min: 0.1, max: 20, value: 4, label: 'RATE', format: v => `${v.toFixed(1)}Hz` });
    this.addKnob(section, 'lfo.depth', { min: 0, max: 1, value: 0, label: 'DEPTH' });

    // LFO waveform
    const waveSelect = section.querySelector('.lfo-wave');
    waveSelect.addEventListener('change', (e) => {
      this.engine.setParam('lfo.type', e.target.value);
    });

    // LFO destination
    const destSelect = section.querySelector('.lfo-dest');
    destSelect.addEventListener('change', (e) => {
      this.engine.setParam('lfo.destination', e.target.value);
    });
  }

  // ─── Effects ─────────────────────────────────
  buildEffectsSection() {
    const effects = [
      { id: 'distortion', params: ['amount', 'tone'], labels: ['AMOUNT', 'TONE'], ranges: [{ min: 0, max: 1, value: 0.3 }, { min: 0, max: 1, value: 0.5 }] },
      { id: 'chorus', params: ['rate', 'depth', 'mix'], labels: ['RATE', 'DEPTH', 'MIX'], ranges: [{ min: 0.1, max: 5, value: 0.5 }, { min: 0, max: 1, value: 0.3 }, { min: 0, max: 1, value: 0.5 }] },
      { id: 'delay', params: ['time', 'feedback', 'mix'], labels: ['TIME', 'FB', 'MIX'], ranges: [{ min: 0.01, max: 2, value: 0.3 }, { min: 0, max: 0.9, value: 0.4 }, { min: 0, max: 1, value: 0.3 }] },
      { id: 'reverb', params: ['size', 'decay', 'mix'], labels: ['SIZE', 'DECAY', 'MIX'], ranges: [{ min: 0.1, max: 1, value: 0.5 }, { min: 0.5, max: 8, value: 2 }, { min: 0, max: 1, value: 0.3 }] },
      { id: 'bitcrusher', params: ['bits'], labels: ['BITS'], ranges: [{ min: 1, max: 16, value: 8 }] },
    ];

    for (const fx of effects) {
      const section = document.getElementById(`fx-${fx.id}`);
      if (!section) continue;

      // Enable toggle
      const enableBtn = section.querySelector('.fx-enable');
      enableBtn.addEventListener('click', () => {
        const current = this.engine.getParam(`fx.${fx.id}.enabled`);
        this.engine.setParam(`fx.${fx.id}.enabled`, !current);
        enableBtn.classList.toggle('active', !current);
        section.classList.toggle('fx-active', !current);
      });

      // Knobs
      fx.params.forEach((param, i) => {
        this.addKnob(section, `fx.${fx.id}.${param}`, {
          ...fx.ranges[i],
          label: fx.labels[i],
        });
      });
    }
  }

  // ─── Master ──────────────────────────────────
  buildMasterSection() {
    const section = document.getElementById('master-section');
    this.addKnob(section, 'masterVolume', { min: 0, max: 1, value: 0.8, label: 'VOLUME' });

    // Glide
    this.addKnob(section, 'glide.time', { min: 0, max: 1, value: 0.1, label: 'GLIDE' });
    const glideBtn = document.getElementById('glide-toggle');
    glideBtn.addEventListener('click', (e) => {
      const val = !this.engine.getParam('glide.enabled');
      this.engine.setParam('glide.enabled', val);
      e.target.classList.toggle('active', val);
    });
  }

  // ─── Keyboard ────────────────────────────────
  buildKeyboard() {
    const container = document.getElementById('keyboard');
    this.keyboard = new Keyboard(container, {
      startNote: 36,
      numOctaves: 4,
      onNoteOn: (note, vel) => this.engine.noteOn(note, vel),
      onNoteOff: (note) => this.engine.noteOff(note),
    });
  }

  // ─── XY Pad ──────────────────────────────────
  buildXYPad() {
    const container = document.getElementById('xy-pad');
    this.xyPad = new XYPad(container, {
      paramX: 'filterCutoff',
      paramY: 'filterResonance',
      minX: 20, maxX: 20000,
      minY: 0, maxY: 1.2,
      labelX: 'CUTOFF',
      labelY: 'RESO',
      onChange: (x, y, paramX, paramY) => {
        this.engine.setParam(paramX, x);
        this.engine.setParam(paramY, y);
        // Update knob visuals
        this.updateKnobVisual(paramX, x);
        this.updateKnobVisual(paramY, y);
      },
    });

    // XY assignment buttons
    const xAssign = document.getElementById('xy-assign-x');
    const yAssign = document.getElementById('xy-assign-y');
    const targets = ['filterCutoff', 'filterResonance', 'filterDrive', 'lfo.rate', 'lfo.depth', 'filterEnvAmount'];
    let xTargetIdx = 0, yTargetIdx = 1;

    xAssign.addEventListener('click', () => {
      xTargetIdx = (xTargetIdx + 1) % targets.length;
      const param = targets[xTargetIdx];
      this.xyPad.paramX = param;
      xAssign.textContent = `X: ${param.split('.').pop().toUpperCase()}`;
    });
    yAssign.addEventListener('click', () => {
      yTargetIdx = (yTargetIdx + 1) % targets.length;
      const param = targets[yTargetIdx];
      this.xyPad.paramY = param;
      yAssign.textContent = `Y: ${param.split('.').pop().toUpperCase()}`;
    });
  }

  // ─── Sequencer ───────────────────────────────
  buildSequencer() {
    const grid = document.getElementById('seq-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
      const step = document.createElement('div');
      step.classList.add('seq-step');
      step.dataset.step = i;
      step.addEventListener('click', () => {
        const result = this.sequencer.toggleStep(i);
        step.classList.toggle('step-active', result.active);
      });
      grid.appendChild(step);
    }

    // Play/Stop
    document.getElementById('seq-play').addEventListener('click', (e) => {
      if (this.sequencer.isPlaying) {
        this.sequencer.stop();
        e.target.textContent = 'PLAY';
        e.target.classList.remove('active');
      } else {
        this.sequencer.start();
        e.target.textContent = 'STOP';
        e.target.classList.add('active');
      }
    });

    document.getElementById('seq-clear').addEventListener('click', () => {
      this.sequencer.clear();
      grid.querySelectorAll('.seq-step').forEach(s => s.classList.remove('step-active'));
    });

    document.getElementById('seq-random').addEventListener('click', () => {
      this.sequencer.randomize('minor', 48);
      this.refreshSeqGrid();
    });

    // BPM
    const bpmInput = document.getElementById('seq-bpm');
    bpmInput.addEventListener('input', (e) => {
      this.sequencer.setBpm(parseInt(e.target.value));
      document.getElementById('seq-bpm-display').textContent = `${e.target.value} BPM`;
    });

    // Direction
    document.getElementById('seq-direction').addEventListener('change', (e) => {
      this.sequencer.setDirection(e.target.value);
    });

    // Swing
    const swingKnob = this.addKnob(document.getElementById('seq-swing'), '_seq.swing', {
      min: 0, max: 0.6, value: 0, label: 'SWING',
    });
    swingKnob.onChange = (v) => this.sequencer.setSwing(v);

    // Step callback for visual
    this.sequencer.onStepCallback = (step) => {
      grid.querySelectorAll('.seq-step').forEach(s => s.classList.remove('step-current'));
      grid.querySelector(`[data-step="${step}"]`)?.classList.add('step-current');
    };
  }

  refreshSeqGrid() {
    const grid = document.getElementById('seq-grid');
    this.sequencer.pattern.forEach((stepData, i) => {
      const stepEl = grid.querySelector(`[data-step="${i}"]`);
      if (stepEl) stepEl.classList.toggle('step-active', stepData.active);
    });
  }

  // ─── Presets ─────────────────────────────────
  buildPresetSelector() {
    const select = document.getElementById('preset-select');
    const categories = Presets.categories();

    select.innerHTML = '';
    categories.forEach(cat => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = cat;
      Presets.byCategory(cat).forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.name;
        option.textContent = preset.name;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    });

    // Custom presets
    const custom = Presets.loadCustom();
    if (custom.length > 0) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = 'Custom';
      custom.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.name;
        option.textContent = preset.name;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    }

    select.addEventListener('change', (e) => {
      this.loadPreset(e.target.value);
    });

    // Save preset
    document.getElementById('preset-save').addEventListener('click', () => {
      const name = prompt('Preset name:');
      if (!name) return;
      Presets.saveCustom(name, this.engine.params);
      this.buildPresetSelector();
      select.value = name;
    });

    // Randomize
    document.getElementById('preset-random').addEventListener('click', () => {
      this.randomizeParams();
    });

    // Panic
    document.getElementById('panic-btn').addEventListener('click', () => {
      this.engine.allNotesOff();
    });
  }

  loadPreset(name) {
    let preset = Presets.byName(name);
    if (!preset) {
      const custom = Presets.loadCustom();
      preset = custom.find(p => p.name === name);
    }
    if (!preset) return;

    this.engine.params = JSON.parse(JSON.stringify(preset.params));
    this.activePreset = name;
    this.refreshAllKnobs();
    this.engine.effects.setParams(this.engine.params.fx);
  }

  randomizeParams() {
    const p = this.engine.params;
    const waveforms = ['sine', 'sawtooth', 'square', 'triangle'];
    p.osc1.type = waveforms[Math.floor(Math.random() * waveforms.length)];
    p.osc2.type = waveforms[Math.floor(Math.random() * waveforms.length)];
    p.osc2.semitone = Math.floor(Math.random() * 24) - 12;
    p.osc2.fine = Math.floor(Math.random() * 20) - 10;
    p.filterCutoff = 200 + Math.random() * 8000;
    p.filterResonance = Math.random() * 0.8;
    p.filterEnvAmount = Math.random();
    p.filterEnv.attack = Math.random() * 0.5;
    p.filterEnv.decay = 0.1 + Math.random() * 1;
    p.filterEnv.sustain = Math.random();
    p.filterEnv.release = 0.1 + Math.random() * 1;
    p.ampEnv.attack = Math.random() * 0.3;
    p.ampEnv.decay = 0.1 + Math.random() * 0.5;
    p.ampEnv.sustain = 0.3 + Math.random() * 0.6;
    p.ampEnv.release = 0.1 + Math.random() * 1;
    p.lfo.rate = 0.5 + Math.random() * 10;
    p.lfo.depth = Math.random() * 0.3;
    this.refreshAllKnobs();
  }

  // ─── MIDI ────────────────────────────────────
  async setupMIDI() {
    if (!navigator.requestMIDIAccess) return;
    try {
      const access = await navigator.requestMIDIAccess();
      access.inputs.forEach(input => {
        input.onmidimessage = (e) => this.handleMIDIMessage(e);
      });
      access.onstatechange = () => {
        access.inputs.forEach(input => {
          input.onmidimessage = (e) => this.handleMIDIMessage(e);
        });
      };
    } catch (e) {
      // MIDI not available
    }
  }

  handleMIDIMessage(e) {
    const [status, note, velocity] = e.data;
    const type = status & 0xf0;
    if (type === 0x90 && velocity > 0) {
      this.engine.noteOn(note, velocity);
      this.keyboard?.highlightNote(note);
    } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
      this.engine.noteOff(note);
    }
  }

  // ─── Computer Keyboard ───────────────────────
  setupKeyboardInput() {
    const keyMap = {
      'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64, 'f': 65, 't': 66,
      'g': 67, 'y': 68, 'h': 69, 'u': 70, 'j': 71, 'k': 72,
      'o': 73, 'l': 74, 'p': 75, ';': 76, "'": 77,
    };
    const heldKeys = new Set();

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      const note = keyMap[e.key.toLowerCase()];
      if (note && !heldKeys.has(e.key.toLowerCase())) {
        heldKeys.add(e.key.toLowerCase());
        this.engine.noteOn(note, 100);
        this.keyboard?.highlightNote(note);
      }
    });

    document.addEventListener('keyup', (e) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note && heldKeys.has(e.key.toLowerCase())) {
        heldKeys.delete(e.key.toLowerCase());
        this.engine.noteOff(note);
      }
    });
  }

  // ─── Knob Helper ─────────────────────────────
  addKnob(container, paramPath, options) {
    const knobContainer = document.createElement('div');
    knobContainer.classList.add('knob-container');
    const knobRow = container.querySelector('.knob-row');
    if (knobRow) {
      knobRow.appendChild(knobContainer);
    } else {
      container.appendChild(knobContainer);
    }

    const knob = new Knob(knobContainer, {
      ...options,
      onChange: (val) => {
        this.engine.setParam(paramPath, val);
      },
    });
    this.knobs.set(paramPath, { knob, container: knobContainer });
    return knob;
  }

  updateKnobVisual(paramPath, value) {
    const entry = this.knobs.get(paramPath);
    if (entry) {
      entry.knob.setValue(value);
    }
  }

  refreshAllKnobs() {
    this.knobs.forEach((entry, paramPath) => {
      const value = this.engine.getParam(paramPath);
      if (value !== undefined) entry.knob.setValue(value);
    });
  }
}