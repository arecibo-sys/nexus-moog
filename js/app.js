// app.js — Entry point: boot the synthesizer

import { Engine } from './audio/Engine.js';
import { Controller } from './ui/Controller.js';

const engine = new Engine();
const controller = new Controller(engine);

// Power button
const powerBtn = document.getElementById('power-btn');
powerBtn.addEventListener('click', async () => {
  if (engine.started) return;
  powerBtn.classList.add('loading');
  powerBtn.textContent = 'INITIALIZING...';
  
  try {
    await controller.init();
    powerBtn.classList.remove('loading');
    powerBtn.classList.add('active');
    powerBtn.textContent = 'ON';
    document.getElementById('synth-body').classList.add('powered-on');
    document.getElementById('boot-screen').classList.add('hidden');
    
    // Load default preset (non-fatal if it fails)
    try {
      controller.loadPreset('Sub Boom');
    } catch (pe) {
      console.warn('Preset load skipped:', pe);
    }
  } catch (e) {
    powerBtn.textContent = 'ERROR';
    console.error('Init failed:', e);
  }
});

// Visualizer mode toggle
document.getElementById('viz-mode').addEventListener('click', (e) => {
  if (!controller.visualizer) return;
  const modes = ['scope', 'spectrum', 'both'];
  const current = modes.indexOf(controller.visualizer.mode);
  const next = modes[(current + 1) % modes.length];
  controller.visualizer.setMode(next);
  e.target.textContent = next.toUpperCase();
});

// Export for debugging
window.__synth = { engine, controller };