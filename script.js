/* =============================================
   LAS LEYES DE NEWTON — script.js
   ============================================= */

function showHome() {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const home = document.getElementById('screen-home');
  home.style.display = 'flex';
  home.classList.add('active');
  stopAllAnimations();
}

function showSimulation(num) {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const sim = document.getElementById('screen-sim' + num);
  sim.style.display = 'flex';
  sim.classList.add('active');

  if (num === 1) initSim1();
  if (num === 2) initSim2();
  if (num === 3) initSim3();
}

let animFrames = { sim1: null, sim2: null, sim3: null };

function stopAllAnimations() {
  Object.values(animFrames).forEach(id => {
    if (id) cancelAnimationFrame(id);
  });
  animFrames = { sim1: null, sim2: null, sim3: null };
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { w: rect.width, h: rect.height };
}

const COLORS = {
  bg:       '#111521',
  surface:  '#1e2540',
  grid:     'rgba(255,255,255,0.04)',
  blue:     '#4f9eff',
  amber:    '#f5a623',
  green:    '#3ecf8e',
  coral:    '#ff6b6b',
  purple:   '#a78bfa',
  textPri:  '#f0f4ff',
  textSec:  '#8a93b8',
  ground:   '#1e2540',
  groundLine: 'rgba(255,255,255,0.1)',
};

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

function drawGround(ctx, w, h, groundY) {
  ctx.fillStyle = 'rgba(30,37,64,0.7)';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = COLORS.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
}

function drawBlock(ctx, x, y, w, h, color, label = '') {
  const bx = x - w / 2;
  const by = y - h;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 12;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.roundRect(bx, by, w, h, 6); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  if (label) {
    ctx.fillStyle = COLORS.textPri;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, by + h/2);
  }
}

function drawArrow(ctx, startX, y, length, color, label = '') {
  if (Math.abs(length) < 4) return;
  const endX = startX + length;
  const dir  = length > 0 ? 1 : -1;
  const headLen = 10;

  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2.5;

  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX - dir * headLen, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, y);
  ctx.lineTo(endX - dir * headLen, y - 6);
  ctx.lineTo(endX - dir * headLen, y + 6);
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.fillStyle = color;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, startX + length / 2, y - 6);
  }
}

/* =============================================
   SIMULACIÓN 1 — PRIMERA LEY (INFINITO CONTINUO)
   ============================================= */
const sim1 = {
  x: 0, vx: 0, friction: false, forceImpulse: 40, mass: 5,
  mu: 0.004, groundY: 0, canvasW: 0, canvasH: 0, blockW: 60, blockH: 36
};

function initSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  const canvas = document.getElementById('canvas1');
  const dims   = resizeCanvas(canvas);
  sim1.canvasW  = dims.w;
  sim1.canvasH  = dims.h;
  sim1.groundY  = dims.h * 0.72;
  sim1.x        = dims.w / 2;
  sim1.vx       = 0;
  sim1.friction = false;

  document.getElementById('btn-friction').classList.remove('active');
  document.getElementById('btn-friction').textContent = '🏔️ Agregar Fricción';
  updateSim1Values();
}

function updateSim1Values() {
  sim1.forceImpulse = parseFloat(document.getElementById('slider-s1-force').value);
  sim1.mass = parseFloat(document.getElementById('slider-s1-mass').value);
  
  document.getElementById('lbl-s1-force').textContent = sim1.forceImpulse;
  document.getElementById('lbl-s1-mass').textContent = sim1.mass;
  
  sim1.blockW = 40 + sim1.mass * 4;
  sim1.blockH = 24 + sim1.mass * 2;
  
  document.getElementById('s1-speed').textContent = (sim1.vx * 2).toFixed(2) + ' m/s';
  if (!animFrames.sim1) drawSim1Frame();
}

function drawSim1Frame() {
  const canvas = document.getElementById('canvas1');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sim1.canvasW, sim1.canvasH);
  
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, sim1.canvasW, sim1.canvasH);
  drawGrid(ctx, sim1.canvasW, sim1.canvasH);
  drawGround(ctx, sim1.canvasW, sim1.canvasH, sim1.groundY);

  if (sim1.friction) {
    ctx.strokeStyle = 'rgba(245,166,35,0.15)';
    for (let i = 0; i < sim1.canvasW; i += 15) {
      ctx.beginPath(); ctx.moveTo(i, sim1.groundY); ctx.lineTo(i+5, sim1.groundY+5); ctx.stroke();
    }
  }

  const blockColor = sim1.friction ? COLORS.amber : COLORS.blue;
  drawBlock(ctx, sim1.x, sim1.groundY, sim1.blockW, sim1.blockH, blockColor, `${sim1.mass}kg`);

  if (Math.abs(sim1.vx) > 0.02) {
    const arrowStart = sim1.x + (sim1.vx > 0 ? sim1.blockW/2 : -sim1.blockW/2);
    drawArrow(ctx, arrowStart, sim1.groundY - sim1.blockH/2, sim1.vx * 25, COLORS.green, 'v');
  }
}

function stepSim1() {
  if (sim1.friction && Math.abs(sim1.vx) > 0) {
    const fDecel = (sim1.mu * 9.8) / sim1.mass; 
    if (sim1.vx > 0) {
      sim1.vx = Math.max(0, sim1.vx - fDecel);
    } else {
      sim1.vx = Math.min(0, sim1.vx + fDecel);
    }
  }

  sim1.x += sim1.vx;

  // Lógica de infinito pedida por el profesor (Bucle Toroide continuo)
  if (sim1.x < -sim1.blockW) {
    sim1.x = sim1.canvasW + sim1.blockW;
  } else if (sim1.x > sim1.canvasW + sim1.blockW) {
    sim1.x = -sim1.blockW;
  }
}

function loopSim1() {
  stepSim1();
  drawSim1Frame();
  document.getElementById('s1-speed').textContent = (Math.abs(sim1.vx) * 5).toFixed(2) + ' m/s';
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

function applyForce1() {
  // v = F / m ajustado para escala visual
  sim1.vx = (sim1.forceImpulse / sim1.mass) * 0.4;
  const box  = document.getElementById('info1');
  const text = document.getElementById('info1-text');
  
  if(!sim1.friction) {
    box.className = 'info-box success';
    text.innerHTML = '✅ <strong>¡Inercia Infinita!</strong> Al no existir fuerzas externas opuestas (sin fricción), el bloque mantendrá su velocidad de forma constante por el espacio.';
  } else {
    box.className = 'info-box warning';
    text.innerHTML = '⚠️ <strong>Fricción Activa:</strong> La fuerza de rozamiento actúa en contra del movimiento, reduciendo la energía cinética del cuerpo.';
  }

  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

function toggleFriction1() {
  sim1.friction = !sim1.friction;
  const btn = document.getElementById('btn-friction');
  btn.className = sim1.friction ? 'btn-sim id-accent active' : 'btn-sim id-accent';
  btn.textContent = sim1.friction ? '✓ Fricción Activa' : '🏔️ Agregar Fricción';
  document.getElementById('s1-friction').textContent = sim1.friction ? 'Con fricción' : 'Sin fricción';
  document.getElementById('s1-friction').className = sim1.friction ? 'metric-value text-amber' : 'metric-value';
}

function resetSim1() {
  initSim1();
  document.getElementById('info1').className = 'info-box';
  document.getElementById('info1-text').innerHTML = 'Aplica un impulso. Sin fricción, el bloque se moverá por el espacio de manera perpetua e infinita.';
}


/* =============================================
   SIMULACIÓN 2 — SEGUNDA LEY (F = m × a)
   ============================================= */
const sim2 = { x: 60, vx: 0, accel: 0, running: false, force: 20, mass: 5, groundY: 0, canvasW: 0, canvasH: 0, blockW: 50, blockH: 50, maxX: 0 };

function initSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  const canvas = document.getElementById('canvas2');
  const dims = resizeCanvas(canvas);
  sim2.canvasW = dims.w;
  sim2.canvasH = dims.h;
  sim2.groundY = dims.h * 0.72;
  sim2.x = 60;
  sim2.vx = 0;
  sim2.running = false;
  sim2.maxX = dims.w - 60;
  
  document.getElementById('btn-start2').textContent = '▶ Iniciar Simulación';
  updateSim2Values();
}

function updateSim2Values() {
  sim2.force = parseFloat(document.getElementById('slider-force').value);
  sim2.mass = parseFloat(document.getElementById('slider-mass').value);
  sim2.accel = sim2.force / sim2.mass;

  sim2.blockW = 34 + sim2.mass * 3;
  sim2.blockH = 34 + sim2.mass * 3;

  document.getElementById('lbl-force').textContent = sim2.force;
  document.getElementById('lbl-mass').textContent = sim2.mass;
  document.getElementById('s2-force').textContent = sim2.force + ' N';
  document.getElementById('s2-mass').textContent = sim2.mass + ' kg';
  document.getElementById('s2-accel').textContent = sim2.accel.toFixed(2) + ' m/s²';

  document.getElementById('formula-display2').innerHTML = 
    `<span class="text-blue">F (${sim2.force}N)</span> = <span class="text-amber">m (${sim2.mass}kg)</span> × <span class="text-green">a (${sim2.accel.toFixed(2)}m/s²)</span>`;

  if (!sim2.running) drawSim2Frame();
}

function drawSim2Frame() {
  const canvas = document.getElementById('canvas2');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sim2.canvasW, sim2.canvasH);

  ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, sim2.canvasW, sim2.canvasH);
  drawGrid(ctx, sim2.canvasW, sim2.canvasH);
  drawGround(ctx, sim2.canvasW, sim2.canvasH, sim2.groundY);

  drawBlock(ctx, sim2.x, sim2.groundY, sim2.blockW, sim2.blockH, COLORS.blue, `${sim2.mass} kg`);

  // Flecha Fuerza Aplicada (Naranja)
  if (sim2.force > 0) {
    drawArrow(ctx, sim2.x - sim2.blockW/2 - 45, sim2.groundY - sim2.blockH/2, 40 + sim2.force, COLORS.amber, 'F');
  }
  // Flecha Velocidad Resultante (Verde)
  if (sim2.vx > 0.1) {
    drawArrow(ctx, sim2.x + sim2.blockW/2, sim2.groundY - sim2.blockH/2, sim2.vx * 15, COLORS.green, 'v');
  }
}

function loopSim2() {
  if (!sim2.running) return;
  sim2.vx += sim2.accel * 0.015;
  sim2.x += sim2.vx;

  if (sim2.x > sim2.maxX) {
    sim2.x = sim2.maxX;
    sim2.vx = 0;
    sim2.running = false;
    document.getElementById('btn-start2').textContent = '▶ Reiniciar';
  }

  drawSim2Frame();
  if (sim2.running) {
    animFrames.sim2 = requestAnimationFrame(loopSim2);
  }
}

function startSim2() {
  if (sim2.x >= sim2.maxX) {
    initSim2();
  }
  sim2.running = true;
  document.getElementById('btn-start2').textContent = '⚡ Simulando...';
  animFrames.sim2 = requestAnimationFrame(loopSim2);
}

function resetSim2() {
  initSim2();
}


/* =============================================
   SIMULACIÓN 3 — TERCERA LEY (ACCIÓN Y REACCIÓN CON MASAS VARIABLE)
   ============================================= */
const sim3 = {
  state: 'idle', groundY: 0, canvasW: 0, canvasH: 0, forceAnim: 0,
  blockA: { x: 0, vx: 0, w: 50, h: 50, mass: 4, color: '#4f9eff', label: 'A' },
  blockB: { x: 0, vx: 0, w: 50, h: 50, mass: 4, color: '#ff6b6b', label: 'B' }
};

function initSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);
  const canvas = document.getElementById('canvas3');
  const dims = resizeCanvas(canvas);
  sim3.canvasW = dims.w;
  sim3.canvasH = dims.h;
  sim3.groundY = dims.h * 0.72;

  sim3.state = 'idle';
  sim3.forceAnim = 0;

  sim3.blockA.vx = 0;
  sim3.blockB.vx = 0;

  updateSim3Values();
}

function updateSim3Values() {
  sim3.blockA.mass = parseFloat(document.getElementById('slider-s3-massA').value);
  sim3.blockB.mass = parseFloat(document.getElementById('slider-s3-massB').value);

  document.getElementById('lbl-s3-massA').textContent = sim3.blockA.mass;
  document.getElementById('lbl-s3-massB').textContent = sim3.blockB.mass;

  sim3.blockA.w = 34 + sim3.blockA.mass * 4;
  sim3.blockA.h = 34 + sim3.blockA.mass * 4;
  sim3.blockB.w = 34 + sim3.blockB.mass * 4;
  sim3.blockB.h = 34 + sim3.blockB.mass * 4;

  if (sim3.state === 'idle') {
    sim3.blockA.x = sim3.canvasW * 0.25;
    sim3.blockB.x = sim3.canvasW * 0.75;
    
    document.getElementById('ar-force-a').textContent = '—';
    document.getElementById('ar-force-b').textContent = '—';
  }

  drawSim3Frame();
}

function drawSim3Frame() {
  const canvas = document.getElementById('canvas3');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sim3.canvasW, sim3.canvasH);

  ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, sim3.canvasW, sim3.canvasH);
  drawGrid(ctx, sim3.canvasW, sim3.canvasH);
  drawGround(ctx, sim3.canvasW, sim3.canvasH, sim3.groundY);

  drawBlock(ctx, sim3.blockA.x, sim3.groundY, sim3.blockA.w, sim3.blockA.h, sim3.blockA.color, `A (${sim3.blockA.mass}kg)`);
  drawBlock(ctx, sim3.blockB.x, sim3.groundY, sim3.blockB.w, sim3.blockB.h, sim3.blockB.color, `B (${sim3.blockB.mass}kg)`);

  if (sim3.state === 'colliding' && sim3.forceAnim > 0) {
    const midX = (sim3.blockA.x + sim3.blockA.w/2 + sim3.blockB.x - sim3.blockB.w/2) / 2;
    drawArrow(ctx, midX, sim3.groundY - 60, sim3.forceAnim * 2.5, COLORS.coral, 'F_Acción');
    drawArrow(ctx, midX, sim3.groundY - 20, -sim3.forceAnim * 2.5, COLORS.blue, 'F_Reacción');
  }
}

function loopSim3() {
  sim3.blockA.x += sim3.blockA.vx;
  sim3.blockB.x += sim3.blockB.vx;

  if (sim3.state === 'approaching') {
    if ((sim3.blockA.x + sim3.blockA.w/2) >= (sim3.blockB.x - sim3.blockB.w/2)) {
      sim3.state = 'colliding';
      sim3.forceAnim = 25; 

      // Choque Elástico Perfecto usando masas variables:
      const vA = 2.5; 
      const vB = -2.5;
      const mA = sim3.blockA.mass;
      const mB = sim3.blockB.mass;

      // Fórmulas de velocidad final post-colisión elástica
      sim3.blockA.vx = ((mA - mB) * vA + 2 * mB * vB) / (mA + mB);
      sim3.blockB.vx = ((mB - mA) * vB + 2 * mA * vA) / (mA + mB);

      updateSim3Info();
    }
  } else if (sim3.state === 'colliding') {
    sim3.forceAnim -= 1; 
    if (sim3.forceAnim <= 0) sim3.state = 'rebounding';
  }

  // Límites
  if (sim3.blockA.x - sim3.blockA.w/2 < 0) sim3.blockA.vx = 0;
  if (sim3.blockB.x + sim3.blockB.w/2 > sim3.canvasW) sim3.blockB.vx = 0;

  drawSim3Frame();
  animFrames.sim3 = requestAnimationFrame(loopSim3);
}

function triggerCollision() {
  initSim3();
  sim3.state = 'approaching';
  sim3.blockA.vx = 2.5;
  sim3.blockB.vx = -2.5;
  animFrames.sim3 = requestAnimationFrame(loopSim3);
}

function updateSim3Info() {
  const text = document.getElementById('info3-text');
  document.getElementById('info3').className = 'info-box success';
  text.innerHTML = `✅ <strong>¡Colisión Registrada!</strong> El Bloque A aplicó fuerza sobre B, y el Bloque B devolvió instantáneamente una fuerza de idéntica magnitud en sentido contrario.`;
  
  // Mostrar que las fuerzas absolutas son idénticas (ej. 40 N de acción y -40 N de reacción)
  document.getElementById('ar-force-a').textContent = '40 N →';
  document.getElementById('ar-force-b').textContent = '← 40 N';
}

function resetSim3() {
  initSim3();
  document.getElementById('info3').className = 'info-box';
  document.getElementById('info3-text').textContent = 'Configura las masas de ambos bloques y presiona "Colisión" para analizar cómo se transfieren fuerzas iguales en sentidos opuestos.';
}

document.addEventListener('DOMContentLoaded', () => {
  showHome();
  window.addEventListener('resize', () => {
    const active = document.querySelector('.screen.active');
    if (active) {
      if (active.id === 'screen-sim1') initSim1();
      if (active.id === 'screen-sim2') initSim2();
      if (active.id === 'screen-sim3') initSim3();
    }
  });
});