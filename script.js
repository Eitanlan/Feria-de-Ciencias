/* =============================================
   LAS LEYES DE NEWTON — script.js
   Autor: Simulaciones Interactivas de Física
   Descripción: Lógica completa de las 3 simulaciones
   ============================================= */

/* =============================================
   UTILIDADES GENERALES
   ============================================= */

/**
 * Muestra la pantalla de inicio y oculta todas las simulaciones.
 */
function showHome() {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const home = document.getElementById('screen-home');
  home.style.display = 'flex';
  home.classList.add('active');

  // Detener todos los loops de animación activos
  stopAllAnimations();
}

/**
 * Muestra una simulación específica y oculta el menú principal.
 * @param {number} num - Número de simulación (1, 2 o 3)
 */
function showSimulation(num) {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const sim = document.getElementById('screen-sim' + num);
  sim.style.display = 'flex';
  sim.classList.add('active');

  // Inicializar la simulación correspondiente
  if (num === 1) initSim1();
  if (num === 2) initSim2();
  if (num === 3) initSim3();
}

// Almacena los IDs de animationFrame activos para poder cancelarlos
let animFrames = { sim1: null, sim2: null, sim3: null };

/**
 * Cancela todos los bucles de animación activos.
 */
function stopAllAnimations() {
  Object.values(animFrames).forEach(id => {
    if (id) cancelAnimationFrame(id);
  });
  animFrames = { sim1: null, sim2: null, sim3: null };
}

/**
 * Ajusta el tamaño interno del canvas para evitar distorsión por DPR.
 * @param {HTMLCanvasElement} canvas
 */
function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { w: rect.width, h: rect.height };
}


/* =============================================
   COLORES DE TEMA (para usar en Canvas)
   ============================================= */
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

/**
 * Dibuja la cuadrícula de fondo del canvas.
 */
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

/**
 * Dibuja el suelo con línea y relleno.
 */
function drawGround(ctx, w, h, groundY) {
  // Relleno inferior
  ctx.fillStyle = 'rgba(30,37,64,0.7)';
  ctx.fillRect(0, groundY, w, h - groundY);
  // Línea del suelo
  ctx.strokeStyle = COLORS.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();
}

/**
 * Dibuja un bloque rectangular con sombra y etiqueta.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - Centro horizontal del bloque
 * @param {number} y - Base del bloque (y del suelo)
 * @param {number} w - Ancho del bloque
 * @param {number} h - Alto del bloque
 * @param {string} color - Color principal
 * @param {string} label - Texto sobre el bloque
 */
function drawBlock(ctx, x, y, w, h, color, label = '') {
  const bx = x - w / 2;
  const by = y - h;

  // Sombra
  ctx.shadowColor = color;
  ctx.shadowBlur  = 12;

  // Relleno
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 6);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Borde luminoso superior
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(bx + 4, by + 3, w - 8, 3);

  // Borde
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 6);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Resetear sombra
  ctx.shadowBlur = 0;

  // Etiqueta sobre el bloque
  if (label) {
    ctx.fillStyle = COLORS.textSec;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, x, by - 4);
  }
}

/**
 * Dibuja una flecha de fuerza horizontal.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX - X inicio
 * @param {number} y - Y de la flecha
 * @param {number} length - Longitud (negativa = izquierda)
 * @param {string} color - Color de la flecha
 * @param {string} label - Etiqueta
 */
function drawArrow(ctx, startX, y, length, color, label = '') {
  if (Math.abs(length) < 4) return;

  const endX = startX + length;
  const dir  = length > 0 ? 1 : -1;
  const headLen = 10;

  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;

  // Línea principal
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX - dir * headLen, y);
  ctx.stroke();

  // Cabeza de flecha
  ctx.beginPath();
  ctx.moveTo(endX, y);
  ctx.lineTo(endX - dir * headLen, y - 6);
  ctx.lineTo(endX - dir * headLen, y + 6);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  // Etiqueta
  if (label) {
    ctx.fillStyle = color;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, startX + length / 2, y - 8);
  }
}

/**
 * Dibuja un marcador de velocidad (v) sobre el bloque.
 */
function drawVelocityLabel(ctx, x, y, speed) {
  if (speed < 0.05) return;
  ctx.fillStyle = COLORS.green;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`v = ${speed.toFixed(1)} m/s`, x, y);
}


/* =============================================
   SIMULACIÓN 1 — PRIMERA LEY (INERCIA)
   ============================================= */

// Estado global de la simulación 1
const sim1 = {
  x:          0,       // posición actual del bloque (px desde el centro)
  vx:         0,       // velocidad horizontal (px/frame equivalente a m/s)
  friction:   false,   // fricción activada
  running:    false,   // animación corriendo
  mu:         0.015,   // coeficiente de fricción (ajustado para visualización)
  groundY:    0,       // Y del suelo calculada en init
  canvasW:    0,
  canvasH:    0,
  blockW:     60,
  blockH:     36,
};

/**
 * Inicializa la primera simulación.
 */
function initSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);

  const canvas = document.getElementById('canvas1');
  const dims   = resizeCanvas(canvas);
  sim1.canvasW  = dims.w;
  sim1.canvasH  = dims.h;
  sim1.groundY  = dims.h * 0.72;
  sim1.x        = dims.w / 2;
  sim1.vx       = 0;
  sim1.running  = false;
  sim1.friction = false;

  // Resetear UI
  document.getElementById('btn-friction').classList.remove('active');
  document.getElementById('btn-friction').textContent = '🏔️ Agregar Fricción';
  updateSim1UI();
  drawSim1Frame();
}

/**
 * Renderiza un fotograma de la simulación 1.
 */
function drawSim1Frame() {
  const canvas = document.getElementById('canvas1');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const w      = sim1.canvasW;
  const h      = sim1.canvasH;

  // Limpiar
  ctx.clearRect(0, 0, w, h);

  // Fondo
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim1.groundY);

  // Superficie con textura de fricción si activa
  if (sim1.friction) {
    drawFrictionTexture(ctx, w, sim1.groundY);
  }

  // Bloque
  const blockColor = sim1.friction ? COLORS.amber : COLORS.blue;
  drawBlock(ctx, sim1.x, sim1.groundY, sim1.blockW, sim1.blockH, blockColor);

  // Flecha de velocidad si se mueve
  if (Math.abs(sim1.vx) > 0.1) {
    const arrowStart = sim1.x + (sim1.vx > 0 ? sim1.blockW / 2 : -sim1.blockW / 2);
    const arrowLen   = sim1.vx * 8;
    drawArrow(ctx, arrowStart, sim1.groundY - sim1.blockH / 2, arrowLen, COLORS.green, 'v');
  }

  // Etiqueta de velocidad
  drawVelocityLabel(ctx, sim1.x, sim1.groundY - sim1.blockH - 22, Math.abs(sim1.vx));

  // Etiqueta de fricción
  if (sim1.friction) {
    ctx.fillStyle = COLORS.amber;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('⚠ Fricción activa (μ = 0.5)', w / 2, sim1.groundY + 8);
  }
}

/**
 * Dibuja marcas de fricción en el suelo.
 */
function drawFrictionTexture(ctx, w, groundY) {
  ctx.strokeStyle = 'rgba(245,166,35,0.2)';
  ctx.lineWidth   = 1;
  for (let x = 0; x < w; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x,    groundY);
    ctx.lineTo(x + 6, groundY + 6);
    ctx.stroke();
  }
}

/**
 * Paso de física de la simulación 1.
 */
function stepSim1() {
  if (sim1.friction && Math.abs(sim1.vx) > 0) {
    // Deceleración por fricción
    const friction = sim1.mu * (sim1.vx > 0 ? -1 : 1);
    sim1.vx += friction;
    // Detener si la velocidad es muy pequeña
    if (Math.abs(sim1.vx) < 0.02) sim1.vx = 0;
  }

  // Mover el bloque
  sim1.x += sim1.vx;

  // Rebotar en los bordes del canvas
  const half = sim1.blockW / 2;
  if (sim1.x - half < 0) {
    sim1.x  = half;
    sim1.vx = Math.abs(sim1.vx) * 0.6;
  }
  if (sim1.x + half > sim1.canvasW) {
    sim1.x  = sim1.canvasW - half;
    sim1.vx = -Math.abs(sim1.vx) * 0.6;
  }
}

/**
 * Bucle de animación de la simulación 1.
 */
function loopSim1() {
  stepSim1();
  drawSim1Frame();
  updateSim1UI();

  // Si hay movimiento o está en marcha, continuar
  if (Math.abs(sim1.vx) > 0.01) {
    animFrames.sim1 = requestAnimationFrame(loopSim1);
  } else {
    sim1.vx      = 0;
    sim1.running = false;
    updateSim1Info('stopped');
    drawSim1Frame();
  }
}

/**
 * Aplica una fuerza inicial al bloque.
 */
function applyForce1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  sim1.vx = 3.5; // velocidad inicial en "unidades visuales"
  updateSim1Info('moving');
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

/**
 * Activa o desactiva la fricción.
 */
function toggleFriction1() {
  sim1.friction = !sim1.friction;
  const btn = document.getElementById('btn-friction');
  if (sim1.friction) {
    btn.classList.add('active');
    btn.textContent = '✓ Fricción Activa';
  } else {
    btn.classList.remove('active');
    btn.textContent = '🏔️ Agregar Fricción';
  }
  document.getElementById('s1-friction').textContent = sim1.friction ? 'Con fricción' : 'Sin fricción';
  drawSim1Frame();
}

/**
 * Reinicia la simulación 1.
 */
function resetSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  initSim1();
}

/**
 * Actualiza los chips de estado de la UI.
 */
function updateSim1UI() {
  document.getElementById('s1-speed').textContent    = Math.abs(sim1.vx).toFixed(2) + ' m/s';
  document.getElementById('s1-friction').textContent = sim1.friction ? 'Con fricción' : 'Sin fricción';
  document.getElementById('s1-state').textContent    = Math.abs(sim1.vx) > 0.05 ? 'En movimiento' : 'En reposo';
}

/**
 * Actualiza la caja de información según el estado.
 */
function updateSim1Info(state) {
  const box  = document.getElementById('info1');
  const text = document.getElementById('info1-text');
  box.className = 'info-box';

  if (state === 'moving' && !sim1.friction) {
    box.classList.add('success');
    text.innerHTML = '✅ <strong>Sin fricción:</strong> El bloque se mueve a velocidad constante. ¡La Primera Ley en acción! No hace falta fuerza para mantener el movimiento.';
  } else if (state === 'moving' && sim1.friction) {
    box.classList.add('warning');
    text.innerHTML = '⚠️ <strong>Con fricción:</strong> La fricción actúa como fuerza opuesta al movimiento, desacelerando el bloque hasta detenerlo.';
  } else if (state === 'stopped') {
    text.innerHTML = sim1.friction
      ? '🛑 <strong>El bloque se detuvo.</strong> La fricción fue la fuerza que alteró su estado de movimiento. Desactívala y aplica fuerza de nuevo.'
      : '💡 Aplica una fuerza al bloque y observa cómo se mueve indefinidamente <strong>sin fricción</strong>.';
  }
}


/* =============================================
   SIMULACIÓN 2 — SEGUNDA LEY (F = m × a)
   ============================================= */

const sim2 = {
  x:        0,       // posición del bloque
  vx:       0,       // velocidad actual
  accel:    0,       // aceleración calculada
  running:  false,
  force:    10,      // N
  mass:     5,       // kg
  groundY:  0,
  canvasW:  0,
  canvasH:  0,
  blockW:   50,
  blockH:   50,      // bloque más grande a mayor masa
  maxX:     0,       // límite derecho
};

/**
 * Inicializa la simulación 2.
 */
function initSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);

  const canvas = document.getElementById('canvas2');
  const dims   = resizeCanvas(canvas);
  sim2.canvasW  = dims.w;
  sim2.canvasH  = dims.h;
  sim2.groundY  = dims.h * 0.72;
  sim2.x        = 60;
  sim2.vx       = 0;
  sim2.running  = false;
  sim2.maxX     = dims.w - 60;

  updateSim2Values();
  drawSim2Frame();
}

/**
 * Actualiza los valores desde los sliders y recalcula aceleración.
 */
function updateSim2Values() {
  const forceSlider = document.getElementById('slider-force');
  const massSlider  = document.getElementById('slider-mass');

  sim2.force = parseFloat(forceSlider.value);
  sim2.mass  = parseFloat(massSlider.value);
  sim2.accel = sim2.force / sim2.mass; // F = m*a → a = F/m

  // Escalar tamaño visual del bloque con la masa
  sim2.blockW = 30 + sim2.mass * 2;
  sim2.blockH = 30 + sim2.mass * 2;

  // Actualizar etiquetas de sliders
  document.getElementById('lbl-force').textContent = sim2.force;
  document.getElementById('lbl-mass').textContent  = sim2.mass;

  // Actualizar métricas
  document.getElementById('s2-force').textContent = sim2.force + ' N';
  document.getElementById('s2-mass').textContent  = sim2.mass + ' kg';
  document.getElementById('s2-accel').textContent = sim2.accel.toFixed(2) + ' m/s²';

  // Actualizar display de fórmula
  document.getElementById('formula-display2').innerHTML =
    `<span class="fd-part blue">F = ${sim2.force} N</span>
     <span class="fd-eq"> = </span>
     <span class="fd-part amber">${sim2.mass} kg</span>
     <span class="fd-times"> × </span>
     <span class="fd-part green">a = ${sim2.accel.toFixed(2)} m/s²</span>`;

  if (!sim2.running) drawSim2Frame();
}

/**
 * Renderiza un fotograma de la simulación 2.
 */
function drawSim2Frame() {
  const canvas = document.getElementById('canvas2');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const w      = sim2.canvasW;
  const h      = sim2.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim2.groundY);

  // Bloque — color varía con aceleración
  const intensity = Math.min(sim2.accel / 10, 1);
  const blockColor = interpolateColor(COLORS.blue, COLORS.coral, intensity);
  drawBlock(ctx, sim2.x, sim2.groundY, sim2.blockW, sim2.blockH, blockColor);

  // Flecha de fuerza
  if (sim2.running || sim2.vx > 0.1) {
    const arrowLen = 30 + sim2.force * 1.5;
    drawArrow(ctx, sim2.x + sim2.blockW / 2, sim2.groundY - sim2.blockH / 2, arrowLen, COLORS.amber, `F=${sim2.force}N`);
  }

  // Flecha de velocidad
  if (sim2.vx > 0.05) {
    drawArrow(ctx, sim2.x - sim2.blockW / 2, sim2.groundY - sim2.blockH * 0.75, sim2.vx * 12, COLORS.green, `v`);
  }

  // Etiqueta de masa visual
  ctx.fillStyle = COLORS.textSec;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${sim2.mass}kg`, sim2.x, sim2.groundY - sim2.blockH / 2);

  // Barra de progreso de aceleración
  drawAccelBar(ctx, w, h);
}

/**
 * Dibuja una barra visual de aceleración.
 */
function drawAccelBar(ctx, w, h) {
  const barX = 16;
  const barY = 16;
  const barW = 120;
  const barH = 8;
  const fill = Math.min(sim2.accel / 15, 1);

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();

  ctx.fillStyle = COLORS.green;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * fill, barH, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = COLORS.textSec;
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`a = ${sim2.accel.toFixed(2)} m/s²`, barX, barY + 12);
}

/**
 * Interpola entre dos colores hex.
 * @param {string} c1 - Color inicial (hex)
 * @param {string} c2 - Color final (hex)
 * @param {number} t  - Factor 0..1
 */
function interpolateColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r  = Math.round(r1 + (r2 - r1) * t);
  const g  = Math.round(g1 + (g2 - g1) * t);
  const b  = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Paso de física de la simulación 2.
 * La aceleración escala visualmente con F/m.
 */
function stepSim2() {
  // Escala visual: cada unidad real = algunos px para que sea visible
  const visualAccel = (sim2.accel / 5) * 0.12;
  sim2.vx += visualAccel;

  // Velocidad máxima para no salir de pantalla demasiado rápido
  const maxVx = 8;
  if (sim2.vx > maxVx) sim2.vx = maxVx;

  sim2.x += sim2.vx;
}

/**
 * Bucle de animación de la simulación 2.
 */
function loopSim2() {
  stepSim2();
  drawSim2Frame();

  // Actualizar velocidad en UI
  document.getElementById('s2-speed').textContent = sim2.vx.toFixed(1) + ' m/s';

  if (sim2.x < sim2.maxX) {
    animFrames.sim2 = requestAnimationFrame(loopSim2);
  } else {
    // El bloque salió de pantalla
    sim2.running = false;
    document.getElementById('s2-speed').textContent = '—';

    // Mostrar resumen
    const accelStr = sim2.accel.toFixed(2);
    const infoEl = document.createElement('div');
    drawSim2Summary();
  }
}

/**
 * Dibuja el resumen final cuando el bloque termina su recorrido.
 */
function drawSim2Summary() {
  const canvas = document.getElementById('canvas2');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const w      = sim2.canvasW;
  const h      = sim2.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim2.groundY);

  // Mensaje central
  ctx.fillStyle = COLORS.green;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`✓ a = ${sim2.accel.toFixed(2)} m/s²  |  F = ${sim2.force}N  |  m = ${sim2.mass}kg`, w / 2, h / 2);

  ctx.fillStyle = COLORS.textSec;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Ajusta los sliders y presiona "Aplicar Fuerza" de nuevo.', w / 2, h / 2 + 28);
}

/**
 * Inicia la animación de la simulación 2.
 */
function runSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  sim2.x       = 60;
  sim2.vx      = 0;
  sim2.running = true;
  animFrames.sim2 = requestAnimationFrame(loopSim2);
}

/**
 * Reinicia la simulación 2.
 */
function resetSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  initSim2();
}


/* =============================================
   SIMULACIÓN 3 — TERCERA LEY (ACCIÓN Y REACCIÓN)
   ============================================= */

const sim3 = {
  blockA:    { x: 0, vx: 0, w: 54, h: 44, color: COLORS.blue },
  blockB:    { x: 0, vx: 0, w: 54, h: 44, color: COLORS.coral },
  groundY:   0,
  canvasW:   0,
  canvasH:   0,
  state:     'idle',   // 'idle' | 'colliding' | 'separating' | 'done'
  forceAnim: 0,        // progreso de la animación de fuerzas (0..1)
  frameCount:0,
};

/**
 * Inicializa la simulación 3.
 */
function initSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);

  const canvas = document.getElementById('canvas3');
  const dims   = resizeCanvas(canvas);
  sim3.canvasW  = dims.w;
  sim3.canvasH  = dims.h;
  sim3.groundY  = dims.h * 0.72;

  // Posicionar los bloques separados
  const center = dims.w / 2;
  sim3.blockA.x = center - 80;
  sim3.blockB.x = center + 80;
  sim3.blockA.vx = 0;
  sim3.blockB.vx = 0;
  sim3.state      = 'idle';
  sim3.forceAnim  = 0;
  sim3.frameCount = 0;

  // Resetear UI
  document.getElementById('ar-force-a').textContent = '—';
  document.getElementById('ar-force-b').textContent = '—';
  document.getElementById('ar-type-a').textContent  = '—';
  document.getElementById('ar-type-b').textContent  = '—';
  document.getElementById('info3-text').innerHTML   = 'Presiona <strong>Colisión</strong> para ver cómo los dos bloques ejercen fuerzas iguales y opuestas.';

  drawSim3Frame();
}

/**
 * Renderiza un fotograma de la simulación 3.
 */
function drawSim3Frame() {
  const canvas = document.getElementById('canvas3');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const w      = sim3.canvasW;
  const h      = sim3.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, h, sim3.groundY);

  const A = sim3.blockA;
  const B = sim3.blockB;

  // Bloques
  drawBlock(ctx, A.x, sim3.groundY, A.w, A.h, COLORS.blue,  'Bloque A');
  drawBlock(ctx, B.x, sim3.groundY, B.w, B.h, COLORS.coral, 'Bloque B');

  // Flechas de fuerza durante colisión
  if (sim3.state === 'colliding' || sim3.state === 'separating') {
    const mag    = 45 * sim3.forceAnim;
    const labelA = 'Reacción →';
    const labelB = '← Acción';

    // Flecha sobre bloque A (sale hacia la izquierda: reacción)
    drawArrow(ctx, A.x - A.w / 2, sim3.groundY - A.h * 0.6, -mag, COLORS.purple, '');
    drawForceLabel(ctx, A.x - A.w / 2 - mag / 2, sim3.groundY - A.h - 18, 'REACCIÓN', COLORS.purple);

    // Flecha sobre bloque B (sale hacia la derecha: acción)
    drawArrow(ctx, B.x + B.w / 2, sim3.groundY - B.h * 0.6, mag, COLORS.amber, '');
    drawForceLabel(ctx, B.x + B.w / 2 + mag / 2, sim3.groundY - B.h - 18, 'ACCIÓN', COLORS.amber);

    // Etiqueta de fuerza en el centro
    const fuerza = (20 * sim3.forceAnim).toFixed(0);
    ctx.fillStyle = COLORS.green;
    ctx.font      = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`|F| = ${fuerza} N`, w / 2, sim3.groundY - A.h - 38);
  }

  // Flecha de separación post-colisión
  if (sim3.state === 'separating') {
    if (Math.abs(A.vx) > 0.1) {
      drawArrow(ctx, A.x - A.w / 2, sim3.groundY - A.h / 2, A.vx * 10, COLORS.purple, 'v');
    }
    if (Math.abs(B.vx) > 0.1) {
      drawArrow(ctx, B.x + B.w / 2, sim3.groundY - B.h / 2, B.vx * 10, COLORS.amber, 'v');
    }
  }
}

/**
 * Dibuja una etiqueta de acción/reacción con fondo.
 */
function drawForceLabel(ctx, x, y, text, color) {
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tw = ctx.measureText(text).width + 12;
  const th = 18;

  ctx.fillStyle = color + '22';
  ctx.beginPath();
  ctx.roundRect(x - tw / 2, y - th / 2, tw, th, 4);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/**
 * Bucle de animación de la simulación 3.
 */
function loopSim3() {
  sim3.frameCount++;

  const A = sim3.blockA;
  const B = sim3.blockB;

  if (sim3.state === 'colliding') {
    // Acercar los bloques
    A.x += A.vx;
    B.x += B.vx;
    sim3.forceAnim = Math.min(1, sim3.forceAnim + 0.04);

    // Detectar colisión (cuando se tocan)
    if (B.x - B.w / 2 <= A.x + A.w / 2 + 2) {
      // Colisión: intercambiar velocidades (masas iguales = intercambio completo)
      const tmpVx = A.vx;
      A.vx = B.vx;
      B.vx = tmpVx;
      sim3.state = 'separating';

      // Actualizar UI con los valores de fuerza
      document.getElementById('ar-force-a').textContent = '20 N';
      document.getElementById('ar-force-b').textContent = '20 N';
      document.getElementById('ar-type-a').textContent  = 'Reacción';
      document.getElementById('ar-type-b').textContent  = 'Acción';
      updateSim3Info();
    }

  } else if (sim3.state === 'separating') {
    // Separar los bloques
    A.x += A.vx * 0.98;
    B.x += B.vx * 0.98;
    sim3.forceAnim = Math.max(0, sim3.forceAnim - 0.03);

    // Detener cuando estén suficientemente separados
    const dist = B.x - A.x;
    if (dist > sim3.canvasW * 0.7) {
      A.vx = 0; B.vx = 0;
      sim3.state     = 'done';
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

/**
 * Dispara la animación de colisión.
 */
function triggerCollision() {
  if (sim3.state !== 'idle') {
    resetSim3();
    return;
  }

  // Velocidades de aproximación hacia el centro
  sim3.blockA.vx =  2.2;
  sim3.blockB.vx = -2.2;
  sim3.state      = 'colliding';
  sim3.forceAnim  = 0;

  animFrames.sim3 = requestAnimationFrame(loopSim3);
}

/**
 * Actualiza la caja de información de la sim3 tras la colisión.
 */
function updateSim3Info() {
  const box  = document.getElementById('info3');
  const text = document.getElementById('info3-text');
  box.className = 'info-box success';
  text.innerHTML = '✅ <strong>¡Colisión producida!</strong> El Bloque A ejerció una fuerza sobre el Bloque B (Acción = 20 N →) y el Bloque B respondió con una fuerza igual y opuesta sobre A (Reacción = 20 N ←). <strong>Misma magnitud, sentido contrario.</strong>';
}

/**
 * Reinicia la simulación 3.
 */
function resetSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);
  initSim3();
}


/* =============================================
   INICIALIZACIÓN AL CARGAR LA PÁGINA
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar la pantalla de inicio
  showHome();

  // Manejar redimensionamiento de ventana
  window.addEventListener('resize', () => {
    // Re-inicializar la simulación activa si el canvas cambió de tamaño
    const active = document.querySelector('.screen.active');
    if (!active) return;
    if (active.id === 'screen-sim1') initSim1();
    if (active.id === 'screen-sim2') initSim2();
    if (active.id === 'screen-sim3') initSim3();
  });
});
