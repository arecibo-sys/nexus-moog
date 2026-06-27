# NEXUS-Moog — Advanced Web Audio Synthesizer

A competition-grade Moog-style subtractive synthesizer built with the Web Audio API. Features an authentic transistor-ladder filter emulation, modern UI with interactive controls, and a full sound-design suite.

## Features

### Sound Engine
- **3 oscillators** per voice with 6 waveforms (sine, saw, square, triangle, PWM, noise)
- **Authentic Moog ladder filter** (custom AudioWorklet DSP with resonance self-oscillation)
- **Dual ADSR envelopes** (filter + amplitude) with linear/exponential curves
- **LFO** with 5 destinations (pitch, filter, amp, PWM, pan)
- **Hard sync, ring mod, oscillator FM**
- **Noise generator** with color control (white/pink/red)
- **Glide/portamento** with constant-time and constant-rate modes

### Effects Chain
- **Analog-style saturation/distortion** (waveshaper with anti-aliasing)
- **Stereo chorus** with depth and rate
- **Tape delay** with sync and feedback
- **Convolution reverb** (algorithmic IR generation)
- **Bitcrusher** for lo-fi character

### Performance Features
- **32-voice polyphony** with note priority (last/low/high)
- **Built-in arpeggiator** with 6 patterns and sync
- **Step sequencer** (16 steps, per-step parameter automation)
- **XY control pad** assignable to 2 parameters
- **Keyboard split** and zone control
- **MIDI input** (USB MIDI controllers)
- **Computer keyboard** playable (QWERTY mapping)

### Preset System
- **40+ factory presets** across categories (Bass, Lead, Pad, Keys, FX, Drum)
- **Patch memory** with save/load/export/import (JSON)
- **Parameter morphing** between presets
- **Randomization** with constraint ranges

### Modern UI
- **Custom SVG knobs** with radial indicators
- **Real-time waveform display** (oscilloscope)
- **Frequency spectrum analyzer**
- **XY pad** with visual feedback
- **Neon glassmorphism** design
- **Responsive layout** — works on tablet/desktop

## Architecture

```
moog-synth/
├── index.html              # Main UI layout
├── css/
│   └── style.css           # Neon glassmorphism styling
├── js/
│   ├── audio/
│   │   ├── Engine.js       # AudioContext, voice management
│   │   ├── Voice.js        # Per-voice oscillator + envelope DSP
│   │   ├── LadderFilter.js # Moog ladder filter worklet
│   │   ├── Effects.js      # Distortion, chorus, delay, reverb
│   │   └── NoteHandler.js  # Note priority, glide, arpeggiator
│   ├── sequencer/
│   │   └── Sequencer.js    # 16-step sequencer with automation
│   ├── presets/
│   │   └── Presets.js      # Factory patches + management
│   ├── ui/
│   │   ├── Knob.js         # SVG knob component
│   │   ├── Keyboard.js     # Virtual keyboard
│   │   ├── XYPad.js        # XY parameter pad
│   │   ├── Visualizer.js   # Oscilloscope + spectrum
│   │   └── Controller.js   # UI ↔ audio bridge
│   ├── worklets/
│   │   └── ladder-filter-processor.js  # Filter DSP worklet
│   └── app.js              # Entry point
└── README.md
```

## Technology
- **Web Audio API** with AudioWorklets for sample-accurate DSP
- **Vanilla JS (ES6+)** — no build step, no dependencies
- **SVG UI components** — resolution-independent, custom-designed
- **Web MIDI API** for hardware controller support

## Browser Support
Chrome 90+, Edge 90+, Firefox 90+, Safari 15+. AudioWorklet required.

## License
MIT

## Author
arecibo-sys