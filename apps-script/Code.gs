/**
 * VOLUNTARIADO ARRUPE · Servicio de Pastoral · Centro Universitario Sagrada Familia (Úbeda)
 * "Cerebro" de la app: recibe las peticiones de la web (GitHub Pages), comprueba quién pregunta
 * y con qué rol, y lee/escribe en la hoja de cálculo privada y en la carpeta privada de Drive.
 *
 * Puesta en marcha: ver GUIA.md. Resumen:
 *   1) Pega este archivo y appsscript.json en un proyecto nuevo de script.google.com
 *   2) Rellena CONFIG (abajo) y ejecuta setup() una vez
 *   3) Implementar > Nueva implementación > Aplicación web (Ejecutar como: yo · Acceso: cualquier usuario)
 *   4) Opcional: ejecuta conectarFormulario() para recibir las inscripciones del formulario
 */

// ───────────────────────── CONFIGURACIÓN ─────────────────────────
const CONFIG = {
  // ID de cliente OAuth de Google (Google Cloud > APIs y servicios > Credenciales). Ver GUIA.md.
  CLIENT_ID: '237021277501-7hj405nb3l88f9vhngghkg6igd0tae3m.apps.googleusercontent.com',
  // Correos del Servicio de Pastoral: acceso total y únicos que pueden abrir los documentos.
  PASTORAL: ['andresgarcia@fundacionsafa.es', 'ldimanuel@fundacionsafa.es'],
  // Dirección pública de la app en GitHub Pages (para los enlaces de los correos).
  APP_URL: 'https://agarcia-poz.github.io/voluntariado-arrupe/',
  // URL o ID del formulario de inscripción de Google (para conectarFormulario()).
  FORM: 'https://docs.google.com/forms/d/1IE4z_QOV2n1IdxytTTrS6LG4bCb7vegyaJQ5AE4og9U/edit',
  // Horas de referencia para el certificado (se muestra como meta orientativa).
  HORAS_REFERENCIA: 20,
  REMITENTE: 'Voluntariado Arrupe · Pastoral CUSAFA'
};

const TIPOS_DOC = {
  cert: 'Certificado de delitos de naturaleza sexual',
  comp: 'Compromiso de voluntariado'
};

const HOJAS = {
  Usuarios: ['email', 'nombre', 'rol', 'estado', 'curso', 'coordEnts', 'alta'],
  Entidades: ['id', 'nombre', 'lugar', 'etiqueta', 'color', 'descripcion', 'horario', 'cupo', 'ig', 'activa', 'claves'],
  Asignaciones: ['email', 'entidad', 'estado', 'fecha', 'origen'],
  Inscripciones: ['id', 'fecha', 'nombre', 'email', 'curso', 'preferencias', 'preferenciasTexto', 'motivo', 'estado', 'entidad', 'gestionadoPor'],
  Documentos: ['email', 'tipo', 'estado', 'fileId', 'archivo', 'fecha', 'revisadoPor', 'fechaRevision', 'nota'],
  Asistencia: ['sesion', 'fecha', 'entidad', 'email', 'horas', 'registradoPor', 'creado'],
  Noticias: ['id', 'fecha', 'titulo', 'detalle', 'tipo', 'autor'],
  Reflexiones: ['email', 'fecha', 'texto'],
  Registro: ['fecha', 'email', 'accion', 'detalle'],
  Invitaciones: ['codigo', 'email', 'nombre', 'rol', 'entidades', 'estado', 'creado', 'creadoPor', 'usadoPor', 'usadoEn']
};

const ENTIDADES_INICIALES = [
  ['res', 'Residencia de Ancianos', 'Plaza del Marqués, Úbeda', 'Mayores', 'orange',
    'Acompañar a personas mayores: conversación, juegos de mesa, lectura y paseos. Lo que más se agradece es la constancia y el tiempo sin prisa.',
    'Lunes a viernes, 17:00–18:00 o 18:00–19:00. Cada voluntario elige su día.', 8, 'https://www.instagram.com/reel/DR4YgsLjO-k/', 'residencia,ancianos,mayores,marqués'],
  ['cruz', 'Cruz Roja Úbeda', 'Asamblea local de Úbeda', 'Acción social', 'red',
    'Colaboración en los programas de la asamblea local: atención a familias, recogidas y campañas puntuales.',
    'Según el programa y la campaña.', 6, '', 'cruz roja'],
  ['hogar', 'Escuela Hogar SAFA', 'SAFA Úbeda', 'Infancia', 'magenta',
    'Apoyo a niñas y niños residentes en las tareas escolares y en el tiempo libre. Un lugar donde se aprende mucho de lo que significa educar.',
    'Lunes a jueves, 16:00–17:00, 18:00–19:00 o 19:00–20:00.', 14, 'https://www.instagram.com/reel/DR32RdJjP5_/', 'escuela hogar,residencia safa,residencia escolar'],
  ['down', 'Asociación Síndrome de Down', 'Úbeda', 'Diversidad', 'purple',
    'Actividades de ocio, habilidades sociales y autonomía con jóvenes y adultos con síndrome de Down.',
    'Varias tardes por semana, en sesiones de 2–3 horas.', 10, 'https://www.instagram.com/reel/DR4K1s_DA8h/', 'down'],
  ['alz', 'Asociación Alzheimer', 'Úbeda', 'Mayores', 'brown',
    'Acompañamiento y estimulación de personas con alzhéimer, junto a sus familias y al equipo técnico.',
    'Lunes, 1 hora.', 4, 'https://www.instagram.com/reel/DR4EANoDHAM/', 'alzheimer,alzhéimer'],
  ['ute', 'Centro Penitenciario de Jaén (UTE)', 'Jaén', 'Prisión', 'grey',
    'Encuentros y talleres en la Unidad Terapéutica y Educativa. Una experiencia exigente que cambia la mirada sobre las segundas oportunidades.',
    'Calendario de sesiones fijado con el centro.', 16, 'https://www.instagram.com/reel/DR4np6Wl5de/', 'penitenciario,ute,prisión,prision,cárcel'],
  ['apoyo', 'Apoyo Escolar SAFA Úbeda', 'EE.PP. SAFA Úbeda', 'Infancia', 'blue',
    'Refuerzo escolar a alumnado de Primaria. Tu primera aula real, acompañando a quien más lo necesita.',
    'L 16–18 h · M 16–17 h · X 16–17 h · J 16–18 h.', 14, 'https://www.instagram.com/reel/DR4fdeyjAAf/', 'apoyo escolar'],
  ['ilu', 'Proyecto Ilusión Baeza', 'Baeza', 'Infancia', 'green',
    'Tardes de ocio educativo con menores. Juego, convivencia y mucha energía.',
    '1–2 sábados al mes, 17:00–21:00.', 12, 'https://www.instagram.com/reel/DR4RtaHjM3N/', 'ilusión,ilusion,baeza'],
  ['apro', 'APROMPSI Úbeda', 'Úbeda', 'Diversidad', 'teal',
    'Actividades con personas con discapacidad intelectual: fútbol, zumba, teatro y baile.',
    'Jueves: fútbol 16–18 h · zumba 17–18 h · teatro y baile 18–20 h.', 8, 'https://www.instagram.com/reel/DR39H0eDBh8/', 'aprompsi']
];

// ───────────────────────── PUESTA EN MARCHA ─────────────────────────
function setup() {
  const props = PropertiesService.getScriptProperties();
  let ss;
  if (props.getProperty('SHEET_ID')) {
    ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
  } else {
    ss = SpreadsheetApp.create('Voluntariado Arrupe · Datos (PRIVADO)');
    props.setProperty('SHEET_ID', ss.getId());
  }
  Object.keys(HOJAS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const cols = HOJAS[name];
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#E3F0F8');
    sh.setFrozenRows(1);
  });
  const def = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);

  if (rows_('Entidades').length === 0) {
    ENTIDADES_INICIALES.forEach(e => append_('Entidades', {
      id: e[0], nombre: e[1], lugar: e[2], etiqueta: e[3], color: e[4], descripcion: e[5],
      horario: e[6], cupo: e[7], ig: e[8], activa: 'sí', claves: e[9]
    }));
  }
  CONFIG.PASTORAL.forEach(email => {
    email = norm_(email);
    if (email.indexOf('@') < 0 || email.indexOf('correo_de') === 0) return;
    if (!findUser_(email)) append_('Usuarios', { email, nombre: email.split('@')[0], rol: 'pastoral', estado: 'activo', curso: '', coordEnts: '', alta: new Date() });
  });

  // Carpeta privada de documentos: solo el propietario del script y el resto de Pastoral.
  let folder;
  if (props.getProperty('FOLDER_ID')) folder = DriveApp.getFolderById(props.getProperty('FOLDER_ID'));
  else {
    folder = DriveApp.createFolder('Voluntariado Arrupe · Documentos (PRIVADO)');
    props.setProperty('FOLDER_ID', folder.getId());
  }
  folder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  const owner = norm_(Session.getEffectiveUser().getEmail());
  CONFIG.PASTORAL.map(norm_).filter(e => e !== owner && e.indexOf('@') > 0 && e.indexOf('correo_de') !== 0)
    .forEach(e => { try { folder.addViewer(e); ss.addViewer(e); } catch (err) { Logger.log('No se pudo compartir con ' + e + ': ' + err); } });

  Logger.log('Listo.\nHoja: ' + ss.getUrl() + '\nCarpeta: ' + folder.getUrl());
}

/** Conecta el formulario de inscripción: cada respuesta nueva entra en Inscripciones y avisa a Pastoral. */
function conectarFormulario() {
  if (!CONFIG.FORM) throw new Error('Escribe la URL o el ID del formulario en CONFIG.FORM');
  const form = CONFIG.FORM.indexOf('http') === 0 ? FormApp.openByUrl(CONFIG.FORM) : FormApp.openById(CONFIG.FORM);
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'alRecibirInscripcion').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('alRecibirInscripcion').forForm(form).onFormSubmit().create();
  Logger.log('Formulario conectado: ' + form.getTitle());
}

/** Importa las respuestas que ya tuviera el formulario (no duplica las ya importadas). */
function importarRespuestasExistentes() {
  const form = CONFIG.FORM.indexOf('http') === 0 ? FormApp.openByUrl(CONFIG.FORM) : FormApp.openById(CONFIG.FORM);
  const ya = new Set(rows_('Inscripciones').map(r => String(r.id)));
  let n = 0;
  form.getResponses().forEach(r => { if (!ya.has(r.getId())) { guardarInscripcion_(r, false); n++; } });
  Logger.log(n + ' inscripciones importadas');
}

function alRecibirInscripcion(e) { guardarInscripcion_(e.response, true); }

function guardarInscripcion_(resp, avisar) {
  const ans = {};
  resp.getItemResponses().forEach(ir => {
    const v = ir.getResponse();
    ans[ir.getItem().getTitle().toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v);
  });
  const pick = (...keys) => {
    const k = Object.keys(ans).find(t => keys.some(x => t.indexOf(x) >= 0));
    return k ? ans[k] : '';
  };
  const email = norm_(resp.getRespondentEmail() || pick('correo', 'email', 'e-mail'));
  const prefTxt = pick('voluntariado', 'entidad', 'preferencia', 'dónde', 'donde');
  const ins = {
    id: resp.getId(), fecha: resp.getTimestamp(),
    nombre: pick('nombre y apellidos', 'nombre', 'apellidos'),
    email, curso: pick('curso', 'grado'),
    preferencias: matchEntidades_(prefTxt).join(','),
    preferenciasTexto: prefTxt,
    motivo: pick('motivo', 'por qué', 'porque', 'por que', 'expectativa', 'cuéntanos', 'comentario'),
    estado: 'nueva', entidad: '', gestionadoPor: ''
  };
  withLock_(() => append_('Inscripciones', ins));
  if (avisar) {
    mail_(CONFIG.PASTORAL, 'Nueva inscripción: ' + ins.nombre,
      `<p><b>${esc_(ins.nombre)}</b> (${esc_(ins.curso)}) se ha inscrito en el Voluntariado Arrupe.</p>
       <p>Preferencias: ${esc_(prefTxt || '—')}</p><p>“${esc_(ins.motivo)}”</p>`,
      'Ver inscripciones', 'ins');
  }
}

function matchEntidades_(txt) {
  txt = (txt || '').toLowerCase();
  if (!txt) return [];
  return rows_('Entidades').filter(e => {
    const keys = [e.nombre].concat(String(e.claves || '').split(',')).map(s => s.trim().toLowerCase()).filter(Boolean);
    return keys.some(k => txt.indexOf(k) >= 0);
  }).map(e => e.id);
}

// ───────────────────────── API WEB ─────────────────────────
function doGet() {
  return json_({ ok: true, app: 'Voluntariado Arrupe', mensaje: 'API activa. La app se usa desde ' + CONFIG.APP_URL });
}

function doPost(e) {
  Object.keys(_cache).forEach(k => delete _cache[k]);
  try {
    const req = JSON.parse(e.postData.contents);
    const who = verify_(req.token);
    const me = currentUser_(who);
    const fn = ACCIONES[req.action];
    if (!fn) throw httpErr_('Acción desconocida');
    const data = fn(me, req.data || {});
    return json_({ ok: true, data });
  } catch (err) {
    return json_({ ok: false, error: err.message || String(err), auth: !!err.auth });
  }
}

const ACCIONES = {
  bootstrap: (me) => bootstrap_(me),

  // ── voluntario/a ──
  solicitarEntidad: (me, d) => {
    activo_(me);
    const ent = entidad_(d.entidad);
    withLock_(() => {
      const a = rows_('Asignaciones').find(r => r.email === me.email && r.entidad === ent.id && r.estado !== 'baja');
      if (a) throw httpErr_('Ya tienes una solicitud o asignación en esta entidad');
      append_('Asignaciones', { email: me.email, entidad: ent.id, estado: 'solicitada', fecha: new Date(), origen: 'app' });
    });
    mail_(CONFIG.PASTORAL, 'Solicitud para ' + ent.nombre, `<p><b>${esc_(me.nombre)}</b> quiere servir en <b>${esc_(ent.nombre)}</b>.</p>`, 'Revisar solicitudes', 'panel');
    log_(me, 'solicitarEntidad', ent.id);
    return bootstrap_(me);
  },
  dejarEntidad: (me, d) => {
    const ent = entidad_(d.entidad);
    withLock_(() => updateWhere_('Asignaciones', r => r.email === me.email && r.entidad === ent.id && r.estado !== 'baja', { estado: 'baja', fecha: new Date() }));
    const coords = coordinadores_(ent.id).map(u => u.email);
    mail_(coords.concat(CONFIG.PASTORAL), 'Baja en ' + ent.nombre, `<p><b>${esc_(me.nombre)}</b> ha dejado el voluntariado de <b>${esc_(ent.nombre)}</b> desde la app.</p>`);
    log_(me, 'dejarEntidad', ent.id);
    return bootstrap_(me);
  },
  subirDocumento: (me, d) => {
    activo_(me);
    if (!TIPOS_DOC[d.tipo]) throw httpErr_('Tipo de documento no válido');
    const okMime = /^(application\/pdf|image\/(jpeg|png|heic|heif|webp))$/.test(d.mime || '');
    if (!okMime) throw httpErr_('Sube un PDF o una foto (JPG, PNG o HEIC)');
    const bytes = Utilities.base64Decode(d.base64);
    if (bytes.length > 10 * 1024 * 1024) throw httpErr_('El archivo supera los 10 MB');
    const root = DriveApp.getFolderById(prop_('FOLDER_ID'));
    const name = me.email;
    const it = root.getFoldersByName(name);
    const folder = it.hasNext() ? it.next() : root.createFolder(name);
    const ext = (d.nombre || '').split('.').pop().slice(0, 5);
    const file = folder.createFile(Utilities.newBlob(bytes, d.mime, `${d.tipo}_${Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyyMMdd-HHmm')}.${ext}`));
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    withLock_(() => {
      const prev = rows_('Documentos').find(r => r.email === me.email && r.tipo === d.tipo);
      const rec = { email: me.email, tipo: d.tipo, estado: 'rev', fileId: file.getId(), archivo: d.nombre || '', fecha: new Date(), revisadoPor: '', fechaRevision: '', nota: '' };
      if (prev) updateWhere_('Documentos', r => r.email === me.email && r.tipo === d.tipo, rec);
      else append_('Documentos', rec);
    });
    mail_(CONFIG.PASTORAL, 'Documento por revisar: ' + me.nombre, `<p><b>${esc_(me.nombre)}</b> ha subido: ${TIPOS_DOC[d.tipo]}.</p>`, 'Revisar', 'personas');
    log_(me, 'subirDocumento', d.tipo);
    return bootstrap_(me);
  },
  guardarReflexion: (me, d) => {
    const t = String(d.texto || '').trim().slice(0, 3000);
    if (!t) throw httpErr_('Escribe algo antes de guardar');
    append_('Reflexiones', { email: me.email, fecha: new Date(), texto: t });
    return bootstrap_(me);
  },

  // ── coordinación ──
  registrarSesion: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const horas = Number(d.horas);
    if (!(horas > 0 && horas <= 12)) throw httpErr_('Indica una duración entre 0,5 y 12 horas');
    const fecha = new Date(d.fecha + 'T12:00:00');
    if (isNaN(fecha)) throw httpErr_('Fecha no válida');
    const equipo = new Set(rows_('Asignaciones').filter(a => a.entidad === ent.id && a.estado === 'activa').map(a => a.email));
    const emails = (d.emails || []).map(norm_).filter(e => equipo.has(e));
    if (!emails.length) throw httpErr_('Marca al menos a una persona del equipo');
    const sesion = Utilities.getUuid().slice(0, 8);
    withLock_(() => emails.forEach(email => append_('Asistencia', { sesion, fecha, entidad: ent.id, email, horas, registradoPor: me.email, creado: new Date() })));
    log_(me, 'registrarSesion', ent.id + ' · ' + emails.length + ' personas');
    return bootstrap_(me);
  },
  borrarSesion: (me, d) => {
    const ses = rows_('Asistencia').filter(r => String(r.sesion) === String(d.sesion));
    if (!ses.length) throw httpErr_('Sesión no encontrada');
    puedeCoordinar_(me, ses[0].entidad);
    withLock_(() => deleteWhere_('Asistencia', r => String(r.sesion) === String(d.sesion)));
    log_(me, 'borrarSesion', d.sesion);
    return bootstrap_(me);
  },
  recordarDocumentos: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const docs = rows_('Documentos');
    const faltan = equipo_(ent.id).filter(u => Object.keys(TIPOS_DOC).some(t => (docs.find(x => x.email === u.email && x.tipo === t) || {}).estado !== 'ok'));
    faltan.forEach(u => {
      const pend = Object.keys(TIPOS_DOC).filter(t => (docs.find(x => x.email === u.email && x.tipo === t) || {}).estado !== 'ok').map(t => '<li>' + TIPOS_DOC[t] + '</li>').join('');
      mail_([u.email], 'Te falta documentación del Voluntariado Arrupe',
        `<p>Hola, ${esc_(u.nombre.split(' ')[0])}:</p><p>Para seguir sirviendo en <b>${esc_(ent.nombre)}</b> necesitamos que subas:</p><ul>${pend}</ul><p>Solo el Servicio de Pastoral puede ver tus archivos.</p>`,
        'Subir documentos', 'docs');
    });
    log_(me, 'recordarDocumentos', ent.id + ' · ' + faltan.length);
    return { enviados: faltan.length };
  },
  darBienvenida: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const u = findUser_(norm_(d.email));
    if (!u) throw httpErr_('Persona no encontrada');
    mail_([u.email], 'Bienvenida a ' + ent.nombre,
      `<p>Hola, ${esc_(u.nombre.split(' ')[0])}:</p><p>Soy ${esc_(me.nombre)} y coordino el voluntariado de <b>${esc_(ent.nombre)}</b>. ¡Qué alegría contar contigo!</p>
       <p><b>Horario:</b> ${esc_(ent.horario)}<br><b>Lugar:</b> ${esc_(ent.lugar)}</p>
       <p>Antes de empezar, sube en la app tu certificado de delitos de naturaleza sexual y el compromiso de voluntariado. Puedes escribirme respondiendo a este correo.</p>`,
      'Abrir la app', 'vinicio', me.email);
    withLock_(() => updateWhere_('Asignaciones', r => r.email === u.email && r.entidad === ent.id && r.estado === 'activa', { origen: 'bienvenida enviada' }));
    log_(me, 'darBienvenida', u.email);
    return bootstrap_(me);
  },

  // ── pastoral ──
  asignarInscripcion: (me, d) => {
    pastoral_(me);
    const ent = entidad_(d.entidad);
    const ins = rows_('Inscripciones').find(r => String(r.id) === String(d.id));
    if (!ins) throw httpErr_('Inscripción no encontrada');
    if (!ins.email) throw httpErr_('Esta inscripción no tiene correo. Añádelo en la hoja Inscripciones.');
    withLock_(() => {
      updateWhere_('Inscripciones', r => String(r.id) === String(d.id), { estado: 'asignada', entidad: ent.id, gestionadoPor: me.email });
      upsertUser_(ins.email, { nombre: ins.nombre, curso: ins.curso, estado: 'activo' });
      asignar_(ins.email, ent.id, 'inscripción');
    });
    avisarAsignacion_(ins.email, ins.nombre, ent);
    log_(me, 'asignarInscripcion', ins.email + ' → ' + ent.id);
    return bootstrap_(me);
  },
  estadoInscripcion: (me, d) => {
    pastoral_(me);
    if (['nueva', 'en_espera', 'descartada'].indexOf(d.estado) < 0) throw httpErr_('Estado no válido');
    withLock_(() => updateWhere_('Inscripciones', r => String(r.id) === String(d.id), { estado: d.estado, gestionadoPor: me.email }));
    return bootstrap_(me);
  },
  resolverSolicitud: (me, d) => {
    pastoral_(me);
    const ent = entidad_(d.entidad);
    const email = norm_(d.email);
    withLock_(() => updateWhere_('Asignaciones', r => r.email === email && r.entidad === ent.id && r.estado === 'solicitada',
      { estado: d.aceptar ? 'activa' : 'baja', fecha: new Date() }));
    const u = findUser_(email);
    if (d.aceptar) avisarAsignacion_(email, u ? u.nombre : email, ent);
    log_(me, 'resolverSolicitud', email + ' · ' + ent.id + ' · ' + (d.aceptar ? 'sí' : 'no'));
    return bootstrap_(me);
  },
  guardarPersona: (me, d) => {
    pastoral_(me);
    const email = norm_(d.email);
    if (email.indexOf('@') < 0) throw httpErr_('Correo no válido');
    if (['pastoral', 'coord', 'vol'].indexOf(d.rol) < 0) throw httpErr_('Rol no válido');
    if (['activo', 'pendiente', 'baja'].indexOf(d.estado) < 0) throw httpErr_('Estado no válido');
    const ids = new Set(rows_('Entidades').map(e => e.id));
    const coordEnts = (d.coordEnts || []).filter(x => ids.has(x));
    const asig = (d.asignaciones || []).filter(x => ids.has(x));
    withLock_(() => {
      upsertUser_(email, { nombre: String(d.nombre || '').trim() || email, curso: d.curso || '', rol: d.rol, estado: d.estado, coordEnts: coordEnts.join(',') });
      const actuales = rows_('Asignaciones').filter(a => a.email === email && a.estado === 'activa').map(a => a.entidad);
      asig.filter(x => actuales.indexOf(x) < 0).forEach(x => asignar_(email, x, 'pastoral'));
      actuales.filter(x => asig.indexOf(x) < 0).forEach(x => updateWhere_('Asignaciones', r => r.email === email && r.entidad === x && r.estado === 'activa', { estado: 'baja', fecha: new Date() }));
    });
    log_(me, 'guardarPersona', email);
    return bootstrap_(me);
  },
  revisarDocumento: (me, d) => {
    pastoral_(me);
    const email = norm_(d.email);
    if (!TIPOS_DOC[d.tipo]) throw httpErr_('Tipo no válido');
    const estado = d.valido ? 'ok' : 'rech';
    withLock_(() => updateWhere_('Documentos', r => r.email === email && r.tipo === d.tipo,
      { estado, revisadoPor: me.email, fechaRevision: new Date(), nota: d.nota || '' }));
    if (!d.valido) {
      mail_([email], 'Revisa tu documentación del Voluntariado Arrupe',
        `<p>Hemos revisado tu <b>${TIPOS_DOC[d.tipo].toLowerCase()}</b> y necesitamos que lo vuelvas a subir.</p>${d.nota ? '<p>Motivo: ' + esc_(d.nota) + '</p>' : ''}`,
        'Subir de nuevo', 'docs');
    }
    log_(me, 'revisarDocumento', email + ' · ' + d.tipo + ' · ' + estado);
    return bootstrap_(me);
  },
  guardarEntidad: (me, d) => {
    pastoral_(me);
    const id = String(d.id || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    if (!id) throw httpErr_('Falta el identificador corto');
    const rec = {
      id, nombre: d.nombre, lugar: d.lugar, etiqueta: d.etiqueta, color: d.color || 'blue', descripcion: d.descripcion,
      horario: d.horario, cupo: Number(d.cupo) || 0, ig: d.ig || '', activa: d.activa === false ? 'no' : 'sí', claves: d.claves || ''
    };
    if (!rec.nombre) throw httpErr_('Falta el nombre');
    withLock_(() => {
      if (rows_('Entidades').some(e => e.id === id)) updateWhere_('Entidades', e => e.id === id, rec);
      else append_('Entidades', rec);
    });
    log_(me, 'guardarEntidad', id);
    return bootstrap_(me);
  },
  guardarNoticia: (me, d) => {
    pastoral_(me);
    if (!d.titulo || !d.fecha) throw httpErr_('Pon al menos fecha y título');
    const rec = { id: d.id || Utilities.getUuid().slice(0, 8), fecha: new Date(d.fecha + 'T12:00:00'), titulo: d.titulo, detalle: d.detalle || '', tipo: d.tipo || 'Aviso', autor: me.email };
    withLock_(() => {
      if (d.id && rows_('Noticias').some(n => String(n.id) === String(d.id))) updateWhere_('Noticias', n => String(n.id) === String(d.id), rec);
      else append_('Noticias', rec);
    });
    return bootstrap_(me);
  },
  // ── invitaciones de coordinación ──
  crearInvitaciones: (me, d) => {
    pastoral_(me);
    const ids = new Set(rows_('Entidades').map(e => e.id));
    const porEmail = {};
    (d.lista || []).forEach(x => {
      const email = norm_(x.email);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw httpErr_('Correo no válido: ' + (x.email || '(vacío)'));
      const ents = (x.entidades || []).filter(e => ids.has(e));
      if (!ents.length) throw httpErr_('Falta la entidad de ' + email);
      if (!porEmail[email]) porEmail[email] = { email, nombre: String(x.nombre || '').trim(), entidades: [] };
      ents.forEach(e => { if (porEmail[email].entidades.indexOf(e) < 0) porEmail[email].entidades.push(e); });
      if (!porEmail[email].nombre && x.nombre) porEmail[email].nombre = String(x.nombre).trim();
    });
    const lista = Object.values(porEmail);
    if (!lista.length) throw httpErr_('Añade al menos una persona');
    if (lista.length > 60) throw httpErr_('Como máximo 60 invitaciones de una vez');
    const nuevas = [];
    withLock_(() => {
      const usados = new Set(rows_('Invitaciones').map(r => String(r.codigo)));
      lista.forEach(x => {
        // Anula invitaciones pendientes anteriores para ese correo
        updateWhere_('Invitaciones', r => r.email === x.email && r.estado === 'enviada', { estado: 'anulada' });
        let codigo; do { codigo = nuevoCodigo_(); } while (usados.has(codigo)); usados.add(codigo);
        const inv = { codigo, email: x.email, nombre: x.nombre, rol: 'coord', entidades: x.entidades.join(','), estado: 'enviada', creado: new Date(), creadoPor: me.email, usadoPor: '', usadoEn: '' };
        append_('Invitaciones', inv);
        nuevas.push(inv);
      });
    });
    nuevas.forEach(inv => mailInvitacion_(inv, me));
    log_(me, 'crearInvitaciones', nuevas.length + ' invitaciones');
    return bootstrap_(me);
  },
  reenviarInvitacion: (me, d) => {
    pastoral_(me);
    const inv = rows_('Invitaciones').find(r => String(r.codigo) === String(d.codigo) && r.estado === 'enviada');
    if (!inv) throw httpErr_('Esta invitación ya no está pendiente');
    mailInvitacion_(inv, me);
    log_(me, 'reenviarInvitacion', inv.email);
    return bootstrap_(me);
  },
  anularInvitacion: (me, d) => {
    pastoral_(me);
    withLock_(() => updateWhere_('Invitaciones', r => String(r.codigo) === String(d.codigo) && r.estado === 'enviada', { estado: 'anulada' }));
    log_(me, 'anularInvitacion', d.codigo);
    return bootstrap_(me);
  },
  canjearCodigo: (me, d) => {
    const codigo = String(d.codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{3})(.{3})$/, '$1-$2');
    const inv = rows_('Invitaciones').find(r => String(r.codigo) === codigo);
    if (!inv) throw httpErr_('Ese código no existe. Revisa que esté bien escrito.');
    if (inv.estado === 'usada') throw httpErr_('Este código ya se ha usado. Si eras tú, ya tienes acceso.');
    if (inv.estado !== 'enviada') throw httpErr_('Este código está anulado. Pide uno nuevo a Pastoral.');
    withLock_(() => aplicarInvitacion_(me.email, me.nombre, inv));
    log_(me, 'canjearCodigo', codigo);
    return bootstrap_(findUser_(me.email) || me);
  },

  borrarNoticia: (me, d) => {
    pastoral_(me);
    withLock_(() => deleteWhere_('Noticias', n => String(n.id) === String(d.id)));
    return bootstrap_(me);
  }
};

// ───────────────────────── DATOS PARA CADA PERFIL ─────────────────────────
function bootstrap_(me) {
  const ents = rows_('Entidades');
  const users = rows_('Usuarios');
  const asigs = rows_('Asignaciones');
  const docs = rows_('Documentos');
  const asis = rows_('Asistencia');
  const byEmail = {};
  users.forEach(u => byEmail[u.email] = u);
  const docState = (email, t) => { const r = docs.find(x => x.email === email && x.tipo === t); return r ? r.estado : 'pend'; };
  const horasDe = (email, ent) => asis.filter(a => a.email === email && (!ent || a.entidad === ent)).reduce((s, a) => s + Number(a.horas || 0), 0);

  const entidades = ents.filter(e => e.activa !== 'no' || me.rol === 'pastoral').map(e => ({
    id: e.id, nombre: e.nombre, lugar: e.lugar, etiqueta: e.etiqueta, color: e.color, descripcion: e.descripcion,
    horario: e.horario, cupo: Number(e.cupo) || 0, ig: e.ig, activa: e.activa !== 'no', claves: me.rol === 'pastoral' ? e.claves : undefined,
    coordinadores: users.filter(u => splitList_(u.coordEnts).indexOf(e.id) >= 0 && u.estado === 'activo').map(u => nombreCorto_(u.nombre)),
    ocupadas: asigs.filter(a => a.entidad === e.id && a.estado === 'activa').length
  }));

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const noticias = rows_('Noticias').map(n => ({ id: n.id, fecha: iso_(n.fecha), titulo: n.titulo, detalle: n.detalle, tipo: n.tipo }))
    .sort((a, b) => a.fecha < b.fecha ? -1 : 1);

  const out = {
    me: { email: me.email, nombre: me.nombre, rol: me.rol, estado: me.estado, curso: me.curso, coordEnts: splitList_(me.coordEnts), foto: me.foto },
    config: { horasReferencia: CONFIG.HORAS_REFERENCIA, tiposDoc: TIPOS_DOC },
    entidades, noticias
  };

  // Lo propio (cualquiera)
  out.mio = {
    asignaciones: asigs.filter(a => a.email === me.email && a.estado !== 'baja').map(a => ({ entidad: a.entidad, estado: a.estado })),
    docs: Object.keys(TIPOS_DOC).reduce((o, t) => { const r = docs.find(x => x.email === me.email && x.tipo === t); o[t] = { estado: r ? r.estado : 'pend', fecha: r ? iso_(r.fechaRevision || r.fecha) : '', nota: r ? r.nota : '' }; return o; }, {}),
    horas: asis.filter(a => a.email === me.email).map(a => ({ fecha: iso_(a.fecha), entidad: a.entidad, horas: Number(a.horas) })).sort((a, b) => a.fecha < b.fecha ? 1 : -1),
    reflexiones: rows_('Reflexiones').filter(r => r.email === me.email).map(r => ({ fecha: iso_(r.fecha), texto: r.texto })).reverse().slice(0, 20)
  };

  // Coordinación: solo sus entidades, y de los documentos solo el estado (nunca el archivo)
  const coordIds = me.rol === 'pastoral' ? [] : splitList_(me.coordEnts);
  if (coordIds.length && me.estado === 'activo') {
    out.coord = {};
    coordIds.forEach(id => {
      const team = asigs.filter(a => a.entidad === id && a.estado === 'activa').map(a => byEmail[a.email]).filter(Boolean);
      out.coord[id] = {
        equipo: team.map(u => ({
          email: u.email, nombre: u.nombre, curso: u.curso,
          otras: asigs.filter(a => a.email === u.email && a.estado === 'activa' && a.entidad !== id).map(a => a.entidad),
          cert: docState(u.email, 'cert'), comp: docState(u.email, 'comp'), horas: horasDe(u.email, id),
          coordina: splitList_(u.coordEnts).indexOf(id) >= 0,
          nuevo: asigs.some(a => a.email === u.email && a.entidad === id && a.estado === 'activa' && a.origen !== 'bienvenida enviada' && a.origen !== 'histórico' && !splitList_(u.coordEnts).length && daysAgo_(a.fecha) < 30)
        })),
        sesiones: sesiones_(asis.filter(a => a.entidad === id), byEmail)
      };
    });
  }

  // Pastoral: todo, incluido el enlace a los archivos
  if (me.rol === 'pastoral') {
    out.pastoral = {
      personas: users.map(u => ({
        email: u.email, nombre: u.nombre, rol: u.rol, estado: u.estado, curso: u.curso, coordEnts: splitList_(u.coordEnts), alta: iso_(u.alta),
        asignaciones: asigs.filter(a => a.email === u.email && a.estado !== 'baja').map(a => ({ entidad: a.entidad, estado: a.estado })),
        docs: Object.keys(TIPOS_DOC).reduce((o, t) => {
          const r = docs.find(x => x.email === u.email && x.tipo === t);
          o[t] = { estado: r ? r.estado : 'pend', url: r && r.fileId ? 'https://drive.google.com/file/d/' + r.fileId + '/view' : '', fecha: r ? iso_(r.fecha) : '' };
          return o;
        }, {}),
        horas: horasDe(u.email)
      })),
      inscripciones: rows_('Inscripciones').map(r => ({
        id: String(r.id), fecha: iso_(r.fecha), nombre: r.nombre, email: r.email, curso: r.curso,
        preferencias: splitList_(r.preferencias), preferenciasTexto: r.preferenciasTexto, motivo: r.motivo, estado: r.estado, entidad: r.entidad
      })).reverse(),
      sesiones: sesiones_(asis, byEmail).slice(0, 40),
      invitaciones: rows_('Invitaciones').map(r => ({
        codigo: String(r.codigo), email: r.email, nombre: r.nombre, entidades: splitList_(r.entidades), estado: r.estado,
        creado: iso_(r.creado), usadoPor: r.usadoPor, usadoEn: iso_(r.usadoEn)
      })).reverse(),
      hojaUrl: SpreadsheetApp.openById(prop_('SHEET_ID')).getUrl(),
      carpetaUrl: DriveApp.getFolderById(prop_('FOLDER_ID')).getUrl()
    };
  }
  return out;
}

function sesiones_(rows, byEmail) {
  const g = {};
  rows.forEach(a => {
    const k = String(a.sesion);
    if (!g[k]) g[k] = { sesion: k, fecha: iso_(a.fecha), entidad: a.entidad, horas: Number(a.horas), personas: [] };
    g[k].personas.push(byEmail[a.email] ? nombreCorto_(byEmail[a.email].nombre) : a.email);
  });
  return Object.values(g).sort((a, b) => a.fecha < b.fecha ? 1 : -1);
}

// ───────────────────────── IDENTIDAD Y PERMISOS ─────────────────────────
function verify_(token) {
  if (!token) throw authErr_('Inicia sesión con tu cuenta de Google');
  const cache = CacheService.getScriptCache();
  const key = 't' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).slice(0, 40);
  const hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  const res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw authErr_('Tu sesión ha caducado. Vuelve a entrar.');
  const p = JSON.parse(res.getContentText());
  if (p.aud !== CONFIG.CLIENT_ID) throw authErr_('Token no emitido para esta app');
  if (String(p.email_verified) !== 'true') throw authErr_('Tu correo de Google no está verificado');
  if (Number(p.exp) * 1000 < Date.now()) throw authErr_('Tu sesión ha caducado. Vuelve a entrar.');
  const who = { email: norm_(p.email), nombre: p.name || p.email, foto: p.picture || '' };
  cache.put(key, JSON.stringify(who), Math.max(60, Math.min(3000, Number(p.exp) - Math.floor(Date.now() / 1000) - 60)));
  return who;
}

function currentUser_(who) {
  let u = findUser_(who.email);
  const esPastoral = CONFIG.PASTORAL.map(norm_).indexOf(who.email) >= 0;
  // Si hay una invitación pendiente para este mismo correo, se activa sola al entrar
  const inv = esPastoral ? null : rows_('Invitaciones').find(r => r.email === who.email && r.estado === 'enviada');
  if (inv && (!u || u.estado !== 'baja')) {
    withLock_(() => aplicarInvitacion_(who.email, who.nombre, inv));
    u = findUser_(who.email);
  }
  if (!u) {
    u = { email: who.email, nombre: who.nombre, rol: esPastoral ? 'pastoral' : 'vol', estado: esPastoral ? 'activo' : 'pendiente', curso: '', coordEnts: '', alta: new Date() };
    withLock_(() => { if (!findUser_(who.email)) append_('Usuarios', u); });
    if (!esPastoral) {
      mail_(CONFIG.PASTORAL, 'Cuenta pendiente de aprobar: ' + who.nombre,
        `<p><b>${esc_(who.nombre)}</b> (${esc_(who.email)}) ha entrado por primera vez en la app y espera aprobación.</p>`, 'Revisar', 'panel');
    }
  } else if (esPastoral && (u.rol !== 'pastoral' || u.estado !== 'activo')) {
    withLock_(() => updateWhere_('Usuarios', r => r.email === who.email, { rol: 'pastoral', estado: 'activo' }));
    u.rol = 'pastoral'; u.estado = 'activo';
  }
  if (u.estado === 'baja') throw authErr_('Tu cuenta está dada de baja. Escribe al Servicio de Pastoral.');
  u.foto = who.foto;
  return u;
}

function activo_(me) { if (me.estado !== 'activo') throw httpErr_('Tu cuenta aún está pendiente de aprobación por Pastoral'); }
function pastoral_(me) { if (me.rol !== 'pastoral') throw httpErr_('Solo el Servicio de Pastoral puede hacer esto'); }
function puedeCoordinar_(me, entId) {
  if (me.rol === 'pastoral') return;
  activo_(me);
  if (splitList_(me.coordEnts).indexOf(entId) < 0) throw httpErr_('No coordinas esta entidad');
}

// ───────────────────────── INVITACIONES ─────────────────────────
function nuevoCodigo_() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Date.now());
  let s = '';
  for (let i = 0; i < 6; i++) s += abc[(bytes[i] + 256) % abc.length];
  return s.slice(0, 3) + '-' + s.slice(3);
}
function aplicarInvitacion_(email, nombre, inv) {
  email = norm_(email);
  const u = findUser_(email);
  const ents = splitList_(inv.entidades);
  const coordEnts = u ? splitList_(u.coordEnts) : [];
  ents.forEach(e => { if (coordEnts.indexOf(e) < 0) coordEnts.push(e); });
  upsertUser_(email, {
    nombre: (u && u.nombre && u.nombre !== email && u.nombre !== email.split('@')[0]) ? u.nombre : (inv.nombre || nombre || email),
    rol: u && u.rol === 'pastoral' ? 'pastoral' : (inv.rol || 'coord'),
    estado: 'activo', coordEnts: coordEnts.join(',')
  });
  updateWhere_('Invitaciones', r => String(r.codigo) === String(inv.codigo), { estado: 'usada', usadoPor: email, usadoEn: new Date() });
}
function mailInvitacion_(inv, me) {
  const ents = splitList_(inv.entidades).map(id => { try { return entidad_(id).nombre; } catch (e) { return id; } });
  const url = CONFIG.APP_URL.replace(/\/?$/, '/') + '?codigo=' + encodeURIComponent(inv.codigo);
  const saludo = inv.nombre ? 'Hola, ' + esc_(String(inv.nombre).split(' ')[0]) + ':' : 'Hola:';
  mail_([inv.email], 'Tu invitación para coordinar el Voluntariado Arrupe',
    `<p>${saludo}</p>
     <p>Gracias por aceptar coordinar el Voluntariado Arrupe en <b>${esc_(ents.join(' y '))}</b>. Acompañar a otros mientras sirven es también una forma de servir.</p>
     <p>Desde la app podrás ver a tu equipo, registrar la asistencia y saber quién tiene la documentación al día.</p>
     <p style="margin:22px 0 6px">Tu código de invitación:</p>
     <p style="font-family:Consolas,Menlo,monospace;font-size:28px;font-weight:700;letter-spacing:.12em;color:#12679A;background:#E3F0F8;display:inline-block;padding:10px 18px;border-radius:10px;margin:0">${esc_(inv.codigo)}</p>
     <ol style="padding-left:20px">
       <li>Pulsa el botón de abajo para abrir la app.</li>
       <li>Entra con tu cuenta de Google. Si usas este mismo correo (${esc_(inv.email)}), se activará sola.</li>
       <li>Si entras con otra cuenta, escribe el código cuando te lo pida.</li>
     </ol>`,
    'Abrir la app', '', me.email, url);
}

// ───────────────────────── AYUDANTES ─────────────────────────
function entidad_(id) { const e = rows_('Entidades').find(x => x.id === id); if (!e) throw httpErr_('Entidad no encontrada'); return e; }
function findUser_(email) { return rows_('Usuarios').find(u => u.email === norm_(email)); }
function coordinadores_(entId) { return rows_('Usuarios').filter(u => splitList_(u.coordEnts).indexOf(entId) >= 0 && u.estado === 'activo'); }
function equipo_(entId) { const set = new Set(rows_('Asignaciones').filter(a => a.entidad === entId && a.estado === 'activa').map(a => a.email)); return rows_('Usuarios').filter(u => set.has(u.email)); }
function upsertUser_(email, patch) {
  email = norm_(email);
  if (findUser_(email)) updateWhere_('Usuarios', u => u.email === email, patch);
  else append_('Usuarios', Object.assign({ email, nombre: email, rol: 'vol', estado: 'activo', curso: '', coordEnts: '', alta: new Date() }, patch));
}
function asignar_(email, entId, origen) {
  email = norm_(email);
  const a = rows_('Asignaciones').find(r => r.email === email && r.entidad === entId && r.estado !== 'baja');
  if (a) updateWhere_('Asignaciones', r => r.email === email && r.entidad === entId && r.estado !== 'baja', { estado: 'activa', fecha: new Date(), origen });
  else append_('Asignaciones', { email, entidad: entId, estado: 'activa', fecha: new Date(), origen });
}
function avisarAsignacion_(email, nombre, ent) {
  const coords = coordinadores_(ent.id);
  mail_([email], 'Ya formas parte de ' + ent.nombre,
    `<p>Hola, ${esc_(String(nombre).split(' ')[0])}:</p><p>Te damos la bienvenida al Voluntariado Arrupe en <b>${esc_(ent.nombre)}</b>.</p>
     <p><b>Horario:</b> ${esc_(ent.horario)}<br><b>Lugar:</b> ${esc_(ent.lugar)}</p>
     <p>Entra en la app con esta cuenta de Google para subir tu documentación y ver tus horas.${coords.length ? ' Te escribirá ' + esc_(coords.map(c => c.nombre).join(' y ')) + ', que coordina esta entidad.' : ''}</p>`,
    'Entrar en la app', 'vinicio');
  if (coords.length) mail_(coords.map(c => c.email), 'Nueva incorporación en ' + ent.nombre,
    `<p>Pastoral ha incorporado a <b>${esc_(nombre)}</b> (${esc_(email)}) a <b>${esc_(ent.nombre)}</b>. Escríbele para darle la bienvenida.</p>`,
    'Ver mi equipo', 'cinicio');
}

let _ss = null; const _cache = {};
function ss_() { return _ss || (_ss = SpreadsheetApp.openById(prop_('SHEET_ID'))); }
function prop_(k) { const v = PropertiesService.getScriptProperties().getProperty(k); if (!v) throw new Error('Falta ejecutar setup()'); return v; }
function sheet_(name) {
  let s = ss_().getSheetByName(name);
  if (!s && HOJAS[name]) { // crea sola cualquier hoja nueva que añadan futuras versiones
    s = ss_().insertSheet(name);
    s.getRange(1, 1, 1, HOJAS[name].length).setValues([HOJAS[name]]).setFontWeight('bold').setBackground('#E3F0F8');
    s.setFrozenRows(1);
  }
  if (!s) throw new Error('Falta la hoja ' + name + '. Ejecuta setup().');
  return s;
}
function rows_(name) {
  if (_cache[name]) return _cache[name];
  const sh = sheet_(name);
  const vals = sh.getDataRange().getValues();
  const head = vals.shift() || HOJAS[name];
  const out = vals.filter(r => r.some(c => c !== '')).map(r => {
    const o = {}; head.forEach((h, i) => o[h] = r[i]);
    if ('email' in o) o.email = norm_(o.email);
    return o;
  });
  return (_cache[name] = out);
}
function append_(name, obj) {
  const sh = sheet_(name);
  sh.appendRow(HOJAS[name].map(h => obj[h] === undefined ? '' : safeCell_(obj[h])));
  delete _cache[name];
}
function updateWhere_(name, pred, patch) {
  const sh = sheet_(name);
  const vals = sh.getDataRange().getValues();
  const head = vals[0]; let n = 0;
  for (let i = 1; i < vals.length; i++) {
    const o = {}; head.forEach((h, j) => o[h] = vals[i][j]);
    if ('email' in o) o.email = norm_(o.email);
    if (pred(o)) {
      Object.keys(patch).forEach(k => { const j = head.indexOf(k); if (j >= 0) vals[i][j] = safeCell_(patch[k]); });
      sh.getRange(i + 1, 1, 1, head.length).setValues([vals[i]]); n++;
    }
  }
  delete _cache[name];
  return n;
}
function deleteWhere_(name, pred) {
  const sh = sheet_(name);
  const vals = sh.getDataRange().getValues();
  const head = vals[0];
  for (let i = vals.length - 1; i >= 1; i--) {
    const o = {}; head.forEach((h, j) => o[h] = vals[i][j]);
    if ('email' in o) o.email = norm_(o.email);
    if (pred(o)) sh.deleteRow(i + 1);
  }
  delete _cache[name];
}
function safeCell_(v) { return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; }
function withLock_(fn) { const l = LockService.getScriptLock(); l.waitLock(20000); try { return fn(); } finally { l.releaseLock(); } }
function log_(me, accion, detalle) { try { append_('Registro', { fecha: new Date(), email: me.email, accion, detalle }); } catch (e) { } }
function norm_(e) { return String(e || '').trim().toLowerCase(); }
function splitList_(s) { return String(s || '').split(',').map(x => x.trim()).filter(Boolean); }
function nombreCorto_(n) { const p = String(n || '').split(' '); return p.length > 1 ? p[0] + ' ' + p[1][0] + '.' : p[0]; }
function iso_(d) { if (!d) return ''; const x = d instanceof Date ? d : new Date(d); return isNaN(x) ? '' : Utilities.formatDate(x, 'Europe/Madrid', 'yyyy-MM-dd'); }
function daysAgo_(d) { const x = d instanceof Date ? d : new Date(d); return (Date.now() - x.getTime()) / 86400000; }
function esc_(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function httpErr_(m) { return new Error(m); }
function authErr_(m) { const e = new Error(m); e.auth = true; return e; }

function mail_(to, subject, html, cta, vista, replyTo, urlBoton) {
  to = (to || []).map(norm_).filter(e => e.indexOf('@') > 0 && e.indexOf('correo_de') !== 0);
  if (!to.length) return;
  const boton = cta ? `<p style="margin:24px 0"><a href="${urlBoton || (CONFIG.APP_URL.replace(/\/?$/, '/') + (vista ? '#' + vista : ''))}" style="background:#12679A;color:#fff;padding:11px 18px;border-radius:10px;text-decoration:none;font-weight:600">${cta}</a></p>` : '';
  const body = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#152433;max-width:560px">
    <div style="height:6px;border-radius:6px;background:linear-gradient(90deg,#E58A00,#D9007A,#3A2A85,#8E5A32,#12679A,#D9312B,#55595D,#25995A)"></div>
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6E8193;margin-top:18px">Voluntariado Arrupe</p>
    ${html}${boton}
    <p style="font-size:12px;color:#6E8193">Servicio de Pastoral · Centro Universitario Sagrada Familia · Úbeda</p></div>`;
  try {
    const opts = { to: to.join(','), subject: subject, htmlBody: body, name: CONFIG.REMITENTE };
    if (replyTo) opts.replyTo = replyTo;
    MailApp.sendEmail(opts);
  } catch (e) { Logger.log('Correo no enviado: ' + e); }
}
