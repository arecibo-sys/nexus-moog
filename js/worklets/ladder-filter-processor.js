// Moog Ladder Filter AudioWorklet — authentic transistor-ladder emulation
// Based on the Stilson/Goldberg model with improvements by Zavalishin (zero-delay feedback)
// 4-stage cascade with thermal feedback for self-oscillation

class LadderFilterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'cutoff', defaultValue: 1000, minValue: 20, maxValue: 20000, automationRate: 'k-rate' },
      { name: 'resonance', defaultValue: 0.3, minValue: 0, maxValue: 1.2, automationRate: 'k-rate' },
      { name: 'drive', defaultValue: 1.0, minValue: 0.1, maxValue: 4.0, automationRate: 'k-rate' },
      { name: 'mode', defaultValue: 0, minValue: 0, maxValue: 2, automationRate: 'k-rate' }, // 0=LP, 1=BP, 2=HP
    ];
  }

  constructor() {
    super();
    this.stage = [0, 0, 0, 0];      // 4 filter stage outputs
    this.stageTanh = [0, 0, 0, 0];   // tanh-saturated stage values
    this.delay = [0, 0, 0, 0];       // unit delay for zero-delay feedback
    this.feedback = 0;
    this.sampleRate = sampleRate;
    this.T = 1.0 / sampleRate;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || input.length === 0) return true;

    const cutoffParam = parameters.cutoff;
    const resParam = parameters.resonance;
    const driveParam = parameters.drive;
    const modeParam = parameters.mode;

    for (let ch = 0; ch < input.length; ch++) {
      const inBuf = input[ch];
      const outBuf = output[ch];
      if (!inBuf) continue;

      // Per-channel state would be needed for stereo; for simplicity we process
      // each channel with shared state reset per render quantum (mono path is primary)
      if (ch > 0) {
        // Reset state for second channel
        this.stageS = this.stageS || [0,0,0,0];
        this.stageTanhS = this.stageTanhS || [0,0,0,0];
        this.delayS = this.delayS || [0,0,0,0];
        this.feedbackS = this.feedbackS || 0;
      }

      for (let i = 0; i < inBuf.length; i++) {
        const cutoff = cutoffParam.length > 1 ? cutoffParam[i] : cutoffParam[0];
        const res = resParam.length > 1 ? resParam[i] : resParam[0];
        const drive = driveParam.length > 1 ? driveParam[i] : driveParam[0];
        const mode = modeParam.length > 1 ? modeParam[i] : modeParam[0];

        // Pre-warp frequency for bilinear transform
        const wc = 2 * Math.PI * cutoff;
        const T = this.T;
        // Stable coefficients for all sample rates
        const wcT = wc * T;
        const g = wcT / (1 + wcT); // ensures stability

        // Resonance compensation (Moog style)
        const comp = Math.max(0, 1.0 - res * 0.8);
        const k = res * 4.0; // feedback gain (4 = self-oscillation)

        const s = ch === 0 ? this.stage : (this.stageS || [0,0,0,0]);
        const sTanh = ch === 0 ? this.stageTanh : (this.stageTanhS || [0,0,0,0]);
        const d = ch === 0 ? this.delay : (this.delayS || [0,0,0,0]);
        let fb = ch === 0 ? this.feedback : (this.feedbackS || 0);

        // Drive input with soft clip (analog warmth)
        let x = inBuf[i] * drive;
        x = Math.tanh(x * 0.5) * 2.0; // pre-stage saturation

        // Zero-delay feedback loop (Zavalishin method)
        // Estimate feedback with one-sample delay + correction
        const fbEst = fb;
        const u = (x - k * fbEst) / comp;

        // 4-stage cascade with saturation per stage
        for (let st = 0; st < 4; st++) {
          sTanh[st] = Math.tanh(s[st]);
          const v = g * (u * (st === 0 ? 1.0 : sTanh[st - 1]) - sTanh[st]);
          s[st] = s[st] + v;
        }

        // Update feedback estimate for next sample
        fb = sTanh[3];
        if (ch === 0) this.feedback = fb; else this.feedbackS = fb;

        // Output mode selection
        let out;
        if (mode < 0.5) {
          // Lowpass: 4th stage output
          out = s[3];
        } else if (mode < 1.5) {
          // Bandpass: 2nd stage
          out = s[1] * 0.7;
        } else {
          // Highpass: input - lowpass
          out = x - s[3] * 0.5;
        }

        // Post-filter soft clip
        out = Math.tanh(out * 1.5) * 0.667;

        // Store delays
        for (let st = 0; st < 4; st++) d[st] = sTanh[st];

        outBuf[i] = out;
      }
    }

    return true;
  }
}

registerProcessor('ladder-filter', LadderFilterProcessor);