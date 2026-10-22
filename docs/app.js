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
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
};
const ic = (n, s = 20) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => /^https:\/\//i.test(String(u || '')) ? esc(u) : '';
const $ = id => document.getElementById(id);
const COLORS = ['orange', 'magenta', 'purple', 'brown', 'blue', 'red', 'grey', 'green', 'teal'];
const cvar = c => `var(--e-${COLORS.includes(c) ? c : 'blue'})`;
const IG = 'https://www.instagram.com/unisafa/';

/* ───────── estado ───────── */
let TOKEN = null, D = null;
const S = { view: null, ent: null, leaving: null, cent: null, assigning: null, insFilter: 'nueva', q: '', editP: null, editE: null, editN: null, delN: null, delSes: null, rejecting: null, att: null, err: '' };
try { TOKEN = sessionStorage.getItem('arrupe-token'); } catch (e) { }

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
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3200); }
function jwtExp(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; } catch (e) { return 0; } }

/* ───────── API ───────── */
async function api(action, data) {
  if (!TOKEN || jwtExp(TOKEN) < Date.now() + 30000) { signOut(true); throw new Error('Tu sesión ha caducado. Vuelve a entrar.'); }
  let res;
  try {
    res = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: TOKEN, data }) });
  } catch (e) { throw new Error('No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.'); }
  let out;
  try { out = await res.json(); } catch (e) { throw new Error('El servidor ha respondido algo inesperado. Avisa a Pastoral.'); }
  if (!out.ok) { if (out.auth) { signOut(true, out.error); } throw new Error(out.error || 'Error desconocido'); }
  return out.data;
}
async function run(action, data, okMsg) {
  $('busy').hidden = false;
  try {
    const r = await api(action, data);
    if (r && r.me) D = r;
    if (okMsg) toast(typeof okMsg === 'function' ? okMsg(r) : okMsg);
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
  try { D = await api('bootstrap'); }
  catch (e) { S.err = e.message; D = null; if (TOKEN) { TOKEN = null; try { sessionStorage.removeItem('arrupe-token'); } catch (x) { } } }
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
  if (!window.google || !google.accounts) { if (tries < 60) return setTimeout(() => initGoogle(tries + 1), 150); S.err = 'No se pudo cargar el acceso de Google. Recarga la página.'; return render(); }
  google.accounts.id.initialize({ client_id: CFG.CLIENT_ID, callback: onCredential, auto_select: true, cancel_on_tap_outside: false, use_fedcm_for_prompt: true });
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
  if (c.pend) return [['espera', 'Tu cuenta', 'home'], ['explorar', 'Dónde servir', 'compass'], ['noticias', 'Noticias', 'bell']];
  const n = [];
  if (c.isP) n.push(['panel', 'Panel', 'chart'], ['ins', 'Inscripciones', 'inbox'], ['personas', 'Personas', 'users'], ['entidades', 'Entidades', 'building']);
  if (c.isC) n.push(['cinicio', 'Mi entidad', 'building'], ['equipo', 'Equipo', 'users'], ['asistencia', 'Asistencia', 'clock']);
  if (c.isVol) n.push(['vinicio', 'Mi voluntariado', 'home'], ['docs', 'Documentos', 'file'], ['horas', 'Mis horas', 'clock']);
  n.push(['explorar', 'Dónde servir', 'compass'], ['noticias', 'Noticias', 'bell']);
  return n;
}
function badge(k) {
  if (!D.pastoral) return 0;
  if (k === 'ins') return D.pastoral.inscripciones.filter(i => i.estado === 'nueva').length;
  if (k === 'panel') return pendientesPastoral().total;
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
  return `<main class="login"><div class="login-card">
    <div class="logo-wrap"><img src="${LOGO}" alt="Pastoral · Centro Universitario Sagrada Familia"></div>
    <div class="ribbon" aria-hidden="true">${COLORS.slice(0, 8).map(c => `<span style="background:${cvar(c)}"></span>`).join('')}</div>
    <div style="display:grid;gap:6px"><h1>Voluntariado Arrupe</h1><p class="muted">Libres para servir. Entra con tu cuenta de Google para ver tu voluntariado, tu documentación y tus horas.</p></div>
    ${ok ? '<div class="gbtn-host" id="gbtn"></div>' : `<p class="err">${!apiOk ? 'La dirección del script en config.js no es válida: debe empezar por https://script.google.com/ y acabar en /exec.' : 'El ID de cliente de Google en config.js no es válido.'}</p>`}
    ${S.err ? `<p class="err">${esc(S.err)}</p>` : ''}
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
  return `<div class="mtop"><div class="row"><div class="logo-wrap"><img src="${LOGO}" alt="Pastoral CUSAFA"></div><div style="display:flex;gap:10px;align-items:center"><button class="signout" data-act="signout">Salir</button>${avatar(me, 'var(--brand)')}</div></div><nav class="tabs" aria-label="Secciones">${tabs}</nav></div>
  <div class="shell">
    <aside class="side"><div class="logo-wrap"><img src="${LOGO}" alt="Pastoral · Centro Universitario Sagrada Familia"></div>
      <div class="motto">Voluntariado Arrupe · <em>Libres para servir</em></div>
      <nav class="nav" aria-label="Secciones">${items}</nav>
      <div class="me">${avatar(me, 'var(--brand)')}<div class="who"><b>${esc(me.nombre)}</b><span>${esc(sub)}</span><br><button class="signout" data-act="signout">Cerrar sesión</button></div></div>
    </aside>
    <main class="main"><div class="wrap">${content}</div></main>
  </div>`;
}
const header = (eyebrow, title, sub, actions = '') => `<div class="head"><div class="t"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1>${sub ? `<p class="muted" style="max-width:62ch">${sub}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
const newsRow = n => `<div class="row"><div style="width:52px;text-align:center;flex:none"><b class="tnum" style="font-family:var(--display);font-size:1.15rem;display:block;line-height:1">${new Date(n.fecha + 'T12:00').getDate()}</b><span class="small muted">${new Date(n.fecha + 'T12:00').toLocaleDateString('es-ES', { month: 'short' })}</span></div><div class="grow"><b>${esc(n.titulo)}</b><span class="muted small">${esc(n.detalle)}</span></div><span class="pill info">${esc(n.tipo)}</span></div>`;
const proximas = () => D.noticias.filter(n => n.fecha >= todayISO());
function artSVG(seed) {
  const r = n => ((Math.sin(seed * 999 + n) * 10000) % 1 + 1) % 1;
  let s = '';
  for (let i = 0; i < 5; i++) s += `<circle cx="${(r(i) * 100).toFixed(1)}%" cy="${(r(i + 9) * 100).toFixed(1)}%" r="${(20 + r(i + 3) * 40).toFixed(0)}" fill="rgba(255,255,255,${(.08 + r(i + 5) * .1).toFixed(2)})"/>`;
  return `<svg aria-hidden="true">${s}<path d="M-10 90 Q 80 40 180 80 T 400 60" stroke="rgba(255,255,255,.35)" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`;
}

/* --- cuenta pendiente --- */
function vEspera() {
  return header('Bienvenida', 'Tu cuenta está en revisión', 'El Servicio de Pastoral la aprobará en breve. Te llegará un correo cuando te asignen un voluntariado. Mientras, puedes conocer dónde servir.') +
    `<div class="card examen"><p class="quote">Antes de elegir dónde servir, pregúntate qué te mueve. Lo que te mueve también te sostiene.</p>
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
  ${ents.length ? `<div class="grid g2">${ents.map(id => { const e = E(id), h = horasPor(id); return `<div class="card" style="--c:${cvar(e.color)}"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">${chip(id)}<span class="small muted tnum">${nf(h)} h</span></div><h2>${esc(e.nombre)}</h2><p class="muted small">${esc(e.horario)}</p><div class="bar"><i style="width:${Math.min(100, h / ref * 100)}%"></i></div><span class="hint">Referencia de ${ref} h para el certificado</span><button class="btn ghost sm" data-ent="${esc(id)}" style="justify-self:start">Ver detalles</button></div>`; }).join('')}</div>`
    : `<div class="empty">Aún no tienes un voluntariado asignado. <button class="btn primary sm" data-go="explorar">Descubre dónde servir</button></div>`}
  ${sol.length ? `<div class="card"><h3>Solicitudes en curso</h3><div class="chips">${sol.map(a => chip(a.entidad)).join('')}</div><p class="hint">Pastoral te responderá por correo.</p></div>` : ''}
  <div class="grid g2">
    <div class="card examen"><span class="eyebrow">Para mirar la semana</span>
      <p class="quote">¿Dónde has encontrado vida en tu voluntariado esta semana? ¿Y qué te ha costado?</p>
      <p class="muted small">Dos minutos para mirar lo vivido. Nadie más lo ve en la app.</p>
      <div class="field"><label for="refl">Lo que me llevo</label><textarea id="refl" maxlength="3000" placeholder="Un momento, una cara, una dificultad…"></textarea></div>
      <button class="btn primary" data-act="save-refl" style="justify-self:start">Guardar para mí</button>
      ${D.mio.reflexiones.length ? `<details><summary class="small muted" style="cursor:pointer">Lo que has ido guardando (${D.mio.reflexiones.length})</summary><div class="grid" style="gap:10px;margin-top:10px">${D.mio.reflexiones.slice(0, 6).map(r => `<div class="refl"><span class="hint">${fmtLong(r.fecha)}</span><p>${esc(r.texto)}</p></div>`).join('')}</div></details>` : ''}
    </div>
    <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Lo que viene</h2><button class="btn ghost sm" data-go="noticias">Ver todo</button></div>
      ${proximas().length ? `<div class="list">${proximas().slice(0, 3).map(newsRow).join('')}</div>` : '<p class="muted small">No hay encuentros próximos publicados.</p>'}</div>
  </div>`;
}
function vDocs() {
  const docs = D.mio.docs, T = D.config.tiposDoc;
  const help = { cert: 'Se pide en la sede electrónica del Ministerio de Justicia con certificado digital o Cl@ve. Es gratuito.', comp: 'Pide el modelo a tu coordinación, fírmalo y súbelo escaneado o en una foto legible.' };
  const card = t => { const d = docs[t]; return `<div class="card doc"><div class="top"><div style="display:grid;gap:4px;min-width:0;flex:1 1 240px"><h2>${esc(T[t])}</h2><p class="muted small">${help[t] || ''}</p></div>${pill(d.estado)}</div>
    ${d.estado === 'rech' && d.nota ? `<p class="err">Motivo: ${esc(d.nota)}</p>` : ''}
    ${d.estado === 'ok' ? `<p class="small muted">${ic('check', 16)} Validado por el Servicio de Pastoral${d.fecha ? ' el ' + fmtLong(d.fecha) : ''}.</p>` :
      `<label class="file btn ${d.estado === 'rev' ? 'ghost' : 'primary'}" for="up-${t}">${ic('upload', 18)}${d.estado === 'rev' ? 'Sustituir archivo' : 'Subir PDF o foto'}<input type="file" id="up-${t}" data-up="${t}" accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,image/webp"></label><span class="hint">Máximo 10 MB.</span>`}
  </div>`; };
  return header('Documentación', 'Tus documentos', 'Son necesarios para empezar a servir. Se entregan una sola vez por curso, aunque estés en varios voluntariados.') +
    `<div class="note">${ic('lock', 18)}<span>Tus archivos se guardan en una carpeta privada. <b>Solo el Servicio de Pastoral puede abrirlos.</b> Tu coordinación únicamente ve si están entregados y validados, nunca el archivo.</span></div>
    <div class="grid g2">${Object.keys(T).map(card).join('')}</div>`;
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
  if (!S.cent || !ids.includes(S.cent)) S.cent = ids[0];
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
  ${nuevos.length ? `<div class="card"><h2>Nuevas incorporaciones</h2><div class="list">${nuevos.map(n => `<div class="row"><div class="av" style="background:${cvar(e.color)}">${esc(initials(n.nombre))}</div><div class="grow"><b>${esc(n.nombre)}</b><span class="muted small">${esc(n.curso)} · ${esc(n.email)}</span></div><button class="btn primary sm" data-welcome="${esc(n.email)}">${ic('mail', 16)}Enviar bienvenida</button></div>`).join('')}</div><p class="hint">El correo sale con tu dirección para que te respondan a ti.</p></div>` : ''}
  <div class="grid g2">
    <div class="card"><h2>Documentación pendiente</h2>
      ${pend.length ? `<div class="list">${pend.map(p => `<div class="row"><div class="grow"><b>${esc(p.nombre)}</b><span class="small muted">${esc(p.curso)}</span></div><div class="chips">${p.cert !== 'ok' ? `<span class="pill ${DOC[p.cert][0]}">Certificado</span>` : ''}${p.comp !== 'ok' ? `<span class="pill ${DOC[p.comp][0]}">Compromiso</span>` : ''}</div></div>`).join('')}</div>
      <p class="hint">Pastoral valida los archivos. Tú puedes recordar a cada persona lo que le falta.</p>
      <button class="btn ghost sm" data-act="remind" style="justify-self:start">${ic('mail', 16)}Recordar por correo a quienes les falta algo</button>` : '<div class="empty">Todo el equipo está al día.</div>'}
    </div>
    <div class="card"><h2>Próximo en la agenda</h2>${proximas().length ? `<div class="list">${proximas().slice(0, 3).map(newsRow).join('')}</div>` : '<p class="muted small">No hay encuentros próximos publicados.</p>'}</div>
  </div>`;
}
function vEquipo() {
  const sel = centSel(), e = E(S.cent), t = D.coord[S.cent].equipo;
  return header('Coordinación', 'Tu equipo', `${t.length} ${t.length === 1 ? 'persona sirve' : 'personas sirven'} en ${esc(e.nombre)}.`, sel + `<button class="btn ghost" data-act="copy-emails">${ic('mail', 18)}Copiar correos del equipo</button>`) +
    (t.length ? `<div class="table-wrap"><table><thead><tr><th>Voluntario/a</th><th>Curso</th><th>Correo</th><th>También en</th><th>Certificado</th><th>Compromiso</th><th>Horas aquí</th></tr></thead><tbody>
    ${t.map(p => `<tr><td><b>${esc(p.nombre)}</b>${p.coordina ? ' <span class="pill info">Coordina</span>' : ''}</td><td class="muted">${esc(p.curso)}</td><td class="small">${esc(p.email)}</td><td><div class="chips">${p.otras.map(chip).join('') || '<span class="hint">—</span>'}</div></td><td>${pill(p.cert)}</td><td>${pill(p.comp)}</td><td class="tnum"><b>${nf(p.horas)} h</b></td></tr>`).join('')}
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
    <div class="actions"><button class="btn primary" data-act="save-att">${ic('check', 18)}Guardar sesión</button><button class="btn ghost" data-act="all-att">Marcar a todos</button></div>` : '<div class="empty">No hay nadie en el equipo todavía.</div>'}
  </div>
  <div class="card"><h2>Sesiones registradas</h2>${C.sesiones.length ? `<div class="list">${C.sesiones.slice(0, 30).map(l => `<div class="row"><span class="tnum" style="width:70px">${fmt(l.fecha)}</span><div class="grow small muted">${esc(l.personas.join(', '))}</div><b class="tnum">${l.personas.length} × ${nf(l.horas)} h</b>
    ${S.delSes === l.sesion ? `<span class="actions"><button class="btn danger sm" data-delses="${esc(l.sesion)}">Borrar</button><button class="btn ghost sm" data-act="cancel-delses">No</button></span>` : `<button class="btn ghost sm" data-askdelses="${esc(l.sesion)}" aria-label="Borrar sesión">Borrar</button>`}</div>`).join('')}</div>` : '<p class="muted small">Aún no has registrado ninguna sesión.</p>'}</div></div>`;
}

/* --- pastoral --- */
function vPanel() {
  const P = D.pastoral.personas, act = P.filter(p => p.estado === 'activo' && p.asignaciones.some(a => a.estado === 'activa'));
  const inc = act.filter(p => p.docs.cert.estado !== 'ok' || p.docs.comp.estado !== 'ok').length;
  const multi = act.filter(p => p.asignaciones.filter(a => a.estado === 'activa').length > 1).length;
  const nIns = D.pastoral.inscripciones.filter(i => i.estado === 'nueva').length;
  const pp = pendientesPastoral();
  return header('Servicio de Pastoral', 'Panel del Voluntariado Arrupe', 'Lo que necesita una mirada vuestra hoy.', `<a class="btn ghost" href="${safeUrl(D.pastoral.hojaUrl)}" target="_blank" rel="noopener">${ic('ext', 18)}Hoja de datos</a><a class="btn ghost" href="${safeUrl(D.pastoral.carpetaUrl)}" target="_blank" rel="noopener">${ic('lock', 18)}Carpeta de documentos</a>`) +
    `<div class="kpis"><div class="kpi ${nIns ? 'alert' : ''}"><b class="tnum">${nIns}</b><span>inscripciones por preseleccionar</span></div>
   <div class="kpi"><b class="tnum">${act.length}</b><span>personas sirviendo · ${multi} en varias</span></div>
   <div class="kpi ${inc ? 'alert' : ''}"><b class="tnum">${inc}</b><span>con documentación incompleta</span></div>
   <div class="kpi"><b class="tnum">${nf(sum(P, p => p.horas))} h</b><span>de servicio registradas</span></div></div>
  <div class="card"><h2>Pendiente de vosotros</h2>
    ${pp.total ? `<div class="list">
      ${pp.cuentas.map(p => `<div class="row"><span class="pill warn">Cuenta nueva</span><div class="grow"><b>${esc(p.nombre)}</b><span class="small muted">${esc(p.email)}</span></div><button class="btn primary sm" data-approve="${esc(p.email)}">Aprobar</button><button class="btn ghost sm" data-editp="${esc(p.email)}">Revisar</button></div>`).join('')}
      ${pp.solicitudes.map(s => `<div class="row"><span class="pill info">Solicitud</span><div class="grow"><b>${esc(s.p.nombre)}</b><span class="small muted">quiere servir en ${esc(E(s.ent).nombre)}</span></div><button class="btn primary sm" data-req="${esc(s.p.email)}|${esc(s.ent)}|1">Aceptar</button><button class="btn ghost sm" data-req="${esc(s.p.email)}|${esc(s.ent)}|0">Rechazar</button></div>`).join('')}
      ${pp.docs.map(x => `<div class="row"><span class="pill info">Documento</span><div class="grow"><b>${esc(x.p.nombre)}</b><span class="small muted">${esc(D.config.tiposDoc[x.t])}</span></div><button class="btn ghost sm" data-editp="${esc(x.p.email)}">Revisar</button></div>`).join('')}
    </div>` : '<div class="empty">Nada pendiente. Buen trabajo.</div>'}</div>
  <div class="grid g2">
   <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2>Ocupación por entidad</h2><button class="btn ghost sm" data-go="entidades">Gestionar</button></div>
     <div class="list">${D.entidades.filter(e => e.activa).map(e => `<div class="row" style="--c:${cvar(e.color)}"><div class="grow" style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="display:inline">${esc(e.nombre)}</b><span class="tnum small muted">${e.ocupadas}/${e.cupo}</span></div><div class="bar"><i style="width:${e.cupo ? Math.min(100, e.ocupadas / e.cupo * 100) : 0}%"></i></div></div></div>`).join('')}</div></div>
   <div class="card"><span class="eyebrow">Lo que dijo el curso 2025-26 · 69 valoraciones</span>
     ${EVAL_2526.map(([l, v]) => `<div class="metric-row"><span class="small">${l}</span><b class="tnum" style="text-align:right">${v}%</b><div class="bar"><i style="width:${v}%;background:var(${v < 80 ? '--warn' : '--ok'})"></i></div></div>`).join('')}
     <p class="small muted">La formación y la parte pastoral son las que más margen tienen este curso.</p></div>
  </div>`;
}
function vIns() {
  const all = D.pastoral.inscripciones;
  const F = [['nueva', 'Nuevas'], ['en_espera', 'En espera'], ['asignada', 'Asignadas'], ['descartada', 'Descartadas']];
  const list = all.filter(i => i.estado === S.insFilter);
  return header('Servicio de Pastoral', 'Inscripciones', 'Llegan solas desde el formulario de Google y os avisamos por correo. Preselecciona y envía cada persona a la coordinación que mejor encaje.') +
    `<div class="filters" role="group" aria-label="Filtrar inscripciones">${F.map(([k, l]) => `<button data-insf="${k}" aria-pressed="${S.insFilter === k}">${l} · ${all.filter(i => i.estado === k).length}</button>`).join('')}</div>
    ${list.length ? `<div class="grid">${list.map(i => {
      const st = i.estado === 'asignada' ? `<span class="pill ok">Enviada a ${esc(E(i.entidad).nombre)}</span>` : i.estado === 'nueva' ? '<span class="pill warn">Nueva</span>' : i.estado === 'en_espera' ? '<span class="pill info">En espera</span>' : '<span class="pill bad">Descartada</span>';
      const assign = S.assigning === i.id ? `<div class="form-grid" style="align-items:end"><div class="field"><label for="sel-${esc(i.id)}">Enviar a la coordinación de</label><select id="sel-${esc(i.id)}">${D.entidades.filter(e => e.activa).map(e => `<option value="${esc(e.id)}" ${i.preferencias[0] === e.id ? 'selected' : ''}>${esc(e.nombre)}${i.preferencias.includes(e.id) ? ' · la eligió' : ''} (${e.ocupadas}/${e.cupo})</option>`).join('')}</select></div><div class="actions"><button class="btn primary" data-assign="${esc(i.id)}">${ic('arrow', 18)}Enviar</button><button class="btn ghost" data-act="cancel-assign">Cancelar</button></div></div>`
        : (i.estado !== 'asignada' ? `<div class="actions"><button class="btn primary sm" data-pre="${esc(i.id)}">Preseleccionar</button>${i.estado !== 'en_espera' ? `<button class="btn ghost sm" data-insst="${esc(i.id)}|en_espera">Dejar en espera</button>` : ''}${i.estado !== 'descartada' ? `<button class="btn ghost sm" data-insst="${esc(i.id)}|descartada">Descartar</button>` : `<button class="btn ghost sm" data-insst="${esc(i.id)}|nueva">Recuperar</button>`}</div>` : '');
      return `<div class="card"><div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap"><div class="av" style="background:var(--brand)">${esc(initials(i.nombre))}</div><div style="flex:1 1 220px;min-width:0;display:grid;gap:2px"><h3>${esc(i.nombre || '(sin nombre)')}</h3><span class="small muted">${esc(i.curso)} · ${esc(i.email || 'sin correo')} · ${fmt(i.fecha)}</span></div>${st}</div>
        ${i.motivo ? `<p>“${esc(i.motivo)}”</p>` : ''}<div class="chips"><span class="small muted">Prefiere:</span>${i.preferencias.length ? i.preferencias.map(chip).join('') : `<span class="small">${esc(i.preferenciasTexto || '—')}</span>`}</div>${assign}</div>`;
    }).join('')}</div>` : '<div class="empty">No hay inscripciones en este apartado.</div>'}`;
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
    ${d.url ? `<a class="btn ghost sm" href="${safeUrl(d.url)}" target="_blank" rel="noopener">${ic('ext', 16)}Abrir archivo</a>` : ''}
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
    ${isNew ? '' : `<div><span class="eyebrow">Documentación</span><div class="list">${Object.keys(D.config.tiposDoc).map(docRow).join('')}</div></div>`}
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

/* ───────── render ───────── */
const VIEWS = { espera: vEspera, explorar: vExplorar, vinicio: vVinicio, docs: vDocs, horas: vHoras, cinicio: vCinicio, equipo: vEquipo, asistencia: vAsistencia, panel: vPanel, ins: vIns, personas: vPersonas, entidades: vEntidades, noticias: vNoticias };
function render() {
  const root = $('root');
  if (!D) {
    root.innerHTML = vLogin();
    const host = $('gbtn');
    if (host && window.google && google.accounts) {
      try { google.accounts.id.renderButton(host, { theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'filled_black' : 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'es', width: 300 }); } catch (e) { }
    }
    return;
  }
  const n = nav();
  if (!S.view || !n.some(x => x[0] === S.view)) {
    const h = (location.hash || '').slice(1);
    S.view = n.some(x => x[0] === h) ? h : n[0][0];
  }
  const y = window.scrollY;
  root.innerHTML = shell(VIEWS[S.view]());
  window.scrollTo(0, render.keepScroll ? y : 0);
  render.keepScroll = true;
}
function go(v) { S.view = v; S.ent = null; S.leaving = null; render.keepScroll = false; try { history.replaceState(null, '', '#' + v); } catch (e) { } render(); }

/* ───────── eventos ───────── */
const root = $('root');
root.addEventListener('click', async ev => {
  const t = ev.target.closest('button,[data-ent],tr[data-editp]'); if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.go) return go(d.go);
  if (d.ent) { S.view = 'explorar'; S.ent = d.ent; S.leaving = null; render.keepScroll = false; return render(); }
  if (d.insf) { S.insFilter = d.insf; S.assigning = null; return render(); }
  if (d.pre) { S.assigning = d.pre; return render(); }
  if (d.assign) { const ent = $('sel-' + d.assign).value; S.assigning = null; return run('asignarInscripcion', { id: d.assign, entidad: ent }, `Enviada a ${E(ent).nombre}. Les llega un correo a la persona y a su coordinación.`); }
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
  if (d.welcome) return run('darBienvenida', { entidad: S.cent, email: d.welcome }, 'Correo de bienvenida enviado');
  switch (d.act) {
    case 'signout': return signOut(false);
    case 'back': S.ent = null; return render();
    case 'join': return run('solicitarEntidad', { entidad: S.ent }, 'Solicitud enviada. Pastoral te responderá pronto.');
    case 'leave': S.leaving = S.ent; return render();
    case 'leave-no': S.leaving = null; return render();
    case 'leave-yes': { const ent = S.ent; S.leaving = null; return run('dejarEntidad', { entidad: ent }, 'Has dejado este voluntariado. Tu coordinación lo sabrá.'); }
    case 'save-refl': { const v = $('refl').value.trim(); if (!v) return toast('Escribe algo antes de guardar'); return run('guardarReflexion', { texto: v }, 'Guardado.'); }
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
    case 'cancel-assign': S.assigning = null; return render();
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
      const data = { id: $('eId').value, nombre: $('eNombre').value.trim(), lugar: $('eLugar').value.trim(), etiqueta: $('eEtiqueta').value.trim(), cupo: $('eCupo').value, color: $('eColor').value, descripcion: $('eDesc').value.trim(), horario: $('eHorario').value.trim(), ig: $('eIg').value.trim(), claves: $('eClaves').value.trim(), activa: $('eActiva').checked };
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
root.addEventListener('change', ev => {
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
  if (t.dataset.att) { t.checked ? S.att.sel.add(t.dataset.att) : S.att.sel.delete(t.dataset.att); }
  if (t.id === 'attDate') S.att.date = t.value;
  if (t.id === 'centSel') { S.cent = t.value; render(); }
});
root.addEventListener('input', ev => {
  if (ev.target.id === 'q') { S.q = ev.target.value; const pos = ev.target.selectionStart; render(); const q = $('q'); q.focus(); q.setSelectionRange(pos, pos); }
});
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (D && VIEWS[h] && h !== S.view) go(h); });

initGoogle();
})();
