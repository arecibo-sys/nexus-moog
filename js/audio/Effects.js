// Effects.js — Full effects chain: distortion, chorus, delay, reverb, bitcrusher

export class EffectsRack {
  constructor(ctx) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.input.gain.value = 1.0;

    // Chain nodes
    this.distortion = this.createDistortion();
    this.chorus = this.createChorus();
    this.delay = this.createDelay();
    this.reverb = this.createReverb();
    this.bitcrusher = this.createBitcrusher();

    // Wet/dry gains for each effect
    this.distortionDry = ctx.createGain();
    this.distortionWet = ctx.createGain();
    this.chorusDry = ctx.createGain();
    this.chorusWet = ctx.createGain();
    this.delayDry = ctx.createGain();
    this.delayWet = ctx.createGain();
    this.reverbDry = ctx.createGain();
    this.reverbWet = ctx.createGain();
    this.bcDry = ctx.createGain();
    this.bcWet = ctx.createGain();

    this.output = ctx.createGain();
    this.output.gain.value = 1.0;

    this.buildChain();
    this.params = null;
  }

  buildChain() {
    const ctx = this.ctx;

    // Simple serial chain: input -> distortion -> chorus -> delay -> reverb -> bitcrusher -> output
    // Each effect has a dry bypass that's controlled by enable state via wet/dry gains
    this.input.connect(this.distortion.input);
    this.distortion.output.connect(this.chorus.input);
    this.chorus.output.connect(this.delay.input);
    this.delay.output.connect(this.reverb.input);
    this.reverb.output.connect(this.bitcrusher.input);
    this.bitcrusher.output.connect(this.output);
  }

  createDistortion() {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    const output = ctx.createGain();
    const preGain = ctx.createGain();
    const postGain = ctx.createGain();

    preGain.gain.value = 1;
    postGain.gain.value = 1;
    input.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(postGain);
    postGain.connect(output);

    return { input, output, shaper, preGain, postGain, enabled: false };
  }

  createChorus() {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const output = ctx.createGain();

    // Two delay lines modulated by LFOs at different rates for stereo chorus
    const delay1 = ctx.createDelay();
    const delay2 = ctx.createDelay();
    delay1.delayTime.value = 0.015;
    delay2.delayTime.value = 0.020;

    const lfo1 = ctx.createOscillator();
    const lfo2 = ctx.createOscillator();
    lfo1.type = 'sine';
    lfo2.type = 'sine';
    lfo1.frequency.value = 0.5;
    lfo2.frequency.value = 0.7;

    const lfoGain1 = ctx.createGain();
    const lfoGain2 = ctx.createGain();
    lfoGain1.gain.value = 0.003;
    lfoGain2.gain.value = 0.004;

    lfo1.connect(lfoGain1);
    lfo1.connect(delay1.delayTime);
    lfo2.connect(lfoGain2);
    lfo2.connect(delay2.delayTime);

    const merger = ctx.createGain();
    input.connect(delay1);
    input.connect(delay2);
    input.connect(output); // dry pass
    delay1.connect(merger);
    delay2.connect(merger);
    merger.connect(output);

    lfo1.start();
    lfo2.start();

    return { input, output, lfo1, lfo2, lfoGain1, lfoGain2, delay1, delay2, merger, enabled: false };
  }

  createDelay() {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const output = ctx.createGain();
    const delayNode = ctx.createDelay(5.0);
    delayNode.delayTime.value = 0.3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.4;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.3;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4000; // tape warmth

    input.connect(output); // dry
    input.connect(delayNode);
    delayNode.connect(filter);
    filter.connect(feedback);
    feedback.connect(delayNode);
    filter.connect(wetGain);
    wetGain.connect(output);

    return { input, output, delayNode, feedback, wetGain, filter, enabled: false };
  }

  createReverb() {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const output = ctx.createGain();
    const convolver = ctx.createConvolver();
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.3;

    // Generate algorithmic impulse response
    this.generateIR(convolver, 2.0, 0.5);

    input.connect(output); // dry
    input.connect(convolver);
    convolver.connect(wetGain);
    wetGain.connect(output);

    return { input, output, convolver, wetGain, enabled: false };
  }

  generateIR(convolver, duration, decay) {
    const sr = this.ctx.sampleRate;
    const length = sr * duration;
    const impulse = this.ctx.createBuffer(2, length, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Exponential decay with early reflection pattern
        const envelope = Math.pow(1 - t, decay * 3);
        const reflection = i < sr * 0.01 ? Math.random() * 2 - 1 : 0;
        data[i] = (Math.random() * 2 - 1) * envelope + reflection * (1 - t * 100);
      }
    }
    convolver.buffer = impulse;
  }

  createBitcrusher() {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const output = ctx.createGain();
    // We'll use a ScriptProcessor fallback or waveshaper approximation
    // For now, use a simple quantization via waveshaper curve
    const shaper = ctx.createWaveShaper();
    this.updateBitcrusher(shaper, 8);

    input.connect(shaper);
    shaper.connect(output);
    return { input, output, shaper, enabled: false };
  }

  updateBitcrusher(shaper, bits) {
    const levels = Math.pow(2, bits);
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * 2 - 1;
      curve[i] = Math.round(x * levels) / levels;
    }
    shaper.curve = curve;
  }

  setParams(fxParams) {
    this.params = fxParams;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    // Distortion
    const dist = fxParams.distortion;
    if (dist.enabled) {
      this.distortion.preGain.gain.setTargetAtTime(1 + dist.amount * 10, t, 0.01);
      this.distortion.postGain.gain.setTargetAtTime(1 / (1 + dist.amount * 3), t, 0.01);
      this.updateDistortionCurve(dist.amount, dist.tone);
    }

    // Chorus
    const chorus = fxParams.chorus;
    if (chorus.enabled) {
      this.chorus.lfo1.frequency.setTargetAtTime(chorus.rate, t, 0.01);
      this.chorus.lfo2.frequency.setTargetAtTime(chorus.rate * 1.3, t, 0.01);
      this.chorus.lfoGain1.gain.setTargetAtTime(chorus.depth * 0.005, t, 0.01);
      this.chorus.lfoGain2.gain.setTargetAtTime(chorus.depth * 0.007, t, 0.01);
      this.chorus.merger.gain.setTargetAtTime(chorus.mix, t, 0.01);
    }

    // Delay
    const delay = fxParams.delay;
    if (delay.enabled) {
      this.delay.delayNode.delayTime.setTargetAtTime(delay.time, t, 0.01);
      this.delay.feedback.gain.setTargetAtTime(delay.feedback, t, 0.01);
      this.delay.wetGain.gain.setTargetAtTime(delay.mix, t, 0.01);
    }

    // Reverb
    const reverb = fxParams.reverb;
    if (reverb.enabled) {
      this.generateIR(this.reverb.convolver, reverb.decay, reverb.size);
      this.reverb.wetGain.gain.setTargetAtTime(reverb.mix, t, 0.01);
    }

    // Bitcrusher
    const bc = fxParams.bitcrusher;
    if (bc.enabled) {
      this.updateBitcrusher(this.bitcrusher.shaper, bc.bits);
    }
  }

  updateDistortionCurve(amount, tone) {
    const k = amount * 100;
    const curve = new Float32Array(4096);
    for (let i = 0; i < 4096; i++) {
      const x = (i / 2048) - 1;
      // Soft clip with tone control
      const drive = 1 + amount * 5;
      let y = (1 + k) * x / (1 + k * Math.abs(x));
      // Tone: high-pass emphasis for high tone values
      if (tone > 0.5) {
        y = y * (1 + (tone - 0.5) * 2 * Math.sign(x) * Math.pow(Math.abs(x), 0.5));
      }
      curve[i] = Math.tanh(y * drive) / Math.tanh(drive);
    }
    this.distortion.shaper.curve = curve;
  }

  connect(dest) {
    this.output.connect(dest);
  }

  disconnect() {
    this.output.disconnect();
  }
}