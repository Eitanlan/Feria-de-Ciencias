/* =============================================
   LAS LEYES DE NEWTON — script.js
   Correcciones aplicadas:
   1. Sim 1: movimiento INFINITO (warp, sin colisión con bordes)
   2. Sim 2: leyenda visual en el canvas
   3. Todas: parámetros ajustables por sliders
   ============================================= */

/* =============================================
   NAVEGACIÓN
   ============================================= */

let animFrames = { sim1: null, sim2: null, sim3: null };

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

function stopAllAnimations() {
  Object.values(animFrames).forEach(id => { if (id) cancelAnimationFrame(id); });
  animFrames = { sim1: null, sim2: null, sim3: null };
}

/* =============================================
   CANVAS UTILS
   ============================================= */

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
  bg:        '#111521',
  grid:      'rgba(255,255,255,0.04)',
  blue:      '#4f9eff',
  amber:     '#f5a623',
  green:     '#3ecf8e',
  coral:     '#ff6b6b',
  purple:    '#a78bfa',
  textPri:   '#f0f4ff',
  textSec:   '#8a93b8',
  groundFill:'rgba(30,37,64,0.7)',
  groundLine:'rgba(255,255,255,0.1)',
};

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}

function drawGround(ctx, w, h, groundY) {
  ctx.fillStyle = COLORS.groundFill;
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = COLORS.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();
}

function drawBlock(ctx, x, y, bw, bh, color, label) {
  const bx = x - bw / 2;
  const by = y - bh;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 12;
  ctx.fillStyle   = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(bx + 4, by + 3, bw - 8, 3);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur  = 0;
  if (label) {
    ctx.fillStyle = COLORS.textSec;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, x, by - 4);
  }
}

function drawArrow(ctx, startX, y, length, color, label) {
  if (Math.abs(length) < 4) return;
  const endX    = startX + length;
  const dir     = length > 0 ? 1 : -1;
  const headLen = 10;
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
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
  ctx.shadowBlur = 0;
  if (label) {
    ctx.fillStyle = color;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, startX + length / 2, y - 8);
  }
}

/* Dibuja la leyenda en el canvas con recuadros de color */
function drawLegend(ctx, w, h, items) {
  // items: [ { color, label } ]
  const boxSize  = 10;
  const padding  = 10;
  const lineH    = 18;
  const legendW  = 160;
  const legendH  = padding * 2 + items.length * lineH;
  const lx = w - legendW - 12;
  const ly = 12;

  // Fondo semi-transparente
  ctx.fillStyle = 'rgba(10,12,20,0.75)';
  ctx.beginPath();
  ctx.roundRect(lx, ly, legendW, legendH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Título
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('LEYENDA', lx + padding, ly + padding - 2);

  // Items
  items.forEach((item, i) => {
    const ix = lx + padding;
    const iy = ly + padding + 12 + i * lineH;

    // Cuadradito de color
    ctx.fillStyle = item.color;
    ctx.shadowColor = item.color;
    ctx.shadowBlur  = 4;
    ctx.fillRect(ix, iy + 1, boxSize, boxSize);
    ctx.shadowBlur = 0;

    // Texto
    ctx.fillStyle = COLORS.textSec;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(item.label, ix + boxSize + 7, iy);
  });
}

/* =============================================
   SIMULACIÓN 1 — PRIMERA LEY (INERCIA)
   Movimiento INFINITO: el bloque hace warp
   al lado opuesto en lugar de rebotar.
   ============================================= */

const sim1 = {
  x:         0,
  vx:        0,
  friction:  false,
  velInicial:4,      // m/s visual — controlado por slider
  mu:        0.30,   // coeficiente de fricción — controlado por slider
  blockSize: 2,      // 1=pequeño, 2=normal, 3=grande
  groundY:   0,
  canvasW:   0,
  canvasH:   0,
  // Tamaños calculados en init a partir de blockSize
  blockW:    60,
  blockH:    36,
};

// Mapa de tamaño visual según el nivel del slider
const BLOCK_SIZES = {
  1: { w: 38, h: 26, label: 'Pequeño' },
  2: { w: 60, h: 36, label: 'Normal'  },
  3: { w: 84, h: 50, label: 'Grande'  },
};

function initSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  const canvas = document.getElementById('canvas1');
  const dims   = resizeCanvas(canvas);
  sim1.canvasW = dims.w;
  sim1.canvasH = dims.h;
  sim1.groundY = dims.h * 0.72;
  sim1.x       = dims.w / 2;
  sim1.vx      = 0;

  // Fricción siempre controlada por el slider (mu=0 → sin fricción)
  sim1.mu       = parseFloat(document.getElementById('slider-s1-mu').value);
  sim1.friction = sim1.mu > 0;

  updateSim1Params();
  updateSim1UI();
  drawSim1Frame();
}

/* Actualiza labels de parámetros en tiempo real */
function updateSim1Params() {
  const vel  = parseFloat(document.getElementById('slider-s1-vel').value);
  const mu   = parseFloat(document.getElementById('slider-s1-mu').value);
  const size = parseInt(document.getElementById('slider-s1-size').value);

  sim1.velInicial = vel;
  sim1.mu         = mu;
  sim1.friction   = mu > 0;   // fricción activa si mu > 0

  document.getElementById('lbl-s1-vel').textContent  = vel;
  document.getElementById('lbl-s1-mu').textContent   = mu.toFixed(2);
  document.getElementById('lbl-s1-size').textContent = BLOCK_SIZES[size].label;

  // Actualizar la pill indicadora
  const hint = document.getElementById('mu-hint');
  if (mu === 0) {
    hint.textContent = 'sin fricción';
    hint.classList.remove('active');
  } else if (mu < 0.30) {
    hint.textContent = 'fricción baja';
    hint.classList.add('active');
  } else if (mu < 0.60) {
    hint.textContent = 'fricción media';
    hint.classList.add('active');
  } else {
    hint.textContent = 'fricción alta';
    hint.classList.add('active');
  }

  // Actualizar chip de estado
  document.getElementById('s1-friction-val').textContent = mu > 0 ? `μ = ${mu.toFixed(2)}` : '—';

  // Solo actualizar tamaño del bloque si no está en movimiento
  if (!sim1.vx) {
    sim1.blockSize = size;
    const sz = BLOCK_SIZES[size];
    sim1.blockW = sz.w;
    sim1.blockH = sz.h;
    drawSim1Frame();
  }
}

function drawSim1Frame() {
  const canvas = document.getElementById('canvas1');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w   = sim1.canvasW;
  const h   = sim1.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim1.groundY);

  // Textura de fricción en el suelo
  if (sim1.friction) {
    ctx.strokeStyle = 'rgba(245,166,35,0.2)';
    ctx.lineWidth   = 1;
    for (let fx = 0; fx < w; fx += 12) {
      ctx.beginPath();
      ctx.moveTo(fx,     sim1.groundY);
      ctx.lineTo(fx + 6, sim1.groundY + 6);
      ctx.stroke();
    }
  }

  // Color del bloque: azul si sin fricción, naranja si con fricción, rojo si mucha
  let blockColor = COLORS.blue;
  if (sim1.mu > 0 && sim1.mu < 0.40) blockColor = COLORS.amber;
  else if (sim1.mu >= 0.40)          blockColor = COLORS.coral;
  drawBlock(ctx, sim1.x, sim1.groundY, sim1.blockW, sim1.blockH, blockColor);

  // Flecha de velocidad
  if (Math.abs(sim1.vx) > 0.08) {
    const arrowStart = sim1.x + (sim1.vx > 0 ? sim1.blockW / 2 : -sim1.blockW / 2);
    const arrowLen   = sim1.vx * 10;
    drawArrow(ctx, arrowStart, sim1.groundY - sim1.blockH / 2, arrowLen, COLORS.green, `v=${Math.abs(sim1.vx).toFixed(1)}`);
  }

  // Etiqueta de fricción debajo del suelo
  if (sim1.friction) {
    ctx.fillStyle = COLORS.amber;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`Fricción activa  μ = ${sim1.mu.toFixed(2)}`, w / 2, sim1.groundY + 8);
  }

  // Indicador de "infinito" cuando se mueve sin fricción
  if (Math.abs(sim1.vx) > 0.08 && !sim1.friction) {
    ctx.fillStyle = 'rgba(79,158,255,0.5)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('∞  Movimiento uniforme (sin fuerza neta)', w / 2, sim1.groundY + 8);
  }

  // Leyenda Sim 1
  drawLegend(ctx, w, h, [
    { color: COLORS.blue,  label: 'Bloque sin fricción (μ=0)' },
    { color: COLORS.amber, label: 'Fricción baja (μ<0.40)'    },
    { color: COLORS.coral, label: 'Fricción alta (μ≥0.40)'    },
    { color: COLORS.green, label: 'Flecha de velocidad'        },
  ]);
}

/* Paso de física: sin colisión con bordes — efecto warp */
function stepSim1() {
  // Fricción desacelera
  if (sim1.friction && Math.abs(sim1.vx) > 0) {
    sim1.vx += sim1.mu * (sim1.vx > 0 ? -0.06 : 0.06);
    if (Math.abs(sim1.vx) < 0.02) sim1.vx = 0;
  }

  sim1.x += sim1.vx;

  // WARP: cuando el bloque sale por un lado, reaparece por el otro
  const half = sim1.blockW / 2;
  if (sim1.x - half > sim1.canvasW) sim1.x = -half;  // salió por la derecha → aparece por izquierda
  if (sim1.x + half < 0)            sim1.x = sim1.canvasW + half; // salió por izquierda → aparece por derecha
}

function loopSim1() {
  stepSim1();
  drawSim1Frame();
  updateSim1UI();

  // Continuar mientras haya velocidad
  if (Math.abs(sim1.vx) > 0.01) {
    animFrames.sim1 = requestAnimationFrame(loopSim1);
  } else {
    sim1.vx = 0;
    updateSim1Info('stopped');
    drawSim1Frame();
  }
}

function applyForce1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  sim1.velInicial = parseFloat(document.getElementById('slider-s1-vel').value);
  sim1.mu         = parseFloat(document.getElementById('slider-s1-mu').value);
  sim1.friction   = sim1.mu > 0;
  sim1.blockSize  = parseInt(document.getElementById('slider-s1-size').value);
  const sz = BLOCK_SIZES[sim1.blockSize];
  sim1.blockW = sz.w;
  sim1.blockH = sz.h;
  sim1.vx     = sim1.velInicial * 0.7;
  updateSim1Info('moving');
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

function resetSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  initSim1();
}

function updateSim1UI() {
  document.getElementById('s1-speed').textContent = Math.abs(sim1.vx).toFixed(2) + ' m/s';
  document.getElementById('s1-state').textContent = Math.abs(sim1.vx) > 0.05 ? 'En movimiento' : 'En reposo';
}

function updateSim1Info(state) {
  const box  = document.getElementById('info1');
  const text = document.getElementById('info1-text');
  box.className = 'info-box';
  if (state === 'moving' && sim1.mu === 0) {
    box.classList.add('success');
    text.innerHTML = '✅ <strong>μ = 0 · Sin fricción:</strong> El bloque se mueve a velocidad constante y NO se detiene nunca. Subí el slider de μ para ver cómo la fricción lo frena.';
  } else if (state === 'moving' && sim1.mu > 0) {
    box.classList.add('warning');
    text.innerHTML = `⚠️ <strong>Fricción μ = ${sim1.mu.toFixed(2)}:</strong> Actúa como fuerza opuesta al movimiento. A mayor μ, más rápido se detiene el bloque.`;
  } else if (state === 'stopped') {
    if (sim1.mu === 0) {
      text.innerHTML = '💡 Presioná <strong>Aplicar Fuerza</strong>. Con μ = 0 el bloque se mueve para siempre.';
    } else {
      text.innerHTML = `🛑 <strong>Detenido.</strong> La fricción (μ = ${sim1.mu.toFixed(2)}) eliminó toda la energía cinética. Bajá μ a 0 para ver el movimiento infinito.`;
    }
  }
}


/* =============================================
   SIMULACIÓN 2 — SEGUNDA LEY (F = m × a)
   + Leyenda visual en el canvas
   ============================================= */

const sim2 = {
  x:       0,
  vx:      0,
  accel:   0,
  running: false,
  force:   10,
  mass:    5,
  groundY: 0,
  canvasW: 0,
  canvasH: 0,
  blockW:  50,
  blockH:  50,
};

function initSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  const canvas = document.getElementById('canvas2');
  const dims   = resizeCanvas(canvas);
  sim2.canvasW = dims.w;
  sim2.canvasH = dims.h;
  sim2.groundY = dims.h * 0.72;
  sim2.x       = 60;
  sim2.vx      = 0;
  sim2.running = false;
  updateSim2Values();
  drawSim2Frame();
}

function updateSim2Values() {
  sim2.force = parseFloat(document.getElementById('slider-force').value);
  sim2.mass  = parseFloat(document.getElementById('slider-mass').value);
  sim2.accel = sim2.force / sim2.mass;
  sim2.blockW = 28 + sim2.mass * 2;
  sim2.blockH = 28 + sim2.mass * 2;

  document.getElementById('lbl-force').textContent = sim2.force;
  document.getElementById('lbl-mass').textContent  = sim2.mass;
  document.getElementById('s2-force').textContent  = sim2.force + ' N';
  document.getElementById('s2-mass').textContent   = sim2.mass + ' kg';
  document.getElementById('s2-accel').textContent  = sim2.accel.toFixed(2) + ' m/s²';
  document.getElementById('formula-display2').innerHTML =
    `<span class="fd-part blue">F = ${sim2.force} N</span>
     <span class="fd-eq"> = </span>
     <span class="fd-part amber">${sim2.mass} kg</span>
     <span class="fd-times"> × </span>
     <span class="fd-part green">a = ${sim2.accel.toFixed(2)} m/s²</span>`;
  if (!sim2.running) drawSim2Frame();
}

function drawSim2Frame() {
  const canvas = document.getElementById('canvas2');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w   = sim2.canvasW;
  const h   = sim2.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim2.groundY);

  // Color del bloque varía con la aceleración (azul → rojo)
  const intensity  = Math.min(sim2.accel / 10, 1);
  const blockColor = interpolateColor(COLORS.blue, COLORS.coral, intensity);
  drawBlock(ctx, sim2.x, sim2.groundY, sim2.blockW, sim2.blockH, blockColor);

  // Flecha de fuerza F (ámbar, sale desde el lado derecho del bloque)
  if (sim2.running || sim2.vx > 0.05) {
    const arrowLen = 20 + sim2.force * 1.2;
    drawArrow(ctx, sim2.x + sim2.blockW / 2, sim2.groundY - sim2.blockH * 0.55, arrowLen, COLORS.amber, `F=${sim2.force}N`);
  }

  // Flecha de velocidad (verde, sale desde el centro superior)
  if (sim2.vx > 0.05) {
    drawArrow(ctx, sim2.x, sim2.groundY - sim2.blockH, sim2.vx * 14, COLORS.green, `v=${sim2.vx.toFixed(1)}`);
  }

  // Etiqueta de masa dentro del bloque
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `bold ${sim2.blockH > 40 ? 13 : 10}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${sim2.mass}kg`, sim2.x, sim2.groundY - sim2.blockH / 2);

  // Barra de aceleración (arriba izquierda)
  drawAccelBar(ctx, w, h);

  // ---- LEYENDA (corrección solicitada) ----
  drawLegend(ctx, w, h, [
    { color: COLORS.amber, label: `Fuerza (F = ${sim2.force} N)`        },
    { color: COLORS.green, label: `Velocidad (v)`                        },
    { color: COLORS.blue,  label: 'Bloque: a baja (azul)'               },
    { color: COLORS.coral, label: 'Bloque: a alta (rojo)'               },
  ]);
}

function drawAccelBar(ctx, w, h) {
  const bx   = 16;
  const by   = 16;
  const bw   = 130;
  const bh   = 7;
  const fill = Math.min(sim2.accel / 15, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();
  ctx.fillStyle   = COLORS.green;
  ctx.globalAlpha = 0.85;
  ctx.beginPath(); ctx.roundRect(bx, by, bw * fill, bh, 3); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.textSec;
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`a = ${sim2.accel.toFixed(2)} m/s²`, bx, by + 11);
}

function interpolateColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
}

function stepSim2() {
  const visualAccel = (sim2.accel / 5) * 0.12;
  sim2.vx = Math.min(sim2.vx + visualAccel, 9);
  sim2.x += sim2.vx;
}

function loopSim2() {
  stepSim2();
  drawSim2Frame();
  document.getElementById('s2-speed').textContent = sim2.vx.toFixed(1) + ' m/s';
  if (sim2.x < sim2.canvasW - sim2.blockW / 2) {
    animFrames.sim2 = requestAnimationFrame(loopSim2);
  } else {
    sim2.running = false;
    document.getElementById('s2-speed').textContent = sim2.vx.toFixed(1) + ' m/s';
    drawSim2EndScreen();
  }
}

function drawSim2EndScreen() {
  const canvas = document.getElementById('canvas2');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w   = sim2.canvasW;
  const h   = sim2.canvasH;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim2.groundY);
  ctx.fillStyle = COLORS.green;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`✓  F=${sim2.force}N  ÷  m=${sim2.mass}kg  =  a=${sim2.accel.toFixed(2)} m/s²`, w/2, h/2 - 12);
  ctx.fillStyle = COLORS.textSec;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Ajustá los parámetros y presioná "Aplicar Fuerza" de nuevo', w/2, h/2 + 16);
  drawLegend(ctx, w, h, [
    { color: COLORS.amber, label: `Fuerza (F = ${sim2.force} N)` },
    { color: COLORS.green, label: 'Velocidad (v)'                },
    { color: COLORS.blue,  label: 'Bloque: a baja (azul)'        },
    { color: COLORS.coral, label: 'Bloque: a alta (rojo)'        },
  ]);
}

function runSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  updateSim2Values();
  sim2.x       = 60;
  sim2.vx      = 0;
  sim2.running = true;
  animFrames.sim2 = requestAnimationFrame(loopSim2);
}

function resetSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  initSim2();
}


/* =============================================
   SIMULACIÓN 3 — TERCERA LEY (ACCIÓN Y REACCIÓN)
   Parámetros: masa A, masa B, velocidad de colisión
   ============================================= */

const sim3 = {
  blockA:     { x: 0, vx: 0, w: 0, h: 0, mass: 5 },
  blockB:     { x: 0, vx: 0, w: 0, h: 0, mass: 5 },
  velColision: 3,
  groundY:    0,
  canvasW:    0,
  canvasH:    0,
  state:      'idle',   // 'idle' | 'colliding' | 'separating' | 'done'
  forceAnim:  0,
  collisionForce: 0,    // magnitud calculada al impacto
};

/* Calcula dimensiones visuales del bloque en función de la masa */
function blockDimsFromMass(mass) {
  const base = 30 + mass * 2.5;
  return { w: Math.min(base, 90), h: Math.min(base * 0.75, 68) };
}

function initSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);
  const canvas = document.getElementById('canvas3');
  const dims   = resizeCanvas(canvas);
  sim3.canvasW = dims.w;
  sim3.canvasH = dims.h;
  sim3.groundY = dims.h * 0.72;

  // Leer parámetros
  sim3.blockA.mass  = parseInt(document.getElementById('slider-s3-massA').value);
  sim3.blockB.mass  = parseInt(document.getElementById('slider-s3-massB').value);
  sim3.velColision  = parseInt(document.getElementById('slider-s3-vel').value);

  const dimsA = blockDimsFromMass(sim3.blockA.mass);
  const dimsB = blockDimsFromMass(sim3.blockB.mass);
  sim3.blockA.w = dimsA.w;  sim3.blockA.h = dimsA.h;
  sim3.blockB.w = dimsB.w;  sim3.blockB.h = dimsB.h;

  // Posición inicial separada
  const center    = dims.w / 2;
  sim3.blockA.x   = center - 90;
  sim3.blockB.x   = center + 90;
  sim3.blockA.vx  = 0;
  sim3.blockB.vx  = 0;
  sim3.state      = 'idle';
  sim3.forceAnim  = 0;

  document.getElementById('ar-force-a').textContent = '—';
  document.getElementById('ar-force-b').textContent = '—';
  document.getElementById('ar-type-a').textContent  = '—';
  document.getElementById('ar-type-b').textContent  = '—';
  document.getElementById('info3-text').innerHTML   = 'Ajustá las masas y velocidades, luego presioná <strong>Colisión</strong> para ver las fuerzas iguales y opuestas.';

  drawSim3Frame();
}

/* Actualiza labels sin reiniciar la animación */
function updateSim3Params() {
  const massA = parseInt(document.getElementById('slider-s3-massA').value);
  const massB = parseInt(document.getElementById('slider-s3-massB').value);
  const vel   = parseInt(document.getElementById('slider-s3-vel').value);
  document.getElementById('lbl-s3-massA').textContent = massA;
  document.getElementById('lbl-s3-massB').textContent = massB;
  document.getElementById('lbl-s3-vel').textContent   = vel;

  // Solo redibuja si no está en animación
  if (sim3.state === 'idle' || sim3.state === 'done') {
    resetSim3();
  }
}

function drawSim3Frame() {
  const canvas = document.getElementById('canvas3');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w   = sim3.canvasW;
  const h   = sim3.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim3.groundY);

  const A = sim3.blockA;
  const B = sim3.blockB;

  // Etiquetas de masa sobre los bloques (se dibujan antes para que queden bajo el bloque)
  drawBlock(ctx, A.x, sim3.groundY, A.w, A.h, COLORS.blue,  `A: ${A.mass} kg`);
  drawBlock(ctx, B.x, sim3.groundY, B.w, B.h, COLORS.coral, `B: ${B.mass} kg`);

  // Flechas de fuerza durante/tras colisión
  if (sim3.state === 'colliding' || sim3.state === 'separating') {
    const mag    = 50 * sim3.forceAnim;
    const fuerza = (sim3.collisionForce * sim3.forceAnim).toFixed(0);

    // Reacción: flecha sale hacia la izquierda del bloque A
    drawArrow(ctx, A.x - A.w / 2, sim3.groundY - A.h * 0.55, -mag, COLORS.purple, '');
    drawForceLabel(ctx, A.x - A.w / 2 - mag / 2, sim3.groundY - A.h - 20, 'REACCIÓN', COLORS.purple);

    // Acción: flecha sale hacia la derecha del bloque B
    drawArrow(ctx, B.x + B.w / 2, sim3.groundY - B.h * 0.55, mag, COLORS.amber, '');
    drawForceLabel(ctx, B.x + B.w / 2 + mag / 2, sim3.groundY - B.h - 20, 'ACCIÓN', COLORS.amber);

    // Magnitud de la fuerza en el punto de impacto
    ctx.fillStyle = COLORS.green;
    ctx.font      = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`|F| = ${fuerza} N`, w / 2, sim3.groundY - Math.max(A.h, B.h) - 42);
  }

  // Flechas de velocidad post-colisión
  if (sim3.state === 'separating') {
    if (Math.abs(A.vx) > 0.1) drawArrow(ctx, A.x - A.w/2, sim3.groundY - A.h/2, A.vx * 10, COLORS.purple, 'vA');
    if (Math.abs(B.vx) > 0.1) drawArrow(ctx, B.x + B.w/2, sim3.groundY - B.h/2, B.vx * 10, COLORS.amber,  'vB');
  }

  // Leyenda Sim 3
  drawLegend(ctx, w, h, [
    { color: COLORS.blue,   label: `Bloque A (${A.mass} kg)` },
    { color: COLORS.coral,  label: `Bloque B (${B.mass} kg)` },
    { color: COLORS.amber,  label: 'Fuerza: Acción'          },
    { color: COLORS.purple, label: 'Fuerza: Reacción'        },
  ]);
}

function drawForceLabel(ctx, x, y, text, color) {
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width + 12;
  const th = 18;
  ctx.fillStyle = color + '22';
  ctx.beginPath(); ctx.roundRect(x - tw/2, y - th/2, tw, th, 4); ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function loopSim3() {
  const A = sim3.blockA;
  const B = sim3.blockB;

  if (sim3.state === 'colliding') {
    A.x += A.vx;
    B.x += B.vx;
    sim3.forceAnim = Math.min(1, sim3.forceAnim + 0.04);

    // Detectar contacto
    if (B.x - B.w / 2 <= A.x + A.w / 2 + 2) {
      // Colisión elástica con masas distintas:
      // v1' = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2)
      // v2' = ((m2-m1)*v2 + 2*m1*v1) / (m1+m2)
      const m1   = A.mass, m2 = B.mass;
      const v1   = A.vx,   v2 = B.vx;
      const sum  = m1 + m2;
      A.vx = ((m1 - m2) * v1 + 2 * m2 * v2) / sum;
      B.vx = ((m2 - m1) * v2 + 2 * m1 * v1) / sum;

      // Fuerza de impacto ≈ cambio de momento del bloque A
      sim3.collisionForce = Math.round(Math.abs(A.mass * (A.vx - v1)) * 3 + 10);

      sim3.state = 'separating';
      document.getElementById('ar-force-a').textContent = sim3.collisionForce + ' N';
      document.getElementById('ar-force-b').textContent = sim3.collisionForce + ' N';
      document.getElementById('ar-type-a').textContent  = 'Reacción';
      document.getElementById('ar-type-b').textContent  = 'Acción';
      updateSim3Info();
    }

  } else if (sim3.state === 'separating') {
    A.x += A.vx * 0.98;
    B.x += B.vx * 0.98;
    sim3.forceAnim = Math.max(0, sim3.forceAnim - 0.025);

    const dist = B.x - A.x;
    if (dist > sim3.canvasW * 0.75 || (A.x + A.w/2 < 0 && B.x - B.w/2 > sim3.canvasW)) {
      A.vx = 0; B.vx = 0;
      sim3.state = 'done';
      sim3.forceAnim = 0;
    }
  }

  drawSim3Frame();

  if (sim3.state === 'colliding' || sim3.state === 'separating') {
    animFrames.sim3 = requestAnimationFrame(loopSim3);
  } else {
    drawSim3Frame();
  }
}

function triggerCollision() {
  if (sim3.state !== 'idle') { resetSim3(); return; }
  const velVis    = sim3.velColision * 0.65;
  sim3.blockA.vx  =  velVis;
  sim3.blockB.vx  = -velVis;
  sim3.state      = 'colliding';
  sim3.forceAnim  = 0;
  animFrames.sim3 = requestAnimationFrame(loopSim3);
}

function updateSim3Info() {
  const box  = document.getElementById('info3');
  const text = document.getElementById('info3-text');
  const mA   = sim3.blockA.mass;
  const mB   = sim3.blockB.mass;
  box.className = 'info-box success';
  text.innerHTML = `✅ <strong>Colisión producida.</strong> A (${mA} kg) ejerció <strong>${sim3.collisionForce} N</strong> sobre B → y B respondió con <strong>${sim3.collisionForce} N</strong> sobre A ←. Igual magnitud, sentido contrario — sin importar las masas.`;
}

function resetSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);
  initSim3();
}


/* =============================================
   INICIO
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar labels de parámetros sim 1
  updateSim1Params();
  // Inicializar labels sim 3
  document.getElementById('lbl-s3-massA').textContent = document.getElementById('slider-s3-massA').value;
  document.getElementById('lbl-s3-massB').textContent = document.getElementById('slider-s3-massB').value;
  document.getElementById('lbl-s3-vel').textContent   = document.getElementById('slider-s3-vel').value;

  showHome();

  window.addEventListener('resize', () => {
    const active = document.querySelector('.screen.active');
    if (!active) return;
    if (active.id === 'screen-sim1') initSim1();
    if (active.id === 'screen-sim2') initSim2();
    if (active.id === 'screen-sim3') initSim3();
  });
});