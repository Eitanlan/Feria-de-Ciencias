/* =====================================================
   LAS LEYES DE NEWTON — script.js
   Versión 2.0 — Feria de Ciencias
   ===================================================== */

/* =====================================================
   SISTEMA DE NAVEGACIÓN
   ===================================================== */

let animFrames = { sim1: null, sim2: null, sim3: null };
let demoActive = { sim1: false, sim2: false, sim3: false };
let demoIntervals = { sim1: null, sim2: null, sim3: null };

function showHome() {
  stopAllAnimations();
  stopAllDemos();
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const home = document.getElementById('screen-home');
  home.style.display = 'flex';
  setTimeout(() => home.classList.add('active'), 10);
}

function showSimulation(num) {
  stopAllAnimations();
  stopAllDemos();
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const sim = document.getElementById('screen-sim' + num);
  sim.style.display = 'flex';
  setTimeout(() => {
    sim.classList.add('active');
    if (num === 1) initSim1();
    if (num === 2) initSim2();
    if (num === 3) initSim3();
  }, 10);
}

function stopAllAnimations() {
  Object.keys(animFrames).forEach(k => {
    if (animFrames[k]) { cancelAnimationFrame(animFrames[k]); animFrames[k] = null; }
  });
}

function stopAllDemos() {
  Object.keys(demoIntervals).forEach(k => {
    if (demoIntervals[k]) { clearTimeout(demoIntervals[k]); demoIntervals[k] = null; }
  });
  demoActive = { sim1: false, sim2: false, sim3: false };
  ['demo1-btn','demo2-btn','demo3-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
}

/* =====================================================
   FONDO ANIMADO — PARTÍCULAS EN HOME
   ===================================================== */

let bgCtx, bgW, bgH;
const bgParticles = [];

function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  bgCtx = canvas.getContext('2d');
  resizeBgCanvas();

  for (let i = 0; i < 80; i++) {
    bgParticles.push({
      x: Math.random() * bgW,
      y: Math.random() * bgH,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: ['#4fa3ff','#a78bfa','#34d399','#f59e0b','#f87171'][Math.floor(Math.random()*5)],
    });
  }

  window.addEventListener('resize', resizeBgCanvas);
  animateBg();
}

function resizeBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  bgW = canvas.clientWidth || window.innerWidth;
  bgH = canvas.clientHeight || window.innerHeight;
  canvas.width  = bgW * dpr;
  canvas.height = bgH * dpr;
  bgCtx.scale(dpr, dpr);
}

function animateBg() {
  if (!document.getElementById('screen-home').classList.contains('active')) return;
  bgCtx.clearRect(0, 0, bgW, bgH);

  // Líneas de conexión
  for (let i = 0; i < bgParticles.length; i++) {
    for (let j = i+1; j < bgParticles.length; j++) {
      const dx = bgParticles[i].x - bgParticles[j].x;
      const dy = bgParticles[i].y - bgParticles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 130) {
        bgCtx.beginPath();
        bgCtx.strokeStyle = `rgba(79,163,255,${0.04 * (1 - dist/130)})`;
        bgCtx.lineWidth = 0.5;
        bgCtx.moveTo(bgParticles[i].x, bgParticles[i].y);
        bgCtx.lineTo(bgParticles[j].x, bgParticles[j].y);
        bgCtx.stroke();
      }
    }
  }

  // Partículas
  bgParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = bgW;
    if (p.x > bgW) p.x = 0;
    if (p.y < 0) p.y = bgH;
    if (p.y > bgH) p.y = 0;

    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    bgCtx.fillStyle = p.color;
    bgCtx.globalAlpha = p.alpha;
    bgCtx.fill();
    bgCtx.globalAlpha = 1;
  });

  requestAnimationFrame(animateBg);
}

/* =====================================================
   CANVAS UTILS
   ===================================================== */

function resizeCanvas(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;
  const w = rect.width  || 600;
  const h = rect.height || 420;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { w, h };
}

const C = {
  bg:     '#080b13',
  grid:   'rgba(255,255,255,0.03)',
  blue:   '#4fa3ff',
  amber:  '#f59e0b',
  green:  '#34d399',
  coral:  '#f87171',
  purple: '#a78bfa',
  teal:   '#2dd4bf',
  text1:  '#f1f5ff',
  text2:  '#8b97c0',
  text3:  '#475a8a',
  ground: 'rgba(20,28,50,0.7)',
  groundLine: 'rgba(255,255,255,0.08)',
};

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}

function drawGround(ctx, w, groundY) {
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, groundY, w, 4);
  ctx.strokeStyle = C.groundLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
}

function drawBlock(ctx, cx, groundY, bw, bh, color, label) {
  const bx = cx - bw/2;
  const by = groundY - bh;

  // Sombra del bloque en el suelo
  ctx.shadowColor = color;
  ctx.shadowBlur  = 0;
  ctx.fillStyle   = `${color}20`;
  ctx.fillRect(cx - bw*0.6, groundY, bw*1.2, 4);

  // Cuerpo del bloque
  ctx.shadowColor = color;
  ctx.shadowBlur  = 16;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle   = color + 'cc';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur  = 0;

  // Brillo en el borde superior
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.roundRect(bx + 3, by + 3, bw - 6, 3, 2);
  ctx.fill();

  // Borde exterior
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.stroke();
  ctx.globalAlpha = 1;

  // Etiqueta
  if (label) {
    ctx.fillStyle = C.text2;
    ctx.font = '11px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, cx, by - 5);
  }
}

function drawArrow(ctx, startX, y, length, color, label, thick) {
  if (Math.abs(length) < 6) return;
  const dir     = length > 0 ? 1 : -1;
  const endX    = startX + length;
  const headLen = 11;
  const lw      = thick || 2.5;

  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = lw;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 10;
  ctx.lineCap     = 'round';

  // Cuerpo de la flecha
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(endX - dir * headLen, y);
  ctx.stroke();

  // Punta
  ctx.beginPath();
  ctx.moveTo(endX, y);
  ctx.lineTo(endX - dir * headLen, y - 7);
  ctx.lineTo(endX - dir * headLen, y + 7);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Etiqueta
  if (label) {
    const midX = startX + length * 0.5;
    ctx.fillStyle = color;
    ctx.font = `bold 11px "Space Grotesk", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, midX, y - 10);
  }
}

function drawLegend(ctx, w, h, items) {
  const pad = 10, boxSz = 10, lineH = 18;
  const legendW = 165, legendH = pad + 12 + items.length * lineH + pad * 0.5;
  const lx = w - legendW - 12, ly = 10;

  ctx.fillStyle = 'rgba(5,8,16,0.82)';
  ctx.beginPath(); ctx.roundRect(lx, ly, legendW, legendH, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = C.text3;
  ctx.font = `bold 9px "Space Grotesk", system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('LEYENDA', lx + pad, ly + pad - 1);

  items.forEach((item, i) => {
    const ix = lx + pad;
    const iy = ly + pad + 12 + i * lineH;
    ctx.shadowColor = item.color;
    ctx.shadowBlur  = 5;
    ctx.fillStyle   = item.color;
    ctx.fillRect(ix, iy + 2, boxSz, boxSz);
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = C.text2;
    ctx.font        = `11px "Space Grotesk", system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(item.label, ix + boxSz + 7, iy);
  });
}

function drawForceBadge(ctx, x, y, text, color) {
  ctx.font = `bold 10px "Space Grotesk", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width + 14;
  ctx.fillStyle = color + '25';
  ctx.beginPath(); ctx.roundRect(x - tw/2, y - 9, tw, 18, 4); ctx.fill();
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function interpolateColor(c1, c2, t) {
  const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
  const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
  const r = Math.round(r1+(r2-r1)*t), g = Math.round(g1+(g2-g1)*t), b = Math.round(b1+(b2-b1)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function flashRTValue(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('updating');
  void el.offsetWidth;
  el.classList.add('updating');
  setTimeout(() => el.classList.remove('updating'), 300);
}

/* =====================================================
   SIMULACIÓN 1 — PRIMERA LEY (INERCIA)
   Movimiento infinito: warp en bordes
   ===================================================== */

const sim1 = {
  x: 0, vx: 0,
  mu: 0, mass: 5, velInicial: 4,
  blockW: 60, blockH: 36,
  groundY: 0, canvasW: 0, canvasH: 0,
  running: false,
  trail: [], // rastro de posiciones
};

const MASS_TO_BLOCK = (mass) => {
  const base = 28 + mass * 2;
  return { w: Math.min(base, 90), h: Math.min(base * 0.6, 55) };
};

function initSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  const canvas = document.getElementById('canvas1');
  const dims   = resizeCanvas(canvas);
  sim1.canvasW = dims.w;
  sim1.canvasH = dims.h;
  sim1.groundY = dims.h * 0.70;
  sim1.x       = dims.w / 2;
  sim1.vx      = 0;
  sim1.running = false;
  sim1.trail   = [];

  updateSim1Params();
  drawSim1Frame();
  updateSim1RT();
  updateSim1Message('idle');
}

function updateSim1Params() {
  const vel  = parseFloat(document.getElementById('slider-s1-vel').value);
  const mu   = parseFloat(document.getElementById('slider-s1-mu').value);
  const mass = parseInt(document.getElementById('slider-s1-mass').value);

  sim1.velInicial = vel;
  sim1.mu   = mu;
  sim1.mass = mass;

  const dims = MASS_TO_BLOCK(mass);
  sim1.blockW = dims.w;
  sim1.blockH = dims.h;

  document.getElementById('lbl-s1-vel').textContent  = vel;
  document.getElementById('lbl-s1-mu').textContent   = mu.toFixed(2);
  document.getElementById('lbl-s1-mass').textContent = mass;

  // Pill de fricción
  const pill = document.getElementById('mu-pill');
  if (mu === 0) {
    pill.textContent = 'sin fricción';
    pill.className = 'mu-pill';
  } else if (mu < 0.25) {
    pill.textContent = 'fricción baja';
    pill.className = 'mu-pill friction-low';
  } else if (mu < 0.55) {
    pill.textContent = 'fricción media';
    pill.className = 'mu-pill friction-medium';
  } else {
    pill.textContent = 'fricción alta';
    pill.className = 'mu-pill friction-high';
  }

  if (!sim1.running) drawSim1Frame();
}

function drawSim1Frame() {
  const canvas = document.getElementById('canvas1');
  if (!canvas || sim1.canvasW === 0) return;
  const ctx = canvas.getContext('2d');
  const w = sim1.canvasW, h = sim1.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);

  // Textura de fricción en el suelo
  if (sim1.mu > 0) {
    const alpha = Math.min(sim1.mu * 1.5, 0.6);
    ctx.strokeStyle = `rgba(245,158,11,${alpha * 0.4})`;
    ctx.lineWidth = 1;
    for (let fx = 0; fx < w; fx += 10) {
      ctx.beginPath();
      ctx.moveTo(fx,     sim1.groundY);
      ctx.lineTo(fx + 5, sim1.groundY + 5);
      ctx.stroke();
    }
    // Etiqueta μ bajo el suelo
    ctx.fillStyle = C.amber;
    ctx.font = '11px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`μ = ${sim1.mu.toFixed(2)}  ·  Fricción = ${(sim1.mu * sim1.mass * 9.8).toFixed(1)} N`, w/2, sim1.groundY + 8);
  }

  drawGround(ctx, w, sim1.groundY);

  // Rastro de movimiento
  if (sim1.trail.length > 1 && sim1.running) {
    const color = sim1.mu === 0 ? C.blue : C.amber;
    for (let i = 1; i < sim1.trail.length; i++) {
      const alpha = (i / sim1.trail.length) * 0.35;
      ctx.beginPath();
      ctx.strokeStyle = `${color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth = sim1.blockH * 0.15;
      ctx.lineCap = 'round';
      ctx.moveTo(sim1.trail[i-1], sim1.groundY - sim1.blockH/2);
      ctx.lineTo(sim1.trail[i],   sim1.groundY - sim1.blockH/2);
      ctx.stroke();
    }
  }

  // Color del bloque según μ
  let blockColor = C.blue;
  if (sim1.mu > 0 && sim1.mu < 0.35) blockColor = C.amber;
  else if (sim1.mu >= 0.35) blockColor = C.coral;

  drawBlock(ctx, sim1.x, sim1.groundY, sim1.blockW, sim1.blockH, blockColor);

  // Flecha de velocidad
  if (Math.abs(sim1.vx) > 0.08) {
    const startX = sim1.x + (sim1.vx > 0 ? sim1.blockW/2 : -sim1.blockW/2);
    const arrowLen = Math.sign(sim1.vx) * Math.max(40, Math.abs(sim1.vx) * 12);
    const speed = Math.abs(sim1.vx).toFixed(2);
    drawArrow(ctx, startX, sim1.groundY - sim1.blockH * 0.55, arrowLen, C.green, `v = ${speed} m/s`);
  }

  // Indicador ∞ si se mueve sin fricción
  if (Math.abs(sim1.vx) > 0.05 && sim1.mu === 0) {
    ctx.fillStyle = 'rgba(79,163,255,0.5)';
    ctx.font = 'bold 12px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('∞  Movimiento Uniforme Rectilíneo — sin fuerza neta', w/2, sim1.groundY + 8);
  }

  // Indicador de fuerza de fricción
  if (sim1.running && sim1.mu > 0 && Math.abs(sim1.vx) > 0.05) {
    const fFric = (sim1.mu * sim1.mass * 9.8).toFixed(1);
    const dir  = sim1.vx > 0 ? -1 : 1;
    drawArrow(ctx, sim1.x, sim1.groundY - sim1.blockH * 0.15, dir * Math.min(80, sim1.mu * 150), C.coral, `Ff = ${fFric} N`);
  }

  // Leyenda
  const legendItems = [
    { color: C.green, label: 'Velocidad (v)' },
  ];
  if (sim1.mu > 0) legendItems.push({ color: C.coral, label: 'Fuerza de fricción (Ff)' });
  legendItems.push({ color: blockColor, label: sim1.mu === 0 ? 'Bloque sin fricción' : 'Bloque con fricción' });
  drawLegend(ctx, w, h, legendItems);
}

function stepSim1() {
  // Física: fricción cinética
  if (sim1.mu > 0 && Math.abs(sim1.vx) > 0) {
    const fricAcc = sim1.mu * 9.8 * 0.06; // escala visual
    if (Math.abs(sim1.vx) <= fricAcc) {
      sim1.vx = 0;
    } else {
      sim1.vx += sim1.vx > 0 ? -fricAcc : fricAcc;
    }
  }

  sim1.x += sim1.vx;

  // Rastro (cada 3 frames)
  if (sim1.running) {
    sim1.trail.push(sim1.x);
    if (sim1.trail.length > 60) sim1.trail.shift();
  }

  // Warp infinito — nunca colisiona con bordes
  const half = sim1.blockW / 2;
  if (sim1.x - half > sim1.canvasW + 20) sim1.x = -half - 20;
  if (sim1.x + half < -20) sim1.x = sim1.canvasW + half + 20;
}

function loopSim1() {
  stepSim1();
  drawSim1Frame();
  updateSim1RT();

  if (Math.abs(sim1.vx) > 0.01) {
    animFrames.sim1 = requestAnimationFrame(loopSim1);
  } else {
    sim1.vx = 0;
    sim1.running = false;
    drawSim1Frame();
    updateSim1RT();
    updateSim1Message('stopped');
  }
}

function applyForce1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  sim1.velInicial = parseFloat(document.getElementById('slider-s1-vel').value);
  sim1.mu  = parseFloat(document.getElementById('slider-s1-mu').value);
  sim1.mass = parseInt(document.getElementById('slider-s1-mass').value);
  const dims = MASS_TO_BLOCK(sim1.mass);
  sim1.blockW = dims.w;
  sim1.blockH = dims.h;
  sim1.vx = sim1.velInicial * 0.75;
  sim1.running = true;
  sim1.trail = [];
  updateSim1Message('moving');
  animFrames.sim1 = requestAnimationFrame(loopSim1);
}

function resetSim1() {
  if (animFrames.sim1) cancelAnimationFrame(animFrames.sim1);
  animFrames.sim1 = null;
  sim1.running = false;
  sim1.trail   = [];
  initSim1();
}

function updateSim1RT() {
  document.getElementById('rt1-vel').textContent   = Math.abs(sim1.vx).toFixed(2) + ' m/s';
  document.getElementById('rt1-pos').textContent   = (sim1.x / 40).toFixed(1) + ' m';
  document.getElementById('rt1-state').textContent = Math.abs(sim1.vx) > 0.05 ? (sim1.mu > 0 ? 'Desacelerando' : 'MUR ∞') : 'Reposo';
  document.getElementById('rt1-mu').textContent    = 'μ = ' + sim1.mu.toFixed(2);
}

function updateSim1Message(state) {
  const box  = document.getElementById('msg1');
  const text = document.getElementById('msg1-text');
  box.className = 'msg-box';
  if (state === 'moving' && sim1.mu === 0) {
    box.classList.add('success');
    text.innerHTML = '✅ <strong>μ = 0 · Movimiento perpetuo:</strong> Sin fricción, el bloque continúa indefinidamente a velocidad constante. <strong>Esta es la Primera Ley de Newton en acción.</strong>';
  } else if (state === 'moving' && sim1.mu > 0) {
    box.classList.add('warning');
    const fric = (sim1.mu * sim1.mass * 9.8).toFixed(1);
    text.innerHTML = `⚠️ <strong>Fricción activa (μ = ${sim1.mu.toFixed(2)}):</strong> Fuerza de rozamiento = ${fric} N oponiéndose al movimiento. El bloque se detendrá.`;
  } else if (state === 'stopped') {
    if (sim1.mu === 0) {
      text.innerHTML = '💡 Presioná <strong>Aplicar Fuerza</strong>. Con μ = 0 el bloque se mueve para siempre (Primera Ley).';
    } else {
      text.innerHTML = `🛑 <strong>Detenido.</strong> La fricción (μ = ${sim1.mu.toFixed(2)}) consumió toda la energía cinética. Bajá μ a 0 para ver el movimiento infinito.`;
    }
  } else {
    text.innerHTML = 'Ajustá la velocidad inicial y el coeficiente de fricción. Con <strong>μ = 0</strong>, el bloque se mueve <strong>para siempre</strong>: eso es la Primera Ley.';
  }
}

/* =====================================================
   MODO DEMO SIM 1
   ===================================================== */
function toggleDemo1() {
  const btn = document.getElementById('demo1-btn');
  if (demoActive.sim1) {
    demoActive.sim1 = false;
    btn.classList.remove('active');
    clearTimeout(demoIntervals.sim1);
    return;
  }
  demoActive.sim1 = true;
  btn.classList.add('active');
  runDemo1Sequence();
}

function runDemo1Sequence() {
  if (!demoActive.sim1) return;

  const steps = [
    () => {
      document.getElementById('slider-s1-mu').value = 0;
      document.getElementById('slider-s1-vel').value = 6;
      document.getElementById('slider-s1-mass').value = 5;
      updateSim1Params();
      applyForce1();
    },
    () => {
      resetSim1();
      document.getElementById('slider-s1-mu').value = 0.3;
      document.getElementById('slider-s1-vel').value = 6;
      updateSim1Params();
      applyForce1();
    },
    () => {
      resetSim1();
      document.getElementById('slider-s1-mu').value = 0.7;
      document.getElementById('slider-s1-vel').value = 8;
      updateSim1Params();
      applyForce1();
    },
  ];

  let i = 0;
  const runNext = () => {
    if (!demoActive.sim1) return;
    steps[i % steps.length]();
    i++;
    demoIntervals.sim1 = setTimeout(runNext, 4000);
  };
  runNext();
}

/* =====================================================
   SIMULACIÓN 2 — SEGUNDA LEY (F = m × a)
   ===================================================== */

const sim2 = {
  x: 0, vx: 0, accel: 0,
  running: false,
  force: 10, mass: 5,
  blockW: 50, blockH: 50,
  groundY: 0, canvasW: 0, canvasH: 0,
  particles: [],
};

function initSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  const canvas = document.getElementById('canvas2');
  const dims   = resizeCanvas(canvas);
  sim2.canvasW = dims.w;
  sim2.canvasH = dims.h;
  sim2.groundY = dims.h * 0.70;
  sim2.x       = 80;
  sim2.vx      = 0;
  sim2.running = false;
  sim2.particles = [];
  updateSim2Values();
  drawSim2Frame();
}

function updateSim2Values() {
  sim2.force = parseFloat(document.getElementById('slider-force').value);
  sim2.mass  = parseFloat(document.getElementById('slider-mass').value);
  sim2.accel = sim2.force / sim2.mass;

  const base = 28 + sim2.mass * 1.5;
  sim2.blockW = Math.min(base, 90);
  sim2.blockH = Math.min(base, 90);

  // Labels
  document.getElementById('lbl-force').textContent = sim2.force;
  document.getElementById('lbl-mass').textContent  = sim2.mass;

  // RT overlay
  document.getElementById('rt2-force').textContent = sim2.force + ' N';
  document.getElementById('rt2-mass').textContent  = sim2.mass + ' kg';
  document.getElementById('rt2-accel').textContent = sim2.accel.toFixed(2) + ' m/s²';

  // Fórmula hero
  document.getElementById('fhv-f').textContent = sim2.force + ' N';
  document.getElementById('fhv-m').textContent = sim2.mass + ' kg';
  document.getElementById('fhv-a').textContent = sim2.accel.toFixed(2) + ' m/s²';

  // Barras proporcionales
  const maxF = 100, maxM = 50, maxA = maxF / 1;
  document.getElementById('vbar-f').style.width  = (sim2.force / maxF * 100) + '%';
  document.getElementById('vbar-m').style.width  = (sim2.mass  / maxM * 100) + '%';
  const aFill = Math.min(sim2.accel / (maxF/1) * 100, 100);
  document.getElementById('vbar-a').style.width  = aFill + '%';
  document.getElementById('vbarnum-f').textContent = sim2.force + ' N';
  document.getElementById('vbarnum-m').textContent = sim2.mass  + ' kg';
  document.getElementById('vbarnum-a').textContent = sim2.accel.toFixed(2) + ' m/s²';

  // Insight dinámico
  updateSim2Insight();

  if (!sim2.running) drawSim2Frame();
}

function updateSim2Insight() {
  const box  = document.getElementById('insight2');
  const text = document.getElementById('insight2-text');
  const a    = sim2.accel;
  box.className = 'insight-box amber-insight';
  if (a < 1) {
    text.innerHTML = `📉 Aceleración muy baja (${a.toFixed(2)} m/s²): masa grande, fuerza pequeña. Aumentá F o reducí m.`;
  } else if (a < 5) {
    text.innerHTML = `📊 Aceleración moderada (${a.toFixed(2)} m/s²). Con el doble de fuerza obtendrías <strong>${(a*2).toFixed(2)} m/s²</strong>.`;
  } else if (a < 15) {
    text.innerHTML = `🚀 Buena aceleración (${a.toFixed(2)} m/s²). Con el doble de masa, caería a <strong>${(a/2).toFixed(2)} m/s²</strong>.`;
  } else {
    text.innerHTML = `⚡ Aceleración alta (${a.toFixed(2)} m/s²): fuerza grande en masa pequeña. <em>F = m·a</em> en su máxima expresión.`;
  }
}

function drawSim2Frame() {
  const canvas = document.getElementById('canvas2');
  if (!canvas || sim2.canvasW === 0) return;
  const ctx = canvas.getContext('2d');
  const w = sim2.canvasW, h = sim2.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, sim2.groundY);

  // Marcadores de distancia en el suelo
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 12]);
  for (let mx = 100; mx < w; mx += 80) {
    ctx.beginPath(); ctx.moveTo(mx, sim2.groundY - 6); ctx.lineTo(mx, sim2.groundY); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Color del bloque interpolado según aceleración
  const intensity  = Math.min(sim2.accel / 12, 1);
  const blockColor = interpolateColor(C.blue, C.coral, intensity);

  drawBlock(ctx, sim2.x, sim2.groundY, sim2.blockW, sim2.blockH, blockColor, `${sim2.mass} kg`);

  // Flecha de fuerza
  if (sim2.running || sim2.vx > 0.1) {
    const arrowLen = 25 + sim2.force * 0.9;
    drawArrow(ctx, sim2.x + sim2.blockW/2, sim2.groundY - sim2.blockH*0.55, arrowLen, C.amber, `F = ${sim2.force} N`);
  }

  // Flecha de velocidad
  if (sim2.vx > 0.1) {
    drawArrow(ctx, sim2.x, sim2.groundY - sim2.blockH - 12, sim2.vx * 14, C.green, `v = ${sim2.vx.toFixed(1)} m/s`);
  }

  // Partículas de propulsión
  sim2.particles.forEach((p, idx) => {
    p.x -= p.vx;
    p.y += p.vy;
    p.alpha -= 0.025;
    p.r *= 0.96;
    if (p.alpha <= 0) { sim2.particles.splice(idx, 1); return; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(245,158,11,${p.alpha})`;
    ctx.fill();
  });

  // Barra de aceleración (esquina superior izquierda)
  drawAccelBar2(ctx, w);

  // Leyenda
  drawLegend(ctx, w, h, [
    { color: C.amber, label: `Fuerza (F = ${sim2.force} N)` },
    { color: C.green, label: `Velocidad (v = ${sim2.vx.toFixed(1)} m/s)` },
    { color: C.blue,  label: 'Bloque: a baja' },
    { color: C.coral, label: 'Bloque: a alta' },
  ]);
}

function drawAccelBar2(ctx, w) {
  const bx = 16, by = 16, bw = 140, bh = 8;
  const fill = Math.min(sim2.accel / 20, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();
  const color = fill < 0.5 ? C.green : fill < 0.8 ? C.amber : C.coral;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 6;
  ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.roundRect(bx, by, bw * fill, bh, 3); ctx.fill();
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  ctx.fillStyle = C.text2;
  ctx.font = '10px "Space Grotesk", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`a = ${sim2.accel.toFixed(2)} m/s²`, bx, by + 13);
}

function stepSim2() {
  const visualAccel = (sim2.accel / 5) * 0.1;
  sim2.vx = Math.min(sim2.vx + visualAccel, 14);
  sim2.x += sim2.vx;

  // Partículas de propulsión
  if (Math.random() < 0.4) {
    sim2.particles.push({
      x:     sim2.x - sim2.blockW/2,
      y:     sim2.groundY - sim2.blockH/2 + (Math.random()-0.5)*10,
      vx:    Math.random() * 2 + 0.5,
      vy:    (Math.random()-0.5) * 0.5,
      r:     Math.random() * 4 + 1,
      alpha: Math.random() * 0.6 + 0.3,
    });
  }
}

function loopSim2() {
  stepSim2();
  drawSim2Frame();
  document.getElementById('rt2-vel').textContent = sim2.vx.toFixed(2) + ' m/s';

  if (sim2.x < sim2.canvasW - sim2.blockW / 2 + 20) {
    animFrames.sim2 = requestAnimationFrame(loopSim2);
  } else {
    sim2.running = false;
    drawSim2EndScreen();
  }
}

function drawSim2EndScreen() {
  const canvas = document.getElementById('canvas2');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = sim2.canvasW, h = sim2.canvasH;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, sim2.groundY);

  // Resultado central
  const cx = w/2, cy = h/2 - 30;
  ctx.fillStyle = 'rgba(5,8,16,0.85)';
  ctx.beginPath(); ctx.roundRect(cx - 180, cy - 45, 360, 90, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(245,158,11,0.2)';
  ctx.lineWidth = 1; ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = C.green;
  ctx.font = 'bold 16px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText(`F = ${sim2.force} N  ÷  m = ${sim2.mass} kg  =  a = ${sim2.accel.toFixed(2)} m/s²`, cx, cy - 8);
  ctx.fillStyle = C.text2;
  ctx.font = '12px "Space Grotesk", system-ui, sans-serif';
  ctx.fillText('¡La Segunda Ley de Newton verificada! Cambiá los parámetros y repetí.', cx, cy + 18);

  drawLegend(ctx, w, h, [
    { color: C.amber, label: `Fuerza (F = ${sim2.force} N)` },
    { color: C.green, label: 'Velocidad (v)' },
  ]);
}

function runSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  updateSim2Values();
  sim2.x       = 80;
  sim2.vx      = 0;
  sim2.running = true;
  sim2.particles = [];
  animFrames.sim2 = requestAnimationFrame(loopSim2);
}

function resetSim2() {
  if (animFrames.sim2) cancelAnimationFrame(animFrames.sim2);
  animFrames.sim2 = null;
  initSim2();
}

/* =====================================================
   MODO DEMO SIM 2
   ===================================================== */
function toggleDemo2() {
  const btn = document.getElementById('demo2-btn');
  if (demoActive.sim2) {
    demoActive.sim2 = false;
    btn.classList.remove('active');
    clearTimeout(demoIntervals.sim2);
    return;
  }
  demoActive.sim2 = true;
  btn.classList.add('active');
  runDemo2Sequence();
}

function runDemo2Sequence() {
  if (!demoActive.sim2) return;
  const cases = [
    { f: 10, m: 5,  label: 'Caso base' },
    { f: 20, m: 5,  label: 'F doble, misma masa → a doble' },
    { f: 10, m: 10, label: 'F igual, masa doble → a mitad' },
    { f: 50, m: 5,  label: 'Mucha fuerza, poca masa' },
    { f: 10, m: 50, label: 'Poca fuerza, mucha masa' },
  ];
  let i = 0;
  const runNext = () => {
    if (!demoActive.sim2) return;
    resetSim2();
    const c = cases[i % cases.length];
    document.getElementById('slider-force').value = c.f;
    document.getElementById('slider-mass').value  = c.m;
    updateSim2Values();
    setTimeout(() => { if (demoActive.sim2) runSim2(); }, 600);
    i++;
    demoIntervals.sim2 = setTimeout(runNext, 4500);
  };
  runNext();
}

/* =====================================================
   SIMULACIÓN 3 — TERCERA LEY (ACCIÓN Y REACCIÓN)
   ===================================================== */

const sim3 = {
  A: { x: 0, vx: 0, w: 60, h: 42, mass: 5 },
  B: { x: 0, vx: 0, w: 60, h: 42, mass: 5 },
  velColision: 3,
  groundY: 0, canvasW: 0, canvasH: 0,
  state: 'idle',
  forceAnim: 0,
  collisionForce: 0,
  impactParticles: [],
  collisionType: 'elastic',
};

function blockDimsFromMass3(mass) {
  const base = 30 + mass * 2.2;
  return { w: Math.min(base, 95), h: Math.min(base * 0.65, 65) };
}

function setCollisionType(type) {
  sim3.collisionType = type;
  document.getElementById('ctype-elastic').classList.toggle('active', type === 'elastic');
  document.getElementById('ctype-inelastic').classList.toggle('active', type === 'inelastic');
}

function initSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);
  const canvas = document.getElementById('canvas3');
  const dims   = resizeCanvas(canvas);
  sim3.canvasW = dims.w;
  sim3.canvasH = dims.h;
  sim3.groundY = dims.h * 0.70;

  sim3.A.mass = parseInt(document.getElementById('slider-s3-massA').value);
  sim3.B.mass = parseInt(document.getElementById('slider-s3-massB').value);
  sim3.velColision = parseInt(document.getElementById('slider-s3-vel').value);

  const dA = blockDimsFromMass3(sim3.A.mass);
  const dB = blockDimsFromMass3(sim3.B.mass);
  sim3.A.w = dA.w; sim3.A.h = dA.h;
  sim3.B.w = dB.w; sim3.B.h = dB.h;

  const center = dims.w / 2;
  sim3.A.x = center - 100; sim3.A.vx = 0;
  sim3.B.x = center + 100; sim3.B.vx = 0;
  sim3.state = 'idle';
  sim3.forceAnim = 0;
  sim3.impactParticles = [];

  // Limpiar UI
  ['ar-fa','ar-fb'].forEach(id => document.getElementById(id).textContent = '— N');
  ['ar-ta','ar-tb'].forEach(id => document.getElementById(id).textContent = '—');
  document.getElementById('ar-massa').textContent = sim3.A.mass + ' kg';
  document.getElementById('ar-massb').textContent = sim3.B.mass + ' kg';
  document.getElementById('rt3-fab').textContent = '— N';
  document.getElementById('rt3-fba').textContent = '— N';
  document.getElementById('rt3-va').textContent  = '0.0 m/s';
  document.getElementById('rt3-vb').textContent  = '0.0 m/s';
  updateAccelCompare(null, null);

  document.getElementById('msg3').className = 'msg-box';
  document.getElementById('msg3-text').innerHTML = 'Ajustá las masas y la velocidad, luego presioná <strong>Generar Colisión</strong>. Observá que las fuerzas son <strong>iguales y opuestas</strong> sin importar las masas.';

  drawSim3Frame();
}

function updateSim3Params() {
  const mA = parseInt(document.getElementById('slider-s3-massA').value);
  const mB = parseInt(document.getElementById('slider-s3-massB').value);
  const v  = parseInt(document.getElementById('slider-s3-vel').value);
  document.getElementById('lbl-s3-massA').textContent = mA;
  document.getElementById('lbl-s3-massB').textContent = mB;
  document.getElementById('lbl-s3-vel').textContent   = v;
  document.getElementById('ar-massa').textContent = mA + ' kg';
  document.getElementById('ar-massb').textContent = mB + ' kg';

  if (sim3.state === 'idle' || sim3.state === 'done') {
    resetSim3();
  }
}

function drawSim3Frame() {
  const canvas = document.getElementById('canvas3');
  if (!canvas || sim3.canvasW === 0) return;
  const ctx = canvas.getContext('2d');
  const w = sim3.canvasW, h = sim3.canvasH;
  const A = sim3.A, B = sim3.B;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  drawGrid(ctx, w, h);
  drawGround(ctx, w, sim3.groundY);

  // Partículas de impacto
  sim3.impactParticles.forEach((p, idx) => {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.1;
    p.alpha -= 0.03;
    p.r  *= 0.97;
    if (p.alpha <= 0) { sim3.impactParticles.splice(idx, 1); return; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `${p.color}${Math.round(p.alpha*255).toString(16).padStart(2,'0')}`;
    ctx.fill();
  });

  // Bloques
  drawBlock(ctx, A.x, sim3.groundY, A.w, A.h, C.blue,  `A: ${A.mass} kg`);
  drawBlock(ctx, B.x, sim3.groundY, B.w, B.h, C.coral, `B: ${B.mass} kg`);

  // Flechas de velocidad pre-colisión
  if (sim3.state === 'colliding') {
    if (Math.abs(A.vx) > 0.1) drawArrow(ctx, A.x + A.w/2, sim3.groundY - A.h/2, A.vx * 12, C.teal, `v = ${Math.abs(A.vx).toFixed(1)}`);
    if (Math.abs(B.vx) > 0.1) drawArrow(ctx, B.x - B.w/2, sim3.groundY - B.h/2, B.vx * 12, C.teal, `v = ${Math.abs(B.vx).toFixed(1)}`);
  }

  // Flechas de fuerza durante colisión
  if (sim3.state === 'colliding' || sim3.state === 'separating') {
    const mag    = 60 * sim3.forceAnim;
    const fuerza = (sim3.collisionForce * sim3.forceAnim).toFixed(0);
    const midX   = (A.x + B.x) / 2;

    // Fuerza sobre A (reacción, hacia izquierda)
    drawArrow(ctx, A.x - A.w/2, sim3.groundY - A.h*0.6, -mag, C.purple, '');
    drawForceBadge(ctx, A.x - A.w/2 - mag/2, sim3.groundY - A.h - 18, 'REACCIÓN', C.purple);

    // Fuerza sobre B (acción, hacia derecha)
    drawArrow(ctx, B.x + B.w/2, sim3.groundY - B.h*0.6, mag, C.amber, '');
    drawForceBadge(ctx, B.x + B.w/2 + mag/2, sim3.groundY - B.h - 18, 'ACCIÓN', C.amber);

    // Magnitud en el punto de impacto
    ctx.fillStyle = C.green;
    ctx.shadowColor = C.green; ctx.shadowBlur = 8;
    ctx.font = `bold 14px "Space Grotesk", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`|F| = ${fuerza} N`, midX, sim3.groundY - Math.max(A.h, B.h) - 38);
    ctx.shadowBlur = 0;
  }

  // Flechas de velocidad post-colisión
  if (sim3.state === 'separating' || sim3.state === 'done') {
    if (Math.abs(A.vx) > 0.1) drawArrow(ctx, A.x - A.w/2, sim3.groundY - A.h*0.5, A.vx * 12, C.purple, `vA=${A.vx.toFixed(1)}`);
    if (Math.abs(B.vx) > 0.1) drawArrow(ctx, B.x + B.w/2, sim3.groundY - B.h*0.5, B.vx * 12, C.amber,  `vB=${B.vx.toFixed(1)}`);
  }

  // Leyenda
  drawLegend(ctx, w, h, [
    { color: C.blue,   label: `Bloque A (${A.mass} kg)` },
    { color: C.coral,  label: `Bloque B (${B.mass} kg)` },
    { color: C.amber,  label: 'Fuerza: Acción' },
    { color: C.purple, label: 'Fuerza: Reacción' },
    { color: C.green,  label: `|F| impacto (${sim3.state !== 'idle' ? sim3.collisionForce + ' N' : '—'})` },
  ]);
}

function loopSim3() {
  const A = sim3.A, B = sim3.B;

  if (sim3.state === 'colliding') {
    A.x += A.vx;
    B.x += B.vx;
    sim3.forceAnim = Math.min(1, sim3.forceAnim + 0.035);

    // Detectar contacto
    if (B.x - B.w/2 <= A.x + A.w/2 + 1) {
      const m1 = A.mass, m2 = B.mass;
      const v1 = A.vx,   v2 = B.vx;
      const sum = m1 + m2;

      let v1f, v2f;
      if (sim3.collisionType === 'elastic') {
        // Colisión elástica — conserva energía cinética y momento
        v1f = ((m1 - m2)*v1 + 2*m2*v2) / sum;
        v2f = ((m2 - m1)*v2 + 2*m1*v1) / sum;
      } else {
        // Colisión perfectamente inelástica
        const vf = (m1*v1 + m2*v2) / sum;
        v1f = vf; v2f = vf;
      }

      sim3.collisionForce = Math.round(Math.abs(m1 * (v1f - v1)) * 3 + 12);

      A.vx = v1f;
      B.vx = v2f;
      sim3.state = 'separating';

      // Partículas de impacto
      const midX = (A.x + B.x) / 2;
      for (let i = 0; i < 20; i++) {
        const angle = (Math.random() * Math.PI * 2);
        sim3.impactParticles.push({
          x: midX, y: sim3.groundY - Math.min(A.h, B.h)/2,
          vx: Math.cos(angle) * (Math.random()*3+1),
          vy: Math.sin(angle) * (Math.random()*3+1) - 2,
          r: Math.random()*4 + 1.5,
          alpha: 0.9,
          color: Math.random() > 0.5 ? C.amber : C.purple,
        });
      }

      // Actualizar UI
      const fStr = sim3.collisionForce + ' N';
      document.getElementById('ar-fa').textContent = fStr;
      document.getElementById('ar-fb').textContent = fStr;
      document.getElementById('ar-ta').textContent = 'Reacción';
      document.getElementById('ar-tb').textContent = 'Acción';
      document.getElementById('rt3-fab').textContent = fStr;
      document.getElementById('rt3-fba').textContent = fStr;

      // Aceleraciones resultantes
      const aA = (sim3.collisionForce / A.mass).toFixed(1);
      const aB = (sim3.collisionForce / B.mass).toFixed(1);
      updateAccelCompare(sim3.collisionForce / A.mass, sim3.collisionForce / B.mass);

      updateSim3Message();
    }
  } else if (sim3.state === 'separating') {
    A.x += A.vx * 0.98;
    B.x += B.vx * 0.98;
    sim3.forceAnim = Math.max(0, sim3.forceAnim - 0.022);

    document.getElementById('rt3-va').textContent = A.vx.toFixed(1) + ' m/s';
    document.getElementById('rt3-vb').textContent = B.vx.toFixed(1) + ' m/s';

    const dist = B.x - A.x;
    const outOfBounds = (A.x + A.w/2 < -10 && B.x - B.w/2 > sim3.canvasW + 10);
    if (dist > sim3.canvasW * 0.78 || outOfBounds) {
      if (sim3.collisionType === 'inelastic') { A.vx = 0; B.vx = 0; }
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

function updateAccelCompare(aA, aB) {
  const max = Math.max(aA || 0, aB || 0, 0.1);
  const wA = aA ? (aA / max * 100) : 0;
  const wB = aB ? (aB / max * 100) : 0;
  document.getElementById('acbar-a').style.width = wA + '%';
  document.getElementById('acbar-b').style.width = wB + '%';
  document.getElementById('acval-a').textContent = aA ? aA.toFixed(1) + ' m/s²' : '—';
  document.getElementById('acval-b').textContent = aB ? aB.toFixed(1) + ' m/s²' : '—';
}

function updateSim3Message() {
  const box  = document.getElementById('msg3');
  const text = document.getElementById('msg3-text');
  const mA   = sim3.A.mass, mB = sim3.B.mass;
  const aA   = (sim3.collisionForce / mA).toFixed(1);
  const aB   = (sim3.collisionForce / mB).toFixed(1);
  box.className = 'msg-box success';
  const tipo = sim3.collisionType === 'elastic' ? 'elástica' : 'inelástica';
  text.innerHTML = `✅ <strong>Colisión ${tipo}.</strong> |F| = <strong>${sim3.collisionForce} N</strong> en ambos bloques. Aceleración A = ${aA} m/s², B = ${aB} m/s² — diferente porque las masas difieren. Las fuerzas: <strong>iguales en magnitud, opuestas en sentido</strong>.`;
}

function triggerCollision() {
  if (sim3.state !== 'idle') { resetSim3(); return; }
  const velVis = sim3.velColision * 0.60;
  sim3.A.vx = +velVis;
  sim3.B.vx = -velVis;
  sim3.state = 'colliding';
  sim3.forceAnim = 0;
  animFrames.sim3 = requestAnimationFrame(loopSim3);
}

function resetSim3() {
  if (animFrames.sim3) cancelAnimationFrame(animFrames.sim3);
  animFrames.sim3 = null;
  initSim3();
}

/* =====================================================
   MODO DEMO SIM 3
   ===================================================== */
function toggleDemo3() {
  const btn = document.getElementById('demo3-btn');
  if (demoActive.sim3) {
    demoActive.sim3 = false;
    btn.classList.remove('active');
    clearTimeout(demoIntervals.sim3);
    return;
  }
  demoActive.sim3 = true;
  btn.classList.add('active');
  runDemo3Sequence();
}

function runDemo3Sequence() {
  if (!demoActive.sim3) return;
  const cases = [
    { mA: 5,  mB: 5,  v: 4, type: 'elastic'   },
    { mA: 10, mB: 2,  v: 4, type: 'elastic'   },
    { mA: 2,  mB: 10, v: 4, type: 'elastic'   },
    { mA: 8,  mB: 8,  v: 5, type: 'inelastic' },
  ];
  let i = 0;
  const runNext = () => {
    if (!demoActive.sim3) return;
    resetSim3();
    const c = cases[i % cases.length];
    document.getElementById('slider-s3-massA').value = c.mA;
    document.getElementById('slider-s3-massB').value = c.mB;
    document.getElementById('slider-s3-vel').value   = c.v;
    setCollisionType(c.type);
    updateSim3Params();
    setTimeout(() => { if (demoActive.sim3) triggerCollision(); }, 700);
    i++;
    demoIntervals.sim3 = setTimeout(runNext, 5000);
  };
  runNext();
}

/* =====================================================
   INICIO — DOMContentLoaded
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // Inicializar canvas de fondo
  initBgCanvas();

  // Inicializar labels de los sliders de sim3
  document.getElementById('lbl-s3-massA').textContent = document.getElementById('slider-s3-massA').value;
  document.getElementById('lbl-s3-massB').textContent = document.getElementById('slider-s3-massB').value;
  document.getElementById('lbl-s3-vel').textContent   = document.getElementById('slider-s3-vel').value;

  // Inicializar labels sim1
  updateSim1Params();

  // Mostrar home
  showHome();

  // Resize handler
  window.addEventListener('resize', () => {
    resizeBgCanvas();
    const active = document.querySelector('.screen.active');
    if (!active) return;
    if (active.id === 'screen-sim1') initSim1();
    if (active.id === 'screen-sim2') initSim2();
    if (active.id === 'screen-sim3') initSim3();
  });

});