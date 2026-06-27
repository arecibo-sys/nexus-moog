// XYPad.js — XY control pad assignable to 2 parameters

export class XYPad {
  constructor(container, options = {}) {
    this.container = container;
    this.paramX = options.paramX || 'filterCutoff';
    this.paramY = options.paramY || 'filterResonance';
    this.minX = options.minX ?? 20;
    this.maxX = options.maxX ?? 20000;
    this.minY = options.minY ?? 0;
    this.maxY = options.maxY ?? 1.2;
    this.labelX = options.labelX || 'Cutoff';
    this.labelY = options.labelY || 'Resonance';
    this.onChange = options.onChange || (() => {});
    this.valueX = (this.minX + this.maxX) / 2;
    this.valueY = (this.minY + this.maxY) / 2;

    this.build();
  }

  build() {
    this.container.innerHTML = '';
    this.container.classList.add('xy-pad-container');

    const pad = document.createElement('div');
    pad.classList.add('xy-pad');

    // Grid lines
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    grid.classList.add('xy-grid');
    grid.setAttribute('viewBox', '0 0 100 100');
    grid.setAttribute('preserveAspectRatio', 'none');
    for (let i = 1; i < 4; i++) {
      const vline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vline.setAttribute('x1', i * 25);
      vline.setAttribute('y1', 0);
      vline.setAttribute('x2', i * 25);
      vline.setAttribute('y2', 100);
      vline.classList.add('xy-grid-line');
      grid.appendChild(vline);

      const hline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hline.setAttribute('x1', 0);
      hline.setAttribute('y1', i * 25);
      hline.setAttribute('x2', 100);
      hline.setAttribute('y2', i * 25);
      hline.classList.add('xy-grid-line');
      grid.appendChild(hline);
    }

    // Trail canvas
    this.trailCanvas = document.createElement('canvas');
    this.trailCanvas.classList.add('xy-trail');
    this.trailCanvas.width = 300;
    this.trailCanvas.height = 300;

    // Handle (dot)
    this.handle = document.createElement('div');
    this.handle.classList.add('xy-handle');

    // Labels
    const labelX = document.createElement('div');
    labelX.classList.add('xy-label', 'xy-label-x');
    labelX.textContent = this.labelX;

    const labelY = document.createElement('div');
    labelY.classList.add('xy-label', 'xy-label-y');
    labelY.textContent = this.labelY;

    pad.appendChild(grid);
    pad.appendChild(this.trailCanvas);
    pad.appendChild(this.handle);
    pad.appendChild(labelX);
    pad.appendChild(labelY);
    this.container.appendChild(pad);

    this.trailCtx = this.trailCanvas.getContext('2d');
    this.trailPoints = [];

    // Events
    let isDragging = false;

    const updateFromEvent = (e) => {
      const rect = pad.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      // X: left=min, right=max
      this.valueX = this.minX + x * (this.maxX - this.minX);
      // Y: top=max, bottom=min (inverted)
      this.valueY = this.maxY - y * (this.maxY - this.minY);

      this.handle.style.left = `${x * 100}%`;
      this.handle.style.top = `${y * 100}%`;

      // Trail
      this.addTrailPoint(x, y);

      this.onChange(this.valueX, this.valueY, this.paramX, this.paramY);
    };

    pad.addEventListener('pointerdown', (e) => {
      isDragging = true;
      pad.setPointerCapture?.(e.pointerId);
      updateFromEvent(e);
    });

    pad.addEventListener('pointermove', (e) => {
      if (isDragging) updateFromEvent(e);
    });

    pad.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // Initialize position
    const initX = (this.valueX - this.minX) / (this.maxX - this.minX);
    const initY = 1 - (this.valueY - this.minY) / (this.maxY - this.minY);
    this.handle.style.left = `${initX * 100}%`;
    this.handle.style.top = `${initY * 100}%`;

    // Start trail animation
    this.animateTrail();
  }

  addTrailPoint(x, y) {
    this.trailPoints.push({ x, y, life: 1.0 });
    if (this.trailPoints.length > 30) this.trailPoints.shift();
  }

  animateTrail() {
    const ctx = this.trailCtx;
    const w = this.trailCanvas.width;
    const h = this.trailCanvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.trailPoints.length; i++) {
      const p = this.trailPoints[i];
      const alpha = p.life * (i / this.trailPoints.length);
      ctx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 8 * p.life, 0, Math.PI * 2);
      ctx.fill();
      p.life *= 0.95;
    }

    this.trailPoints = this.trailPoints.filter(p => p.life > 0.05);

    requestAnimationFrame(() => this.animateTrail());
  }

  setParams(paramX, paramY, minX, maxX, minY, maxY, labelX, labelY) {
    this.paramX = paramX;
    this.paramY = paramY;
    if (minX !== undefined) this.minX = minX;
    if (maxX !== undefined) this.maxX = maxX;
    if (minY !== undefined) this.minY = minY;
    if (maxY !== undefined) this.maxY = maxY;
    if (labelX) this.labelX = labelX;
    if (labelY) this.labelY = labelY;
  }
}