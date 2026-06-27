// Sequencer.js — 16-step sequencer with per-step parameter automation

export class Sequencer {
  constructor(engine) {
    this.engine = engine;
    this.steps = 16;
    this.pattern = this.createEmptyPattern();
    this.currentStep = 0;
    this.isPlaying = false;
    this.bpm = 120;
    this.swing = 0;
    this.direction = 'forward'; // forward, backward, pingpong, random
    this.pingpongDir = 1;
    this.automation = {}; // param -> array of 16 values
    this.intervalId = null;
    this.onStepCallback = null;
  }

  createEmptyPattern() {
    const arr = [];
    for (let i = 0; i < this.steps; i++) {
      arr.push({ note: null, velocity: 100, gate: 0.8, active: false });
    }
    return arr;
  }

  setStep(step, note, velocity = 100, gate = 0.8) {
    this.pattern[step] = { note, velocity, gate, active: note !== null };
  }

  toggleStep(step) {
    if (this.pattern[step].active) {
      this.pattern[step].active = false;
      this.pattern[step].note = null;
    } else {
      this.pattern[step].active = true;
      this.pattern[step].note = 60; // default C4
    }
    return this.pattern[step];
  }

  setStepNote(step, note) {
    this.pattern[step].note = note;
    this.pattern[step].active = true;
  }

  setAutomation(param, values) {
    this.automation[param] = values;
  }

  setAutoValue(param, step, value) {
    if (!this.automation[param]) this.automation[param] = new Array(16).fill(null);
    this.automation[param][step] = value;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.pingpongDir = 1;
    this.tick();
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.engine.allNotesOff();
  }

  pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    if (!this.isPlaying) return;

    const step = this.currentStep;
    const stepData = this.pattern[step];

    // Play note
    if (stepData.active && stepData.note !== null) {
      this.engine.noteOn(stepData.note, stepData.velocity);
      // Schedule note off based on gate
      const gateTime = (60 / this.bpm / 4) * stepData.gate * 1000;
      setTimeout(() => {
        this.engine.noteOff(stepData.note);
      }, gateTime);
    }

    // Apply automation
    for (const [param, values] of Object.entries(this.automation)) {
      if (values[step] !== null && values[step] !== undefined) {
        this.engine.setParam(param, values[step]);
      }
    }

    // UI callback
    if (this.onStepCallback) this.onStepCallback(step);

    // Advance step
    this.advanceStep();

    // Schedule next tick with swing
    const stepDuration = (60 / this.bpm / 4) * 1000; // 16th note
    const swingOffset = this.swing > 0 && step % 2 === 1 ? stepDuration * this.swing : 0;
    const nextDelay = stepDuration + swingOffset - (step % 2 === 0 && this.swing > 0 ? stepDuration * this.swing : 0);

    this.intervalId = setTimeout(() => this.tick(), nextDelay);
  }

  advanceStep() {
    switch (this.direction) {
      case 'forward':
        this.currentStep = (this.currentStep + 1) % this.steps;
        break;
      case 'backward':
        this.currentStep = (this.currentStep - 1 + this.steps) % this.steps;
        break;
      case 'pingpong':
        this.currentStep += this.pingpongDir;
        if (this.currentStep >= this.steps - 1) { this.currentStep = this.steps - 1; this.pingpongDir = -1; }
        if (this.currentStep <= 0) { this.currentStep = 0; this.pingpongDir = 1; }
        break;
      case 'random':
        this.currentStep = Math.floor(Math.random() * this.steps);
        break;
    }
  }

  setBpm(bpm) {
    this.bpm = bpm;
  }

  setSwing(swing) {
    this.swing = swing;
  }

  setDirection(dir) {
    this.direction = dir;
  }

  clear() {
    this.pattern = this.createEmptyPattern();
    this.automation = {};
  }

  randomize(scale = 'minor', rootNote = 60) {
    const scales = {
      minor: [0, 2, 3, 5, 7, 8, 10, 12],
      major: [0, 2, 4, 5, 7, 9, 11, 12],
      pentatonic: [0, 3, 5, 7, 10, 12],
      chromatic: [0,1,2,3,4,5,6,7,8,9,10,11,12],
    };
    const notes = scales[scale] || scales.minor;
    for (let i = 0; i < this.steps; i++) {
      if (Math.random() > 0.4) {
        const oct = Math.floor(Math.random() * 2) * 12;
        this.pattern[i] = {
          note: rootNote + notes[Math.floor(Math.random() * notes.length)] + oct,
          velocity: 60 + Math.floor(Math.random() * 60),
          gate: 0.5 + Math.random() * 0.5,
          active: true,
        };
      } else {
        this.pattern[i] = { note: null, velocity: 100, gate: 0.8, active: false };
      }
    }
  }

  exportPattern() {
    return JSON.stringify({ pattern: this.pattern, automation: this.automation, bpm: this.bpm });
  }

  importPattern(data) {
    const obj = JSON.parse(data);
    this.pattern = obj.pattern;
    this.automation = obj.automation;
    this.bpm = obj.bpm;
  }
}