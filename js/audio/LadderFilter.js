// LadderFilter.js — Wrapper for the Moog ladder filter AudioWorklet

export class LadderFilter {
  constructor(ctx) {
    this.ctx = ctx;
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    try {
      await this.ctx.audioWorklet.addModule('js/worklets/ladder-filter-processor.js');
      this.loaded = true;
    } catch (e) {
      console.error('Failed to load ladder filter worklet:', e);
      // Fallback: use BiquadFilter
      this.fallback = true;
    }
  }

  createNode(params = {}) {
    if (this.fallback) {
      const node = this.ctx.createBiquadFilter();
      node.type = 'lowpass';
      node.frequency.value = params.cutoff || 2000;
      node.Q.value = (params.resonance || 0.3) * 10;
      return node;
    }
    return this.ctx.createAudioWorkletNode('ladder-filter', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 1,
      parameterData: {
        cutoff: params.cutoff || 2000,
        resonance: params.resonance || 0.3,
        drive: params.drive || 1.0,
        mode: params.mode || 0,
      },
    });
  }
}