// Visualizer.js — Oscilloscope + frequency spectrum analyzer

export class Visualizer {
  constructor(container, analyser) {
    this.container = container;
    this.analyser = analyser;
    this.mode = 'scope'; // 'scope', 'spectrum', 'both'
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('visualizer-canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.timeData = new Uint8Array(analyser.fftSize);
    this.freqData = new Uint8Array(analyser.frequencyBinCount);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.scale(dpr, dpr);
    this.w = rect.width;
    this.h = rect.height;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.analyser) return;

    this.ctx.clearRect(0, 0, this.w, this.h);

    if (this.mode === 'scope' || this.mode === 'both') {
      this.drawScope();
    }
    if (this.mode === 'spectrum' || this.mode === 'both') {
      this.drawSpectrum();
    }
  }

  drawScope() {
    this.analyser.getByteTimeDomainData(this.timeData);
    const ctx = this.ctx;
    const w = this.w;
    const h = this.mode === 'both' ? this.h / 2 : this.h;
    const yOff = this.mode === 'both' ? 0 : 0;

    // Grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, yOff + (h / 4) * i);
      ctx.lineTo(w, yOff + (h / 4) * i);
      ctx.stroke();
    }

    // Waveform
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    const sliceWidth = w / this.timeData.length;
    let x = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const v = this.timeData[i] / 128.0;
      const y = yOff + (v * h) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawSpectrum() {
    this.analyser.getByteFrequencyData(this.freqData);
    const ctx = this.ctx;
    const w = this.w;
    const h = this.mode === 'both' ? this.h / 2 : this.h;
    const yOff = this.mode === 'both' ? this.h / 2 : 0;

    const barCount = 80;
    const barWidth = w / barCount;
    const binsPerBar = Math.floor(this.freqData.length / barCount);

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      for (let j = 0; j < binsPerBar; j++) {
        sum += this.freqData[i * binsPerBar + j];
      }
      const avg = sum / binsPerBar;
      const barHeight = (avg / 255) * h;

      // Gradient
      const grad = ctx.createLinearGradient(0, yOff + h, 0, yOff + h - barHeight);
      grad.addColorStop(0, '#00e5ff');
      grad.addColorStop(0.5, '#7c4dff');
      grad.addColorStop(1, '#ff4081');

      ctx.fillStyle = grad;
      ctx.fillRect(i * barWidth + 1, yOff + h - barHeight, barWidth - 2, barHeight);
    }
  }

  setMode(mode) {
    this.mode = mode;
  }
}