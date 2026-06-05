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
  bg: '#0f111a',
  grid: 'rgba(255,255,255,0.03)',
  blue: '#4f9eff',
  amber: '#f5a623',
  green: '#3ecf8e',
  coral: '#ff6b6b',
  purple: '#a78bfa',
  textPri: '#f0f4ff',
  textSec: '#8a93b8',
  ground: '#161a2b',
  groundLine: 'rgba(255,255,255,0.08)'
};

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

function drawGround(ctx, w, h, groundY) {
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = COLORS.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
}

function drawBlock(ctx, x, y, w, h, color, label = '') {
  const bx = x - w / 2;
  const by = y - h;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.roundRect(bx, by, w, h, 6); ctx.fill();
  ctx.globalAlpha = 1;

  if (label) {
    ctx.fillStyle = COLORS.textPri;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, by + h / 2);
  }
}

function drawArrow(ctx, startX, y, length, color, label = '', speedText = '') {
  if (Math.abs(length) < 3) return;
  const endX = startX + length;
  const dir  = length > 0 ? 1 : -1;
  const headLen = 8;

  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2;

  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX - dir * headLen, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, y);
  ctx.lineTo(endX - dir * headLen, y - 5);
  ctx.lineTo(endX - dir * headLen, y + 5);
  ctx.closePath();
  ctx.fill();

  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  if (speedText) {
    ctx.fillText(speedText, startX + length / 2, y - 16);
  }
  if (label) {
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(label, startX + length / 2, y - 4);
  }
}

/* =============================================
   SIMULACIÓN 1 — PRIMERA LEY (FRICCIÓN PERSONALIZADA)
   ============================================= */
const sim1 = { x: 0, vx: 0, frictionCoef: 0, forceImpulse: 40, mass: 5, groundY: 0, canvasW: 0, canvasH: 0, blockW: 60, blockH: 36 };

function initSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  const canvas = document.getElementById('canvas1');
  const dims   = resizeCanvas(canvas);
  sim1.canvasW  = dims.w;
  sim1.canvasH  = dims.h;
  sim1.groundY  = dims.h * 0.72;
  sim1.x        = dims.w / 2;
  sim1.vx       = 0;
  updateSim1Values();
}

function updateSim1Values() {
  sim1.forceImpulse = parseFloat(document.getElementById('slider-s1-force').value);
  sim1.mass = parseFloat(document.getElementById('slider-s1-mass').value);
  sim1.frictionCoef = parseFloat(document.getElementById('slider-s1-friction').value) * 0.01;

  document.getElementById('lbl-s1-force').textContent = sim1.forceImpulse;
  document.getElementById('lbl-s1-mass').textContent = sim1.mass;
  document.getElementById('lbl-s1-friction').textContent = (sim1.frictionCoef * 10).toFixed(2);
  document.getElementById('s1-friction-val').textContent = (sim1.frictionCoef * 10).toFixed(2);

  sim1.blockW = 40 + sim1.mass * 3;
  sim1.blockH = 24 + sim1.mass * 2;

  document.getElementById('s1-speed').textContent = (Math.abs(sim1.vx) * 5).toFixed(2) + ' m/s';
  if (!animFrames.sim1) drawSim1Frame();
}

function drawSim1Frame() {
  const canvas = document.getElementById('canvas1');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sim1.canvasW, sim1.canvasH);
  ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, sim1.canvasW, sim1.canvasH);
  drawGrid(ctx, sim1.canvasW, sim1.canvasH);
  drawGround(ctx, sim1.canvasW, sim1.canvasH, sim1.groundY);

  drawBlock(ctx, sim1.x, sim1.groundY, sim1.blockW, sim1.blockH, COLORS.blue, `${sim1.mass}kg`);

  if (Math.abs(sim1.vx) > 0.01) {
    const arrowStart = sim1.x + (sim1.vx > 0 ? sim1.blockW/2 : -sim1.blockW/2);
    const speedMS = (Math.abs(sim1.vx) * 5).toFixed(2) + " m/s";
    // Muestra la velocidad arriba de la flecha con indicador
    drawArrow(ctx, arrowStart, sim1.groundY - sim1.blockH - 12, sim1.vx * 20, COLORS.green, '→ v', speedMS);
  }
}

function loopSim1() {
  if (sim1.frictionCoef > 0 && Math.abs(sim1.vx) > 0) {
    const fDecel = (sim1.frictionCoef * 9.8) / sim1.mass;
    if (sim1.vx > 0) sim1.vx = Math.max(0, sim1.vx - fDecel);
    else sim1.vx = Math.min(0, sim1.vx + fDecel);
  }

  sim1.x += sim1.vx;
  if (sim1.x < -sim1.blockW) sim1.x = sim1.canvasW + sim1.blockW;
  else if (sim1.x > sim1.canvasW + sim1.blockW) sim1.x = -sim1.blockW;

  drawSim1Frame();
  document.getElementById('s1-speed').textContent = (Math.abs(sim1.vx) * 5).toFixed(2) + ' m/s';
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

function applyForce1() {
  sim1.vx = (sim1.forceImpulse / sim1.mass) * 0.4;
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

function resetSim1() {
  initSim1();
}

/* =============================================
   SIMULACIÓN 2 — SEGUNDA LEY (FIX BOTÓN Y FLECHAS SEPARADAS)
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
  if (sim2.running) return;
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
  document.getElementById('s2-speed-val').textContent = (sim2.vx * 5).toFixed(2) + ' m/s';

  document.getElementById('formula-display2').innerHTML = 
    `<span class="text-amber">F (${sim2.force}N)</span> = <span class="text-blue">m (${sim2.mass}kg)</span> × <span class="text-purple">a (${sim2.accel.toFixed(2)}m/s²)</span>`;

  drawSim2Frame();
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

  // Flecha Fuerza Aplicada corrida hacia la izquierda (Separada para evitar colisiones visuales)
  if (sim2.force > 0) {
    const gapSeparation = sim2.x - sim2.blockW/2 - 25;
    drawArrow(ctx, gapSeparation - (20 + sim2.force), sim2.groundY - sim2.blockH/2, 20 + sim2.force, COLORS.amber, 'F');
  }
  // Flecha Velocidad Resultante
  if (sim2.vx > 0.05) {
    drawArrow(ctx, sim2.x + sim2.blockW/2 + 5, sim2.groundY - sim2.blockH/2, sim2.vx * 12, COLORS.green, 'v');
  }
}

function loopSim2() {
  if (!sim2.running) return;
  sim2.vx += sim2.accel * 0.012;
  sim2.x += sim2.vx;

  document.getElementById('s2-speed-val').textContent = (sim2.vx * 5).toFixed(2) + ' m/s';

  if (sim2.x >= sim2.maxX - sim2.blockW/2) {
    sim2.x = sim2.maxX - sim2.blockW/2;
    sim2.vx = 0;
    sim2.running = false;
    // Fix Solicitado: Cambia limpiamente a Reiniciar al finalizar la trayectoria
    document.getElementById('btn-start2').textContent = '↺ Reiniciar';
  }

  drawSim2Frame();
  if (sim2.running) {
    animFrames.sim2 = requestAnimationFrame(loopSim2);
  }
}

function startSim2() {
  if (!sim2.running && document.getElementById('btn-start2').textContent === '↺ Reiniciar') {
    initSim2();
    return;
  }
  sim2.running = true;
  document.getElementById('btn-start2').textContent = '⚡ Simulando...';
  animFrames.sim2 = requestAnimationFrame(loopSim2);
}

function resetSim2() {
  initSim2();
}

/* =============================================
   SIMULACIÓN 3 — TERCERA LEY (VECTORES POR ENCIMA Y SIN TRASLAPOS)
   ============================================= */
const sim3 = {
  state: 'idle', groundY: 0, canvasW: 0, canvasH: 0, forceAnim: 0,
  blockA: { x: 0, vx: 0, w: 50, h: 50, mass: 4, color: '#4f9eff' },
  blockB: { x: 0, vx: 0, w: 50, h: 50, mass: 4, color: '#ff6b6b' }
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
  document.getElementById('btn-start3').textContent = '💥 Generar Colisión';
  updateSim3Values();
}

function updateSim3Values() {
  if (sim3.state !== 'idle') return;
  sim3.blockA.mass = parseFloat(document.getElementById('slider-s3-massA').value);
  sim3.blockB.mass = parseFloat(document.getElementById('slider-s3-massB').value);

  document.getElementById('lbl-s3-massA').textContent = sim3.blockA.mass;
  document.getElementById('lbl-s3-massB').textContent = sim3.blockB.mass;

  sim3.blockA.w = 36 + sim3.blockA.mass * 3;
  sim3.blockA.h = 36 + sim3.blockA.mass * 3;
  sim3.blockB.w = 36 + sim3.blockB.mass * 3;
  sim3.blockB.h = 36 + sim3.blockB.mass * 3;

  sim3.blockA.x = sim3.canvasW * 0.22;
  sim3.blockB.x = sim3.canvasW * 0.78;
    
  document.getElementById('ar-force-a').textContent = '—';
  document.getElementById('ar-force-b').textContent = '—';

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

  // Corrección: Los vectores de fuerza se renderizan POR ENCIMA de los bloques para que nunca los tapen
  if (sim3.state === 'colliding' && sim3.forceAnim > 0) {
    const highestBlockH = Math.max(sim3.blockA.h, sim3.blockB.h);
    const vectorY = sim3.groundY - highestBlockH - 25; 
    const midPoint = (sim3.blockA.x + sim3.blockA.w/2 + sim3.blockB.x - sim3.blockB.w/2) / 2;

    drawArrow(ctx, midPoint, vectorY, 55, COLORS.coral, 'F_AB (Acción)');
    drawArrow(ctx, midPoint, vectorY + 14, -55, COLORS.blue, 'F_BA (Reacción)');
  }
}

function loopSim3() {
  sim3.blockA.x += sim3.blockA.vx;
  sim3.blockB.x += sim3.blockB.vx;

  // Lógica de aproximación y detección perfecta sin penetración
  if (sim3.state === 'approaching') {
    if ((sim3.blockA.x + sim3.blockA.w/2) >= (sim3.blockB.x - sim3.blockB.w/2)) {
      // Forzar posición justa de contacto mecánico (evita solapamiento mutuo)
      const overlap = (sim3.blockA.x + sim3.blockA.w/2) - (sim3.blockB.x - sim3.blockB.w/2);
      sim3.blockA.x -= overlap / 2;
      sim3.blockB.x += overlap / 2;

      sim3.state = 'colliding';
      sim3.forceAnim = 35;

      const mA = sim3.blockA.mass;
      const mB = sim3.blockB.mass;
      const vA = 2.4; const vB = -2.4;

      // Choque elástico físico real basado en sus masas cambiadas
      sim3.blockA.vx = ((mA - mB) * vA + 2 * mB * vB) / (mA + mB);
      sim3.blockB.vx = ((mB - mA) * vB + 2 * mA * vA) / (mA + mB);

      document.getElementById('ar-force-a').textContent = '40 N (← Izq)';
      document.getElementById('ar-force-b').textContent = '40 N (Der →)';
    }
  } else if (sim3.state === 'colliding') {
    sim3.forceAnim--;
    if (sim3.forceAnim <= 0) sim3.state = 'rebounding';
  }

  // Prevención estricta: No meterse adentro de la pared exterior del canvas
  if (sim3.blockA.x - sim3.blockA.w/2 <= 0) {
    sim3.blockA.x = sim3.blockA.w/2;
    sim3.blockA.vx = 0;
  }
  if (sim3.blockB.x + sim3.blockB.w/2 >= sim3.canvasW) {
    sim3.blockB.x = sim3.canvasW - sim3.blockB.w/2;
    sim3.blockB.vx = 0;
  }

  drawSim3Frame();
  if (sim3.state !== 'idle') {
    animFrames.sim3 = requestAnimationFrame(loopSim3);
  }
}

function triggerCollision() {
  if (sim3.state !== 'idle') { initSim3(); }
  sim3.state = 'approaching';
  sim3.blockA.vx = 2.4;
  sim3.blockB.vx = -2.4;
  document.getElementById('btn-start3').textContent = '⚡ Colisionando...';
  animFrames.sim3 = requestAnimationFrame(loopSim3);
}

function resetSim3() {
  initSim3();
}

/* =============================================
   SISTEMA DE POP-UPS MODALES GENERALES
   ============================================= */
const THEORIES = {
  1: {
    title: "Primera Ley: Principio de Inercia",
    content: "<p>Todo cuerpo preserva su estado de reposo o movimiento rectilíneo uniforme a menos que actúe sobre él una fuerza externa neta.</p><br><p><strong>En el simulador:</strong> Al dejar el control de Fricción en 0, verás que el cuerpo viaja de forma infinita sin perder velocidad. Al subir la fricción, la superficie ejerce una fuerza contraria ralentizándolo.</p>"
  },
  2: {
    title: "Segunda Ley: Dinámica (F = m · a)",
    content: "<p>La alteración del movimiento es proporcional a la fuerza motriz impresa y se efectúa según la línea recta en que se imprime dicha fuerza.</p><br><p><strong>En el simulador:</strong> Si mantienes una fuerza fija y aumentas la masa, notarás que la aceleración baja. La fuerza naranja tira constantemente del bloque incrementando su vector de velocidad (flecha verde).</p>"
  },
  3: {
    title: "Tercera Ley: Acción y Reacción",
    content: "<p>Con toda acción ocurre siempre una reacción igual y contraria; las acciones mutuas de dos cuerpos siempre son iguales y dirigidas en sentidos opuestos.</p><br><p><strong>En el simulador:</strong> En el instante exacto del impacto, ambos experimentan la misma fuerza de 40 N. Los bloques rebotan sin encimarse ni atravesar las paredes laterales gracias a la transferencia de energía cinética.</p>"
  }
};

function openModal(lawNum) {
  const data = THEORIES[lawNum];
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-content').innerHTML = data.content;
  document.getElementById('theory-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('theory-modal').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  showHome();
});