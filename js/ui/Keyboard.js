// Keyboard.js — Virtual keyboard with mouse and touch support

export class Keyboard {
  constructor(container, options = {}) {
    this.container = container;
    this.startNote = options.startNote ?? 36; // C2
    this.numOctaves = options.numOctaves ?? 4;
    this.onNoteOn = options.onNoteOn || (() => {});
    this.onNoteOff = options.onNoteOff || (() => {});
    this.activeNotes = new Set();
    this.whiteKeys = [];
    this.blackKeys = [];
    this.build();
  }

  build() {
    this.container.innerHTML = '';
    const totalKeys = this.numOctaves * 12;
    const whiteKeyPattern = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
    const blackKeyPattern = [1, 3, 6, 8, 10]; // C# D# F# G# A#

    const numWhiteKeys = this.numOctaves * 7;
    const whiteKeyWidth = 100 / numWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;

    const wrapper = document.createElement('div');
    wrapper.classList.add('keyboard-wrapper');

    // White keys
    let whiteIdx = 0;
    for (let oct = 0; oct < this.numOctaves; oct++) {
      for (const semitone of whiteKeyPattern) {
        const note = this.startNote + oct * 12 + semitone;
        const key = document.createElement('div');
        key.classList.add('key', 'key-white');
        key.style.left = `${whiteIdx * whiteKeyWidth}%`;
        key.style.width = `${whiteKeyWidth}%`;
        key.dataset.note = note;
        const label = document.createElement('span');
        label.classList.add('key-label');
        if (semitone === 0) label.textContent = `C${Math.floor(note / 12) - 1}`;
        key.appendChild(label);
        wrapper.appendChild(key);
        this.whiteKeys.push({ element: key, note });
        whiteIdx++;
      }
    }

    // Black keys
    for (let oct = 0; oct < this.numOctaves; oct++) {
      for (const semitone of blackKeyPattern) {
        const note = this.startNote + oct * 12 + semitone;
        // Position relative to white keys
        const octaveStart = oct * 7;
        let whiteOffset;
        switch (semitone) {
          case 1: whiteOffset = 1; break;  // after C
          case 3: whiteOffset = 2; break;  // after D
          case 6: whiteOffset = 4; break;  // after F
          case 8: whiteOffset = 5; break;  // after G
          case 10: whiteOffset = 6; break; // after A
        }
        const key = document.createElement('div');
        key.classList.add('key', 'key-black');
        const leftPos = (octaveStart + whiteOffset) * whiteKeyWidth - blackKeyWidth / 2;
        key.style.left = `${leftPos}%`;
        key.style.width = `${blackKeyWidth}%`;
        key.dataset.note = note;
        wrapper.appendChild(key);
        this.blackKeys.push({ element: key, note });
      }
    }

    this.container.appendChild(wrapper);

    // Mouse events
    let isMouseDown = false;

    const handleKeyDown = (note) => {
      if (this.activeNotes.has(note)) return;
      this.activeNotes.add(note);
      this.setKeyVisual(note, true);
      this.onNoteOn(note, 100);
    };

    const handleKeyUp = (note) => {
      if (!this.activeNotes.has(note)) return;
      this.activeNotes.delete(note);
      this.setKeyVisual(note, false);
      this.onNoteOff(note);
    };

    wrapper.addEventListener('pointerdown', (e) => {
      const key = e.target.closest('.key');
      if (!key) return;
      isMouseDown = true;
      handleKeyDown(parseInt(key.dataset.note));
      e.preventDefault();
    });

    wrapper.addEventListener('pointermove', (e) => {
      if (!isMouseDown) return;
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const key = elem?.closest('.key');
      if (!key) return;
      const note = parseInt(key.dataset.note);
      if (!this.activeNotes.has(note)) {
        // Release previous notes
        this.activeNotes.forEach(n => {
          handleKeyUp(n);
        });
        handleKeyDown(note);
      }
    });

    document.addEventListener('pointerup', () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      this.activeNotes.forEach(n => handleKeyUp(n));
    });

    // Touch leave
    wrapper.addEventListener('pointerleave', () => {
      if (isMouseDown) {
        this.activeNotes.forEach(n => handleKeyUp(n));
      }
    });
  }

  setKeyVisual(note, active) {
    const key = this.whiteKeys.find(k => k.note === note) || this.blackKeys.find(k => k.note === note);
    if (key) {
      key.element.classList.toggle('key-active', active);
    }
  }

  highlightNote(note, duration = 200) {
    this.setKeyVisual(note, true);
    setTimeout(() => this.setKeyVisual(note, false), duration);
  }
}