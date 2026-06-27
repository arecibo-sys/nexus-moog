// NoteHandler.js — Note priority, glide, arpeggiator

export class NoteHandler {
  constructor(engine) {
    this.engine = engine;
    this.heldNotes = []; // ordered by time
    this.priority = 'last'; // last, low, high
    this.arpeggiator = {
      enabled: false,
      pattern: 'up', // up, down, updown, random, order, chord
      rate: 16, // 16th notes
      sync: false,
      octaveRange: 1,
      currentStep: 0,
      interval: null,
      lastNote: null,
    };
  }

  noteOn(midiNote, velocity) {
    // Remove if already held
    this.heldNotes = this.heldNotes.filter(n => n.note !== midiNote);
    this.heldNotes.push({ note: midiNote, velocity, time: this.engine.ctx.currentTime });

    if (this.arpeggiator.enabled && this.heldNotes.length > 0) {
      if (!this.arpeggiator.interval) this.startArp();
    } else {
      this.engine.createVoice(midiNote, velocity);
    }
  }

  noteOff(midiNote) {
    this.heldNotes = this.heldNotes.filter(n => n.note !== midiNote);

    if (this.arpeggiator.enabled) {
      if (this.heldNotes.length === 0) {
        this.stopArp();
        if (this.arpeggiator.lastNote !== null) {
          this.engine.releaseVoice(this.arpeggiator.lastNote);
          this.arpeggiator.lastNote = null;
        }
      }
    } else {
      this.engine.releaseVoice(midiNote);
    }
  }

  startArp() {
    const rateHz = this.bpmToHz(this.arpeggiator.rate, this.engine.bpm || 120);
    const intervalMs = (60 / rateHz) * 1000;
    this.arpeggiator.currentStep = 0;

    this.arpeggiator.interval = setInterval(() => {
      this.arpStep();
    }, intervalMs);
  }

  arpStep() {
    if (this.heldNotes.length === 0) return;

    const notes = [...this.heldNotes];
    const pattern = this.arpeggiator.pattern;
    const octRange = this.arpeggiator.octaveRange;
    let seq = [];

    // Build sequence based on pattern
    const sortedNotes = notes.map(n => n.note).sort((a, b) => a - b);
    for (let oct = 0; oct <= octRange; oct++) {
      const offset = oct * 12;
      let group;
      switch (pattern) {
        case 'up':
          group = sortedNotes.map(n => n + offset);
          break;
        case 'down':
          group = [...sortedNotes].reverse().map(n => n + offset);
          break;
        case 'updown':
          group = sortedNotes.map(n => n + offset);
          if (oct === octRange) group = [...group, ...[...sortedNotes].reverse().map(n => n + offset)];
          break;
        case 'random':
          group = [sortedNotes[Math.floor(Math.random() * sortedNotes.length)] + offset];
          break;
        case 'order':
          group = notes.map(n => n.note + offset);
          break;
        case 'chord':
          group = sortedNotes.map(n => n + offset);
          break;
        default:
          group = sortedNotes.map(n => n + offset);
      }
      seq = seq.concat(group);
    }

    const noteToPlay = seq[this.arpeggiator.currentStep % seq.length];

    // Release previous note
    if (this.arpeggiator.lastNote !== null && this.arpeggiator.lastNote !== noteToPlay) {
      this.engine.releaseVoice(this.arpeggiator.lastNote);
    }

    this.engine.createVoice(noteToPlay, 100);
    this.arpeggiator.lastNote = noteToPlay;
    this.arpeggiator.currentStep++;
  }

  stopArp() {
    if (this.arpeggiator.interval) {
      clearInterval(this.arpeggiator.interval);
      this.arpeggiator.interval = null;
    }
  }

  bpmToHz(rate, bpm) {
    // rate = note division (4=quarter, 8=eighth, 16=sixteenth)
    return (bpm / 60) * (rate / 4);
  }

  setPriority(mode) {
    this.priority = mode;
  }

  setArpParam(param, value) {
    this.arpeggiator[param] = value;
    if (param === 'enabled' && !value) {
      this.stopArp();
    }
    if (param === 'rate' || param === 'octaveRange' && this.arpeggiator.enabled) {
      this.stopArp();
      this.startArp();
    }
  }

  allOff() {
    this.stopArp();
    this.heldNotes = [];
    this.engine.allNotesOff();
  }
}