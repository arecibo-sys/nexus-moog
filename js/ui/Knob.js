// Knob.js — Custom SVG knob component with radial indicator

export class Knob {
  constructor(container, options = {}) {
    this.container = container;
    this.min = options.min ?? 0;
    this.max = options.max ?? 1;
    this.value = options.value ?? 0.5;
    this.defaultValue = options.defaultValue ?? this.value;
    this.step = options.step ?? 0.01;
    this.label = options.label ?? '';
    this.unit = options.unit ?? '';
    this.size = options.size ?? 64;
    this.format = options.format || null;
    this.onChange = options.onChange || (() => {});
    this.curve = options.curve || 'linear'; // linear, log
    this.bipolar = options.bipolar || false;

    this.svg = null;
    this.isDragging = false;
    this.startY = 0;
    this.startValue = 0;
    this.build();
  }

  build() {
    this.container.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.size} ${this.size + 20}`);
    svg.setAttribute('width', this.size);
    svg.setAttribute('height', this.size + 20);
    svg.classList.add('knob-svg');

    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = this.size / 2 - 8;
    const startAngle = -135;
    const endAngle = 135;
    const totalAngle = endAngle - startAngle;

    // Background track
    const bgTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bgTrack.setAttribute('d', this.arcPath(cx, cy, r, startAngle, endAngle));
    bgTrack.classList.add('knob-track');
    svg.appendChild(bgTrack);

    // Active track
    this.activeTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.activeTrack.classList.add('knob-active');
    svg.appendChild(this.activeTrack);

    // Knob body
    const knobBody = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    knobBody.setAttribute('cx', cx);
    knobBody.setAttribute('cy', cy);
    knobBody.setAttribute('r', r - 6);
    knobBody.classList.add('knob-body');
    svg.appendChild(knobBody);

    // Inner ring
    const innerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerRing.setAttribute('cx', cx);
    innerRing.setAttribute('cy', cy);
    innerRing.setAttribute('r', r - 10);
    innerRing.classList.add('knob-inner');
    svg.appendChild(innerRing);

    // Indicator line
    this.indicator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.indicator.setAttribute('x1', cx);
    this.indicator.setAttribute('y1', cy);
    this.indicator.classList.add('knob-indicator');
    svg.appendChild(this.indicator);

    // Center dot
    const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerDot.setAttribute('cx', cx);
    centerDot.setAttribute('cy', cy);
    centerDot.setAttribute('r', 3);
    centerDot.classList.add('knob-center');
    svg.appendChild(centerDot);

    // Label
    if (this.label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx);
      text.setAttribute('y', this.size + 16);
      text.setAttribute('text-anchor', 'middle');
      text.classList.add('knob-label');
      text.textContent = this.label;
      svg.appendChild(text);
    }

    // Value display
    this.valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.valueText.setAttribute('x', cx);
    this.valueText.setAttribute('y', cy + 4);
    this.valueText.setAttribute('text-anchor', 'middle');
    this.valueText.classList.add('knob-value-text');
    svg.appendChild(this.valueText);

    this.svg = svg;
    this.container.appendChild(svg);

    // Events
    svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    svg.addEventListener('dblclick', () => this.reset());
    svg.addEventListener('wheel', (e) => this.onWheel(e));

    this.update();
  }

  onPointerDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.startY = e.clientY;
    this.startValue = this.value;
    this.svg.setPointerCapture?.(e.pointerId);

    const move = (ev) => this.onPointerMove(ev);
    const up = (ev) => {
      this.isDragging = false;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    const dy = this.startY - e.clientY;
    const sensitivity = e.shiftKey ? 0.001 : 0.005;
    let newVal = this.startValue + dy * sensitivity * (this.max - this.min);
    newVal = Math.max(this.min, Math.min(this.max, newVal));
    this.setValue(newVal);
  }

  onWheel(e) {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    const step = (this.max - this.min) * (e.shiftKey ? 0.001 : 0.02);
    let newVal = this.value + dir * step;
    newVal = Math.max(this.min, Math.min(this.max, newVal));
    this.setValue(newVal);
  }

  setValue(val) {
    this.value = Math.max(this.min, Math.min(this.max, val));
    this.update();
    this.onChange(this.value);
  }

  getValue() {
    return this.value;
  }

  getNormalized() {
    return (this.value - this.min) / (this.max - this.min);
  }

  reset() {
    this.setValue(this.defaultValue);
  }

  update() {
    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = this.size / 2 - 8;
    const startAngle = -135;
    const endAngle = 135;
    const totalAngle = endAngle - startAngle;

    const norm = this.getNormalized();
    const angle = startAngle + norm * totalAngle;

    // Active track
    if (this.bipolar) {
      const midAngle = startAngle + totalAngle / 2;
      if (angle >= midAngle) {
        this.activeTrack.setAttribute('d', this.arcPath(cx, cy, r, midAngle, angle));
      } else {
        this.activeTrack.setAttribute('d', this.arcPath(cx, cy, r, angle, midAngle));
      }
    } else {
      this.activeTrack.setAttribute('d', this.arcPath(cx, cy, r, startAngle, angle));
    }

    // Indicator
    const rad = (angle - 90) * Math.PI / 180;
    const x2 = cx + (r - 8) * Math.cos(rad);
    const y2 = cy + (r - 8) * Math.sin(rad);
    this.indicator.setAttribute('x2', x2);
    this.indicator.setAttribute('y2', y2);

    // Value text
    let displayVal = this.value;
    if (this.format) {
      this.valueText.textContent = this.format(this.value);
    } else {
      if (this.max > 100) {
        this.valueText.textContent = Math.round(this.value);
      } else if (this.max > 10) {
        this.valueText.textContent = this.value.toFixed(1);
      } else {
        this.valueText.textContent = this.value.toFixed(2);
      }
    }
  }

  arcPath(cx, cy, r, startDeg, endDeg) {
    const startRad = (startDeg - 90) * Math.PI / 180;
    const endRad = (endDeg - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg > startDeg ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  }
}