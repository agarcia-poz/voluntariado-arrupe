/* Voluntariado Arrupe · Servicio de Pastoral CUSAFA
   App web (GitHub Pages) que habla con el Apps Script. Todo lo que se ve se pide a la API
   con el token de Google de quien entra; la API decide qué puede ver cada perfil. */
(() => {
'use strict';
const CFG = window.ARRUPE_CONFIG || {};
const LOGO = 'logo.png';
const EVAL_2526 = [['Recomendaría el voluntariado', 100], ['Su experiencia ha sido positiva', 97], ['Ha crecido personalmente', 94], ['Ha participado en actividades pastorales', 74], ['Ha recibido formación útil', 70]];

/* ───────── iconos ───────── */
const I = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M9 15l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22M17.5 15H9"/>',
  news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8Z"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  life: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
};
const ic = (n, s = 20) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => /^https:\/\//i.test(String(u || '')) ? esc(u) : '';
const $ = id => document.getElementById(id);
const COLORS = ['orange', 'magenta', 'purple', 'brown', 'blue', 'red', 'grey', 'green', 'teal'];
const cvar = c => `var(--e-${COLORS.includes(c) ? c : 'blue'})`;
const IG = 'https://www.instagram.com/unisafa/';
const VERSION_API = '2026-10-26b'; // debe coincidir con la de Code.gs

/* ───────── estado ───────── */
let TOKEN = null, D = null;
const S = { com: { destino: 'todos', ents: [], asunto: '', texto: '', saludo: true, boton: true, imgs: [], files: [] }, comConfirm: false, certOpen: false, inc: { tipo: 'error', asunto: '', desc: '', file: null }, incOpen: null, insSel: {}, insEnts: {}, thanksConfirm: false, welcome: null, wMsg: '', wWa: undefined, editInfo: false, gal: {}, cf: {}, resign: false, tf: null, delT: null, delM: null, upMsg: '', fent: null, view: null, ent: null, leaving: null, cent: null, assigning: null, insFilter: 'nueva', q: '', editP: null, editE: null, editN: null, delN: null, delSes: null, rejecting: null, att: null, err: '' };
try { TOKEN = sessionStorage.getItem('arrupe-token'); } catch (e) { }
let CODE = null;
try {
  const u = new URL(location.href), c = u.searchParams.get('codigo');
  if (c) { sessionStorage.setItem('arrupe-code', c); u.searchParams.delete('codigo'); history.replaceState(null, '', u.pathname + u.search + u.hash); }
  CODE = sessionStorage.getItem('arrupe-code');
} catch (e) { }
let REFL_START = null;
try { const u = new URL(location.href), r = u.searchParams.get('reflexion'); if (r) { REFL_START = r; u.searchParams.delete('reflexion'); history.replaceState(null, '', u.pathname + u.search + '#reflexion'); } } catch (e) { }
let DEMO_START = null;
try { const q = new URL(location.href).searchParams.get('demo'); if (q === 'coord' || q === 'vol' || q === 'pastoral') DEMO_START = q; } catch (e) { }
function clearCode() { CODE = null; try { sessionStorage.removeItem('arrupe-code'); } catch (e) { } }

/* ───────── utilidades ───────── */
const E = id => (D && D.entidades.find(e => e.id === id)) || { id, nombre: id, color: 'grey', horario: '', lugar: '' };
const chip = id => { const e = E(id); return `<span class="chip" style="--c:${cvar(e.color)}">${esc(e.nombre)}</span>`; };
const DOC = { ok: ['ok', 'Validado'], rev: ['info', 'Entregado · por revisar'], pend: ['warn', 'Pendiente'], rech: ['bad', 'Hay que repetirlo'] };
const pill = k => { const d = DOC[k] || DOC.pend; return `<span class="pill ${d[0]}">${d[1]}</span>`; };
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const fmt = d => d ? new Date(d + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
const fmtLong = d => d ? new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const sum = (a, f) => a.reduce((s, x) => s + (f ? f(x) : x), 0);
const nf = n => (Math.round(n * 10) / 10).toLocaleString('es-ES');
function toast(t) { const el = $('toast'); el.hidden = true; void el.offsetWidth; el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3600); }
const REDUCED = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
// Celebración: un estallido de hilos con los colores del logo
function celebrate(x, y) {
  if (REDUCED() || !document.body.animate) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const cx = x ?? innerWidth / 2, cy = y ?? innerHeight * .42;
  for (let i = 0; i < 46; i++) {
    const p = document.createElement('i'); p.style.left = cx + 'px'; p.style.top = cy + 'px'; p.style.background = WEAVE_COLORS[i % 8];
    box.appendChild(p);
    const ang = Math.random() * Math.PI * 2, v = 140 + Math.random() * 260, dx = Math.cos(ang) * v, dy = Math.sin(ang) * v - 120, rot = Math.random() * 720 - 360;
    p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 1, offset: .6 }, { transform: `translate(${dx * 1.15}px,${dy + 260}px) rotate(${rot * 1.4}deg)`, opacity: 0 }], { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2000);
}
// Contadores que suben al entrar
function countUp(root) {
  if (REDUCED()) return;
  root.querySelectorAll('.kpi b').forEach(el => {
    const m = el.textContent.match(/^(\d+(?:[.,]\d+)?)(.*)$/); if (!m) return;
    const end = parseFloat(m[1].replace(',', '.')), dec = /[.,]/.test(m[1]), rest = m[2]; if (!end) return;
    const t0 = performance.now(), dur = 900;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), v = end * e; el.textContent = (dec ? v.toFixed(1).replace('.', ',') : Math.round(v)) + rest; if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0' + rest; requestAnimationFrame(step);
  });
}
function stagger(root) {
  let i = 0;
  root.querySelectorAll('.wrap > *, .wrap > .grid > *, .wrap > .kpis > *, .wrap .g3 > *').forEach(el => { el.classList.add('stg'); el.style.setProperty('--i', Math.min(i++, 14)); });
}
function jwtExp(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; } catch (e) { return 0; } }

/* ───────── MODO DEMOSTRACIÓN (datos ficticios, no se guarda nada) ───────── */
let DEMO = null;
const dIso = n => { const d = new Date(); d.setDate(d.getDate() + n); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const DEMO_ENTS = [
  ['res', 'Residencia de Ancianos', 'Plaza del Marqués, Úbeda', 'Mayores', 'orange', 'Acompañar a personas mayores: conversación, juegos de mesa, lectura y paseos. Lo que más se agradece es la constancia y el tiempo sin prisa.', 'Lunes a viernes, 17:00–18:00 o 18:00–19:00. Cada voluntario elige su día.', 8, 'https://www.instagram.com/reel/DR4YgsLjO-k/', ['Pablo R.', 'Yolanda T.'], 5],
  ['cruz', 'Cruz Roja Úbeda', 'Asamblea local de Úbeda', 'Acción social', 'red', 'Colaboración en los programas de la asamblea local: atención a familias, recogidas y campañas puntuales.', 'Según el programa y la campaña.', 6, '', ['Yolanda T.'], 1],
  ['hogar', 'Escuela Hogar SAFA', 'SAFA Úbeda', 'Infancia', 'magenta', 'Apoyo a niñas y niños residentes en las tareas escolares y en el tiempo libre. Un lugar donde se aprende mucho de lo que significa educar.', 'Lunes a jueves, 16:00–17:00, 18:00–19:00 o 19:00–20:00.', 14, 'https://www.instagram.com/reel/DR32RdJjP5_/', ['Clara O.', 'Miguel Á.'], 6],
  ['down', 'Asociación Síndrome de Down', 'Úbeda', 'Diversidad', 'purple', 'Actividades de ocio, habilidades sociales y autonomía con jóvenes y adultos con síndrome de Down.', 'Varias tardes por semana, en sesiones de 2–3 horas.', 10, 'https://www.instagram.com/reel/DR4K1s_DA8h/', ['Ana S.', 'Paula S.'], 7],
  ['alz', 'Asociación Alzheimer', 'Úbeda', 'Mayores', 'brown', 'Acompañamiento y estimulación de personas con alzhéimer, junto a sus familias y al equipo técnico.', 'Lunes, 1 hora.', 4, 'https://www.instagram.com/reel/DR4EANoDHAM/', ['M.ª Teresa A.'], 2],
  ['ute', 'Centro Penitenciario de Jaén (UTE)', 'Jaén', 'Prisión', 'grey', 'Encuentros y talleres en la Unidad Terapéutica y Educativa. Una experiencia exigente que cambia la mirada sobre las segundas oportunidades.', 'Calendario de sesiones fijado con el centro.', 16, 'https://www.instagram.com/reel/DR4np6Wl5de/', ['Marina H.', 'Antonio P.'], 11],
  ['apoyo', 'Apoyo Escolar SAFA Úbeda', 'EE.PP. SAFA Úbeda', 'Infancia', 'blue', 'Refuerzo escolar a alumnado de Primaria. Tu primera aula real, acompañando a quien más lo necesita.', 'L 16–18 h · M 16–17 h · X 16–17 h · J 16–18 h.', 14, 'https://www.instagram.com/reel/DR4fdeyjAAf/', ['M.ª Jesús P.', 'M.ª Victoria C.'], 9],
  ['ilu', 'Proyecto Ilusión Baeza', 'Baeza', 'Infancia', 'green', 'Tardes de ocio educativo con menores. Juego, convivencia y mucha energía.', '1–2 sábados al mes, 17:00–21:00.', 12, 'https://www.instagram.com/reel/DR4RtaHjM3N/', ['Gustavo P.', 'María R.'], 8],
  ['apro', 'APROMPSI Úbeda', 'Úbeda', 'Diversidad', 'teal', 'Actividades con personas con discapacidad intelectual: fútbol, zumba, teatro y baile.', 'Jueves: fútbol 16–18 h · zumba 17–18 h · teatro y baile 18–20 h.', 8, 'https://www.instagram.com/reel/DR39H0eDBh8/', ['Lorena P.', 'Ramón S.'], 5]
].map(e => ({ id: e[0], nombre: e[1], lugar: e[2], etiqueta: e[3], color: e[4], descripcion: e[5], horario: e[6], cupo: e[7], ig: e[8], activa: true, coordinadores: e[9], ocupadas: e[10], whatsapp: '', editadoPor: e[0] === 'hogar' ? 'Miguel Á.' : '', editado: e[0] === 'hogar' ? dIso(-3) : '' }));
const DOW = iso => ((new Date(iso + 'T12:00:00Z').getUTCDay() + 6) % 7) + 1;
function demoOcc(t, dias) { const out = []; for (let i = 0; i <= dias; i++) { const f = dIso(i); if (t.tipo === 'fecha' ? t.fecha === f : DOW(f) === t.dia) out.push(f); } return out; }
function demoTurnos() {
  const d1 = DOW(dIso(1));
  return [
    { id: 't1', entidad: 'hogar', tipo: 'semanal', dia: d1, fecha: '', inicio: '17:00', fin: '18:00', lugar: 'Escuela Hogar · sala de estudio', nota: 'Apoyo con los deberes' },
    { id: 't2', entidad: 'hogar', tipo: 'semanal', dia: (d1 + 1) % 7 + 1, fecha: '', inicio: '18:00', fin: '19:00', lugar: 'Escuela Hogar · patio', nota: '' },
    { id: 't3', entidad: 'hogar', tipo: 'fecha', dia: 0, fecha: dIso(9), inicio: '16:30', fin: '19:30', lugar: 'SAFA Úbeda · gimnasio', nota: 'Fiesta de otoño con las familias' },
    { id: 't4', entidad: 'apoyo', tipo: 'semanal', dia: (d1 + 2) % 7 + 1, fecha: '', inicio: '16:00', fin: '18:00', lugar: 'EE.PP. SAFA Úbeda · aula 3', nota: '' }
  ];
}
function demoProximos(role) {
  const T = demoTurnos(), out = [];
  const ent = role === 'coord' ? ['hogar'] : ['hogar', 'apoyo'];
  T.filter(t => ent.includes(t.entidad)).forEach(t => { if (role === 'vol' && t.id === 't2') return; demoOcc(t, 14).forEach((f, i) => out.push({ turno: t.id, entidad: t.entidad, fecha: f, inicio: t.inicio, fin: t.fin, lugar: t.lugar, nota: t.nota, respuesta: i === 0 && t.id === 't1' ? 'sí' : '' })); });
  return out.sort((a, b) => (a.fecha + a.inicio) < (b.fecha + b.inicio) ? -1 : 1);
}
function demoPastoral(base) {
  const P = (email, nombre, curso, rol, ents, cert, comp, horas, extra) => Object.assign({ email, nombre, curso, rol, estado: 'activo', coordEnts: [], alta: dIso(-30), asignaciones: ents.map(e => ({ entidad: e, estado: 'activa' })),
    docs: { cert: { estado: cert, url: cert === 'pend' ? '' : '#', fecha: dIso(-10) }, comp: { estado: comp, url: '', fecha: dIso(-8) } }, horas, telefono: '6' + String(Math.abs(nombre.length * 7919)).padStart(8, '1').slice(0, 8), emailContacto: '', emergencia: '',
    compromiso: comp === 'ok' ? { dni: '••••••••X', fecha: dIso(-8), hasta: '2027-06-30', actividades: '' } : null }, extra || {});
  const personas = [
    P('pastoral@demo', 'Equipo de Pastoral', '', 'pastoral', [], 'pend', 'pend', 0, { docs: { cert: { estado: 'pend', url: '' }, comp: { estado: 'pend', url: '' } } }),
    P('clara.ortega@cusafa.es', 'Clara Ortega Vílchez', '4.º Ed. Infantil', 'coord', ['hogar'], 'ok', 'ok', 14, { coordEnts: ['hogar'] }),
    P('pablo.ruiz@cusafa.es', 'Pablo Ruiz Fernández', '4.º Ed. Primaria', 'coord', ['res', 'alz'], 'ok', 'ok', 22, { coordEnts: ['res'] }),
    P('lucia.martos@cusafa.es', 'Lucía Martos Ortega', '2.º Ed. Infantil', 'vol', ['hogar', 'apoyo'], 'ok', 'pend', 13),
    P('javier.cuesta@cusafa.es', 'Javier Cuesta Ruiz', '1.º Ed. Primaria', 'vol', ['hogar'], 'rev', 'ok', 4),
    P('carmen.vilches@cusafa.es', 'Carmen Vilches Ramos', '3.º Ed. Primaria', 'vol', ['hogar', 'ute'], 'ok', 'ok', 16),
    P('ines.rubio@cusafa.es', 'Inés Rubio Cózar', '2.º Ed. Primaria', 'vol', ['apoyo'], 'ok', 'ok', 8),
    P('sergio.ballesteros@cusafa.es', 'Sergio Ballesteros León', '4.º Ed. Primaria', 'vol', ['ilu'], 'rev', 'ok', 10),
    P('daniel.moya@cusafa.es', 'Daniel Moya Peña', '3.º Ed. Infantil', 'vol', ['apro'], 'ok', 'ok', 12, { asignaciones: [{ entidad: 'apro', estado: 'activa' }, { entidad: 'down', estado: 'solicitada' }] }),
    P('paula.rentero@gmail.com', 'Paula Rentero Gil', '1.º Ed. Primaria', 'vol', [], 'pend', 'pend', 0, { estado: 'pendiente' })
  ];
  const ins = (id, nombre, curso, dias, prefs, motivo, estado, entidad) => ({ id, fecha: dIso(-dias), nombre, email: nombre.split(' ')[0].toLowerCase() + '@cusafa.es', curso, preferencias: prefs, preferenciasTexto: '', motivo, estado, entidad: entidad || '' });
  return Object.assign(base, {
    me: { email: 'pastoral@demo', nombre: 'Equipo de Pastoral', rol: 'pastoral', estado: 'activo', curso: '', coordEnts: [], foto: '', telefono: '', emailContacto: '', emergenciaNombre: '', emergenciaTelefono: '', avisos: true },
    mio: { asignaciones: [], docs: { cert: { estado: 'pend' }, comp: { estado: 'pend' } }, horas: [], reflexiones: [], compromiso: null, turnos: [], proximos: [], misSubidas: 0 },
    pastoral: {
      personas,
      inscripciones: [
        ins('i1', 'Nerea Castro Vela', '1.º Ed. Infantil', 1, ['hogar', 'apoyo'], 'Quiero estar con niños fuera del aula antes de las prácticas.', 'nueva'),
        ins('i2', 'Hugo Prieto Lanza', '2.º Ed. Primaria', 2, ['apro'], 'Juego al fútbol y me gustaría compartirlo.', 'nueva'),
        ins('i3', 'Sofía Martín Arjona', '3.º Ed. Primaria', 3, ['ute', 'down'], 'Me lo recomendó una compañera que estuvo el curso pasado.', 'nueva'),
        ins('i4', 'Irene Sola Medina', '1.º Ed. Primaria', 5, ['res'], 'Mi abuela vive en una residencia y sé lo que significa una visita.', 'en_espera'),
        ins('i5', 'Álvaro Pastor Ruiz', '4.º Ed. Infantil', 9, ['ute'], 'Quiero conocer otras realidades.', 'asignada', 'ute')
      ],
      invitaciones: [
        { codigo: 'KGS-DVK', email: 'clara.ortega@cusafa.es', nombre: 'Clara Ortega', entidades: ['hogar'], estado: 'usada', creado: dIso(-1), usadoPor: 'clara.ortega@cusafa.es', usadoEn: dIso(0) },
        { codigo: '95V-K53', email: 'pablo.ruiz@cusafa.es', nombre: 'Pablo Ruiz', entidades: ['res'], estado: 'usada', creado: dIso(-1), usadoPor: 'pablo.personal@gmail.com', usadoEn: dIso(0) },
        { codigo: 'P9A-H45', email: 'ana.sanchez@cusafa.es', nombre: 'Ana Sánchez', entidades: ['down'], estado: 'enviada', creado: dIso(-1), usadoPor: '', usadoEn: '' }
      ],
      notificaciones: [
        { id: 'a1', fecha: new Date(Date.now() - 12 * 60000).toISOString(), tipo: 'inscripcion', titulo: 'Nueva inscripción: Nerea Castro Vela', detalle: '1.º Ed. Infantil · Prefiere: Escuela Hogar, Apoyo escolar', vista: 'ins', leida: false },
        { id: 'a2', fecha: new Date(Date.now() - 95 * 60000).toISOString(), tipo: 'documento', titulo: 'Documento por revisar: Javier Cuesta Ruiz', detalle: 'Certificado de delitos de naturaleza sexual', vista: 'personas', leida: false },
        { id: 'a3', fecha: new Date(Date.now() - 5 * 3600000).toISOString(), tipo: 'solicitud', titulo: 'Daniel Moya Peña quiere servir en Asociación Síndrome de Down', detalle: 'Solicitud desde la app', vista: 'panel', leida: false },
        { id: 'a4', fecha: new Date(Date.now() - 26 * 3600000).toISOString(), tipo: 'cuenta', titulo: 'Cuenta pendiente de aprobar: Paula Rentero Gil', detalle: 'paula.rentero@gmail.com', vista: 'panel', leida: false },
        { id: 'a5', fecha: new Date(Date.now() - 50 * 3600000).toISOString(), tipo: 'baja', titulo: 'Irene Sola ha dejado Residencia de Ancianos', detalle: 'Baja desde la app', vista: 'personas', leida: true }
      ],
      reflexion: { total: 38, semana: 9, semanas: [2, 4, 5, 7, 11, 9], personas: 21, voluntarios: 34, personas28: 18, asistencias28: 64, trasSesion28: 29, porEntidad: [{ id: 'hogar', n: 12 }, { id: 'ute', n: 9 }, { id: 'apoyo', n: 8 }, { id: 'down', n: 5 }, { id: 'apro', n: 4 }] },
      comunicados: [{ id: 'c1', fecha: new Date(Date.now() - 2 * 864e5).toISOString(), destino: 'coord', entidades: [], asunto: 'Primeros pasos en la app', destinatarios: 17, adjuntos: 'instrucciones-coordinacion.png' }],
      sesiones: [], hojaUrl: '', carpetaUrl: '', multimediaUrl: ''
    },
    incidencias: [
      { id: 'INC-261024-7F2A', fecha: new Date(Date.now() - 3 * 3600000).toISOString(), nombre: 'Javier Cuesta Ruiz', email: 'javier.cuesta@cusafa.es', rol: 'vol', tipo: 'error', asunto: 'No puedo subir el certificado desde el móvil', descripcion: 'Elijo el PDF y se queda cargando. Lo he intentado dos veces con el iPhone.', pantalla: 'Documentos', estado: 'abierta', respuesta: '', adjunto: '' },
      { id: 'INC-261023-B91C', fecha: new Date(Date.now() - 28 * 3600000).toISOString(), nombre: 'Clara Ortega Vílchez', email: 'clara.ortega@cusafa.es', rol: 'coord', tipo: 'sugerencia', asunto: 'Exportar la asistencia a Excel', descripcion: 'Sería útil descargar las horas de todo el equipo para el certificado final.', pantalla: 'Asistencia', estado: 'abierta', respuesta: '', adjunto: '' },
      { id: 'INC-261021-04DE', fecha: new Date(Date.now() - 80 * 3600000).toISOString(), nombre: 'Lucía Martos Ortega', email: 'lucia.martos@cusafa.es', rol: 'vol', tipo: 'duda', asunto: '¿Cómo cambio de turno?', descripcion: 'Me apunté al del lunes y prefiero el jueves.', pantalla: 'Mi horario', estado: 'resuelta', respuesta: 'Desmarca “Es mi turno” en el del lunes y márcalo en el del jueves.', adjunto: '' }
    ]
  });
}
function demoData(role) {
  const base = {
    config: { horasReferencia: 20, tiposDoc: { cert: 'Certificado de delitos de naturaleza sexual', comp: 'Compromiso de voluntariado' }, finCurso: '2027-06-30', hoy: dIso(0), guiaCert: true },
    entidades: JSON.parse(JSON.stringify(DEMO_ENTS)),
    noticias: [
      { id: 'n1', fecha: dIso(6), titulo: 'Encuentro de inicio del Voluntariado Arrupe', detalle: 'Capilla del Centro Universitario · 13:30', tipo: 'Encuentro' },
      { id: 'n2', fecha: dIso(13), titulo: 'Formación: acompañar con cuidado a cada persona', detalle: 'Aula 2.4 · 13:30 · para quienes empiezan', tipo: 'Formación' },
      { id: 'n3', fecha: dIso(15), titulo: 'Fin del plazo para entregar la documentación', detalle: 'Certificado de delitos de naturaleza sexual y compromiso de voluntariado', tipo: 'Aviso' },
      { id: 'n4', fecha: dIso(28), titulo: 'Oración del voluntariado', detalle: 'Último jueves de mes · Capilla · durante el recreo', tipo: 'Oración' }
    ]
  };
  if (role === 'pastoral') return demoPastoral(base);
  if (role === 'coord') {
    const equipo = [
      ['clara.ortega@cusafa.es', 'Clara Ortega Vílchez', '4.º Ed. Infantil', [], 'ok', 'ok', 14, true, false],
      ['lucia.martos@cusafa.es', 'Lucía Martos Ortega', '2.º Ed. Infantil', ['apoyo'], 'ok', 'rev', 9, false, false],
      ['javier.cuesta@cusafa.es', 'Javier Cuesta Ruiz', '1.º Ed. Primaria', [], 'rev', 'ok', 4, false, false],
      ['carmen.vilches@cusafa.es', 'Carmen Vilches Ramos', '3.º Ed. Primaria', ['ute'], 'ok', 'ok', 11, false, false],
      ['alba.torres@cusafa.es', 'Alba Torres Medina', '1.º Ed. Infantil', [], 'pend', 'pend', 0, false, true],
      ['marta.jimenez@cusafa.es', 'Marta Jiménez Soto', '1.º Ed. Infantil', ['res'], 'ok', 'pend', 3, false, false]
    ].map(x => ({ email: x[0], nombre: x[1], curso: x[2], otras: x[3], cert: x[4], comp: x[5], horas: x[6], coordina: x[7], nuevo: x[8] }));
    const tels = ['611 204 318', '622 845 107', '633 120 984', '644 567 201', '655 903 412', '666 718 225'];
    equipo.forEach((p, i) => { p.acceso = i < 3; p.invitacion = i === 3 ? 'enviada' : ''; p.telefono = tels[i]; p.emergencia = i % 2 ? '' : 'Madre · 600 000 00' + i; });
    const T = demoTurnos().filter(t => t.entidad === 'hogar').map(t => Object.assign({}, t, { apuntados: t.id === 't1' ? ['Clara O.', 'Lucía M.', 'Carmen V.'] : t.id === 't2' ? ['Javier C.', 'Marta J.'] : [] }));
    const proximos = [];
    T.forEach(t => demoOcc(t, 14).forEach((f, k) => {
      const nombres = t.tipo === 'fecha' ? equipo.map(p => p.nombre) : equipo.filter(p => t.apuntados.includes(p.nombre.split(' ')[0] + ' ' + p.nombre.split(' ')[1][0] + '.')).map(p => p.nombre);
      proximos.push({ turno: t.id, fecha: f, inicio: t.inicio, fin: t.fin, lugar: t.lugar, personas: equipo.filter(p => nombres.includes(p.nombre)).map((p, j) => ({ email: p.email, nombre: p.nombre, respuesta: k === 0 ? (j === 0 || j === 1 ? 'sí' : j === 2 ? 'no' : '') : '' })) });
    }));
    proximos.sort((a, b) => (a.fecha + a.inicio) < (b.fecha + b.inicio) ? -1 : 1);
    return Object.assign(base, {
      me: { email: 'clara.ortega@cusafa.es', nombre: 'Clara Ortega Vílchez', rol: 'coord', estado: 'activo', curso: '4.º Ed. Infantil', coordEnts: ['hogar'], foto: '', telefono: '611 204 318', emailContacto: '', emergenciaNombre: '', emergenciaTelefono: '', avisos: true },
      mio: { asignaciones: [{ entidad: 'hogar', estado: 'activa' }], docs: { cert: { estado: 'ok', fecha: dIso(-14), nota: '' }, comp: { estado: 'ok', fecha: dIso(-14), nota: '' } },
        horas: [{ fecha: dIso(-2), entidad: 'hogar', horas: 2 }, { fecha: dIso(-7), entidad: 'hogar', horas: 2 }, { fecha: dIso(-9), entidad: 'hogar', horas: 1 }], reflexiones: [],
        compromiso: { nombre: 'Clara Ortega Vílchez', dni: '00000000T', telefono: '611 204 318', curso: '4.º Ed. Infantil', entidades: ['hogar'], actividades: 'Coordinación del equipo y apoyo en tareas', desde: dIso(-14), hasta: '2027-06-30', fecha: dIso(-14) },
        turnos: demoTurnos().filter(t => t.entidad === 'hogar').map(t => Object.assign({}, t, { apuntado: t.id === 't1' })), proximos: demoProximos('coord').filter(p => p.turno !== 't2'), misSubidas: 4 },
      coord: { hogar: { equipo, sesiones: [
        { sesion: 's1', fecha: dIso(-2), entidad: 'hogar', horas: 2, personas: ['Clara O.', 'Lucía M.', 'Carmen V.', 'Marta J.'] },
        { sesion: 's2', fecha: dIso(-7), entidad: 'hogar', horas: 2, personas: ['Clara O.', 'Lucía M.', 'Javier C.', 'Carmen V.'] },
        { sesion: 's3', fecha: dIso(-9), entidad: 'hogar', horas: 1, personas: ['Clara O.', 'Lucía M.', 'Carmen V.'] }], turnos: T, proximos } }
    });
  }
  return Object.assign(base, {
    me: { email: 'lucia.martos@cusafa.es', nombre: 'Lucía Martos Ortega', rol: 'vol', estado: 'activo', curso: '2.º Ed. Infantil', coordEnts: [], foto: '', telefono: '622 845 107', emailContacto: '', emergenciaNombre: 'Carmen Ortega (madre)', emergenciaTelefono: '600 000 001', avisos: true },
    mio: { asignaciones: [{ entidad: 'hogar', estado: 'activa' }, { entidad: 'apoyo', estado: 'activa' }],
      docs: { cert: { estado: 'ok', fecha: dIso(-12), nota: '' }, comp: { estado: 'pend', fecha: '', nota: '' } },
      horas: [{ fecha: dIso(-2), entidad: 'hogar', horas: 2 }, { fecha: dIso(-6), entidad: 'apoyo', horas: 2 }, { fecha: dIso(-7), entidad: 'hogar', horas: 2 }, { fecha: dIso(-9), entidad: 'hogar', horas: 1 }, { fecha: dIso(-13), entidad: 'apoyo', horas: 2 }, { fecha: dIso(-16), entidad: 'hogar', horas: 2 }, { fecha: dIso(-20), entidad: 'apoyo', horas: 2 }],
      reflexiones: [{ fecha: dIso(-7), texto: 'Hoy Aitana me ha enseñado su cuaderno de dibujos. No sabía que llevaba semanas esperando a que se lo pidiera.', entidad: 'hogar', sesion: 'x1', palabra: 'esperar' }, { fecha: dIso(-13), texto: 'Me costó que me hicieran caso con los deberes. Al final, un chiste lo cambió todo.', entidad: 'apoyo', sesion: 'x2', palabra: 'humor' }],
      reflexionTotal: 2, sesionesAsistidas: 7, sinReflexion: [{ sesion: 'demo-s1', entidad: 'hogar', fecha: dIso(-1) }, { sesion: 'demo-s2', entidad: 'apoyo', fecha: dIso(-6) }],
      compromiso: null, turnos: demoTurnos().map(t => Object.assign({}, t, { apuntado: t.id === 't1' || t.id === 't4' })), proximos: demoProximos('vol'), misSubidas: 1 }
  });
}
function demoThumb(i) {
  const pal = [['#E58A00', '#F5C26B'], ['#D9007A', '#F59ACB'], ['#12679A', '#7FC0E6'], ['#25995A', '#9BDDB5'], ['#3A2A85', '#A99BEA'], ['#8E5A32', '#D8B08C']][i % 6];
  const shapes = ['<circle cx="60" cy="70" r="26" fill="rgba(255,255,255,.55)"/><rect x="18" y="104" width="124" height="40" rx="12" fill="rgba(255,255,255,.35)"/>', '<path d="M20 130 L60 70 L90 110 L110 85 L145 130 Z" fill="rgba(255,255,255,.5)"/><circle cx="118" cy="45" r="14" fill="rgba(255,255,255,.7)"/>', '<path d="M80 128 L40 88 C26 74 26 52 41 41 C56 30 72 34 80 49 C88 34 104 30 119 41 C134 52 134 74 120 88 Z" fill="rgba(255,255,255,.6)"/>'][i % 3];
  return 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient></defs><rect width="160" height="160" fill="url(#g)"/>${shapes}</svg>`);
}
let DEMO_GAL = [
  { id: 'm1', mime: 'image/jpeg', fecha: dIso(-2), autor: 'Lucía M.', descripcion: 'Taller de manualidades de otoño', thumb: demoThumb(0), url: '' },
  { id: 'm2', mime: 'image/jpeg', fecha: dIso(-2), autor: 'Clara O.', descripcion: 'Merienda en el patio', thumb: demoThumb(1), url: '' },
  { id: 'm3', mime: 'video/mp4', fecha: dIso(-7), autor: 'Carmen V.', descripcion: 'Ensayo de la obra de teatro', thumb: demoThumb(2), url: '' },
  { id: 'm4', mime: 'image/jpeg', fecha: dIso(-9), autor: 'Javier C.', descripcion: '', thumb: demoThumb(3), url: '' },
  { id: 'm5', mime: 'image/jpeg', fecha: dIso(-12), autor: 'Clara O.', descripcion: 'Mural del equipo', thumb: demoThumb(4), url: '' }
];
function demoApi(action, d) {
  const D2 = DEMO, me = D2.me, short = n => { const p = n.split(' '); return p[0] + ' ' + p[1][0] + '.'; };
  switch (action) {
    case 'bootstrap': return D2;
    case 'guardarReflexion': { const p = (D2.mio.sinReflexion || []).find(x => x.sesion === d.sesion); D2.mio.reflexiones.unshift({ fecha: todayISO(), texto: d.texto, palabra: String(d.palabra || '').split(/\s+/)[0], sesion: d.sesion || '', entidad: p ? p.entidad : '' }); D2.mio.sinReflexion = (D2.mio.sinReflexion || []).filter(x => x.sesion !== d.sesion); D2.mio.reflexionTotal = (D2.mio.reflexionTotal || 0) + 1; return D2; }
    case 'subirDocumento': D2.mio.docs[d.tipo] = { estado: 'rev', fecha: todayISO(), nota: '' }; return D2;
    case 'solicitarEntidad': D2.mio.asignaciones.push({ entidad: d.entidad, estado: 'solicitada' }); return D2;
    case 'dejarEntidad': D2.mio.asignaciones = D2.mio.asignaciones.filter(x => x.entidad !== d.entidad); return D2;
    case 'registrarSesion': {
      const C = D2.coord[d.entidad];
      const ps = C.equipo.filter(p => d.emails.includes(p.email));
      ps.forEach(p => p.horas += d.horas);
      C.sesiones.unshift({ sesion: 's' + Date.now(), fecha: d.fecha, entidad: d.entidad, horas: d.horas, personas: ps.map(p => short(p.nombre)) });
      if (d.emails.includes(me.email)) D2.mio.horas.unshift({ fecha: d.fecha, entidad: d.entidad, horas: d.horas });
      return D2;
    }
    case 'borrarSesion': Object.values(D2.coord).forEach(C => { C.sesiones = C.sesiones.filter(s => s.sesion !== d.sesion); }); return D2;
    case 'recordarDocumentos': return { enviados: D2.coord[d.entidad].equipo.filter(p => p.cert !== 'ok' || p.comp !== 'ok').length };
    case 'darBienvenida': D2.coord[d.entidad].equipo.forEach(p => { if (p.email === d.email) p.nuevo = false; }); if (d.whatsapp) D2.entidades.forEach(e => { if (e.id === d.entidad) e.whatsapp = d.whatsapp; }); return D2;
    case 'guardarInfoEntidad': D2.entidades.forEach(e => { if (e.id === d.entidad) Object.assign(e, { horario: d.horario, lugar: d.lugar, descripcion: d.descripcion || e.descripcion, whatsapp: d.whatsapp, editadoPor: short(me.nombre), editado: todayISO() }); }); return D2;
    case 'guardarMisDatos': Object.assign(me, d); return D2;
    case 'invitarVoluntarios': D2.coord[d.entidad].equipo.forEach(p => { if (d.emails.includes(p.email)) p.invitacion = 'enviada'; }); return D2;
    case 'asignarInscripciones': d.items.forEach(x => D2.pastoral.inscripciones.forEach(i => { if (i.id === x.id) { i.estado = 'asignada'; i.entidades = x.entidades; i.entidad = x.entidades.join(','); i.avisado = ''; } })); return D2;
    case 'enviarAgradecimiento': D2.pastoral.inscripciones.forEach(i => { if (d.ids.includes(i.id)) i.avisado = todayISO(); }); return D2;
    case 'estadoInscripcion': D2.pastoral.inscripciones.forEach(i => { if (i.id === d.id) i.estado = d.estado; }); return D2;
    case 'guardarPersona': { let p = D2.pastoral.personas.find(x => x.email === d.email); if (!p) { p = { email: d.email, alta: todayISO(), asignaciones: [], docs: { cert: { estado: 'pend', url: '' }, comp: { estado: 'pend', url: '' } }, horas: 0, telefono: '', emergencia: '', compromiso: null }; D2.pastoral.personas.push(p); }
      Object.assign(p, { nombre: d.nombre, curso: d.curso, rol: d.rol, estado: d.estado, coordEnts: d.coordEnts, asignaciones: d.asignaciones.map(e => ({ entidad: e, estado: 'activa' })) }); return D2; }
    case 'revisarDocumento': D2.pastoral.personas.forEach(p => { if (p.email === d.email) p.docs[d.tipo].estado = d.valido ? 'ok' : 'rech'; }); return D2;
    case 'resolverSolicitud': D2.pastoral.personas.forEach(p => { if (p.email === d.email) p.asignaciones = p.asignaciones.map(a => a.entidad === d.entidad && a.estado === 'solicitada' ? (d.aceptar ? { entidad: a.entidad, estado: 'activa' } : null) : a).filter(Boolean); }); return D2;
    case 'crearInvitaciones': d.lista.forEach(x => D2.pastoral.invitaciones.unshift({ codigo: Math.random().toString(36).slice(2, 5).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(), email: x.email, nombre: x.nombre, entidades: x.entidades, estado: 'enviada', creado: todayISO(), usadoPor: '', usadoEn: '' })); return D2;
    case 'reenviarInvitacion': return D2;
    case 'enviarComunicado': { const n = d.prueba ? 1 : comDest({ destino: d.destino, ents: d.entidades }).length; if (!d.prueba) D2.pastoral.comunicados.unshift({ id: 'c' + Date.now(), fecha: new Date().toISOString(), destino: d.destino, entidades: d.entidades, asunto: d.asunto, destinatarios: n, adjuntos: d.adjuntos.map(a => a.nombre).join(', ') }); const o = Object.assign({}, D2); o.enviados = n; return o; }
    case 'subirGuiaCertificado': D2.config.guiaCert = true; return D2;
    case 'enviarIncidencia': { const x = { id: 'INC-DEMO-' + Math.random().toString(36).slice(2, 6).toUpperCase(), fecha: new Date().toISOString(), nombre: me.nombre, email: me.email, rol: me.rol, tipo: d.tipo, asunto: d.asunto, descripcion: d.descripcion, pantalla: d.pantalla, estado: 'abierta', respuesta: '', adjunto: '' }; D2.mio.incidencias = [x].concat(D2.mio.incidencias || []); if (D2.incidencias) D2.incidencias.unshift(x); const o = Object.assign({}, D2); o.ticket = x.id; return o; }
    case 'resolverIncidencia': (D2.incidencias || []).forEach(x => { if (x.id === d.id) { x.estado = d.reabrir ? 'abierta' : 'resuelta'; if (d.respuesta) x.respuesta = d.respuesta; } }); return D2;
    case 'marcarNotificaciones': D2.pastoral.notificaciones.forEach(n => { if (d.todas || (d.ids || []).includes(n.id)) n.leida = true; }); return D2;
    case 'anularInvitacion': D2.pastoral.invitaciones.forEach(i => { if (i.codigo === d.codigo) i.estado = 'anulada'; }); return D2;
    case 'guardarEntidad': { const e = D2.entidades.find(x => x.id === d.id); if (e) Object.assign(e, d, { cupo: Number(d.cupo) || 0 }); else D2.entidades.push(Object.assign({ coordinadores: [], ocupadas: 0 }, d, { cupo: Number(d.cupo) || 0 })); return D2; }
    case 'guardarNoticia': if (d.id) D2.noticias.forEach(n => { if (n.id === d.id) Object.assign(n, d); }); else D2.noticias.push(Object.assign({}, d, { id: 'n' + Date.now() })); D2.noticias.sort((x, y) => x.fecha < y.fecha ? -1 : 1); return D2;
    case 'borrarNoticia': D2.noticias = D2.noticias.filter(n => n.id !== d.id); return D2;
    case 'firmarCompromiso': D2.mio.compromiso = { nombre: d.nombre, dni: d.dni, telefono: d.telefono, curso: d.curso, entidades: D2.mio.asignaciones.filter(x => x.estado === 'activa').map(x => x.entidad), actividades: d.actividades, desde: todayISO(), hasta: '2027-06-30', fecha: todayISO() }; D2.mio.docs.comp = { estado: 'ok', fecha: todayISO(), nota: '' }; return D2;
    case 'apuntarTurno': D2.mio.turnos.forEach(t => { if (t.id === d.turno) t.apuntado = !!d.apuntar; }); return D2;
    case 'confirmarAsistencia': D2.mio.proximos.forEach(p => { if (p.turno === d.turno && p.fecha === d.fecha) p.respuesta = d.respuesta; }); return D2;
    case 'guardarTurno': { const C = D2.coord[d.entidad]; const t = Object.assign({ id: 't' + Date.now(), entidad: d.entidad, apuntados: [] }, d); C.turnos.push(t); demoOcc(t, 14).forEach(f => C.proximos.push({ turno: t.id, fecha: f, inicio: t.inicio, fin: t.fin, lugar: t.lugar, personas: C.equipo.map(p => ({ email: p.email, nombre: p.nombre, respuesta: '' })) })); C.proximos.sort((x, y) => (x.fecha + x.inicio) < (y.fecha + y.inicio) ? -1 : 1); return D2; }
    case 'borrarTurno': Object.values(D2.coord).forEach(C => { C.turnos = C.turnos.filter(t => t.id !== d.id); C.proximos = C.proximos.filter(p => p.turno !== d.id); }); return D2;
    case 'subirMultimedia': DEMO_GAL.unshift({ id: 'm' + Date.now(), mime: d.mime, fecha: todayISO(), autor: short(me.nombre), descripcion: d.descripcion, thumb: d.mime.startsWith('image/') ? 'data:' + d.mime + ';base64,' + d.base64 : demoThumb(5), url: '' }); D2.mio.misSubidas = (D2.mio.misSubidas || 0) + 1; return { ok: true, misSubidas: D2.mio.misSubidas };
    case 'galeria': return { entidad: d.entidad, items: DEMO_GAL.slice(), carpetaUrl: '' };
    case 'quitarMultimedia': DEMO_GAL = DEMO_GAL.filter(m => m.id !== d.id); return { entidad: 'hogar', items: DEMO_GAL.slice(), carpetaUrl: '' };
    default: throw new Error('En el modo demostración esta acción no está disponible');
  }
}
function startDemo(role) {
  render.animate = true; DEMO = demoData(role); D = DEMO; S.gal = {}; S.cf = {}; S.tf = null;
  S.view = null; S.ent = null; S.cent = null; S.att = null; S.leaving = null;
  render.keepScroll = false; render(); window.scrollTo(0, 0);
}
async function exitDemo() {
  DEMO = null; D = null; S.view = null;
  if (TOKEN && jwtExp(TOKEN) > Date.now() + 30000) load(); else render();
}

/* ───────── API ───────── */
async function api(action, data) {
  if (DEMO) { await new Promise(r => setTimeout(r, 250)); return demoApi(action, data || {}); }
  if (!TOKEN || jwtExp(TOKEN) < Date.now() + 30000) { signOut(true); throw new Error('Tu sesión ha caducado. Vuelve a entrar.'); }
  let res;
  try {
    res = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: TOKEN, data }) });
  } catch (e) { throw new Error('No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.'); }
  let out;
  try { out = await res.json(); } catch (e) { throw new Error('El servidor ha respondido algo inesperado. Avisa a Pastoral.'); }
  if (!out.ok) {
    if (out.auth) { signOut(true, out.error); }
    if (/Acción desconocida/.test(out.error || '')) throw new Error('Esta función necesita la última versión del script de Google. Pastoral debe copiar Code.gs del repositorio y publicar una versión nueva.');
    throw new Error(out.error || 'Error desconocido');
  }
  return out.data;
}
const CELEBRA = { guardarReflexion: 1, firmarCompromiso: 1, confirmarAsistencia: 1, darBienvenida: 1, asignarInscripciones: 1, enviarAgradecimiento: 1, registrarSesion: 1, crearInvitaciones: 1, invitarVoluntarios: 1, solicitarEntidad: 1 };
async function run(action, data, okMsg) {
  $('busy').hidden = false;
  try {
    const r = await api(action, data);
    if (r && r.me) D = r;
    if (CELEBRA[action] && (action !== 'confirmarAsistencia' || (data && data.respuesta === 'sí'))) celebrate(run.x, run.y);
    if (okMsg) toast((typeof okMsg === 'function' ? okMsg(r) : okMsg) + (DEMO ? ' (demostración: no se guarda ni se envía nada)' : ''));
    render();
    return r;
  } catch (e) { toast(e.message); return null; }
  finally { $('busy').hidden = true; }
}

/* ───────── acceso con Google ───────── */
function onCredential(resp) {
  TOKEN = resp.credential;
  try { sessionStorage.setItem('arrupe-token', TOKEN); } catch (e) { }
  load();
}
async function load() {
  S.err = '';
  $('root').innerHTML = '<div class="boot"><div class="spinner" role="status" aria-label="Cargando"></div></div>';
  render.animate = true;
  try { D = await api('bootstrap'); if (REFL_START && D && D.mio) { S.rses = (D.mio.sinReflexion || []).some(p => p.sesion === REFL_START) ? REFL_START : undefined; S.view = 'reflexion'; REFL_START = null; } }
  catch (e) { S.err = e.message; D = null; if (TOKEN) { TOKEN = null; try { sessionStorage.removeItem('arrupe-token'); } catch (x) { } } }
  if (D && CODE) {
    const c = caps();
    if (c.isP) clearCode();
    else {
      try { D = await api('canjearCodigo', { codigo: CODE }); clearCode(); S.view = null; toast('Invitación activada. Ya puedes coordinar tu voluntariado.'); }
      catch (e) { if (/ya se ha usado/.test(e.message) && caps().isC) clearCode(); else S.codeErr = e.message; }
    }
  }
  render();
}
function signOut(silent, msg) {
  TOKEN = null; D = null;
  try { sessionStorage.removeItem('arrupe-token'); } catch (e) { }
  try { google.accounts.id.disableAutoSelect(); } catch (e) { }
  if (msg) S.err = msg;
  if (!silent) render(); else setTimeout(render, 0);
}
function initGoogle(tries = 0) {
  if (tries === 1 && !DEMO && !D && !(TOKEN && jwtExp(TOKEN) > Date.now() + 60000)) render(); // muestra la pantalla de acceso sin esperar a Google
  if (!window.google || !google.accounts) { if (tries < 60) return setTimeout(() => initGoogle(tries + 1), 150); if (DEMO) return; S.err = 'No se pudo cargar el acceso de Google. Recarga la página.'; return render(); }
  google.accounts.id.initialize({ client_id: CFG.CLIENT_ID, callback: onCredential, auto_select: true, cancel_on_tap_outside: false, use_fedcm_for_prompt: true });
  if (DEMO) return;
  if (TOKEN && jwtExp(TOKEN) > Date.now() + 60000) load(); else { TOKEN = null; render(); try { google.accounts.id.prompt(); } catch (e) { } }
}

/* ───────── perfiles y navegación ───────── */
function caps() {
  const me = D.me;
  const isP = me.rol === 'pastoral';
  const coordIds = D.coord ? Object.keys(D.coord) : [];
  const isVol = !isP && (me.rol === 'vol' || D.mio.asignaciones.length > 0);
  return { isP, coordIds, isC: coordIds.length > 0, isVol, pend: me.estado !== 'activo' };
}
function nav() {
  const c = caps();
  if (c.pend) return [['espera', 'Tu cuenta', 'home'], ['datos', 'Mis datos', 'user'], ['explorar', 'Dónde servir', 'compass'], ['noticias', 'Noticias', 'news'], ['soporte', 'Ayuda', 'life']];
  const n = [];
  if (c.isP) n.push(['panel', 'Panel', 'chart'], ['avisos', 'Avisos', 'bell'], ['ins', 'Inscripciones', 'inbox'], ['personas', 'Personas', 'users'], ['comunicados', 'Comunicados', 'send'], ['invitaciones', 'Invitaciones', 'mail'], ['entidades', 'Entidades', 'building']);
  if (c.isC) n.push(['cinicio', 'Mi entidad', 'building'], ['equipo', 'Equipo', 'users'], ['chorario', 'Horarios', 'calendar'], ['asistencia', 'Asistencia', 'check']);
  if (c.isVol) n.push(['vinicio', 'Mi voluntariado', 'home'], ['reflexion', 'Con qué me quedo', 'feather'], ['horario', 'Mi horario', 'calendar'], ['docs', 'Documentos', 'file'], ['horas', 'Mis horas', 'clock']);
  if (c.isVol || c.isC) n.push(['fotos', 'Fotos y vídeos', 'camera']);
  if (!c.isP) n.push(['datos', 'Mis datos', 'user']);
  n.push(['explorar', 'Dónde servir', 'compass'], ['noticias', 'Noticias', 'news'], ['soporte', c.isP ? 'Incidencias' : 'Ayuda', 'life']);
  return n;
}
function badge(k) {
  if (k === 'reflexion') return D.mio && D.mio.sinReflexion ? D.mio.sinReflexion.length : 0;
  if (k === 'soporte') return D.incidencias ? D.incidencias.filter(x => x.estado === 'abierta').length : 0;
  if (!D.pastoral) return 0;
  if (k === 'ins') return D.pastoral.inscripciones.filter(i => i.estado === 'nueva').length;
  if (k === 'panel') return pendientesPastoral().total;
  if (k === 'avisos') return (D.pastoral.notificaciones || []).filter(n => !n.leida).length;
  return 0;
}
function pendientesPastoral() {
  const P = D.pastoral.personas;
  const cuentas = P.filter(p => p.estado === 'pendiente');
  const solicitudes = [];
  P.forEach(p => p.asignaciones.filter(a => a.estado === 'solicitada').forEach(a => solicitudes.push({ p, ent: a.entidad })));
  const docs = [];
  P.forEach(p => Object.keys(p.docs).forEach(t => { if (p.docs[t].estado === 'rev') docs.push({ p, t }); }));
  return { cuentas, solicitudes, docs, total: cuentas.length + solicitudes.length + docs.length };
}

/* ───────── vistas ───────── */
function vLogin() {
  const apiOk = /^https:\/\/script\.google\.com\/.+\/exec$/.test(String(CFG.API_URL || '').trim());
  const cidOk = /\.apps\.googleusercontent\.com$/.test(String(CFG.CLIENT_ID || '').trim()) && CFG.CLIENT_ID.indexOf('PEGA_AQUI') < 0;
  const ok = apiOk && cidOk;
  return `<main class="login">${weaveSVG()}<div class="login-card">
    <div class="logo-wrap"><img src="${LOGO}" alt="Pastoral · Centro Universitario Sagrada Familia"></div>
    <div class="ribbon" aria-hidden="true">${COLORS.slice(0, 8).map(c => `<span style="background:${cvar(c)}"></span>`).join('')}</div>
    <div style="display:grid;gap:8px;justify-items:center"><h1>Voluntariado Arrupe</h1>${THREAD}<p class="muted">Entra con tu cuenta de Google para ver tu voluntariado, tu documentación y tus horas.</p></div>
    ${ok ? '<div class="gbtn-host" id="gbtn"></div>' : `<p class="err">${!apiOk ? 'La dirección del script en config.js no es válida: debe empezar por https://script.google.com/ y acabar en /exec.' : 'El ID de cliente de Google en config.js no es válido.'}</p>`}
    ${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}
    ${CODE ? `<div class="note">${ic('mail', 18)}<span>Tienes una <b>invitación para coordinar</b>. Entra con tu cuenta de Google y se activará al momento.</span></div>` : ''}
    <div class="login-note">${ic('lock', 18)}<span>La primera vez, el Servicio de Pastoral revisa tu cuenta antes de darte acceso. Tus documentos solo los ve Pastoral.</span></div>
  </div></main>`;
}
function avatar(me, col) {
  return `<div class="av" style="background:${col}">${me.foto ? `<img src="${safeUrl(me.foto)}" alt="" referrerpolicy="no-referrer">` : esc(initials(me.nombre))}</div>`;
}
function shell(content) {
  const me = D.me, n = nav(), c = caps();
  const sub = c.isP ? 'Servicio de Pastoral' : c.isC ? 'Coordinación · ' + c.coordIds.map(id => E(id).nombre).join(', ') : c.pend ? 'Cuenta pendiente' : 'Voluntario/a' + (me.curso ? ' · ' + me.curso : '');
  const items = n.map(([k, l, i]) => { const b = badge(k); return `<button data-go="${k}" ${S.view === k ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span>${b ? `<span class="count">${b}</span>` : ''}</button>`; }).join('');
  const tabs = n.map(([k, l]) => { const b = badge(k); return `<button data-go="${k}" ${S.view === k ? 'aria-current="page"' : ''}>${l}${b ? ` (${b})` : ''}</button>`; }).join('');
  const demoBar = DEMO ? `<div class="demo-bar" role="region" aria-label="Modo demostración"><span><b>Modo demostración</b><span class="demo-long"> · datos ficticios, no se guarda nada</span></span>
    <div class="seg"><button data-demo="pastoral" aria-pressed="${DEMO.me.rol === 'pastoral'}">Pastoral</button><button data-demo="coord" aria-pressed="${DEMO.me.rol === 'coord'}">Coordinación</button><button data-demo="vol" aria-pressed="${DEMO.me.rol === 'vol'}">Voluntariado</button><button data-act="demo-exit">Salir</button></div></div>` : '';
  return demoBar + `<div class="mtop"><div class="row"><div class="logo-wrap"><img src="${LOGO}" alt="Pastoral CUSAFA"></div><div style="display:flex;gap:10px;align-items:center"><button class="signout" data-act="signout">Salir</button>${avatar(me, 'var(--brand)')}</div></div><nav class="tabs" aria-label="Secciones">${tabs}</nav></div>
  <div class="shell">
    <aside class="side"><div class="logo-wrap"><img src="${LOGO}" alt="Pastoral · Centro Universitario Sagrada Familia"></div>
      <div class="motto">Voluntariado Arrupe</div>
      <nav class="nav" aria-label="Secciones">${items}</nav>
      <div class="me">${avatar(me, 'var(--brand)')}<div class="who"><b>${esc(me.nombre)}</b><span>${esc(sub)}</span><br><button class="signout" data-act="signout">Cerrar sesión</button></div></div>
    </aside>
    <main class="main"><div class="wrap">${avisoVersion()}${content}</div></main>
  </div>`;
}
const THREAD = '<svg class="thread" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C 34 2, 58 15, 92 8 S 150 2, 184 9 S 246 15, 298 6"/></svg>';
const header = (eyebrow, title, sub, actions = '') => `<div class="head"><div class="t"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${THREAD}${sub ? `<p class="muted">${sub}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
const newsRow = n => `<div class="row"><div style="width:52px;text-align:center;flex:none"><b class="tnum" style="font-family:var(--display);font-size:1.15rem;display:block;line-height:1">${new Date(n.fecha + 'T12:00').getDate()}</b><span class="small muted">${new Date(n.fecha + 'T12:00').toLocaleDateString('es-ES', { month: 'short' })}</span></div><div class="grow"><b>${esc(n.titulo)}</b><span class="muted small">${esc(n.detalle)}</span></div><span class="pill info">${esc(n.tipo)}</span></div>`;
const proximas = () => D.noticias.filter(n => n.fecha >= todayISO());
// Tejido: hilos blancos ondulados, distintos para cada entidad
function artSVG(seed) {
  const r = n => ((Math.sin(seed * 999 + n * 7.13) * 10000) % 1 + 1) % 1;
  let s = '';
  for (let i = 0; i < 7; i++) {
    const y = 18 + i * 22 + r(i) * 10, a = 10 + r(i + 3) * 22, ph = r(i + 7) * 120;
    s += `<path d="M-20 ${y.toFixed(0)} C ${(60 + ph).toFixed(0)} ${(y - a).toFixed(0)}, ${(120 + ph).toFixed(0)} ${(y + a).toFixed(0)}, ${(210 + ph / 2).toFixed(0)} ${y.toFixed(0)} S ${(360).toFixed(0)} ${(y - a).toFixed(0)}, 460 ${(y + a / 2).toFixed(0)}" stroke="rgba(255,255,255,${(.12 + r(i + 11) * .28).toFixed(2)})" stroke-width="${(2 + r(i + 5) * 5).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 3; i++) s += `<circle cx="${(30 + r(i + 20) * 340).toFixed(0)}" cy="${(20 + r(i + 30) * 110).toFixed(0)}" r="${(3 + r(i + 40) * 4).toFixed(1)}" fill="rgba(255,255,255,.55)"/>`;
  return `<svg viewBox="0 0 420 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}
const WEAVE_COLORS = ['#E58A00', '#D9007A', '#7B6BE0', '#C9925E', '#4FA9E0', '#E5544F', '#9AA0A6', '#3CB878'];
function weaveSVG() {
  let s = '';
  WEAVE_COLORS.forEach((c, i) => {
    const y = 90 + i * 95, a = 60 + (i % 3) * 35, d = i * 0.12;
    s += `<path d="M-100 ${y} C 250 ${y - a}, 450 ${y + a}, 760 ${y} S 1250 ${y - a}, 1600 ${y + a / 2}" stroke="${c}" style="animation-delay:${d}s,${-i * 2}s"/>`;
  });
  return `<svg class="weave" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}

/* --- cuenta pendiente --- */
function vEspera() {
  return header('Bienvenida', 'Tu cuenta está en revisión', 'El Servicio de Pastoral la aprobará en breve. Te llegará un correo cuando te asignen un voluntariado. Mientras, puedes conocer dónde servir.') +
    `<div class="card"><h2>¿Tienes un código de invitación?</h2><p class="muted small">Si Pastoral te ha invitado a coordinar, escribe aquí el código que te llegó por correo.</p>
      <div class="actions"><input type="text" id="codeIn" value="${esc(CODE || '')}" placeholder="ABC-123" autocomplete="one-time-code" style="max-width:200px;text-transform:uppercase;letter-spacing:.1em;font-weight:700"><button class="btn primary" data-act="redeem">Activar</button></div>
      ${S.codeErr ? `<p class="err">${esc(S.codeErr)}</p>` : ''}</div>
    <div class="card examen"><p class="quote">Antes de elegir dónde servir, pregúntate qué te mueve. Lo que te mueve también te sostiene.</p>
    <button class="btn primary" data-go="explorar" style="justify-self:start">${ic('compass', 18)}Ver los voluntariados</button></div>`;
}

/* --- explorar --- */
function vExplorar() {
  if (S.ent) return vEntDetail();
  const mine = D.mio.asignaciones.map(a => a.entidad);
  const ents = D.entidades.filter(e => e.activa);
  return header('Voluntariado Arrupe', '¿Dónde quieres servir?', `${ents.length} lugares donde el curso se convierte en encuentro. Elige con calma: lo importante no es hacer mucho, sino estar de verdad.`, `<a class="btn ghost" href="${IG}" target="_blank" rel="noopener">${ic('insta', 18)}@unisafa</a>`) +
    `<div class="grid g3">${ents.map((e, i) => `<button class="ent" data-ent="${esc(e.id)}" style="--c:${cvar(e.color)}">
      <div class="art">${artSVG(i + 1)}<span class="tag">${esc(e.etiqueta)}</span>${mine.includes(e.id) ? '<span class="mine">Tu voluntariado</span>' : ''}${e.ig ? '<span class="reel">▶ Reel</span>' : ''}</div>
      <div class="body"><h3>${esc(e.nombre)}</h3><p class="muted small">${esc(String(e.descripcion || '').split('.')[0])}.</p>
      <div class="meta">${ic('pin', 16)}${esc(e.lugar)}</div></div></button>`).join('')}</div>`;
}
function vEntDetail() {
  const e = E(S.ent), i = D.entidades.indexOf(e), c = caps();
  const a = D.mio.asignaciones.find(x => x.entidad === e.id);
  let action = '';
  if (!c.isP) {
    if (c.pend) action = `<p class="hint">Podrás pedir plaza cuando Pastoral apruebe tu cuenta.</p>`;
    else if (a && a.estado === 'activa' && S.leaving === e.id) action = `<div class="confirm"><span>¿Seguro que quieres dejar <b>${esc(e.nombre)}</b>? Avisaremos a tu coordinación.</span><button class="btn danger sm" data-act="leave-yes">Sí, dejarlo</button><button class="btn ghost sm" data-act="leave-no">Mejor no</button></div>`;
    else if (a && a.estado === 'activa') action = `<button class="btn danger" data-act="leave">Dejar este voluntariado</button>`;
    else if (a && a.estado === 'solicitada') action = `<span class="pill info">Solicitud enviada a Pastoral</span>`;
    else action = `<button class="btn primary" data-act="join">${ic('heart', 18)}Quiero servir aquí</button>`;
  }
  return `<div class="hero-ent" style="--c:${cvar(e.color)}">${artSVG(i + 1)}<button class="back" data-act="back">← Todos los voluntariados</button>
    <span class="eyebrow" style="color:rgba(255,255,255,.85)">${esc(e.etiqueta)}</span><h1>${esc(e.nombre)}</h1><p>${esc(e.descripcion)}</p></div>
  <div class="detail" style="--c:${cvar(e.color)}">
    <div class="card"><h2>Cómo es</h2>
      <div class="row">${ic('calendar')}<div class="grow"><b>Horario</b><span class="muted">${esc(e.horario)}</span></div></div>
      <div class="row">${ic('pin')}<div class="grow"><b>Lugar</b><span class="muted">${esc(e.lugar)}</span></div></div>
      <div class="row">${ic('users')}<div class="grow"><b>Plazas</b><span class="muted tnum">${e.ocupadas} de ${e.cupo} ocupadas</span></div></div>
      <div class="row">${ic('shield')}<div class="grow"><b>Para empezar</b><span class="muted">Certificado de delitos de naturaleza sexual y documento de compromiso de voluntariado.</span></div></div>
      ${e.coordinadores.length ? `<div class="row">${ic('heart')}<div class="grow"><b>Coordinan</b><span class="muted">${esc(e.coordinadores.join(', '))}</span></div></div>` : ''}
      ${action ? `<div>${action}</div>` : ''}
    </div>
    <div class="card"><h2>Míralo en Instagram</h2>
      ${e.ig ? `<a class="igcard" href="${safeUrl(e.ig)}" target="_blank" rel="noopener"><span class="igplay" aria-hidden="true">▶</span><span><b>Reel del Día Internacional del Voluntariado</b><span class="small muted">Cómo se vive el voluntariado en ${esc(e.nombre)}</span></span></a>` : `<p class="muted small">Todavía no hay una publicación propia de este voluntariado.</p>`}
      <a class="btn ghost" href="${IG}" target="_blank" rel="noopener" style="justify-self:start">${ic('insta', 18)}Instagram del centro · @unisafa</a>
    </div>
  </div>`;
}

/* --- voluntario/a --- */
function misEnts() { return D.mio.asignaciones.filter(a => a.estado === 'activa').map(a => a.entidad); }
function horasPor(id) { return sum(D.mio.horas.filter(h => h.entidad === id), h => h.horas); }
function vVinicio() {
  const me = D.me, ents = misEnts(), ref = D.config.horasReferencia;
  const tot = sum(D.mio.horas, h => h.horas);
  const docs = D.mio.docs, done = Object.values(docs).filter(d => d.estado === 'ok').length;
  const falta = Object.keys(docs).filter(t => docs[t].estado === 'pend' || docs[t].estado === 'rech');
  const sol = D.mio.asignaciones.filter(a => a.estado === 'solicitada');
  return header('Hola, ' + esc(me.nombre.split(' ')[0]), 'Tu voluntariado', 'Aquí tienes dónde sirves, lo que te falta para estar al día y lo que viene.') +
    `<div class="kpis"><div class="kpi"><b class="tnum">${nf(tot)} h</b><span>este curso</span></div>
     <div class="kpi"><b class="tnum">${ents.length}</b><span>${ents.length === 1 ? 'voluntariado' : 'voluntariados'}</span></div>
     <div class="kpi ${done < 2 ? 'alert' : ''}"><b class="tnum">${done}/2</b><span>documentos validados</span></div></div>
  ${falta.length ? `<div class="note">${ic('file', 18)}<span>Te falta: <b>${falta.map(t => D.config.tiposDoc[t].toLowerCase()).join(' y ')}</b>. <button class="btn primary sm" data-go="docs" style="margin-left:6px">Ir a documentos</button></span></div>` : ''}
  ${ents.length ? `<div class="grid g2">${ents.map(id => { const e = E(id), h = horasPor(id); return `<div class="card" style="--c:${cvar(e.color)}"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">${chip(id)}<span class="small muted tnum">${nf(h)} h</span></div><h2>${esc(e.nombre)}</h2><p class="muted small">${esc(e.horario)}</p><div class="bar"><i style="width:${Math.min(100, h / ref * 100)}%"></i></div><span class="hint">Referencia de ${ref} h para el certificado</span><div class="actions"><button class="btn ghost sm" data-ent="${esc(id)}">Ver detalles</button></div></div>`; }).join('')}</div>`
    : `<div class="empty">Aún no tienes un voluntariado asignado. <button class="btn primary sm" data-go="explorar">Descubre dónde servir</button></div>`}
  ${sol.length ? `<div class="card"><h3>Solicitudes en curso</h3><div class="chips">${sol.map(a => chip(a.entidad)).join('')}</div><p class="hint">Pastoral te responderá por correo.</p></div>` : ''}
  <div class="grid g2">
    ${reflCard()}
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Lo que viene</h2><button class="btn ghost sm" data-go="noticias">Ver todo</button></div>
      ${proximas().length ? `<div class="list">${proximas().slice(0, 3).map(newsRow).join('')}</div>` : '<p class="muted small">No hay encuentros próximos publicados.</p>'}</div>
  </div>`;
}
function vDocs() {
  const docs = D.mio.docs, T = D.config.tiposDoc;
  const help = { cert: 'Se pide en la sede electrónica del Ministerio de Justicia con Cl@ve. Es gratuito y lo descargas al momento en PDF.', comp: 'Pide el modelo a tu coordinación, fírmalo y súbelo escaneado o en una foto legible.' };
  const card = t => { const d = docs[t];
    if (t === 'comp') { const c = D.mio.compromiso; return `<div class="card doc"><div class="top"><div style="display:grid;gap:4px;min-width:0;flex:1 1 240px"><h2>${esc(T[t])}</h2><p class="muted small">Se completa y se firma aquí mismo, en la app. Te llegará una copia por correo.</p></div>${c ? '<span class="pill ok">Firmado</span>' : pill(d.estado)}</div>
      ${c ? `<p class="small muted">${ic('check', 16)} Firmado el ${fmtLong(c.fecha)}. Vigente hasta el ${fmtLong(c.hasta)}.</p><button class="btn ghost" data-go="compromiso" style="justify-self:start">Ver mi compromiso</button>`
        : `<button class="btn primary" data-go="compromiso" style="justify-self:start">${ic('pen', 18)}Completar y firmar</button>`}</div>`; }
    return `<div class="card doc"><div class="top"><div style="display:grid;gap:4px;min-width:0;flex:1 1 240px"><h2>${esc(T[t])}</h2><p class="muted small">${help[t] || ''}</p></div>${pill(d.estado)}</div>
    ${t === 'cert' ? certSteps() : ''}
    ${d.estado === 'rech' && d.nota ? `<p class="err">Motivo: ${esc(d.nota)}</p>` : ''}
    ${d.estado === 'ok' ? `<p class="small muted">${ic('check', 16)} Validado por el Servicio de Pastoral${d.fecha ? ' el ' + fmtLong(d.fecha) : ''}.</p>` :
      `<label class="file btn ${d.estado === 'rev' ? 'ghost' : 'primary'}" for="up-${t}">${ic('upload', 18)}${d.estado === 'rev' ? 'Sustituir archivo' : 'Subir PDF o foto'}<input type="file" id="up-${t}" data-up="${t}" accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"></label><span class="hint">Máximo 10 MB.</span>`}
  </div>`; };
  return header('Documentación', 'Tus documentos', 'Son necesarios para empezar a servir. Se entregan una sola vez por curso, aunque estés en varios voluntariados.') +
    `<div class="note">${ic('lock', 18)}<span>Tu certificado y tus datos se guardan de forma privada. <b>Solo el Servicio de Pastoral puede verlos.</b> Tu coordinación únicamente ve si están entregados y validados.</span></div>
    <div class="grid g2">${Object.keys(T).map(card).join('')}</div>`;
}
const CERT_URL = 'https://sede.mjusticia.gob.es/es/tramites/certificado-registro-central';
const CERT_PASOS = [
  ['Entra en la sede del Ministerio de Justicia', 'Abre la página del trámite con el botón de abajo.'],
  ['Elige “Tramitación On-line con Cl@ve para personas físicas”', ''],
  ['Identifícate con Cl@ve', 'Cl@ve Móvil, Cl@ve PIN, certificado digital o DNI electrónico.'],
  ['Rellena el teléfono móvil y, si quieres, el correo electrónico', ''],
  ['En “Finalidad”, selecciona “Trabajo y/o contacto habitual con menores”', 'Si te lo piden, puedes indicar también el país al que se destina.'],
  ['Deja sin marcar la apostilla y pulsa “Siguiente”', 'La apostilla solo hace falta para presentarlo en el extranjero.'],
  ['Si ya habías pedido uno antes y te sirve, puedes descargarlo directamente', ''],
  ['Revisa los datos y pulsa “Confirmar”', ''],
  ['Pulsa “Descargar certificado”', 'Se descarga un PDF con firma electrónica.'],
  ['Súbelo aquí, en esta misma tarjeta', 'Vale el PDF tal cual lo descargas; no hace falta imprimirlo.']
];
function certSteps() {
  return `<details class="cert-steps" ${S.certOpen ? 'open' : ''}><summary>${ic('file', 18)}<span><b>Cómo pedirlo, paso a paso</b><span class="hint"> · unos 5 minutos</span></span></summary>
    <ol>${CERT_PASOS.map(([t, d]) => `<li><b>${esc(t)}</b>${d ? `<span>${esc(d)}</span>` : ''}</li>`).join('')}</ol>
    <div class="actions"><a class="btn primary sm" href="${CERT_URL}" target="_blank" rel="noopener">${ic('ext', 16)}Ir a la sede del Ministerio</a>${D.config.guiaCert ? `<button class="btn ghost sm" data-act="guia-cert">${ic('file', 16)}Ver la guía con capturas (PDF)</button>` : ''}</div></details>`;
}
async function abrirGuia() {
  if (DEMO) return toast('En la demostración no está disponible la guía');
  const w = window.open('', '_blank');
  $('busy').hidden = false;
  try {
    const r = await api('guiaCertificado');
    const bin = atob(r.base64), arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
    if (w) w.location.href = url; else { const a = document.createElement('a'); a.href = url; a.download = r.nombre; a.click(); }
  } catch (e) { if (w) w.close(); toast(e.message); } finally { $('busy').hidden = true; }
}
function vHoras() {
  const ents = [...new Set(misEnts().concat(D.mio.horas.map(h => h.entidad)))], ref = D.config.horasReferencia;
  return header('Asistencia', 'Tus horas', 'Las registra tu coordinación después de cada sesión. Si ves algún error, escríbele.') +
    (ents.length ? `<div class="grid g2">${ents.map(id => { const e = E(id), h = horasPor(id); return `<div class="card" style="--c:${cvar(e.color)}">${chip(id)}<b class="tnum" style="font-family:var(--display);font-size:2.2rem;line-height:1">${nf(h)} h</b><div class="bar"><i style="width:${Math.min(100, h / ref * 100)}%"></i></div></div>`; }).join('')}</div>` : '') +
    `<div class="card"><h2>Sesiones</h2>${D.mio.horas.length ? `<div class="list">${D.mio.horas.map(l => `<div class="row"><span class="tnum muted" style="width:92px">${fmt(l.fecha)}</span><div class="grow">${chip(l.entidad)}</div><b class="tnum">${nf(l.horas)} h</b></div>`).join('')}</div>` : '<p class="muted small">Todavía no hay sesiones registradas.</p>'}</div>`;
}

/* --- coordinación --- */
function centSel() {
  const ids = caps().coordIds;
  if (!S.cent || !ids.includes(S.cent)) { S.cent = ids[0]; S.editInfo = false; S.welcome = null; }
  return ids.length > 1 ? `<div class="selector"><label for="centSel" class="small muted">Entidad</label><select id="centSel">${ids.map(id => `<option value="${esc(id)}" ${id === S.cent ? 'selected' : ''}>${esc(E(id).nombre)}</option>`).join('')}</select></div>` : '';
}
function vCinicio() {
  const sel = centSel(), e = E(S.cent), C = D.coord[S.cent], t = C.equipo;
  const pend = t.filter(p => p.cert !== 'ok' || p.comp !== 'ok');
  const nuevos = t.filter(p => p.nuevo);
  return header('Coordinación', esc(e.nombre), esc(e.horario), sel + `<button class="btn primary" data-go="asistencia">${ic('clock', 18)}Registrar sesión</button>`) +
    `<div class="kpis"><div class="kpi"><b class="tnum">${t.length}</b><span>voluntarios · ${e.cupo} plazas</span></div>
    <div class="kpi ${pend.length ? 'alert' : ''}"><b class="tnum">${pend.length}</b><span>con documentación incompleta</span></div>
    <div class="kpi"><b class="tnum">${nf(sum(t, p => p.horas))} h</b><span>de servicio este curso</span></div></div>
  ${nuevos.length ? `<div class="card"><h2>Nuevas incorporaciones</h2><div class="list">${nuevos.map(n => `<div class="row"><div class="av" style="background:${cvar(e.color)}">${esc(initials(n.nombre))}</div><div class="grow"><b>${esc(n.nombre)}</b><span class="muted small">${esc(n.curso)} · ${esc(n.email)}</span></div>${S.welcome === n.email ? '' : `<button class="btn primary sm" data-welcome="${esc(n.email)}">${ic('mail', 16)}Escribir bienvenida</button>`}</div>${S.welcome === n.email ? welcomeComposer(n, e) : ''}`).join('')}</div></div>` : ''}
  <div class="grid g2">
    <div class="card"><h2>Documentación pendiente</h2>
      ${pend.length ? `<div class="list">${pend.map(p => `<div class="row"><div class="grow"><b>${esc(p.nombre)}</b><span class="small muted">${esc(p.curso)}</span></div><div class="chips">${p.cert !== 'ok' ? `<span class="pill ${DOC[p.cert][0]}">Certificado</span>` : ''}${p.comp !== 'ok' ? `<span class="pill ${DOC[p.comp][0]}">Compromiso</span>` : ''}</div></div>`).join('')}</div>
      <p class="hint">Pastoral valida los archivos. Tú puedes recordar a cada persona lo que le falta.</p>
      <button class="btn ghost sm" data-act="remind" style="justify-self:start">${ic('mail', 16)}Recordar por correo a quienes les falta algo</button>` : '<div class="empty">Todo el equipo está al día.</div>'}
    </div>
    <div class="card"><h2>Próximo en la agenda</h2>${proximas().length ? `<div class="list">${proximas().slice(0, 3).map(newsRow).join('')}</div>` : '<p class="muted small">No hay encuentros próximos publicados.</p>'}</div>
  </div>
  ${galeriaCard(S.cent)}`;
}
function appPill(p) {
  if (p.acceso) return '<span class="pill ok">Ha entrado</span>';
  if (p.invitacion === 'enviada') return '<span class="pill info">Invitación enviada</span>';
  if (p.invitacion === 'usada') return '<span class="pill ok">Activada</span>';
  return '<span class="pill warn">Sin invitar</span>';
}
function welcomeComposer(n, e) {
  const first = String(n.nombre || '').split(' ')[0];
  return `<div class="card" style="border-color:var(--brand);margin-bottom:12px">
    <h3>Bienvenida para ${esc(first)}</h3>
    <div class="field"><label for="wMsg">Tu presentación</label>
      <textarea id="wMsg" maxlength="1500" style="min-height:150px" placeholder="Preséntate en pocas líneas: quién eres, qué estudias, cuánto tiempo llevas en ${esc(e.nombre)} y qué te gustaría que viviera en este voluntariado.">${esc(S.wMsg || '')}</textarea>
      <span class="hint">Se envía con tu nombre. Lo que escribas va justo después del saludo “Hola, ${esc(first)}:”.</span></div>
    <button class="signout" data-act="w-ejemplo" style="justify-self:start">Empezar con un ejemplo</button>
    <div class="field"><label for="wWa">Enlace del grupo de WhatsApp</label><input type="text" id="wWa" value="${esc(S.wWa ?? e.whatsapp ?? '')}" placeholder="https://chat.whatsapp.com/…">
      <span class="hint">${e.whatsapp ? 'Es el enlace guardado para tu entidad.' : 'Es obligatorio: crea primero el grupo en WhatsApp y pega aquí su enlace de invitación.'} El enlace se guarda para el resto de coordinadores.</span></div>
    <div class="note small">${ic('mail', 18)}<span>Además de tu presentación, el correo incluye el horario y el lugar, la invitación al grupo de WhatsApp (es el único sitio donde el voluntariado recibe el enlace) y el recordatorio de subir el certificado y firmar el compromiso. Si te responden, la respuesta te llega a ti.</span></div>
    <div class="actions"><button class="btn primary" data-sendwelcome="${esc(n.email)}">${ic('mail', 18)}Enviar bienvenida</button><button class="btn ghost" data-act="w-cancel">Cancelar</button></div></div>`;
}
function vEquipo() {
  const sel = centSel(), e = E(S.cent), t = D.coord[S.cent].equipo, me = D.me.email;
  if (!S.isel || S.isel.ent !== S.cent) S.isel = { ent: S.cent, set: new Set() };
  const elegibles = t.filter(p => p.email !== me);
  const sinEntrar = elegibles.filter(p => !p.acceso);
  const n = S.isel.set.size;
  return header('Coordinación', 'Tu equipo', `${t.length} ${t.length === 1 ? 'persona sirve' : 'personas sirven'} en ${esc(e.nombre)}.`, sel + `<button class="btn ghost" data-act="copy-emails">${ic('mail', 18)}Copiar correos del equipo</button>`) +
    (t.length ? `<div class="card" style="gap:10px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div style="display:grid;gap:2px;min-width:0;flex:1 1 280px"><h2>Invitar a la app</h2><span class="muted small">Marca a quienes quieras invitar. Recibirán un correo con su código y el enlace para entrar.</span></div>
      <div class="actions">${sinEntrar.length ? `<button class="btn ghost sm" data-act="isel-pend">Marcar a quienes no han entrado (${sinEntrar.length})</button>` : ''}${n ? '<button class="btn ghost sm" data-act="isel-none">Quitar selección</button>' : ''}
      <button class="btn primary" data-act="send-vinv" ${n ? '' : 'disabled'}>${ic('mail', 18)}Enviar invitación${n ? ` (${n})` : ''}</button></div></div></div>
    <div class="table-wrap"><table><thead><tr><th style="width:44px"><span class="sr-only">Seleccionar</span></th><th>Voluntario/a</th><th>App</th><th>Curso</th><th>Contacto</th><th>También en</th><th>Certificado</th><th>Compromiso</th><th>Horas aquí</th></tr></thead><tbody>
    ${t.map((p, i) => `<tr><td>${p.email === me ? '' : `<input type="checkbox" id="is${i}" data-isel="${esc(p.email)}" ${S.isel.set.has(p.email) ? 'checked' : ''} aria-label="Seleccionar a ${esc(p.nombre)}" style="width:20px;height:20px;accent-color:var(--brand)">`}</td>
      <td><label for="is${i}"><b>${esc(p.nombre)}</b></label>${p.coordina ? ' <span class="pill info">Coordina</span>' : ''}</td><td>${p.email === me ? '<span class="hint">Tú</span>' : appPill(p)}</td><td class="muted">${esc(p.curso)}</td>
      <td class="small">${esc(p.email)}${p.telefono ? `<br><b>${esc(p.telefono)}</b>` : ''}${p.emergencia ? `<br><span class="hint">Emergencias: ${esc(p.emergencia)}</span>` : ''}</td><td><div class="chips">${p.otras.map(chip).join('') || '<span class="hint">—</span>'}</div></td><td>${pill(p.cert)}</td><td>${pill(p.comp)}</td><td class="tnum"><b>${nf(p.horas)} h</b></td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty">Aún no hay nadie asignado. Pastoral te avisará por correo cuando incorpore a alguien.</div>');
}
function vAsistencia() {
  const sel = centSel(), C = D.coord[S.cent], t = C.equipo;
  if (!S.att || S.att.ent !== S.cent) S.att = { ent: S.cent, date: todayISO(), h: 1, sel: new Set() };
  return header('Coordinación', 'Registrar una sesión', 'Marca quién vino y cuántas horas duró. Cada persona verá sus horas al momento.', sel) +
    `<div class="grid g2"><div class="card">
    <div class="form-grid"><div class="field"><label for="attDate">Fecha</label><input type="date" id="attDate" value="${S.att.date}" max="${todayISO()}"></div>
      <div class="field"><span style="font-weight:600;font-size:.88rem">Duración</span><div class="stepper"><button data-act="h-" aria-label="Menos tiempo">−</button><span class="tnum" id="attH">${nf(S.att.h)} h</span><button data-act="h+" aria-label="Más tiempo">+</button></div></div></div>
    ${t.length ? `<div class="list">${t.map((p, i) => `<label class="row check" for="a${i}"><input type="checkbox" id="a${i}" data-att="${esc(p.email)}" ${S.att.sel.has(p.email) ? 'checked' : ''}><span class="grow"><b>${esc(p.nombre)}</b><span class="small muted">${esc(p.curso)}</span></span></label>`).join('')}</div>
    <div class="actions"><button class="btn primary" data-act="save-att">${ic('check', 18)}Guardar sesión</button>${(() => { const n = confirmadosEn(S.att.date).length; return n ? `<button class="btn ghost" data-act="att-conf">Marcar a quienes confirmaron (${n})</button>` : ''; })()}<button class="btn ghost" data-act="all-att">Marcar a todos</button></div>` : '<div class="empty">No hay nadie en el equipo todavía.</div>'}
  </div>
  <div class="card"><h2>Sesiones registradas</h2>${C.sesiones.length ? `<div class="list">${C.sesiones.slice(0, 30).map(l => `<div class="row"><span class="tnum" style="width:70px">${fmt(l.fecha)}</span><div class="grow small muted">${esc(l.personas.join(', '))}</div><b class="tnum">${l.personas.length} × ${nf(l.horas)} h</b>
    ${S.delSes === l.sesion ? `<span class="actions"><button class="btn danger sm" data-delses="${esc(l.sesion)}">Borrar</button><button class="btn ghost sm" data-act="cancel-delses">No</button></span>` : `<button class="btn ghost sm" data-askdelses="${esc(l.sesion)}" aria-label="Borrar sesión">Borrar</button>`}</div>`).join('')}</div>` : '<p class="muted small">Aún no has registrado ninguna sesión.</p>'}</div></div>`;
}

/* --- pastoral --- */
function avisoVersion() {
  if (DEMO || !D || !caps().isP || D.version === VERSION_API) return '';
  return `<div class="note" style="background:var(--warn-soft)">${ic('shield', 18)}<span><b>El script de Google está desactualizado.</b> Algunas funciones nuevas no responderán hasta que copies <b>apps-script/Code.gs</b> del repositorio en script.google.com y publiques una versión nueva (Implementar → Gestionar implementaciones → lápiz → Nueva versión).</span></div>`;
}
const TIPO_AVISO = { inscripcion: ['info', 'Inscripción'], solicitud: ['info', 'Solicitud'], documento: ['warn', 'Documento'], cuenta: ['warn', 'Cuenta nueva'], baja: ['bad', 'Baja'], ausencia: ['bad', 'Ausencia'] };
function haceTxt(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!(m >= 0)) return '';
  if (m < 1) return 'ahora'; if (m < 60) return 'hace ' + m + ' min'; const h = Math.round(m / 60); if (h < 24) return 'hace ' + h + ' h';
  const d = Math.round(h / 24); return d === 1 ? 'ayer' : 'hace ' + d + ' días';
}
function avisoRow(n) {
  const t = TIPO_AVISO[n.tipo] || ['info', 'Aviso'];
  return `<div class="row" style="${n.leida ? 'opacity:.7' : ''}">${n.leida ? '' : '<span aria-label="Sin leer" style="width:9px;height:9px;border-radius:50%;background:var(--brand);flex:none"></span>'}<span class="pill ${t[0]}">${t[1]}</span><div class="grow"><b>${esc(n.titulo)}</b><span class="muted small">${esc(n.detalle)}${n.detalle ? ' · ' : ''}${haceTxt(n.fecha)}</span></div><button class="btn ghost sm" data-aviso="${esc(n.id)}|${esc(n.vista || 'panel')}">Ver</button></div>`;
}
function vAvisos() {
  const L = D.pastoral.notificaciones || [], sin = L.filter(n => !n.leida), leidas = L.filter(n => n.leida);
  return header('Servicio de Pastoral', 'Avisos', 'Lo que pasa en el voluntariado, sin llenar vuestro correo. Revisadlos aquí: no se envía ningún correo de aviso.', sin.length ? `<button class="btn ghost" data-act="avisos-leidos">${ic('check', 18)}Marcar todos como leídos</button>` : '') +
    `<div class="card"><h2>Sin leer${sin.length ? ` · ${sin.length}` : ''}</h2>${sin.length ? `<div class="list">${sin.map(avisoRow).join('')}</div>` : '<div class="empty">Estáis al día.</div>'}</div>
    ${leidas.length ? `<details class="card"><summary style="cursor:pointer;font-weight:600">Leídos recientemente (${leidas.length})</summary><div class="list">${leidas.map(avisoRow).join('')}</div></details>` : ''}`;
}
function guiaCard() {
  const has = D.config.guiaCert;
  return `<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div style="display:grid;gap:4px;min-width:0;flex:1 1 300px"><h2>Guía del certificado de delitos sexuales</h2>
    <span class="muted small">${has ? 'Subida. El voluntariado la ve en Documentos, junto a los pasos para pedir el certificado.' : 'Sube el PDF con capturas para que el voluntariado pueda consultarlo en Documentos. Se guarda en vuestro Drive privado.'}</span></div>
    <div class="actions">${has ? `<button class="btn ghost sm" data-act="guia-cert">${ic('file', 16)}Ver</button>` : ''}<label class="file btn ${has ? 'ghost' : 'primary'} sm" for="guiaFile">${ic('upload', 16)}${has ? 'Sustituir' : 'Subir PDF'}<input type="file" id="guiaFile" accept="application/pdf"></label></div></div></div>`;
}
function reflStats() {
  const r = D.pastoral.reflexion; if (!r) return '';
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0, max = Math.max(1, ...r.semanas);
  return `<div class="card refl-stats"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline"><h2>¿Con qué me quedo? · reflexión</h2><span class="hint">Solo recuento: el contenido es privado</span></div>
    <div class="refl-grid"><div class="kpis">
      <div class="kpi"><b class="tnum">${r.total}</b><span>reflexiones en total</span></div>
      <div class="kpi"><b class="tnum">${r.semana}</b><span>esta semana</span></div>
      <div class="kpi"><b class="tnum">${r.personas}/${r.voluntarios}</b><span>personas que han reflexionado</span></div>
      <div class="kpi ${r.asistencias28 && pct(r.trasSesion28, r.asistencias28) < 30 ? 'alert' : ''}"><b class="tnum">${pct(r.trasSesion28, r.asistencias28)}%</b><span>de las asistencias de las últimas 4 semanas, con reflexión</span></div></div>
    <div><span class="small muted">Reflexiones por semana</span><div class="spark" role="img" aria-label="Reflexiones en las últimas seis semanas: ${r.semanas.join(', ')}">${r.semanas.map((v, i) => `<div><i style="height:${Math.max(4, v / max * 100)}%"></i><span class="tnum">${v}</span><small>${i === 5 ? 'esta' : '−' + (5 - i)}</small></div>`).join('')}</div></div></div>
    ${r.porEntidad.length ? `<div class="chips"><span class="small muted">Por entidad:</span>${r.porEntidad.map(x => `<span class="chip" style="--c:${cvar(E(x.id).color)}">${esc(E(x.id).nombre)} · ${x.n}</span>`).join('')}</div>` : ''}</div>`;
}
function vPanel() {
  const P = D.pastoral.personas, act = P.filter(p => p.estado === 'activo' && p.asignaciones.some(a => a.estado === 'activa'));
  const inc = act.filter(p => p.docs.cert.estado !== 'ok' || p.docs.comp.estado !== 'ok').length;
  const multi = act.filter(p => p.asignaciones.filter(a => a.estado === 'activa').length > 1).length;
  const nIns = D.pastoral.inscripciones.filter(i => i.estado === 'nueva').length;
  const pp = pendientesPastoral();
  return header('Servicio de Pastoral', 'Panel del Voluntariado Arrupe', 'Lo que necesita una mirada vuestra hoy.', `${DEMO ? '' : `<button class="btn primary" data-demo="coord">${ic('users', 18)}Ver demostración</button>`}${D.pastoral.hojaUrl ? `<a class="btn ghost" href="${safeUrl(D.pastoral.hojaUrl)}" target="_blank" rel="noopener">${ic('ext', 18)}Hoja de datos</a>` : ''}${D.pastoral.carpetaUrl ? `<a class="btn ghost" href="${safeUrl(D.pastoral.carpetaUrl)}" target="_blank" rel="noopener">${ic('lock', 18)}Carpeta de documentos</a>` : ''}${D.pastoral.multimediaUrl ? `<a class="btn ghost" href="${safeUrl(D.pastoral.multimediaUrl)}" target="_blank" rel="noopener">${ic('camera', 18)}Fotos y vídeos</a>` : ''}`) +
    `<div class="kpis"><div class="kpi ${nIns ? 'alert' : ''}"><b class="tnum">${nIns}</b><span>inscripciones por preseleccionar</span></div>
   <div class="kpi"><b class="tnum">${act.length}</b><span>personas sirviendo · ${multi} en varias</span></div>
   <div class="kpi ${inc ? 'alert' : ''}"><b class="tnum">${inc}</b><span>con documentación incompleta</span></div>
   <div class="kpi"><b class="tnum">${nf(sum(P, p => p.horas))} h</b><span>de servicio registradas</span></div></div>
  ${(() => { const sin = (D.pastoral.notificaciones || []).filter(n => !n.leida); return sin.length ? `<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>Avisos sin leer · ${sin.length}</h2><button class="btn ghost sm" data-go="avisos">Ver todos</button></div><div class="list">${sin.slice(0, 4).map(avisoRow).join('')}</div></div>` : ''; })()}
  <div class="card"><h2>Pendiente de vosotros</h2>
    ${pp.total ? `<div class="list">
      ${pp.cuentas.map(p => `<div class="row"><span class="pill warn">Cuenta nueva</span><div class="grow"><b>${esc(p.nombre)}</b><span class="small muted">${esc(p.email)}</span></div><button class="btn primary sm" data-approve="${esc(p.email)}">Aprobar</button><button class="btn ghost sm" data-editp="${esc(p.email)}">Revisar</button></div>`).join('')}
      ${pp.solicitudes.map(s => `<div class="row"><span class="pill info">Solicitud</span><div class="grow"><b>${esc(s.p.nombre)}</b><span class="small muted">quiere servir en ${esc(E(s.ent).nombre)}</span></div><button class="btn primary sm" data-req="${esc(s.p.email)}|${esc(s.ent)}|1">Aceptar</button><button class="btn ghost sm" data-req="${esc(s.p.email)}|${esc(s.ent)}|0">Rechazar</button></div>`).join('')}
      ${pp.docs.map(x => `<div class="row"><span class="pill info">Documento</span><div class="grow"><b>${esc(x.p.nombre)}</b><span class="small muted">${esc(D.config.tiposDoc[x.t])}</span></div><button class="btn ghost sm" data-editp="${esc(x.p.email)}">Revisar</button></div>`).join('')}
    </div>` : '<div class="empty">Nada pendiente. Buen trabajo.</div>'}</div>
  ${reflStats()}
  ${guiaCard()}
  <div class="grid g2">
   <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2>Ocupación por entidad</h2><button class="btn ghost sm" data-go="entidades">Gestionar</button></div>
     <div class="list">${D.entidades.filter(e => e.activa).map(e => `<div class="row" style="--c:${cvar(e.color)}"><div class="grow" style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="display:inline">${esc(e.nombre)}</b><span class="tnum small muted">${e.ocupadas}/${e.cupo}</span></div><div class="bar"><i style="width:${e.cupo ? Math.min(100, e.ocupadas / e.cupo * 100) : 0}%"></i></div></div></div>`).join('')}</div></div>
   <div class="card"><span class="eyebrow">Lo que dijo el curso 2025-26 · 69 valoraciones</span>
     ${EVAL_2526.map(([l, v]) => `<div class="metric-row"><span class="small">${l}</span><b class="tnum" style="text-align:right">${v}%</b><div class="bar"><i style="width:${v}%;background:var(${v < 80 ? '--warn' : '--ok'})"></i></div></div>`).join('')}
     <p class="small muted">La formación y la parte pastoral son las que más margen tienen este curso.</p></div>
  </div>`;
}
function insOpciones(i) {
  const prefs = i.preferencias.slice(0, 3);
  if (!prefs.length) return D.entidades.filter(e => e.activa).map(e => ({ v: e.id, l: e.nombre }));
  const ops = prefs.map(id => ({ v: id, l: E(id).nombre + ' (' + E(id).ocupadas + '/' + E(id).cupo + ')' }));
  return prefs.length > 1 ? [{ v: prefs.join(','), l: 'Todas las que eligió: ' + prefs.map(id => E(id).nombre).join(' + ') }].concat(ops) : ops;
}
function insEnts(i) {
  if (!S.insEnts[i.id]) S.insEnts[i.id] = new Set(i.preferencias.slice(0, 3));
  return S.insEnts[i.id];
}
function insResumen(list, sel) {
  const all = D.pastoral.inscripciones;
  const pend = all.filter(i => i.estado === 'nueva' || i.estado === 'en_espera');
  const entsDe = i => (i.entidades && i.entidades.length) ? i.entidades : String(i.entidad || '').split(',').filter(Boolean);
  const nuevos = {};
  [...sel].forEach(id => { const i = list.find(x => x.id === id); if (i) [...insEnts(i)].forEach(e => nuevos[e] = (nuevos[e] || 0) + 1); });
  const rows = D.entidades.filter(e => e.activa).map(e => ({
    e, pend: pend.filter(i => i.preferencias.includes(e.id)).length, total: all.filter(i => i.preferencias.includes(e.id)).length,
    pre: all.filter(i => i.estado === 'asignada' && entsDe(i).includes(e.id)).length, add: nuevos[e.id] || 0
  })).sort((a, b) => b.pend - a.pend || b.total - a.total);
  const max = Math.max(1, ...rows.map(r => r.pend));
  return `<div class="card" style="gap:10px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline"><h2>Interés por entidad</h2><span class="hint">Ordenado por inscripciones pendientes que la eligieron</span></div>
  <div class="table-wrap" style="border:0"><table class="resumen" style="min-width:640px"><thead><tr><th>Entidad</th><th>Interesados pendientes</th><th>Preseleccionados</th><th>Plazas ocupadas</th></tr></thead><tbody>
  ${rows.map(r => { const libre = r.e.cupo - r.e.ocupadas, tras = r.e.ocupadas + r.add, pasa = r.add && tras > r.e.cupo; return `<tr style="--c:${cvar(r.e.color)}">
    <td><span class="chip" style="--c:${cvar(r.e.color)}">${esc(r.e.nombre)}</span></td>
    <td><div style="display:flex;align-items:center;gap:10px"><b class="tnum" style="min-width:22px">${r.pend}</b><div class="bar" style="flex:1;min-width:60px"><i style="width:${r.pend / max * 100}%"></i></div><span class="hint tnum" title="Total de inscripciones que la eligieron">${r.total} en total</span></div></td>
    <td class="tnum"><b>${r.pre}</b>${r.add ? ` <span class="pill info tnum">+${r.add} seleccionad${r.add === 1 ? 'a' : 'as'}</span>` : ''}</td>
    <td><div style="display:flex;align-items:center;gap:10px"><span class="tnum" style="min-width:52px"><b>${r.e.ocupadas}</b>/${r.e.cupo}</span><div class="bar" style="flex:1;min-width:60px;position:relative"><i style="width:${r.e.cupo ? Math.min(100, r.e.ocupadas / r.e.cupo * 100) : 0}%"></i>${r.add ? `<i style="position:absolute;top:0;left:${r.e.cupo ? Math.min(100, r.e.ocupadas / r.e.cupo * 100) : 0}%;width:${r.e.cupo ? Math.max(0, Math.min(100, tras / r.e.cupo * 100) - Math.min(100, r.e.ocupadas / r.e.cupo * 100)) : 0}%;opacity:.45"></i>` : ''}</div>
      <span class="small ${pasa ? '' : 'muted'}" style="${pasa ? 'color:var(--bad);font-weight:600' : ''}">${pasa ? 'se pasa del cupo' : libre > 0 ? `quedan ${libre}` : 'completa'}</span></div></td></tr>`; }).join('')}
  </tbody></table></div><p class="hint">Plazas ocupadas incluye a quienes ya sirven en la entidad, también la coordinación. La parte más clara de la barra es lo que sumaría tu selección actual.</p></div>`;
}
function vIns() {
  const all = D.pastoral.inscripciones;
  const F = [['nueva', 'Nuevas'], ['en_espera', 'En espera'], ['asignada', 'Asignadas'], ['descartada', 'Descartadas']];
  const enFiltro = all.filter(i => i.estado === S.insFilter);
  const list = (S.insFilter === 'nueva' || S.insFilter === 'en_espera') && S.insEnt ? enFiltro.filter(i => i.preferencias.includes(S.insEnt)) : enFiltro;
  const sel = S.insSel[S.insFilter] || (S.insSel[S.insFilter] = new Set());
  [...sel].forEach(id => { if (!list.some(i => i.id === id)) sel.delete(id); });
  const preselect = S.insFilter === 'nueva' || S.insFilter === 'en_espera';
  const asignadas = S.insFilter === 'asignada';
  const n = sel.size;
  const sinAvisar = asignadas ? list.filter(i => !i.avisado) : [];
  const bar = !enFiltro.length ? '' : preselect
    ? `<div class="card" style="gap:10px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div style="display:grid;gap:2px;min-width:0;flex:1 1 280px"><h2>Preselección</h2><span class="muted small">Revisa en cada inscripción las entidades marcadas y selecciona las que quieras preseleccionar. Si trabajáis a la vez, repartíos por entidades con el filtro. No se envía nada a la persona hasta que lo hagáis desde Asignadas.</span></div>
      <div class="actions"><select id="insEntF" aria-label="Mostrar inscripciones interesadas en" style="width:auto;min-height:36px;padding:5px 10px"><option value="">Todas las entidades</option>${D.entidades.filter(e => e.activa).map(e => `<option value="${esc(e.id)}" ${S.insEnt === e.id ? 'selected' : ''}>Solo interesados en ${esc(e.nombre)}</option>`).join('')}</select><button class="btn ghost sm" data-act="ins-all">${n === list.length ? 'Quitar selección' : `Seleccionar todas (${list.length})`}</button>
      <button class="btn primary" data-act="ins-pre" ${n ? '' : 'disabled'}>${ic('check', 18)}Preseleccionar${n ? ` (${n})` : ''}</button></div></div></div>`
    : asignadas ? `<div class="card" style="gap:10px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div style="display:grid;gap:2px;min-width:0;flex:1 1 280px"><h2>Correo de agradecimiento</h2><span class="muted small">Agradece la inscripción, confirma la preselección y anuncia que la coordinación se pondrá en contacto en breve.</span></div>
      <div class="actions">${sinAvisar.length ? `<button class="btn ghost sm" data-act="ins-sinavisar">Seleccionar las no avisadas (${sinAvisar.length})</button>` : ''}${n ? '<button class="btn ghost sm" data-act="ins-none">Quitar selección</button>' : ''}
      <button class="btn primary" data-act="ins-thanks" ${n ? '' : 'disabled'}>${ic('mail', 18)}Enviar correo${n ? ` (${n})` : ''}</button></div></div>
      ${S.thanksConfirm ? `<div class="confirm" style="background:var(--brand-soft)"><span>Vas a enviar ${n} ${n === 1 ? 'correo' : 'correos'}${[...sel].some(id => (list.find(i => i.id === id) || {}).avisado) ? ', y alguna persona ya lo había recibido' : ''}. ¿Seguimos?</span><button class="btn primary sm" data-act="ins-thanks-yes">Sí, enviar</button><button class="btn ghost sm" data-act="ins-thanks-no">Cancelar</button></div>` : ''}</div>`
    : '';
  return header('Servicio de Pastoral', 'Inscripciones', 'Llegan solas desde el formulario de Google y os avisamos por correo. Preseleccionad en bloque y, cuando queráis, enviad el correo de agradecimiento desde Asignadas.') +
    `<div class="filters" role="group" aria-label="Filtrar inscripciones">${F.map(([k, l]) => `<button data-insf="${k}" aria-pressed="${S.insFilter === k}">${l} · ${all.filter(i => i.estado === k).length}</button>`).join('')}</div>` + (preselect ? insResumen(list, sel) : '') + bar +
    (list.length ? `<div class="grid">${list.map(i => {
      const ie = (i.entidades && i.entidades.length) ? i.entidades : String(i.entidad || '').split(',').filter(Boolean);
      const st = i.estado === 'asignada' ? (i.avisado ? `<span class="pill ok">Correo enviado · ${fmt(i.avisado)}</span>` : '<span class="pill warn">Sin avisar</span>') : i.estado === 'nueva' ? '<span class="pill warn">Nueva</span>' : i.estado === 'en_espera' ? '<span class="pill info">En espera</span>' : '<span class="pill bad">Descartada</span>';
      const chk = (preselect || asignadas) ? `<input type="checkbox" data-inssel="${esc(i.id)}" ${sel.has(i.id) ? 'checked' : ''} aria-label="Seleccionar a ${esc(i.nombre)}" style="width:22px;height:22px;accent-color:var(--brand);margin-top:8px;flex:none">` : '';
      const es = preselect ? insEnts(i) : null;
      const prefiere = `<div class="chips"><span class="small muted">Prefiere:</span>${i.preferencias.length ? i.preferencias.map(chip).join('') : `<span class="small">${esc(i.preferenciasTexto || '—')}</span>`}</div>`;
      const opciones = i.preferencias.length ? i.preferencias.map(E) : D.entidades.filter(e => e.activa);
      const entsHtml = preselect ? prefiere + `<div style="display:grid;gap:6px"><span style="font-weight:600;font-size:.88rem">Preseleccionar para${i.preferencias.length ? '' : ' <span class="hint">(no se reconoció su preferencia; elige entidad)</span>'}${es.size ? '' : ' <b style="color:var(--warn);font-weight:600">· marca al menos una</b>'}</span>
          <div class="checks">${opciones.map(e => `<label style="${es.has(e.id) ? 'border-color:' + cvar(e.color) + ';background:color-mix(in srgb,' + cvar(e.color) + ' 10%,transparent)' : ''}"><input type="checkbox" data-insent="${esc(i.id)}|${esc(e.id)}" ${es.has(e.id) ? 'checked' : ''}>${esc(e.nombre)} <span class="hint tnum">${e.ocupadas}/${e.cupo}</span></label>`).join('')}</div></div>`
        : asignadas ? `<div class="chips"><span class="small muted">Preseleccionada para:</span>${ie.map(chip).join('')}</div>`
        : prefiere;
      const acciones = i.estado === 'asignada' ? '' : `<div class="actions">${i.estado !== 'en_espera' && i.estado !== 'descartada' ? `<button class="btn ghost sm" data-insst="${esc(i.id)}|en_espera">Dejar en espera</button>` : ''}${i.estado !== 'descartada' ? `<button class="btn ghost sm" data-insst="${esc(i.id)}|descartada">Descartar</button>` : `<button class="btn ghost sm" data-insst="${esc(i.id)}|nueva">Recuperar</button>`}</div>`;
      return `<div class="card" style="${sel.has(i.id) ? 'border-color:var(--brand)' : ''}"><div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">${chk}<div class="av" style="background:var(--brand)">${esc(initials(i.nombre))}</div><div style="flex:1 1 220px;min-width:0;display:grid;gap:2px"><h3>${esc(i.nombre || '(sin nombre)')}</h3><span class="small muted">${esc(i.curso)} · ${esc(i.email || 'sin correo')} · ${fmt(i.fecha)}</span></div>${st}</div>
        ${i.motivo ? `<p>“${esc(i.motivo)}”</p>` : ''}${entsHtml}${acciones}</div>`;
    }).join('')}</div>` : '<div class="empty">No hay inscripciones en este apartado.</div>');
}
function vPersonas() {
  const q = S.q.toLowerCase();
  const P = D.pastoral.personas.filter(p => !q || (p.nombre + ' ' + p.email + ' ' + p.asignaciones.map(a => E(a.entidad).nombre).join(' ')).toLowerCase().includes(q));
  return header('Servicio de Pastoral', 'Personas', 'Voluntariado, coordinación y Pastoral. Una persona puede servir en varias entidades; sus documentos se entregan una sola vez.', `<button class="btn primary" data-editp="__new">Añadir persona</button>`) +
    (S.editP ? editPersona() : '') +
    `<div class="field" style="max-width:420px"><label for="q">Buscar por nombre, correo o entidad</label><input type="search" id="q" value="${esc(S.q)}" placeholder="Ej.: Escuela Hogar"></div>
  <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Perfil</th><th>Voluntariados</th><th>Certificado</th><th>Compromiso</th><th>Horas</th></tr></thead><tbody>
  ${P.map(p => `<tr class="clickable" data-editp="${esc(p.email)}" tabindex="0"><td><b>${esc(p.nombre)}</b><br><span class="small muted">${esc(p.email)}</span></td><td>${p.estado !== 'activo' ? `<span class="pill ${p.estado === 'pendiente' ? 'warn' : 'bad'}">${p.estado}</span>` : `<span class="small">${{ pastoral: 'Pastoral', coord: 'Coordinación', vol: 'Voluntario/a' }[p.rol]}</span>`}</td><td><div class="chips">${p.asignaciones.map(a => a.estado === 'activa' ? chip(a.entidad) : `<span class="chip" style="--c:var(--fg-3)">${esc(E(a.entidad).nombre)} · solicitada</span>`).join('')}</div></td><td>${pill(p.docs.cert.estado)}</td><td>${pill(p.docs.comp.estado)}</td><td class="tnum"><b>${nf(p.horas)} h</b></td></tr>`).join('') || `<tr><td colspan="6"><div class="empty">Nadie coincide con “${esc(S.q)}”.</div></td></tr>`}
  </tbody></table></div>`;
}
function editPersona() {
  const isNew = S.editP === '__new';
  const p = isNew ? { email: '', nombre: '', curso: '', rol: 'vol', estado: 'activo', coordEnts: [], asignaciones: [], docs: { cert: { estado: 'pend' }, comp: { estado: 'pend' } } } : D.pastoral.personas.find(x => x.email === S.editP);
  if (!p) { S.editP = null; return ''; }
  const act = p.asignaciones.filter(a => a.estado === 'activa').map(a => a.entidad);
  const ents = D.entidades;
  const docRow = t => { const d = p.docs[t]; return `<div class="row"><div class="grow"><b>${esc(D.config.tiposDoc[t])}</b>${d.fecha ? `<span class="small muted">Subido el ${fmtLong(d.fecha)}</span>` : ''}</div>${pill(d.estado)}
    ${d.url ? (DEMO ? `<span class="btn ghost sm" aria-disabled="true" title="En la demostración no hay archivos">${ic('ext', 16)}Abrir archivo</span>` : `<a class="btn ghost sm" href="${safeUrl(d.url)}" target="_blank" rel="noopener">${ic('ext', 16)}Abrir archivo</a>`) : ''}
    ${d.url && d.estado !== 'ok' ? `<button class="btn primary sm" data-doc="${esc(p.email)}|${t}|1">Validar</button>` : ''}
    ${d.url && d.estado !== 'rech' ? (S.rejecting === t ? `<span class="actions"><input type="text" id="rej-${t}" placeholder="Motivo (le llegará por correo)" style="min-width:200px"><button class="btn danger sm" data-doc="${esc(p.email)}|${t}|0">Pedir que lo repita</button></span>` : `<button class="btn ghost sm" data-askrej="${t}">Rechazar</button>`) : ''}</div>`; };
  return `<div class="card" style="border-color:var(--brand)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>${isNew ? 'Nueva persona' : esc(p.nombre)}</h2><button class="btn ghost sm" data-act="close-editp">Cerrar</button></div>
    <div class="form-grid">
      <div class="field"><label for="pEmail">Correo de Google</label><input type="text" id="pEmail" value="${esc(p.email)}" ${isNew ? '' : 'readonly'} autocomplete="off"></div>
      <div class="field"><label for="pNombre">Nombre y apellidos</label><input type="text" id="pNombre" value="${esc(p.nombre)}"></div>
      <div class="field"><label for="pCurso">Curso</label><input type="text" id="pCurso" value="${esc(p.curso)}" placeholder="Ej.: 2.º Ed. Infantil"></div>
      <div class="field"><label for="pRol">Perfil</label><select id="pRol">${[['vol', 'Voluntario/a'], ['coord', 'Coordinación'], ['pastoral', 'Pastoral']].map(([v, l]) => `<option value="${v}" ${p.rol === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label for="pEstado">Estado de la cuenta</label><select id="pEstado">${[['activo', 'Activa'], ['pendiente', 'Pendiente de aprobar'], ['baja', 'De baja']].map(([v, l]) => `<option value="${v}" ${p.estado === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field wide"><span style="font-weight:600;font-size:.88rem">Sirve en</span><div class="checks">${ents.map(e => `<label><input type="checkbox" data-pasig="${esc(e.id)}" ${act.includes(e.id) ? 'checked' : ''}>${esc(e.nombre)}</label>`).join('')}</div></div>
      <div class="field wide"><span style="font-weight:600;font-size:.88rem">Coordina</span><div class="checks">${ents.map(e => `<label><input type="checkbox" data-pcoord="${esc(e.id)}" ${p.coordEnts.includes(e.id) ? 'checked' : ''}>${esc(e.nombre)}</label>`).join('')}</div><span class="hint">Quien coordina ve el equipo, registra asistencia y ve el estado (no el archivo) de la documentación de esa entidad.</span></div>
    </div>
    <div class="actions"><button class="btn primary" data-act="save-p">${ic('check', 18)}Guardar</button></div>
    ${isNew ? '' : `<div><span class="eyebrow">Contacto</span><div class="list">
      <div class="row"><div class="grow"><b>Teléfono</b><span class="muted small">${esc(p.telefono || '—')}</span></div><div class="grow"><b>Correo de contacto</b><span class="muted small">${esc(p.emailContacto || p.email)}</span></div><div class="grow"><b>Emergencias</b><span class="muted small">${esc(p.emergencia || '—')}</span></div></div>
      ${p.compromiso ? `<div class="row"><div class="grow"><b>Compromiso firmado</b><span class="muted small">El ${fmtLong(p.compromiso.fecha)} · documento ${esc(p.compromiso.dni)} · vigente hasta el ${fmtLong(p.compromiso.hasta)}${p.compromiso.actividades ? ' · ' + esc(p.compromiso.actividades) : ''}</span></div></div>` : ''}</div></div>`}
    ${isNew ? '' : `<div><span class="eyebrow">Documentación</span><div class="list">${Object.keys(D.config.tiposDoc).map(docRow).join('')}</div></div>`}
  </div>`;
}
const normTxt = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
function matchEnt(txt) {
  const n = normTxt(txt); if (!n) return '';
  const ents = D.entidades;
  let e = ents.find(x => normTxt(x.id) === n || normTxt(x.nombre) === n);
  if (!e) e = ents.find(x => (n.length >= 4 && normTxt(x.nombre).includes(n)) || n.includes(normTxt(x.nombre)));
  if (!e) e = ents.find(x => String(x.claves || '').split(',').map(normTxt).some(k => k.length >= 3 && n.includes(k)));
  return e ? e.id : '';
}
function parseInv(text) {
  const out = [];
  String(text || '').split(/\r?\n/).forEach(line => {
    const f = line.split(/\t|;|,/).map(s => s.trim()).filter(Boolean);
    const email = (f.find(x => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)) || '').toLowerCase();
    if (!email) return;
    let ent = '', nombre = '';
    f.filter(x => x.toLowerCase() !== email).forEach(x => { const m = matchEnt(x); if (m && !ent) ent = m; else if (!m && !nombre) nombre = x; });
    out.push({ email, nombre, ent });
  });
  return out;
}
function vInvitaciones() {
  const L = D.pastoral.invitaciones || [];
  const ents = D.entidades.filter(e => e.activa);
  const st = { enviada: ['info', 'Pendiente'], usada: ['ok', 'Activada'], anulada: ['bad', 'Anulada'] };
  const prev = S.inv;
  const listos = prev ? prev.filter(x => x.ent).length : 0;
  return header('Servicio de Pastoral', 'Invitaciones a coordinación', 'Pega los correos de los coordinadores con su entidad. Cada persona recibe un correo con su código y el enlace a la app. Si entra con ese mismo correo, se activa sola; si usa otra cuenta de Google, escribe el código.') +
  `<div class="card"><h2>${prev ? 'Revisa antes de enviar' : 'Nuevas invitaciones'}</h2>
    ${!prev ? `<div class="field"><label for="invText">Una línea por persona: correo, entidad y, si quieres, nombre</label>
      <textarea id="invText" style="min-height:160px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9rem" placeholder="ana.sanchez@cusafa.es, Síndrome de Down, Ana Sánchez&#10;pablo@cusafa.es; Residencia de Ancianos&#10;pablo@cusafa.es; Alzheimer">${esc(S.invText || '')}</textarea>
      <span class="hint">Puedes copiar y pegar directamente desde una hoja de cálculo. Si alguien coordina dos entidades, ponlo en dos líneas.</span></div>
      <div class="actions"><button class="btn primary" data-act="inv-parse">${ic('arrow', 18)}Revisar</button></div>`
    : `${prev.length ? `<div class="table-wrap"><table style="min-width:640px"><thead><tr><th>Correo</th><th>Nombre</th><th>Coordinará</th><th></th></tr></thead><tbody>
      ${prev.map((x, i) => `<tr><td class="small">${esc(x.email)}</td><td><input type="text" data-invnom="${i}" value="${esc(x.nombre)}" placeholder="Opcional"></td>
        <td><select data-invent="${i}" ${x.ent ? '' : 'style="border-color:var(--warn)"'}><option value="">— Elige entidad —</option>${ents.map(e => `<option value="${esc(e.id)}" ${x.ent === e.id ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select></td>
        <td><button class="btn ghost sm" data-invrm="${i}" aria-label="Quitar">Quitar</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No he encontrado ningún correo en lo que has pegado.</div>'}
      <div class="actions"><button class="btn primary" data-act="inv-send" ${prev.length && listos === prev.length ? '' : 'disabled'}>${ic('mail', 18)}Enviar ${prev.length} ${prev.length === 1 ? 'invitación' : 'invitaciones'}</button><button class="btn ghost" data-act="inv-back">Volver a editar</button>
      ${prev.length && listos < prev.length ? `<span class="hint">Falta elegir la entidad en ${prev.length - listos} ${prev.length - listos === 1 ? 'fila' : 'filas'}.</span>` : ''}</div>`}
  </div>
  <div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>Enviadas</h2><span class="small muted tnum">${L.filter(x => x.estado === 'usada').length} activadas · ${L.filter(x => x.estado === 'enviada').length} pendientes</span></div>
    ${L.length ? `<div class="table-wrap"><table><thead><tr><th>Persona</th><th>Para</th><th>Código</th><th>Estado</th><th></th></tr></thead><tbody>
    ${L.map(x => `<tr><td><b>${esc(x.nombre || x.email)}</b>${x.nombre ? `<br><span class="small muted">${esc(x.email)}</span>` : ''}</td><td><span class="hint">${x.rol === 'vol' ? 'Voluntariado en' : 'Coordina'}</span><div class="chips">${x.entidades.map(chip).join('')}</div></td>
      <td class="tnum" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700;letter-spacing:.06em">${esc(x.codigo)}</td>
      <td><span class="pill ${(st[x.estado] || st.enviada)[0]}">${(st[x.estado] || st.enviada)[1]}</span>${x.estado === 'usada' && x.usadoPor && x.usadoPor !== x.email ? `<br><span class="hint">con ${esc(x.usadoPor)}</span>` : ''}<br><span class="hint">${fmt(x.estado === 'usada' ? x.usadoEn : x.creado)}</span></td>
      <td>${x.estado === 'enviada' ? (S.anul === x.codigo ? `<span class="actions"><button class="btn danger sm" data-anul="${esc(x.codigo)}">Anular</button><button class="btn ghost sm" data-act="cancel-anul">No</button></span>` : `<span class="actions"><button class="btn ghost sm" data-reinv="${esc(x.codigo)}">Reenviar</button><button class="btn ghost sm" data-askanul="${esc(x.codigo)}">Anular</button></span>`) : ''}</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="muted small">Todavía no has enviado ninguna invitación.</p>'}
  </div>`;
}
function vEntidades() {
  return header('Servicio de Pastoral', 'Entidades', 'Lo que ve el alumnado en "Dónde servir", las plazas y quién coordina.', `<button class="btn primary" data-edite="__new">Añadir entidad</button>`) +
    (S.editE ? editEntidad() : '') +
    `<div class="grid g3">${D.entidades.map(e => { const P = D.pastoral.personas.filter(p => p.asignaciones.some(a => a.entidad === e.id && a.estado === 'activa')); const inc = P.filter(p => p.docs.cert.estado !== 'ok' || p.docs.comp.estado !== 'ok').length; return `<div class="card" style="--c:${cvar(e.color)};border-top:5px solid ${cvar(e.color)}"><h3>${esc(e.nombre)}${e.activa ? '' : ' <span class="pill bad">Oculta</span>'}</h3><span class="small muted">${esc(e.horario)}</span>
   <div><span class="eyebrow">Coordinan</span><div class="chips" style="margin-top:6px">${e.coordinadores.map(c => `<span class="chip" style="--c:${cvar(e.color)}">${esc(c)}</span>`).join('') || '<span class="hint">Sin coordinación asignada</span>'}</div></div>
   <div class="actions"><span class="pill info tnum">${e.ocupadas}/${e.cupo} plazas</span>${P.length ? (inc ? `<span class="pill warn tnum">${inc} con doc. pendiente</span>` : '<span class="pill ok">Documentación al día</span>') : ''}</div>
   <div class="actions"><button class="btn ghost sm" data-edite="${esc(e.id)}">Editar</button><button class="btn ghost sm" data-ent="${esc(e.id)}">Ver ficha</button></div></div>`; }).join('')}</div>`;
}
function editEntidad() {
  const isNew = S.editE === '__new';
  const e = isNew ? { id: '', nombre: '', lugar: '', etiqueta: '', color: 'blue', descripcion: '', horario: '', cupo: 8, ig: '', activa: true, claves: '' } : E(S.editE);
  return `<div class="card" style="border-color:var(--brand)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>${isNew ? 'Nueva entidad' : 'Editar ' + esc(e.nombre)}</h2><button class="btn ghost sm" data-act="close-edite">Cerrar</button></div>
    <div class="form-grid">
      <div class="field"><label for="eId">Identificador corto</label><input type="text" id="eId" value="${esc(e.id)}" ${isNew ? '' : 'readonly'} maxlength="12" placeholder="Ej.: comedor"><span class="hint">Solo letras y números. No se puede cambiar después.</span></div>
      <div class="field"><label for="eNombre">Nombre</label><input type="text" id="eNombre" value="${esc(e.nombre)}"></div>
      <div class="field"><label for="eLugar">Lugar</label><input type="text" id="eLugar" value="${esc(e.lugar)}"></div>
      <div class="field"><label for="eEtiqueta">Etiqueta</label><input type="text" id="eEtiqueta" value="${esc(e.etiqueta)}" placeholder="Infancia, Mayores…"></div>
      <div class="field"><label for="eCupo">Plazas</label><input type="text" inputmode="numeric" id="eCupo" value="${esc(e.cupo)}"></div>
      <div class="field"><label for="eColor">Color</label><select id="eColor">${COLORS.map(c => `<option value="${c}" ${e.color === c ? 'selected' : ''}>${{ orange: 'Naranja', magenta: 'Magenta', purple: 'Morado', brown: 'Marrón', blue: 'Azul', red: 'Rojo', grey: 'Gris', green: 'Verde', teal: 'Turquesa' }[c]}</option>`).join('')}</select></div>
      <div class="field wide"><label for="eDesc">Descripción</label><textarea id="eDesc">${esc(e.descripcion)}</textarea></div>
      <div class="field wide"><label for="eHorario">Horario</label><input type="text" id="eHorario" value="${esc(e.horario)}"></div>
      <div class="field wide"><label for="eIg">Enlace a la publicación de Instagram</label><input type="text" id="eIg" value="${esc(e.ig)}" placeholder="https://www.instagram.com/reel/…"></div>
      <div class="field wide"><label for="eWa">Enlace del grupo de WhatsApp</label><input type="text" id="eWa" value="${esc(e.whatsapp || '')}" placeholder="https://chat.whatsapp.com/…"></div>
      <div class="field wide"><label for="eClaves">Palabras que la identifican en el formulario</label><input type="text" id="eClaves" value="${esc(e.claves || '')}" placeholder="separadas por comas"><span class="hint">Sirven para reconocer la preferencia que marcan en el formulario de inscripción.</span></div>
      <label class="check wide" for="eActiva"><input type="checkbox" id="eActiva" ${e.activa ? 'checked' : ''}>Visible para el alumnado</label>
    </div>
    <div class="actions"><button class="btn primary" data-act="save-e">${ic('check', 18)}Guardar entidad</button></div></div>`;
}
function vNoticias() {
  const canPost = caps().isP;
  const up = proximas(), past = D.noticias.filter(n => n.fecha < todayISO()).reverse();
  const row = n => `<div class="row">${newsRow(n).replace(/^<div class="row">|<\/div>$/g, '')}${canPost ? (S.delN === n.id ? `<span class="actions"><button class="btn danger sm" data-deln="${esc(n.id)}">Borrar</button><button class="btn ghost sm" data-act="cancel-deln">No</button></span>` : `<span class="actions"><button class="btn ghost sm" data-editn="${esc(n.id)}">Editar</button><button class="btn ghost sm" data-askdeln="${esc(n.id)}">Borrar</button></span>`) : ''}</div>`;
  return header('Comunidad', 'Noticias y encuentros', 'Lo que nos reúne a todo el voluntariado a lo largo del curso.', canPost ? `<button class="btn primary" data-editn="__new">Publicar aviso</button>` : '') +
    (S.editN ? editNoticia() : '') +
    `<div class="card"><h2>Próximamente</h2>${up.length ? `<div class="list">${up.map(row).join('')}</div>` : '<p class="muted small">No hay nada publicado todavía.</p>'}</div>
    ${past.length ? `<details class="card"><summary style="cursor:pointer;font-weight:600">Ya celebrado (${past.length})</summary><div class="list">${past.map(row).join('')}</div></details>` : ''}
    <div class="card examen"><span class="eyebrow">Pedro Arrupe, SJ</span><p class="quote">Hombres y mujeres para los demás.</p><p class="muted small">El voluntariado lleva su nombre porque nació de esa intuición: servir no es dar lo que sobra, sino ponerse al lado.</p></div>`;
}
function editNoticia() {
  const isNew = S.editN === '__new';
  const n = isNew ? { fecha: todayISO(), titulo: '', detalle: '', tipo: 'Encuentro' } : D.noticias.find(x => x.id === S.editN);
  if (!n) { S.editN = null; return ''; }
  return `<div class="card" style="border-color:var(--brand)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>${isNew ? 'Nuevo aviso' : 'Editar aviso'}</h2><button class="btn ghost sm" data-act="close-editn">Cerrar</button></div>
    <div class="form-grid"><div class="field"><label for="nFecha">Fecha</label><input type="date" id="nFecha" value="${esc(n.fecha)}"></div>
    <div class="field"><label for="nTipo">Tipo</label><select id="nTipo">${['Encuentro', 'Formación', 'Oración', 'Aviso'].map(t => `<option ${n.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="field wide"><label for="nTitulo">Título</label><input type="text" id="nTitulo" value="${esc(n.titulo)}"></div>
    <div class="field wide"><label for="nDetalle">Lugar, hora o detalle</label><input type="text" id="nDetalle" value="${esc(n.detalle)}"></div></div>
    <div class="actions"><button class="btn primary" data-act="save-n">${ic('check', 18)}Publicar</button></div></div>`;
}

/* --- horarios --- */
const DIAS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const dow = iso => ((new Date(iso + 'T12:00:00Z').getUTCDay() + 6) % 7) + 1;
function nextDow(d) { let x = todayISO(); for (let i = 0; i < 7; i++) { const iso = new Date(new Date(x + 'T12:00:00Z').getTime() + i * 86400000).toISOString().slice(0, 10); if (dow(iso) === d) return iso; } return x; }
function gcal(t, ent) {
  const date = t.tipo === 'fecha' ? t.fecha : (t.fecha && t.tipo !== 'fecha' ? t.fecha : nextDow(t.dia));
  const ymd = date.replace(/-/g, ''), hm = s => String(s || '00:00').replace(':', '') + '00';
  const u = new URLSearchParams({ action: 'TEMPLATE', text: 'Voluntariado · ' + ent.nombre, dates: ymd + 'T' + hm(t.inicio) + '/' + ymd + 'T' + hm(t.fin), ctz: 'Europe/Madrid', location: t.lugar || ent.lugar || '', details: 'Voluntariado Arrupe · Servicio de Pastoral CUSAFA' + (t.nota ? '\n' + t.nota : '') + '\n' + location.origin + location.pathname });
  if (t.tipo === 'semanal') u.set('recur', 'RRULE:FREQ=WEEKLY;UNTIL=' + String(D.config.finCurso || '2027-06-30').replace(/-/g, '') + 'T235959Z');
  return 'https://calendar.google.com/calendar/render?' + u.toString();
}
const turnoTxt = t => t.tipo === 'semanal' ? `Cada ${DIAS[t.dia]} · ${esc(t.inicio)}–${esc(t.fin)}` : `${fmtLong(t.fecha)} · ${esc(t.inicio)}–${esc(t.fin)}`;
const calBtn = (t, ent) => `<a class="btn ghost sm" href="${esc(gcal(t, ent))}" target="_blank" rel="noopener">${ic('calendar', 16)}Añadir a Google Calendar</a>`;
function respPill(r) { return r === 'sí' ? '<span class="pill ok">Confirma</span>' : r === 'no' ? '<span class="pill bad">No puede</span>' : '<span class="pill" style="background:var(--surface-2);color:var(--fg-3)">Sin respuesta</span>'; }
/* --- reflexión: ¿con qué me quedo hoy? --- */
const PREG = [
  ['¿Qué momento de hoy se te ha quedado dentro?', '¿Qué te ha costado o te ha removido?', '¿Qué te llevas para la maestra o el maestro que serás?'],
  ['¿Qué cara o qué gesto recuerdas de hoy?', '¿Dónde te has sentido más tú?', '¿Qué te gustaría hacer distinto la próxima vez?'],
  ['¿Qué has recibido hoy sin esperarlo?', '¿Qué te ha pesado?', '¿Qué quieres cuidar en la próxima sesión?']
];
const pregDe = key => PREG[Math.abs(String(key || 'x').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)) % PREG.length];
const cuando = f => f === todayISO() ? 'Hoy' : f === new Date(Date.now() - 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10) ? 'Ayer' : fmtLong(f).replace(/^./, c => c.toUpperCase());
function reflCard() {
  const pend = (D.mio.sinReflexion || [])[0], n = D.mio.reflexionTotal || D.mio.reflexiones.length;
  if (pend) { const e = E(pend.entidad); return `<div class="card refl-hero" style="--c:${cvar(e.color)}"><span class="eyebrow">${cuando(pend.fecha)} estuviste en ${esc(e.nombre)}</span>
    <p class="quote">¿Con qué te quedas?</p><p class="muted">Dos minutos para mirar lo vivido antes de que el día lo tape todo. Solo lo lees tú.</p>
    <button class="btn primary" data-reflses="${esc(pend.sesion)}" style="justify-self:start">${ic('feather', 18)}Escribir con qué me quedo</button></div>`; }
  return `<div class="card refl-hero"><span class="eyebrow">Para mirar lo vivido</span><p class="quote">¿Con qué me quedo hoy?</p>
    <p class="muted">${n ? `Llevas ${n} ${n === 1 ? 'reflexión guardada' : 'reflexiones guardadas'}. ` : ''}Un momento, una cara, una dificultad. Solo lo lees tú.</p>
    <button class="btn ghost" data-go="reflexion" style="justify-self:start">${ic('feather', 18)}Abrir mi cuaderno</button></div>`;
}
function vReflexion() {
  const pend = D.mio.sinReflexion || [], R = D.mio.reflexiones || [];
  if (S.rses === undefined) S.rses = pend[0] ? pend[0].sesion : '';
  const sel = pend.find(p => p.sesion === S.rses), q = pregDe(S.rses || todayISO());
  const tras = R.filter(r => r.sesion).length, asist = D.mio.sesionesAsistidas || 0;
  return header('Mi cuaderno', '¿Con qué me quedo hoy?', 'Un espacio para mirar lo vivido en el voluntariado. Lo que escribes aquí es solo tuyo: nadie más puede leerlo, tampoco Pastoral.') +
  `<div class="grid g2" style="align-items:start"><div class="card refl-write" style="--c:${sel ? cvar(E(sel.entidad).color) : 'var(--brand)'}">
    ${pend.length ? `<div style="display:grid;gap:8px"><span class="small muted">¿Sobre qué sesión?</span><div class="filters" role="group" aria-label="Sesión">${pend.slice(0, 4).map(p => `<button data-rsel="${esc(p.sesion)}" aria-pressed="${S.rses === p.sesion}">${esc(E(p.entidad).nombre)} · ${cuando(p.fecha).toLowerCase()}</button>`).join('')}<button data-rsel="" aria-pressed="${!S.rses}">Sin sesión concreta</button></div></div>` : ''}
    <ol class="preg">${q.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <div class="field"><label for="refl">Con qué me quedo</label><textarea id="refl" maxlength="3000" style="min-height:170px" placeholder="Escribe sin pensar demasiado. No hay respuestas correctas.">${esc(S.rtxt || '')}</textarea></div>
    <div class="field"><label for="reflW">Una palabra que me llevo en el bolsillo (opcional)</label><input type="text" id="reflW" maxlength="40" value="${esc(S.rword || '')}" placeholder="Ej.: paciencia" style="max-width:320px"></div>
    <button class="btn primary" data-act="save-refl" style="justify-self:start">${ic('check', 18)}Guardar para mí</button></div>
  <div class="grid" style="gap:18px"><div class="kpis"><div class="kpi"><b class="tnum">${D.mio.reflexionTotal || R.length}</b><span>reflexiones guardadas</span></div><div class="kpi"><b class="tnum">${tras}/${asist}</b><span>sesiones con reflexión</span></div></div>
    <div class="card"><h2>Mis palabras</h2>${R.some(r => r.palabra) ? `<div class="words">${R.filter(r => r.palabra).slice(0, 18).map((r, i) => `<span style="--c:${cvar(COLORS[i % 8])}">${esc(r.palabra)}</span>`).join('')}</div>` : '<p class="muted small">Aquí irán apareciendo las palabras que elijas.</p>'}</div>
    <div class="card"><h2>Lo que he ido guardando</h2>${R.length ? `<div class="grid" style="gap:12px">${R.slice(0, 12).map(r => `<div class="refl"><span class="hint">${fmtLong(r.fecha)}${r.entidad ? ' · ' + esc(E(r.entidad).nombre) : ''}${r.palabra ? ' · <b>' + esc(r.palabra) + '</b>' : ''}</span><p>${esc(r.texto)}</p></div>`).join('')}</div>` : '<p class="muted small">Todavía no has guardado nada. Tu primera reflexión aparecerá aquí.</p>'}</div></div></div>`;
}
function vHorario() {
  const ents = misEnts(), T = D.mio.turnos || [], P = D.mio.proximos || [];
  return header('Horario', 'Tu horario', 'Los turnos y encuentros que fija tu coordinación. El día antes te llega un recordatorio por correo para confirmar.') +
  `<div class="card"><h2>Próximos encuentros</h2>${P.length ? `<div class="list">${P.map(p => { const e = E(p.entidad), t = T.find(x => x.id === p.turno) || p; return `<div class="row" style="--c:${cvar(e.color)}"><div style="width:52px;text-align:center;flex:none"><b class="tnum" style="font-family:var(--display);font-size:1.15rem;display:block;line-height:1">${new Date(p.fecha + 'T12:00').getDate()}</b><span class="small muted">${new Date(p.fecha + 'T12:00').toLocaleDateString('es-ES', { month: 'short' })}</span></div>
      <div class="grow"><b>${esc(e.nombre)}</b><span class="muted small">${fmtLong(p.fecha)} · ${esc(p.inicio)}–${esc(p.fin)} · ${esc(p.lugar || e.lugar)}</span></div>
      <span class="actions"><button class="btn sm ${p.respuesta === 'sí' ? 'primary' : 'ghost'}" data-conf="${esc(p.turno)}|${p.fecha}|sí" aria-pressed="${p.respuesta === 'sí'}">Voy</button><button class="btn sm ${p.respuesta === 'no' ? 'danger' : 'ghost'}" data-conf="${esc(p.turno)}|${p.fecha}|no" aria-pressed="${p.respuesta === 'no'}">No podré ir</button></span></div>`; }).join('')}</div>`
    : '<p class="muted small">No tienes encuentros en las próximas dos semanas.</p>'}</div>
  <div class="grid g2">${ents.map(id => { const e = E(id), ts = T.filter(t => t.entidad === id); return `<div class="card" style="--c:${cvar(e.color)};border-top:5px solid ${cvar(e.color)}"><h2>${esc(e.nombre)}</h2><p class="muted small">${esc(e.horario)}</p>
    ${ts.length ? `<div class="list">${ts.map(t => `<div class="row"><div class="grow"><b>${turnoTxt(t)}</b><span class="muted small">${esc(t.lugar || e.lugar)}${t.nota ? ' · ' + esc(t.nota) : ''}</span></div>
      ${t.tipo === 'semanal' ? `<label class="check small" for="ap-${esc(t.id)}"><input type="checkbox" id="ap-${esc(t.id)}" data-apuntar="${esc(t.id)}" ${t.apuntado ? 'checked' : ''}>Es mi turno</label>` : ''}${calBtn(t, e)}</div>`).join('')}</div>
      ${ts.some(t => t.tipo === 'semanal') ? '<p class="hint">Marca los turnos semanales a los que vas. Si no marcas ninguno, te avisaremos de todos.</p>' : ''}`
      : '<p class="muted small">Tu coordinación aún no ha fijado los turnos. Te aparecerán aquí.</p>'}</div>`; }).join('') || '<div class="empty">Aún no tienes un voluntariado asignado.</div>'}</div>`;
}
function confirmadosEn(fecha) { const C = D.coord && D.coord[S.cent]; if (!C || !C.proximos) return []; return [...new Set(C.proximos.filter(p => p.fecha === fecha).flatMap(p => p.personas.filter(x => x.respuesta === 'sí').map(x => x.email)))]; }
function vChorario() {
  const sel = centSel(), e = E(S.cent), C = D.coord[S.cent], T = C.turnos || [];
  const f = S.tf || (S.tf = { tipo: 'semanal', dia: 1, fecha: todayISO(), inicio: '17:00', fin: '18:00', lugar: e.lugar, nota: '' });
  const info = S.editInfo ? `<div class="card" style="border-color:var(--brand)"><h2>Información de ${esc(e.nombre)}</h2>
      <div class="form-grid"><div class="field wide"><label for="iHor">Horario general</label><input type="text" id="iHor" value="${esc(e.horario)}"></div>
      <div class="field wide"><label for="iLug">Lugar</label><input type="text" id="iLug" value="${esc(e.lugar)}"></div>
      <div class="field wide"><label for="iDesc">Descripción para el alumnado</label><textarea id="iDesc">${esc(e.descripcion)}</textarea></div>
      <div class="field wide"><label for="iWa">Enlace del grupo de WhatsApp</label><input type="text" id="iWa" value="${esc(e.whatsapp || '')}" placeholder="https://chat.whatsapp.com/…"><span class="hint">Solo lo ven la coordinación y Pastoral. El voluntariado lo recibe únicamente en el correo de bienvenida.</span></div></div>
      <div class="actions"><button class="btn primary" data-act="save-info">${ic('check', 18)}Guardar</button><button class="btn ghost" data-act="cancel-info">Cancelar</button></div></div>`
    : `<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>Información de ${esc(e.nombre)}</h2><button class="btn ghost sm" data-act="edit-info">${ic('pen', 16)}Editar</button></div>
      <div class="list"><div class="row"><div class="grow"><b>Horario general</b><span class="muted small">${esc(e.horario)}</span></div></div>
      <div class="row"><div class="grow"><b>Lugar</b><span class="muted small">${esc(e.lugar)}</span></div></div>
      <div class="row"><div class="grow"><b>Grupo de WhatsApp</b><span class="muted small">${e.whatsapp ? `<a class="link" href="${safeUrl(e.whatsapp)}" target="_blank" rel="noopener">Abrir el grupo</a>` : 'Sin enlace todavía'}</span></div></div></div>
      <p class="hint">Esta información y los turnos son comunes a toda la coordinación de la entidad: lo que cambies lo ven el resto de coordinadores y tu equipo.${e.editadoPor ? ` Última edición: ${esc(e.editadoPor)}, ${fmt(e.editado)}.` : ''}</p></div>`;
  return header('Coordinación', 'Horarios', `Fija los turnos de ${esc(e.nombre)}. Cada persona recibe un recordatorio por correo el día antes, con botones para confirmar o avisar si no puede.`, sel) + info +
  `<div class="grid g2"><div class="card"><h2>Turnos y encuentros</h2>
    ${T.length ? `<div class="list">${T.map(t => `<div class="row"><div class="grow"><b>${turnoTxt(t)}</b><span class="muted small">${esc(t.lugar || e.lugar)}${t.nota ? ' · ' + esc(t.nota) : ''}${t.tipo === 'semanal' ? ' · ' + (t.apuntados.length ? 'van: ' + esc(t.apuntados.join(', ')) : 'nadie lo ha elegido aún: se avisa a todo el equipo') : ' · se avisa a todo el equipo'}</span></div>
      ${S.delT === t.id ? `<span class="actions"><button class="btn danger sm" data-delturno="${esc(t.id)}">Quitar</button><button class="btn ghost sm" data-act="cancel-delt">No</button></span>` : `<button class="btn ghost sm" data-askdelt="${esc(t.id)}">Quitar</button>`}</div>`).join('')}</div>` : '<p class="muted small">Todavía no hay turnos. Añade el primero.</p>'}
    <div style="border-top:1px solid var(--line);padding-top:14px;display:grid;gap:12px"><h3>Añadir</h3>
      <div class="filters" role="group" aria-label="Tipo"><button data-tftipo="semanal" aria-pressed="${f.tipo === 'semanal'}">Cada semana</button><button data-tftipo="fecha" aria-pressed="${f.tipo === 'fecha'}">Una fecha concreta</button></div>
      <div class="form-grid">
        ${f.tipo === 'semanal' ? `<div class="field"><label for="tfDia">Día</label><select id="tfDia">${DIAS.slice(1).map((d, i) => `<option value="${i + 1}" ${Number(f.dia) === i + 1 ? 'selected' : ''}>${d[0].toUpperCase() + d.slice(1)}</option>`).join('')}</select></div>`
          : `<div class="field"><label for="tfFecha">Fecha</label><input type="date" id="tfFecha" value="${esc(f.fecha)}" min="${todayISO()}"></div>`}
        <div class="field"><label for="tfIni">Empieza</label><input type="time" id="tfIni" value="${esc(f.inicio)}"></div>
        <div class="field"><label for="tfFin">Termina</label><input type="time" id="tfFin" value="${esc(f.fin)}"></div>
        <div class="field wide"><label for="tfLugar">Lugar</label><input type="text" id="tfLugar" value="${esc(f.lugar)}"></div>
        <div class="field wide"><label for="tfNota">Nota para el equipo (opcional)</label><input type="text" id="tfNota" value="${esc(f.nota)}" placeholder="Ej.: traed ropa deportiva"></div>
      </div>
      <button class="btn primary" data-act="save-turno" style="justify-self:start">${ic('check', 18)}Añadir turno</button></div>
  </div>
  <div class="card"><h2>Próximos 14 días</h2>${(C.proximos || []).length ? `<div class="list">${C.proximos.map(p => `<div class="row" style="align-items:flex-start"><div class="grow"><b>${fmtLong(p.fecha)} · ${esc(p.inicio)}–${esc(p.fin)}</b>
      <div class="grid" style="gap:6px;margin-top:8px">${p.personas.map(x => `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span class="small">${esc(x.nombre)}</span>${respPill(x.respuesta)}</div>`).join('') || '<span class="hint">Nadie convocado</span>'}</div></div></div>`).join('')}</div>` : '<p class="muted small">No hay encuentros en las próximas dos semanas.</p>'}
    <p class="hint">Los recordatorios salen cada día a las 10:00 para los encuentros del día siguiente.</p></div></div>`;
}

/* --- compromiso --- */
function vCompromiso() {
  const me = D.me, c = D.mio.compromiso, ents = misEnts().map(E);
  const fin = D.config.finCurso || '2027-06-30';
  const derechosVol = ['Recibir información, formación, orientación y apoyo, y los medios necesarios para sus funciones.', 'Ser respetado en sus derechos fundamentales, sin discriminación.', 'Participar de forma activa en la elaboración, ejecución y evaluación del programa.', 'Estar asegurado frente a accidentes y daños a terceros derivados de la acción voluntaria.', 'Recibir el reembolso de los gastos autorizados previamente.', 'Disponer de una acreditación como persona voluntaria.', 'Recibir reconocimiento por su contribución y un certificado de los servicios prestados.', 'Realizar la actividad en condiciones de seguridad e higiene.', 'Cesar en su condición de voluntario en los términos de este compromiso.'];
  const deberesVol = ['Cumplir los compromisos adquiridos, respetando los fines y normas de la entidad.', 'Guardar confidencialidad sobre la información y las personas que conozca.', 'Rechazar cualquier contraprestación material o económica.', 'Respetar los derechos de las personas atendidas y actuar de forma diligente y solidaria.', 'Seguir las instrucciones para el buen desarrollo de la actividad.', 'Usar debidamente las acreditaciones y cuidar los recursos materiales.', 'Observar las medidas de seguridad e higiene.'];
  const deberesEnt = ['Ofrecer información, formación, apoyo y los medios necesarios.', 'Favorecer la participación activa del voluntariado en la organización y evaluación.', 'Asegurar al voluntariado frente a accidentes y responsabilidad civil.', 'Abonar los gastos de dietas y transporte derivados de la actividad.', 'Facilitar una acreditación y expedir un certificado de participación.', 'Garantizar la actividad en condiciones de seguridad e higiene.'];
  const lst = arr => `<ul style="margin:6px 0 0;padding-left:20px;display:grid;gap:4px">${arr.map(x => `<li>${x}</li>`).join('')}</ul>`;
  const clausulas = `<details class="card" style="gap:10px"><summary style="cursor:pointer;font-weight:700">Derechos y obligaciones (léelos antes de firmar)</summary>
    <div class="small" style="display:grid;gap:14px"><div><b>IV. La persona voluntaria tiene derecho a:</b>${lst(derechosVol)}</div><div><b>Y se compromete a:</b>${lst(deberesVol)}</div>
    <div><b>V. La entidad se compromete a:</b>${lst(deberesEnt)}</div><div><b>VI. Extinción.</b> El compromiso termina por mutuo acuerdo o por voluntad de cualquiera de las partes, avisando con al menos 15 días de antelación.</div></div></details>`;
  const entsHtml = ents.length ? `<div class="list">${ents.map(e => `<div class="row" style="--c:${cvar(e.color)}">${chip(e.id)}<div class="grow"><span class="muted small">${esc(e.lugar)} · ${esc(e.horario)}</span></div></div>`).join('')}</div>` : '<p class="err">Aún no tienes ningún voluntariado asignado. Podrás firmar cuando Pastoral te asigne uno.</p>';
  if (c && !S.resign) return header('Documentación', 'Tu compromiso de voluntariado', 'Firmado en la app. Tienes una copia en tu correo.', `<button class="btn ghost" data-go="docs">← Documentos</button>`) +
    `<div class="card"><div class="list">
      <div class="row"><div class="grow"><b>Entre</b><span class="muted small">El centro SAFA-Úbeda (Fundación Escuelas Profesionales de la Sagrada Familia, CIF G23633266, Avda. de Cristo Rey, 25, Úbeda) y ${esc(c.nombre)}, con documento ${esc(c.dni)}.</span></div></div>
      <div class="row"><div class="grow"><b>Voluntariado en</b><div class="chips" style="margin-top:6px">${c.entidades.map(chip).join('')}</div></div></div>
      ${c.actividades ? `<div class="row"><div class="grow"><b>Actividades</b><span class="muted small">${esc(c.actividades)}</span></div></div>` : ''}
      <div class="row"><div class="grow"><b>Vigencia</b><span class="muted small">Del ${fmtLong(c.desde)} al ${fmtLong(c.hasta)}</span></div></div>
      <div class="row"><div class="grow"><b>Firma</b><span class="muted small">${esc(c.nombre)} · ${fmtLong(c.fecha)}</span></div></div></div>
      <p class="hint">Si te incorporas a otro voluntariado, vuelve a firmarlo para que lo incluya.</p>
      <button class="btn ghost" data-act="resign" style="justify-self:start">Volver a firmar</button></div>${clausulas}`;
  return header('Documentación', 'Compromiso de voluntariado', `Curso ${String(D.config.hoy || todayISO()).slice(0, 4)}-${fin.slice(0, 4)} · Se firma aquí mismo y te llega una copia por correo.`, `<button class="btn ghost" data-go="docs">← Documentos</button>`) +
  `<div class="card"><h2>Las partes</h2><p class="small"><b>De un lado,</b> el centro SAFA-Úbeda, de la Fundación Escuelas Profesionales de la Sagrada Familia (CIF G23633266), con sede en Avda. de Cristo Rey, 25, 23400 Úbeda, a través de su Servicio de Pastoral. <b>Y de otro,</b> la persona voluntaria:</p>
    <div class="form-grid">
      <div class="field"><label for="cNombre">Nombre y apellidos</label><input type="text" id="cNombre" value="${esc(S.cf.nombre ?? me.nombre)}" autocomplete="name"></div>
      <div class="field"><label for="cDni">DNI, NIE o pasaporte</label><input type="text" id="cDni" value="${esc(S.cf.dni ?? '')}" autocomplete="off" style="text-transform:uppercase"></div>
      <div class="field"><label for="cTel">Teléfono</label><input type="text" inputmode="tel" id="cTel" value="${esc(S.cf.telefono ?? me.telefono)}" autocomplete="tel"></div>
      <div class="field"><label for="cCurso">Grado y curso</label><input type="text" id="cCurso" value="${esc(S.cf.curso ?? me.curso)}" placeholder="Ej.: 2.º Ed. Infantil"></div>
      <div class="field wide"><label for="cEmail">Correo</label><input type="text" id="cEmail" value="${esc(me.email)}" readonly></div>
    </div></div>
  <div class="card"><h2>I y II. Objeto, lugar y horario</h2><p class="small">Colaborar como persona voluntaria en:</p>${entsHtml}
    <div class="field"><label for="cAct">Actividades concretas (opcional)</label><textarea id="cAct" placeholder="Ej.: apoyo en las tareas escolares y juego en el tiempo libre">${esc(S.cf.actividades ?? '')}</textarea></div></div>
  <div class="card"><h2>III. Duración</h2><p class="small">Desde hoy, ${fmtLong(todayISO())}, hasta el <b>${fmtLong(fin)}</b>.</p></div>
  ${clausulas}
  <div class="card"><h2>Aceptación y firma</h2>
    <div class="grid" style="gap:10px">
      ${[['derechos', 'He leído y acepto los derechos y obligaciones de la persona voluntaria y de la entidad.'], ['confidencialidad', 'Me comprometo a guardar confidencialidad sobre la información y las personas que conozca en el voluntariado.'], ['gratuidad', 'Entiendo que mi colaboración es voluntaria y que no recibiré contraprestación económica ni material.'], ['datos', 'Autorizo al Servicio de Pastoral a tratar mis datos para gestionar el voluntariado.']].map(([k, l]) => `<label class="check" for="ca-${k}" style="align-items:flex-start"><input type="checkbox" id="ca-${k}" data-cacepta="${k}" ${S.cf.acepta && S.cf.acepta[k] ? 'checked' : ''}><span class="small">${l}</span></label>`).join('')}
    </div>
    <div class="field"><label for="cFirma">Firma: escribe de nuevo tu nombre y apellidos</label><input type="text" id="cFirma" value="${esc(S.cf.firma ?? '')}" style="font-family:'Segoe Script','Bradley Hand',cursive;font-size:1.2rem"></div>
    <p class="hint">Escribir tu nombre equivale a tu firma. Quedará registrado con la fecha y la hora.</p>
    <button class="btn primary" data-act="sign-comp" style="justify-self:start" ${ents.length ? '' : 'disabled'}>${ic('pen', 18)}Firmar compromiso</button></div>`;
}

/* --- mis datos --- */
function vDatos() {
  const me = D.me;
  return header('Tu cuenta', 'Mis datos', 'Tus datos de contacto. Los ven el Servicio de Pastoral y la coordinación de tus voluntariados.') +
  `<div class="card"><div class="form-grid">
    <div class="field"><label for="mNombre">Nombre y apellidos</label><input type="text" id="mNombre" value="${esc(me.nombre)}" autocomplete="name"></div>
    <div class="field"><label for="mCurso">Grado y curso</label><input type="text" id="mCurso" value="${esc(me.curso)}" placeholder="Ej.: 2.º Ed. Infantil"></div>
    <div class="field"><label for="mTel">Teléfono móvil</label><input type="text" inputmode="tel" id="mTel" value="${esc(me.telefono)}" autocomplete="tel"></div>
    <div class="field"><label for="mEmail">Correo de la cuenta</label><input type="text" id="mEmail" value="${esc(me.email)}" readonly></div>
    <div class="field wide"><label for="mEmailC">Otro correo de contacto (opcional)</label><input type="text" id="mEmailC" value="${esc(me.emailContacto)}" placeholder="Si prefieres que te escriban a otra dirección"></div>
    <div class="field"><label for="mEmN">Contacto de emergencia</label><input type="text" id="mEmN" value="${esc(me.emergenciaNombre)}" placeholder="Nombre y parentesco"></div>
    <div class="field"><label for="mEmT">Teléfono de emergencia</label><input type="text" inputmode="tel" id="mEmT" value="${esc(me.emergenciaTelefono)}"></div>
    <label class="check wide" for="mAvisos"><input type="checkbox" id="mAvisos" ${me.avisos ? 'checked' : ''}>Quiero recibir el recordatorio por correo el día antes de cada encuentro</label>
    <label class="check wide" for="mAvisosR"><input type="checkbox" id="mAvisosR" ${me.avisosReflexion !== false ? 'checked' : ''}>Quiero recibir la invitación “¿Con qué te quedas?” después de cada sesión</label>
  </div><button class="btn primary" data-act="save-datos" style="justify-self:start">${ic('check', 18)}Guardar cambios</button></div>`;
}

/* --- fotos y vídeos --- */
function entsMedia() { const c = caps(); return [...new Set(misEnts().concat(c.coordIds))]; }
function vFotos() {
  const ents = entsMedia();
  if (!S.fent || !ents.includes(S.fent)) S.fent = ents[0];
  return header('Comunidad', 'Fotos y vídeos', 'Comparte momentos de tu voluntariado. Se guardan en una carpeta privada de Pastoral para usarlos después en las redes del centro.') +
  `<div class="note" style="background:var(--warn-soft)">${ic('shield', 18)}<span><b>Antes de hacer o subir una foto:</b> evita que aparezcan <b>menores reconocibles</b> (fotografía de espaldas, manos, objetos o planos lejanos) y pide permiso a cualquier persona adulta que salga. En residencias, centros de personas con discapacidad o en prisión, pregunta antes a la coordinación.</span></div>
  ${ents.length ? `<div class="card"><div class="form-grid">
    <div class="field"><label for="fEnt">Voluntariado</label><select id="fEnt">${ents.map(id => `<option value="${esc(id)}" ${id === S.fent ? 'selected' : ''}>${esc(E(id).nombre)}</option>`).join('')}</select></div>
    <div class="field"><label for="fDesc">Qué estabais haciendo (opcional)</label><input type="text" id="fDesc" maxlength="300" placeholder="Ej.: taller de manualidades de otoño"></div>
    <label class="check wide" for="fPermiso" style="align-items:flex-start"><input type="checkbox" id="fPermiso"><span class="small">Confirmo que no aparecen menores identificables y que las personas que salen han dado su permiso.</span></label>
  </div>
  <label class="file btn primary" for="fFiles" style="justify-self:start">${ic('upload', 18)}Elegir fotos o vídeos<input type="file" id="fFiles" accept="image/*,video/*" multiple></label>
  <span class="hint">Hasta 25 MB por archivo. ${S.upMsg ? '<b>' + esc(S.upMsg) + '</b>' : ''}</span>
  <p class="small muted">Has compartido ${D.mio.misSubidas || 0} ${D.mio.misSubidas === 1 ? 'archivo' : 'archivos'} este curso.${caps().isC ? ' La galería de tu entidad está en Mi entidad.' : ''}</p></div>`
  : '<div class="empty">Podrás compartir fotos cuando tengas un voluntariado asignado.</div>'}`;
}
function galeriaCard(ent) {
  const g = S.gal[ent];
  if (g === undefined) { S.gal[ent] = null; loadGal(ent); }
  const body = !g ? '<div class="boot" style="min-height:120px"><div class="spinner" role="status" aria-label="Cargando fotos"></div></div>'
    : g.error ? `<p class="err">${esc(g.error)}</p>`
    : g.items.length ? `<div class="gal">${g.items.map(m => `<figure class="gal-item">${m.thumb ? `<img src="${esc(m.thumb)}" alt="${esc(m.descripcion || 'Foto del voluntariado')}" loading="lazy">` : `<div class="gal-ph">${ic('camera', 28)}</div>`}${/^video/.test(m.mime) ? '<span class="gal-play" aria-label="Vídeo">▶</span>' : ''}
        <figcaption><span>${esc(m.autor)} · ${fmt(m.fecha)}</span>${m.descripcion ? `<span class="hint">${esc(m.descripcion)}</span>` : ''}
        ${S.delM === m.id ? `<span class="actions"><button class="btn danger sm" data-delmedia="${esc(m.id)}">Quitar</button><button class="btn ghost sm" data-act="cancel-delm">No</button></span>` : `<button class="signout" data-askdelm="${esc(m.id)}">Quitar</button>`}</figcaption></figure>`).join('')}</div>`
    : '<p class="muted small">Todavía no hay fotos ni vídeos de esta entidad.</p>';
  return `<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><h2>Fotos y vídeos</h2><button class="btn ghost sm" data-go="fotos">${ic('upload', 16)}Subir</button></div>${body}
    <p class="hint">Lo que suba tu equipo aparece aquí. Pastoral lo recoge para las redes del centro.</p></div>`;
}
async function loadGal(ent) {
  try { const r = await api('galeria', { entidad: ent }); S.gal[ent] = r; }
  catch (e) { S.gal[ent] = { error: e.message, items: [] }; }
  if (D && S.view === 'cinicio') render();
}
async function uploadMedia(files) {
  if (!$('fPermiso').checked) return toast('Marca la casilla sobre menores y permisos antes de subir');
  const ent = $('fEnt').value, desc = $('fDesc').value.trim();
  const list = [...files].filter(f => /^(image|video)\//.test(f.type));
  if (!list.length) return toast('Elige fotos o vídeos');
  $('busy').hidden = false;
  let ok = 0;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    S.upMsg = `Subiendo ${i + 1} de ${list.length}…`; render();
    if (f.size > 25 * 1024 * 1024) { toast(f.name + ' supera los 25 MB'); continue; }
    try {
      const b64 = await new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result).split(',')[1]); rd.onerror = rej; rd.readAsDataURL(f); });
      const r = await api('subirMultimedia', { entidad: ent, nombre: f.name, mime: f.type, base64: b64, descripcion: desc, permiso: true });
      D.mio.misSubidas = r.misSubidas; ok++;
    } catch (e) { toast(e.message); }
  }
  $('busy').hidden = true;
  delete S.gal[ent];
  S.upMsg = ok ? `${ok} ${ok === 1 ? 'archivo subido' : 'archivos subidos'}. ¡Gracias!` : '';
  render();
  if (ok) toast(S.upMsg + (DEMO ? ' (demostración: no se guarda nada)' : ''));
}

/* --- comunicados de Pastoral --- */
// Misma conversión que mdHtml_ en Code.gs: lo que ves en la vista previa es lo que llega.
function mdHtml(t, imgSrc) {
  const esc_ = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inl = s => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" style="color:#12679A;font-weight:600">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" style="color:#12679A">$2</a>');
  return esc_(t).replace(/\r/g, '').split(/\n{2,}/).map(b => {
    const img = b.trim().match(/^\[imagen:([a-z0-9]+)\]$/);
    if (img) return `<p style="margin:16px 0"><img src="${imgSrc(img[1])}" alt="" style="max-width:100%;border-radius:12px;display:block"></p>`;
    const lines = b.split('\n');
    if (lines.every(l => /^\s*[-•]\s+/.test(l))) return '<ul style="padding-left:20px;margin:0 0 14px">' + lines.map(l => '<li style="margin-bottom:4px">' + inl(l.replace(/^\s*[-•]\s+/, '')) + '</li>').join('') + '</ul>';
    return '<p>' + lines.map(inl).join('<br>') + '</p>';
  }).join('').replace(/<p>\s*\[imagen:([a-z0-9]+)\]\s*<\/p>/g, (m, id) => `<p style="margin:16px 0"><img src="${imgSrc(id)}" alt="" style="max-width:100%;border-radius:12px;display:block"></p>`);
}
function comDest(cm) {
  const P = (D.pastoral.personas || []).filter(p => p.estado === 'activo' && p.rol !== 'pastoral'), ents = cm.ents;
  return P.filter(p => {
    const coord = (p.coordEnts || []).some(e => !ents.length || ents.includes(e));
    const plaza = p.asignaciones.some(a => a.estado === 'activa' && (!ents.length || ents.includes(a.entidad)));
    return cm.destino === 'coord' ? coord : cm.destino === 'vol' ? plaza && !(p.coordEnts || []).length : coord || plaza;
  });
}
function comEmailHtml(cm, nombre) {
  const saludo = cm.saludo ? `<p>Hola, ${esc(String(nombre || '').split(' ')[0])}:</p>` : '';
  const boton = cm.boton ? `<p style="margin:24px 0"><a href="${location.origin + location.pathname}" style="background:#12679A;color:#fff;padding:11px 18px;border-radius:10px;text-decoration:none;font-weight:600">Abrir la app</a></p>` : '';
  const body = cm.texto.trim() ? mdHtml(cm.texto, id => (cm.imgs.find(x => x.id === id) || {}).url || '') : '<p style="color:#8195A9">Tu mensaje aparecerá aquí…</p>';
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>body{margin:0;padding:18px;background:#fff}a{pointer-events:none}</style></head><body><div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#152433;max-width:560px">
    <div style="height:6px;border-radius:6px;background:linear-gradient(90deg,#E58A00,#D9007A,#3A2A85,#8E5A32,#12679A,#D9312B,#55595D,#25995A)"></div>
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6E8193;margin-top:18px">Voluntariado Arrupe</p>
    ${saludo}${body}<p style="margin-bottom:0">Un abrazo,<br>El equipo de Pastoral</p>${boton}
    <p style="font-size:12px;color:#6E8193">Servicio de Pastoral · Centro Universitario Sagrada Familia · Úbeda</p></div></body></html>`;
}
const kb = n => n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
function vComunicados() {
  const cm = S.com, dest = comDest(cm), first = dest[0];
  const total = cm.imgs.concat(cm.files).reduce((a, f) => a + f.size, 0);
  const hist = D.pastoral.comunicados || [];
  const DEST = { todos: 'Todos', coord: 'Coordinación', vol: 'Voluntariado' };
  return header('Servicio de Pastoral', 'Comunicados', 'Escribe a todo el voluntariado, solo a la coordinación o solo a los voluntarios. A la derecha ves el correo tal y como llegará.') +
  `<div class="com-grid"><div class="card">
    <div style="display:grid;gap:8px"><span style="font-weight:650;font-size:.88rem">Para</span>
      <div class="filters" role="group" aria-label="Destinatarios">${Object.entries(DEST).map(([k, l]) => `<button data-comdest="${k}" aria-pressed="${cm.destino === k}">${l}</button>`).join('')}</div>
      <details class="com-ents" ${cm.ents.length ? 'open' : ''}><summary class="small">${cm.ents.length ? 'Solo de: ' + cm.ents.map(x => esc(E(x).nombre)).join(', ') : 'De todas las entidades'} <span class="hint">· cambiar</span></summary>
        <div class="checks" style="margin-top:8px">${D.entidades.filter(e => e.activa).map(e => `<label><input type="checkbox" data-coment="${esc(e.id)}" ${cm.ents.includes(e.id) ? 'checked' : ''}>${esc(e.nombre)}</label>`).join('')}</div></details>
      <span class="pill ${dest.length ? 'info' : 'warn'}" style="justify-self:start">${dest.length} ${dest.length === 1 ? 'persona' : 'personas'}</span></div>
    <div class="field"><label for="comAs">Asunto</label><input type="text" id="comAs" maxlength="160" value="${esc(cm.asunto)}" placeholder="Ej.: Encuentro de inicio del Voluntariado Arrupe"></div>
    <div class="field"><label for="comTx">Mensaje</label>
      <div class="toolbar" role="toolbar" aria-label="Formato">
        <button type="button" data-fmt="b" title="Negrita"><b>N</b></button><button type="button" data-fmt="i" title="Cursiva"><i>C</i></button>
        <button type="button" data-fmt="ul" title="Lista">• Lista</button><button type="button" data-fmt="a" title="Enlace">${ic('ext', 15)}Enlace</button>
        <label class="file" for="comImg" title="Insertar imagen">${ic('image', 15)}Imagen<input type="file" id="comImg" accept="image/png,image/jpeg,image/gif,image/webp" multiple></label>
        <label class="file" for="comFile" title="Adjuntar archivo">${ic('clip', 15)}Adjuntar<input type="file" id="comFile" multiple></label>
      </div>
      <textarea id="comTx" style="min-height:260px;border-top-left-radius:0;border-top-right-radius:0" placeholder="Escribe tu mensaje. Deja una línea en blanco entre párrafos.">${esc(cm.texto)}</textarea>
      <span class="hint">**negrita**, *cursiva*, líneas que empiezan por “- ” para listas, [texto](https://…) para enlaces. Las imágenes aparecen donde está su marca.</span></div>
    ${cm.imgs.length || cm.files.length ? `<div class="chips">${cm.imgs.map(f => `<span class="chip" style="--c:var(--e-blue)">${ic('image', 14)}${esc(f.name)} · ${kb(f.size)} <button class="x" data-comrm="img|${f.id}" aria-label="Quitar ${esc(f.name)}">×</button></span>`).join('')}${cm.files.map((f, i) => `<span class="chip" style="--c:var(--e-purple)">${ic('clip', 14)}${esc(f.name)} · ${kb(f.size)} <button class="x" data-comrm="file|${i}" aria-label="Quitar ${esc(f.name)}">×</button></span>`).join('')}</div>
      <span class="hint ${total > 20 * 1048576 ? 'err' : ''}">${kb(total)} de 20 MB</span>` : ''}
    <div class="checks"><label><input type="checkbox" id="comSal" ${cm.saludo ? 'checked' : ''}>Saludo personal (“Hola, nombre:”)</label><label><input type="checkbox" id="comBtn" ${cm.boton ? 'checked' : ''}>Botón “Abrir la app”</label></div>
    ${S.comConfirm ? `<div class="confirm" style="background:var(--brand-soft)"><span>Vas a enviar <b>${esc(cm.asunto)}</b> a <b>${dest.length} ${dest.length === 1 ? 'persona' : 'personas'}</b>. ¿Seguimos?</span><button class="btn primary sm" data-act="com-send-yes">Sí, enviar</button><button class="btn ghost sm" data-act="com-send-no">Cancelar</button></div>` : ''}
    <div class="actions"><button class="btn primary" data-act="com-send" ${dest.length ? '' : 'disabled'}>${ic('send', 18)}Enviar a ${dest.length} ${dest.length === 1 ? 'persona' : 'personas'}</button><button class="btn ghost" data-act="com-test">${ic('mail', 18)}Enviarme una prueba</button></div>
  </div>
  <div class="com-preview"><div class="card" style="padding:0;overflow:hidden">
    <div class="mail-head"><span class="eyebrow">Vista previa</span>
      <div><span>De</span><b>Voluntariado Arrupe · Pastoral CUSAFA</b></div><div><span>Para</span>${first ? esc(first.nombre) + (dest.length > 1 ? ` y ${dest.length - 1} más` : '') : '—'}</div>
      <div class="subj">${esc(cm.asunto) || '<span class="hint">Sin asunto</span>'}</div></div>
    <iframe id="comPrev" title="Vista previa del correo" sandbox="allow-same-origin" srcdoc="${esc(comEmailHtml(cm, first ? first.nombre : 'Lucía'))}"></iframe>
    ${cm.files.length ? `<div class="mail-att">${cm.files.map(f => `<span>${ic('clip', 14)}${esc(f.name)}</span>`).join('')}</div>` : ''}
  </div></div></div>
  ${hist.length ? `<div class="card"><h2>Enviados</h2><div class="list">${hist.map(h => `<div class="row"><span class="pill info">${DEST[h.destino] || 'Todos'}</span><div class="grow"><b>${esc(h.asunto)}</b><span class="muted small">${haceTxt(h.fecha)} · ${h.destinatarios} ${h.destinatarios === 1 ? 'persona' : 'personas'}${h.entidades.length ? ' · ' + h.entidades.map(x => esc(E(x).nombre)).join(', ') : ''}${h.adjuntos ? ' · ' + esc(h.adjuntos) : ''}</span></div></div>`).join('')}</div></div>` : ''}`;
}
function comPreview() {
  const f = $('comPrev'); if (!f) return;
  const dest = comDest(S.com), first = dest[0];
  f.srcdoc = comEmailHtml(S.com, first ? first.nombre : 'Lucía');
  const s = document.querySelector('.mail-head .subj'); if (s) s.innerHTML = esc(S.com.asunto) || '<span class="hint">Sin asunto</span>';
}
function comWrap(pre, post, ph) {
  const t = $('comTx'); if (!t) return;
  const a = t.selectionStart, b = t.selectionEnd, sel = t.value.slice(a, b) || ph;
  t.value = t.value.slice(0, a) + pre + sel + post + t.value.slice(b);
  t.focus(); t.setSelectionRange(a + pre.length, a + pre.length + sel.length);
  S.com.texto = t.value; comPreview();
}
function comInsert(txt) {
  const t = $('comTx'); const a = t ? t.selectionStart : S.com.texto.length;
  const v = S.com.texto; S.com.texto = v.slice(0, a) + txt + v.slice(a);
}
const readB64 = f => new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result)); rd.onerror = rej; rd.readAsDataURL(f); });
async function comSend(prueba) {
  const cm = S.com;
  cm.asunto = $('comAs').value.trim(); cm.texto = $('comTx').value;
  if (cm.asunto.length < 3) return toast('Escribe el asunto');
  if (cm.texto.trim().length < 5) return toast('Escribe el mensaje');
  const total = cm.imgs.concat(cm.files).reduce((a, f) => a + f.size, 0);
  if (total > 20 * 1048576) return toast('Entre imágenes y adjuntos se superan los 20 MB');
  const usadas = cm.imgs.filter(im => cm.texto.includes('[imagen:' + im.id + ']'));
  const data = { destino: cm.destino, entidades: cm.ents, asunto: cm.asunto, texto: cm.texto, saludo: cm.saludo, boton: cm.boton, prueba,
    imagenes: usadas.map(im => ({ id: im.id, mime: im.mime, base64: im.url.split(',')[1] })),
    adjuntos: await Promise.all(cm.files.map(async f => ({ nombre: f.name, mime: f.type || 'application/octet-stream', base64: (await readB64(f.file)).split(',')[1] }))) };
  const r = await run('enviarComunicado', data, r => prueba ? 'Prueba enviada a tu correo' : `Comunicado enviado a ${r && r.enviados} ${r && r.enviados === 1 ? 'persona' : 'personas'}`);
  if (r && !prueba) { S.com = { destino: cm.destino, ents: [], asunto: '', texto: '', saludo: true, boton: true, imgs: [], files: [] }; render.animate = true; render(); celebrate(); }
}

/* --- ayuda e incidencias --- */
const TIPO_INC = { error: ['bad', 'Algo no funciona'], sugerencia: ['info', 'Sugerencia'], duda: ['warn', 'Duda'] };
function incRow(x, admin) {
  const t = TIPO_INC[x.tipo] || TIPO_INC.error, open = S.incOpen === x.id;
  return `<div class="row" style="align-items:flex-start"><span class="pill ${x.estado === 'resuelta' ? 'ok' : 'warn'}">${x.estado === 'resuelta' ? 'Resuelta' : 'Abierta'}</span>
    <div class="grow"><b>${esc(x.asunto)}</b><span class="muted small">${t[1]} · ${admin ? esc(x.nombre) + ' · ' : ''}${haceTxt(x.fecha)} · ${esc(x.id)}</span>
    ${open ? `<p class="small" style="white-space:pre-wrap;margin-top:8px">${esc(x.descripcion)}</p>${x.pantalla ? `<span class="hint">Pantalla: ${esc(x.pantalla)}</span>` : ''}${x.adjunto ? `<a class="link small" href="${safeUrl(x.adjunto)}" target="_blank" rel="noopener">Ver captura</a>` : ''}
      ${x.respuesta ? `<div class="refl" style="margin-top:8px"><span class="hint">Respuesta de Pastoral</span><p class="small" style="white-space:pre-wrap">${esc(x.respuesta)}</p></div>` : ''}
      ${admin ? (x.estado === 'abierta' ? `<div class="field" style="margin-top:10px"><label for="incR-${esc(x.id)}">Respuesta (opcional, se le envía por correo)</label><textarea id="incR-${esc(x.id)}" placeholder="Gracias por avisar. Ya lo hemos corregido…"></textarea></div><div class="actions"><button class="btn primary sm" data-incres="${esc(x.id)}">${ic('check', 16)}Marcar como resuelta</button><a class="btn ghost sm" href="mailto:${esc(x.email)}">${ic('mail', 16)}${esc(x.email)}</a></div>` : `<button class="btn ghost sm" data-increopen="${esc(x.id)}" style="margin-top:8px">Reabrir</button>`) : ''}` : ''}</div>
    <button class="btn ghost sm" data-incopen="${esc(x.id)}" aria-expanded="${open}">${open ? 'Cerrar' : 'Ver'}</button></div>`;
}
function vSoporte() {
  const isP = caps().isP, mias = D.mio.incidencias || [], f = S.inc;
  const form = `<div class="card"><h2>Cuéntanos qué ha pasado</h2>
    <div class="filters" role="group" aria-label="Tipo de incidencia">${Object.entries(TIPO_INC).map(([k, v]) => `<button data-inctipo="${k}" aria-pressed="${f.tipo === k}">${v[1]}</button>`).join('')}</div>
    <div class="form-grid">
      <div class="field wide"><label for="incAs">Asunto</label><input type="text" id="incAs" maxlength="140" value="${esc(f.asunto)}" placeholder="${f.tipo === 'sugerencia' ? 'Ej.: Poder ver el horario en el móvil sin entrar' : f.tipo === 'duda' ? 'Ej.: ¿Cómo cambio de turno?' : 'Ej.: No puedo subir el certificado'}"></div>
      <div class="field wide"><label for="incDe">Descripción</label><textarea id="incDe" maxlength="4000" style="min-height:130px" placeholder="${f.tipo === 'error' ? 'Qué estabas haciendo, qué esperabas que pasara y qué ha pasado. Si salió algún mensaje, cópialo.' : 'Cuéntanoslo con el detalle que quieras.'}">${esc(f.desc)}</textarea></div>
      <div class="field wide"><span style="font-weight:600;font-size:.88rem">Captura de pantalla (opcional)</span>
        <label class="file btn ghost sm" for="incFile" style="justify-self:start">${ic('upload', 16)}${f.file ? esc(f.file.name) : 'Adjuntar imagen'}<input type="file" id="incFile" accept="image/png,image/jpeg,image/webp,image/heic"></label></div>
    </div>
    <p class="hint">Se envía al equipo de Pastoral junto con la pantalla en la que estás y tu navegador, para poder reproducirlo.</p>
    <button class="btn primary" data-act="inc-send" style="justify-self:start">${ic('mail', 18)}Enviar a la administración</button></div>`;
  if (isP) {
    const all = D.incidencias || [], abiertas = all.filter(x => x.estado === 'abierta'), res = all.filter(x => x.estado !== 'abierta');
    return header('Servicio de Pastoral', 'Incidencias', 'Lo que coordinación y voluntariado os envían desde la app. También os llega por correo; al responder aquí, la persona recibe vuestra respuesta.') +
      `<div class="card"><h2>Abiertas${abiertas.length ? ' · ' + abiertas.length : ''}</h2>${abiertas.length ? `<div class="list">${abiertas.map(x => incRow(x, true)).join('')}</div>` : '<div class="empty">No hay incidencias abiertas.</div>'}</div>
      ${res.length ? `<details class="card"><summary style="cursor:pointer;font-weight:600">Resueltas (${res.length})</summary><div class="list">${res.map(x => incRow(x, true)).join('')}</div></details>` : ''}`;
  }
  return header('Ayuda', 'Ayuda e incidencias', 'Si algo no funciona, tienes una duda o se te ocurre una mejora, escríbenos. Llega directamente al equipo de Pastoral.') +
    `<div class="grid g2" style="align-items:start">${form}
    <div class="card"><h2>Lo que has enviado</h2>${mias.length ? `<div class="list">${mias.map(x => incRow(x, false)).join('')}</div>` : '<p class="muted small">Todavía no has enviado ninguna incidencia.</p>'}
      <div class="note small">${ic('heart', 18)}<span>Gracias por ayudarnos a mejorar la app. Cada aviso nos sirve.</span></div></div></div>`;
}

/* ───────── render ───────── */
const VIEWS = { comunicados: vComunicados, reflexion: vReflexion, soporte: vSoporte, avisos: vAvisos, horario: vHorario, chorario: vChorario, compromiso: vCompromiso, datos: vDatos, fotos: vFotos, espera: vEspera, explorar: vExplorar, vinicio: vVinicio, docs: vDocs, horas: vHoras, cinicio: vCinicio, equipo: vEquipo, asistencia: vAsistencia, panel: vPanel, ins: vIns, personas: vPersonas, invitaciones: vInvitaciones, entidades: vEntidades, noticias: vNoticias };
function render() {
  const root = $('root');
  if (!D) {
    root.innerHTML = vLogin(); root.classList.add('enter'); render.animate = true;
    const host = $('gbtn');
    if (host && window.google && google.accounts) {
      try { google.accounts.id.renderButton(host, { theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'filled_black' : 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: 300 }); } catch (e) { }
    }
    return;
  }
  const n = nav();
  const extra = caps().isVol ? ['compromiso'] : [];
  if (!S.view || !(n.some(x => x[0] === S.view) || extra.includes(S.view))) {
    const h = (location.hash || '').slice(1);
    S.view = n.some(x => x[0] === h) ? h : n[0][0];
  }
  const y = window.scrollY, anim = render.animate !== false;
  root.innerHTML = shell(VIEWS[S.view]());
  root.classList.toggle('enter', anim);
  if (anim) { stagger(root); countUp(root); }
  render.animate = false;
  window.scrollTo(0, render.keepScroll ? y : 0);
  render.keepScroll = true;
}
function readTf() { const g = id => ($(id) || {}).value; const o = {}; if ($('tfDia')) o.dia = g('tfDia'); if ($('tfFecha')) o.fecha = g('tfFecha'); ['inicio:tfIni', 'fin:tfFin', 'lugar:tfLugar', 'nota:tfNota'].forEach(s => { const [k, id] = s.split(':'); if ($(id)) o[k] = $(id).value; }); return o; }
function readCf() { const g = id => $(id) ? $(id).value.trim() : undefined; const m = { nombre: 'cNombre', dni: 'cDni', telefono: 'cTel', curso: 'cCurso', actividades: 'cAct', firma: 'cFirma' }; Object.keys(m).forEach(k => { const v = g(m[k]); if (v !== undefined) S.cf[k] = k === 'dni' ? v.toUpperCase() : v; }); }
const NAV_LABEL = {};
function go(v) { render.animate = true; if (S.view !== 'soporte') S.prevView = S.view; S.view = v; S.ent = null; S.leaving = null; render.keepScroll = false; try { history.replaceState(null, '', '#' + v); } catch (e) { } render(); }

/* ───────── eventos ───────── */
const root = $('root');
root.addEventListener('pointerdown', ev => { run.x = ev.clientX; run.y = ev.clientY; }, true);
root.addEventListener('click', async ev => {
  const t = ev.target.closest('button,[data-ent],tr[data-editp]'); if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.demo) return startDemo(d.demo);
  if (d.go) return go(d.go);
  if (d.ent) { render.animate = true; S.view = 'explorar'; S.ent = d.ent; S.leaving = null; render.keepScroll = false; return render(); }
  if (d.insf) { render.animate = true; S.insFilter = d.insf; S.thanksConfirm = false; return render(); }
  if (d.insst) { const [id, estado] = d.insst.split('|'); return run('estadoInscripcion', { id, estado }, 'Inscripción actualizada'); }
  if (d.approve) { const p = D.pastoral.personas.find(x => x.email === d.approve); return run('guardarPersona', { email: p.email, nombre: p.nombre, curso: p.curso, rol: p.rol, estado: 'activo', coordEnts: p.coordEnts, asignaciones: p.asignaciones.filter(a => a.estado === 'activa').map(a => a.entidad) }, 'Cuenta aprobada'); }
  if (d.req) { const [email, entidad, ok] = d.req.split('|'); return run('resolverSolicitud', { email, entidad, aceptar: ok === '1' }, ok === '1' ? 'Solicitud aceptada. Le llega un correo.' : 'Solicitud rechazada'); }
  if (d.editp) { S.editP = d.editp; S.rejecting = null; if (S.view !== 'personas') { S.view = 'personas'; } render.keepScroll = false; return render(); }
  if (d.askrej) { S.rejecting = d.askrej; return render(); }
  if (d.doc) { const [email, tipo, ok] = d.doc.split('|'); const nota = ok === '0' ? (($('rej-' + tipo) || {}).value || '') : ''; S.rejecting = null; return run('revisarDocumento', { email, tipo, valido: ok === '1', nota }, ok === '1' ? 'Documento validado' : 'Se le ha pedido que lo repita'); }
  if (d.edite) { S.editE = d.edite; render.keepScroll = false; return render(); }
  if (d.editn) { S.editN = d.editn; render.keepScroll = false; return render(); }
  if (d.askdeln) { S.delN = d.askdeln; return render(); }
  if (d.deln) { S.delN = null; return run('borrarNoticia', { id: d.deln }, 'Aviso borrado'); }
  if (d.askdelses) { S.delSes = d.askdelses; return render(); }
  if (d.delses) { S.delSes = null; return run('borrarSesion', { sesion: d.delses }, 'Sesión borrada'); }
  if (d.invrm) { S.inv.splice(+d.invrm, 1); return render(); }
  if (d.reinv) return run('reenviarInvitacion', { codigo: d.reinv }, 'Invitación reenviada');
  if (d.askanul) { S.anul = d.askanul; return render(); }
  if (d.anul) { S.anul = null; return run('anularInvitacion', { codigo: d.anul }, 'Invitación anulada'); }
  if (d.aviso) {
    const [id, vista] = d.aviso.split('|');
    const n = (D.pastoral.notificaciones || []).find(x => x.id === id);
    if (n && !n.leida) { n.leida = true; api('marcarNotificaciones', { ids: [id] }).then(r => { if (r && r.me && !DEMO) D = r; }).catch(() => { }); }
    return go(VIEWS[vista] ? vista : 'panel');
  }
  if (d.comdest) { S.com.destino = d.comdest; S.comConfirm = false; return render(); }
  if (d.fmt) { const f = d.fmt; if (f === 'b') comWrap('**', '**', 'texto en negrita'); else if (f === 'i') comWrap('*', '*', 'texto en cursiva'); else if (f === 'ul') comWrap('\n\n- ', '\n- segundo punto\n\n', 'primer punto'); else comWrap('[', '](https://)', 'texto del enlace'); return; }
  if (d.comrm) { const [k, v] = d.comrm.split('|'); if (k === 'img') { S.com.imgs = S.com.imgs.filter(x => x.id !== v); S.com.texto = S.com.texto.replace(new RegExp('\\n?\\n?\\[imagen:' + v + '\\]\\n?\\n?'), '\n\n'); } else S.com.files.splice(+v, 1); return render(); }
  if (d.inctipo) { S.inc.tipo = d.inctipo; return render(); }
  if (d.incopen) { S.incOpen = S.incOpen === d.incopen ? null : d.incopen; return render(); }
  if (d.incres) { const r = ($('incR-' + d.incres) || {}).value || ''; return run('resolverIncidencia', { id: d.incres, respuesta: r.trim() }, r.trim() ? 'Resuelta. Le hemos enviado tu respuesta.' : 'Marcada como resuelta'); }
  if (d.increopen) return run('resolverIncidencia', { id: d.increopen, reabrir: true }, 'Incidencia reabierta');
  if (d.reflses) { S.rses = d.reflses; return go('reflexion'); }
  if (d.rsel !== undefined) { S.rtxt = ($('refl') || {}).value || S.rtxt; S.rword = ($('reflW') || {}).value || S.rword; S.rses = d.rsel; return render(); }
  if (d.conf) { const [turno, fecha, respuesta] = d.conf.split('|'); return run('confirmarAsistencia', { turno, fecha, respuesta }, respuesta === 'sí' ? '¡Gracias! Asistencia confirmada' : 'Hemos avisado a tu coordinación'); }
  if (d.tftipo) { S.tf = Object.assign(S.tf || {}, readTf(), { tipo: d.tftipo }); return render(); }
  if (d.askdelt) { S.delT = d.askdelt; return render(); }
  if (d.delturno) { S.delT = null; return run('borrarTurno', { id: d.delturno }, 'Turno quitado'); }
  if (d.askdelm) { S.delM = d.askdelm; return render(); }
  if (d.delmedia) { S.delM = null; $('busy').hidden = false; try { S.gal[S.cent] = await api('quitarMultimedia', { id: d.delmedia }); toast('Archivo quitado de la galería'); } catch (e) { toast(e.message); } $('busy').hidden = true; return render(); }
  if (d.welcome) { S.welcome = d.welcome; S.wMsg = ''; S.wWa = undefined; render(); setTimeout(() => { const t = $('wMsg'); if (t) t.focus(); }, 0); return; }
  if (d.sendwelcome) {
    const mensaje = $('wMsg').value.trim(), whatsapp = $('wWa').value.trim();
    if (mensaje.length < 20) return toast('Escribe una breve presentación (al menos un par de frases)');
    if (!whatsapp) return toast('Crea el grupo de WhatsApp y pega su enlace antes de enviar la bienvenida');
    if (!/^https:\/\/chat\.whatsapp\.com\//.test(whatsapp)) return toast('El enlace de WhatsApp debe empezar por https://chat.whatsapp.com/');
    const r = await run('darBienvenida', { entidad: S.cent, email: d.sendwelcome, mensaje, whatsapp }, 'Bienvenida enviada');
    if (r) { S.welcome = null; S.wMsg = ''; render(); }
    return;
  }
  switch (d.act) {
    case 'signout': if (DEMO) return exitDemo(); return signOut(false);
    case 'demo-exit': return exitDemo();
    case 'inv-parse': { S.invText = $('invText').value; S.inv = parseInv(S.invText); return render(); }
    case 'inv-back': S.inv = null; return render();
    case 'cancel-delt': S.delT = null; return render();
    case 'guia-cert': S.certOpen = true; return abrirGuia();
    case 'guia-up': return;
    case 'com-send': S.com.asunto = $('comAs').value.trim(); S.com.texto = $('comTx').value; if (S.com.asunto.length < 3) return toast('Escribe el asunto'); if (S.com.texto.trim().length < 5) return toast('Escribe el mensaje'); S.comConfirm = true; return render();
    case 'com-send-no': S.comConfirm = false; return render();
    case 'com-send-yes': S.comConfirm = false; render(); return comSend(false);
    case 'com-test': return comSend(true);
    case 'inc-send': {
      const f = S.inc; f.asunto = $('incAs').value.trim(); f.desc = $('incDe').value.trim();
      if (f.asunto.length < 4) return toast('Escribe un asunto breve');
      if (f.desc.length < 10) return toast('Cuéntanos un poco más qué ha pasado');
      const data = { tipo: f.tipo, asunto: f.asunto, descripcion: f.desc, pantalla: (NAV_LABEL[S.prevView] || S.prevView || ''), navegador: navigator.userAgent + ' · ' + innerWidth + '×' + innerHeight };
      if (f.file) {
        if (f.file.size > 6 * 1024 * 1024) return toast('La captura supera los 6 MB');
        data.mime = f.file.type; data.base64 = await new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result).split(',')[1]); rd.onerror = rej; rd.readAsDataURL(f.file); });
      }
      const r = await run('enviarIncidencia', data, r => 'Enviada' + (r && r.ticket ? ' (' + r.ticket + ')' : '') + '. ¡Gracias por avisarnos!');
      if (r) { S.inc = { tipo: 'error', asunto: '', desc: '', file: null }; render(); celebrate(); }
      return;
    }
    case 'avisos-leidos': return run('marcarNotificaciones', { todas: true }, 'Todos los avisos marcados como leídos');
    case 'w-cancel': S.welcome = null; return render();
    case 'w-ejemplo': {
      const e = E(S.cent), yo = D.me.nombre.split(' ')[0];
      S.wMsg = `Soy ${yo}, estudio ${D.me.curso || '…'} y este es mi … año en ${e.nombre}. Me alegra mucho que te sumes al equipo.\n\nAquí vas a encontrar … Lo que más me ha marcado de este voluntariado es …\n\nCualquier duda que tengas, escríbeme sin problema. ¡Nos vemos pronto!`;
      S.wWa = $('wWa') ? $('wWa').value : S.wWa; render(); return;
    }
    case 'edit-info': S.editInfo = true; return render();
    case 'cancel-info': S.editInfo = false; return render();
    case 'save-info': {
      const data = { entidad: S.cent, horario: $('iHor').value.trim(), lugar: $('iLug').value.trim(), descripcion: $('iDesc').value.trim(), whatsapp: $('iWa').value.trim() };
      if (data.whatsapp && !/^https:\/\/chat\.whatsapp\.com\//.test(data.whatsapp)) return toast('El enlace de WhatsApp debe empezar por https://chat.whatsapp.com/');
      const r = await run('guardarInfoEntidad', data, 'Información actualizada para toda la coordinación');
      if (r) { S.editInfo = false; render(); }
      return;
    }
    case 'isel-pend': D.coord[S.cent].equipo.filter(p => !p.acceso && p.email !== D.me.email).forEach(p => S.isel.set.add(p.email)); return render();
    case 'isel-none': S.isel.set.clear(); return render();
    case 'send-vinv': {
      const emails = [...S.isel.set]; if (!emails.length) return toast('Selecciona al menos a una persona');
      const r = await run('invitarVoluntarios', { entidad: S.cent, emails }, `${emails.length} ${emails.length === 1 ? 'invitación enviada' : 'invitaciones enviadas'}`);
      if (r) { S.isel.set.clear(); render(); }
      return;
    }
    case 'cancel-delm': S.delM = null; return render();
    case 'att-conf': confirmadosEn(S.att.date).forEach(e => S.att.sel.add(e)); return render();
    case 'resign': S.resign = true; S.cf = {}; return render();
    case 'save-turno': {
      const f = Object.assign(S.tf, readTf());
      const r = await run('guardarTurno', { entidad: S.cent, tipo: f.tipo, dia: Number(f.dia), fecha: f.fecha, inicio: f.inicio, fin: f.fin, lugar: f.lugar, nota: f.nota }, 'Turno añadido');
      if (r) { S.tf = null; render(); }
      return;
    }
    case 'save-datos': {
      const data = { nombre: $('mNombre').value.trim(), curso: $('mCurso').value.trim(), telefono: $('mTel').value.trim(), emailContacto: $('mEmailC').value.trim(), emergenciaNombre: $('mEmN').value.trim(), emergenciaTelefono: $('mEmT').value.trim(), avisos: $('mAvisos').checked, avisosReflexion: $('mAvisosR').checked };
      if (data.nombre.length < 3) return toast('Escribe tu nombre y apellidos');
      return run('guardarMisDatos', data, 'Datos guardados');
    }
    case 'sign-comp': {
      readCf();
      const cf = S.cf;
      if (!cf.dni) return toast('Escribe tu DNI, NIE o pasaporte');
      if (!['derechos', 'confidencialidad', 'gratuidad', 'datos'].every(k => cf.acepta && cf.acepta[k])) return toast('Marca las cuatro casillas para poder firmar');
      if (normTxt(cf.firma) !== normTxt(cf.nombre)) return toast('Escribe tu nombre exactamente igual que arriba para firmar');
      const r = await run('firmarCompromiso', cf, 'Compromiso firmado. Te hemos enviado una copia por correo.');
      if (r) { S.cf = {}; S.resign = false; render.keepScroll = false; render(); }
      return;
    }
    case 'cancel-anul': S.anul = null; return render();
    case 'inv-send': {
      const lista = S.inv.map(x => ({ email: x.email, nombre: x.nombre, entidades: [x.ent] }));
      const n = new Set(lista.map(x => x.email)).size;
      const r = await run('crearInvitaciones', { lista }, `${n} ${n === 1 ? 'invitación enviada' : 'invitaciones enviadas'}`);
      if (r) { S.inv = null; S.invText = ''; render(); }
      return;
    }
    case 'redeem': {
      const v = $('codeIn').value.trim(); if (!v) return toast('Escribe el código');
      S.codeErr = '';
      const r = await run('canjearCodigo', { codigo: v }, 'Invitación activada. Ya puedes coordinar tu voluntariado.');
      if (r) { clearCode(); S.view = null; render(); } else { S.codeErr = 'No se pudo activar. Revisa el código.'; render(); }
      return;
    }
    case 'back': S.ent = null; render.animate = true; return render();
    case 'join': return run('solicitarEntidad', { entidad: S.ent }, 'Solicitud enviada. Pastoral te responderá pronto.');
    case 'leave': S.leaving = S.ent; return render();
    case 'leave-no': S.leaving = null; return render();
    case 'leave-yes': { const ent = S.ent; S.leaving = null; return run('dejarEntidad', { entidad: ent }, 'Has dejado este voluntariado. Tu coordinación lo sabrá.'); }
    case 'save-refl': {
      const v = $('refl').value.trim(); if (!v) return toast('Escribe algo antes de guardar');
      const r = await run('guardarReflexion', { texto: v, palabra: ($('reflW') || {}).value || '', sesion: S.rses || '' }, 'Guardado en tu cuaderno. Solo lo lees tú.');
      if (r) { S.rtxt = ''; S.rword = ''; S.rses = undefined; render.animate = true; render(); }
      return;
    }
    case 'remind': return run('recordarDocumentos', { entidad: S.cent }, r => r && r.enviados ? `Recordatorio enviado a ${r.enviados} ${r.enviados === 1 ? 'persona' : 'personas'}` : 'No había nadie a quien recordar');
    case 'copy-emails': {
      const txt = D.coord[S.cent].equipo.map(p => p.email).join(', ');
      if (!txt) return toast('El equipo está vacío');
      try { await navigator.clipboard.writeText(txt); toast('Correos copiados. Pégalos en Para o CCO.'); } catch (e) { prompt('Copia los correos:', txt); }
      return;
    }
    case 'h-': S.att.h = Math.max(.5, S.att.h - .5); $('attH').textContent = nf(S.att.h) + ' h'; return;
    case 'h+': S.att.h = Math.min(12, S.att.h + .5); $('attH').textContent = nf(S.att.h) + ' h'; return;
    case 'all-att': D.coord[S.cent].equipo.forEach(p => S.att.sel.add(p.email)); return render();
    case 'save-att': {
      if (!S.att.sel.size) return toast('Marca al menos a una persona');
      const n = S.att.sel.size;
      const r = await run('registrarSesion', { entidad: S.cent, fecha: S.att.date, horas: S.att.h, emails: [...S.att.sel] }, `Sesión guardada: ${n} ${n === 1 ? 'persona' : 'personas'}`);
      if (r) { S.att.sel = new Set(); render(); }
      return;
    }
    case 'ins-all': { const list = D.pastoral.inscripciones.filter(i => i.estado === S.insFilter && (!S.insEnt || !(S.insFilter === 'nueva' || S.insFilter === 'en_espera') || i.preferencias.includes(S.insEnt))), sel = S.insSel[S.insFilter]; if (sel.size === list.length) sel.clear(); else list.forEach(i => sel.add(i.id)); return render(); }
    case 'ins-none': S.insSel[S.insFilter].clear(); S.thanksConfirm = false; return render();
    case 'ins-sinavisar': D.pastoral.inscripciones.filter(i => i.estado === 'asignada' && !i.avisado).forEach(i => S.insSel.asignada.add(i.id)); return render();
    case 'ins-pre': {
      const sel = [...S.insSel[S.insFilter]];
      const items = sel.map(id => ({ id, entidades: [...(S.insEnts[id] || [])] }));
      const sinEnt = items.filter(x => !x.entidades.length).length;
      if (sinEnt) return toast(sinEnt === 1 ? 'Hay una inscripción seleccionada sin entidad' : `Hay ${sinEnt} inscripciones seleccionadas sin entidad`);
      if (items.some(x => x.entidades.length > 3)) return toast('Como máximo tres entidades por persona');
      const r = await run('asignarInscripciones', { items }, r => { const n = r && r.hechas !== undefined ? r.hechas : items.length; return (n ? `${n} ${n === 1 ? 'persona preseleccionada' : 'personas preseleccionadas'}. ` : '') + (r && r.aviso ? r.aviso + '.' : 'Envía el correo de agradecimiento desde Asignadas cuando quieras.'); });
      if (r) { S.insSel[S.insFilter].clear(); render(); }
      return;
    }
    case 'ins-thanks': S.thanksConfirm = true; return render();
    case 'ins-thanks-no': S.thanksConfirm = false; return render();
    case 'ins-thanks-yes': {
      const ids = [...S.insSel.asignada]; S.thanksConfirm = false;
      const r = await run('enviarAgradecimiento', { ids }, `${ids.length} ${ids.length === 1 ? 'correo enviado' : 'correos enviados'}`);
      if (r) { S.insSel.asignada.clear(); render(); }
      return;
    }
    case 'cancel-deln': S.delN = null; return render();
    case 'cancel-delses': S.delSes = null; return render();
    case 'close-editp': S.editP = null; return render();
    case 'close-edite': S.editE = null; return render();
    case 'close-editn': S.editN = null; return render();
    case 'save-p': {
      const email = $('pEmail').value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Escribe un correo válido');
      const data = { email, nombre: $('pNombre').value.trim(), curso: $('pCurso').value.trim(), rol: $('pRol').value, estado: $('pEstado').value,
        asignaciones: [...root.querySelectorAll('[data-pasig]:checked')].map(x => x.dataset.pasig), coordEnts: [...root.querySelectorAll('[data-pcoord]:checked')].map(x => x.dataset.pcoord) };
      if (data.rol === 'coord' && !data.coordEnts.length) return toast('Marca qué entidad coordina');
      const r = await run('guardarPersona', data, 'Persona guardada');
      if (r) { S.editP = data.email; render(); }
      return;
    }
    case 'save-e': {
      const data = { id: $('eId').value, nombre: $('eNombre').value.trim(), lugar: $('eLugar').value.trim(), etiqueta: $('eEtiqueta').value.trim(), cupo: $('eCupo').value, color: $('eColor').value, descripcion: $('eDesc').value.trim(), horario: $('eHorario').value.trim(), ig: $('eIg').value.trim(), whatsapp: $('eWa').value.trim(), claves: $('eClaves').value.trim(), activa: $('eActiva').checked };
      if (data.ig && !/^https:\/\//.test(data.ig)) return toast('El enlace de Instagram debe empezar por https://');
      const r = await run('guardarEntidad', data, 'Entidad guardada');
      if (r) { S.editE = null; render(); }
      return;
    }
    case 'save-n': {
      const data = { id: S.editN === '__new' ? '' : S.editN, fecha: $('nFecha').value, tipo: $('nTipo').value, titulo: $('nTitulo').value.trim(), detalle: $('nDetalle').value.trim() };
      const r = await run('guardarNoticia', data, 'Aviso publicado');
      if (r) { S.editN = null; render(); }
      return;
    }
  }
});
root.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('tr[data-editp]')) ev.target.click(); });
root.addEventListener('change', async ev => {
  const t = ev.target;
  if (t.dataset.up && t.files.length) {
    const f = t.files[0];
    if (f.size > 10 * 1024 * 1024) return toast('El archivo supera los 10 MB');
    const mime = f.type || (/\.heic$/i.test(f.name) ? 'image/heic' : '');
    const rd = new FileReader();
    rd.onload = () => run('subirDocumento', { tipo: t.dataset.up, nombre: f.name, mime, base64: String(rd.result).split(',')[1] }, 'Archivo recibido. Pastoral lo revisará.');
    rd.onerror = () => toast('No se pudo leer el archivo');
    rd.readAsDataURL(f);
  }
  if (t.dataset.inssel) { const sel = S.insSel[S.insFilter]; t.checked ? sel.add(t.dataset.inssel) : sel.delete(t.dataset.inssel); S.thanksConfirm = false; render(); return; }
  if (t.id === 'comImg' && t.files.length) {
    for (const f of [...t.files]) { if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { toast(f.name + ': usa PNG, JPG, GIF o WEBP'); continue; } const id = 'img' + Math.random().toString(36).slice(2, 7); S.com.imgs.push({ id, name: f.name, size: f.size, mime: f.type, url: await readB64(f) }); comInsert('\n\n[imagen:' + id + ']\n\n'); }
    t.value = ''; return render();
  }
  if (t.id === 'comFile' && t.files.length) { [...t.files].forEach(f => S.com.files.push({ name: f.name, size: f.size, type: f.type, file: f })); t.value = ''; return render(); }
  if (t.dataset.coment) { const e = t.dataset.coment; S.com.ents = t.checked ? S.com.ents.concat(e) : S.com.ents.filter(x => x !== e); S.comConfirm = false; return render(); }
  if (t.id === 'comSal') { S.com.saludo = t.checked; return comPreview(); }
  if (t.id === 'comBtn') { S.com.boton = t.checked; return comPreview(); }
  if (t.id === 'guiaFile' && t.files.length) { const f = t.files[0]; if (f.type !== 'application/pdf') return toast('La guía debe ser un PDF'); const b = (await readB64(f)).split(',')[1]; return run('subirGuiaCertificado', { mime: f.type, base64: b }, 'Guía subida. Ya la puede abrir todo el voluntariado.'); }
  if (t.id === 'incFile') { S.inc.file = t.files[0] || null; S.inc.asunto = $('incAs').value; S.inc.desc = $('incDe').value; render(); return; }
  if (t.id === 'insEntF') { S.insEnt = t.value; S.insSel[S.insFilter] && S.insSel[S.insFilter].clear(); render(); return; }
  if (t.dataset.preent) { S.insEnts[t.dataset.preent] = new Set(t.value ? t.value.split(',') : []); S.insSel[S.insFilter] && S.insSel[S.insFilter].add(t.dataset.preent); render(); return; }
  if (t.dataset.insent) { const [id, ent] = t.dataset.insent.split('|'); const set = S.insEnts[id] || (S.insEnts[id] = new Set()); if (t.checked) { if (set.size >= 3) { t.checked = false; return toast('Como máximo tres entidades por persona'); } set.add(ent); } else set.delete(ent); const sl = S.insSel[S.insFilter]; if (sl) { if (set.size) sl.add(id); else sl.delete(id); } render(); return; }
  if (t.dataset.isel) { t.checked ? S.isel.set.add(t.dataset.isel) : S.isel.set.delete(t.dataset.isel); render(); return; }
  if (t.dataset.att) { t.checked ? S.att.sel.add(t.dataset.att) : S.att.sel.delete(t.dataset.att); }
  if (t.id === 'attDate') { S.att.date = t.value; render(); }
  if (t.dataset.apuntar) run('apuntarTurno', { turno: t.dataset.apuntar, apuntar: t.checked }, t.checked ? 'Turno marcado como tuyo' : 'Turno desmarcado');
  if (t.id === 'fFiles' && t.files.length) { uploadMedia(t.files); t.value = ''; }
  if (t.id === 'fEnt') S.fent = t.value;
  if (t.dataset.cacepta) { S.cf.acepta = S.cf.acepta || {}; S.cf.acepta[t.dataset.cacepta] = t.checked; }
  if (t.id === 'centSel') { S.cent = t.value; S.editInfo = false; S.welcome = null; render(); }
  if (t.dataset.invent) { S.inv[+t.dataset.invent].ent = t.value; render(); }
  if (t.dataset.invnom) { S.inv[+t.dataset.invnom].nombre = t.value; }
});
root.addEventListener('input', ev => {
  if (/^c(Nombre|Dni|Tel|Curso|Act|Firma)$/.test(ev.target.id)) readCf();
  if (ev.target.id === 'wMsg') S.wMsg = ev.target.value;
  if (ev.target.id === 'incAs') S.inc.asunto = ev.target.value;
  if (ev.target.id === 'comAs' || ev.target.id === 'comTx') { S.com[ev.target.id === 'comAs' ? 'asunto' : 'texto'] = ev.target.value; S.comConfirm = false; clearTimeout(comPreview.t); comPreview.t = setTimeout(comPreview, 160); }
  if (ev.target.id === 'refl') S.rtxt = ev.target.value;
  if (ev.target.id === 'reflW') S.rword = ev.target.value;
  if (ev.target.id === 'incDe') S.inc.desc = ev.target.value;
  if (ev.target.id === 'wWa') S.wWa = ev.target.value;
  if (ev.target.id === 'q') { S.q = ev.target.value; const pos = ev.target.selectionStart; render(); const q = $('q'); q.focus(); q.setSelectionRange(pos, pos); }
});
root.addEventListener('pointermove', ev => {
  const c = ev.target.closest && ev.target.closest('.ent'); if (!c || REDUCED() || ev.pointerType !== 'mouse') return;
  const b = c.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width - .5, py = (ev.clientY - b.top) / b.height - .5;
  c.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
});
root.addEventListener('pointerout', ev => { const c = ev.target.closest && ev.target.closest('.ent'); if (c && !c.contains(ev.relatedTarget)) { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } });
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (D && VIEWS[h] && h !== S.view) go(h); });

setInterval(async () => {
  if (!D || DEMO || !TOKEN || document.hidden || !['ins', 'panel', 'personas', 'invitaciones', 'avisos'].includes(S.view) || !$('busy').hidden) return;
  const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
  try { const r = await api('bootstrap'); if (r && r.me && !DEMO) { D = r; render(); } } catch (e) { }
}, 30000);
(() => { const d = document.createElement('div'); d.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="hilo" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#E58A00"/><stop offset=".15" stop-color="#D9007A"/><stop offset=".3" stop-color="#5B49B8"/><stop offset=".45" stop-color="#8E5A32"/><stop offset=".6" stop-color="#12679A"/><stop offset=".75" stop-color="#D9312B"/><stop offset=".88" stop-color="#55595D"/><stop offset="1" stop-color="#25995A"/></linearGradient></defs></svg>'; document.body.prepend(d.firstChild); })();
if (DEMO_START) startDemo(DEMO_START);
initGoogle();
})();
