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
  // Último día del curso: fin del compromiso y de los turnos semanales.
  FIN_CURSO: '2027-06-30',
  // Hora (Madrid) a la que salen los recordatorios del día siguiente.
  HORA_RECORDATORIO: 10,
  // Dirección /exec de esta aplicación web (para los botones de los recordatorios).
  API_URL: 'https://script.google.com/macros/s/AKfycbzYykd0tdj1JUVWh91d3g7QRXMeiG6yZh_YlA1cP5EETIpUOBBSp0L6phpzLOhC1Eet/exec',
  REMITENTE: 'Voluntariado Arrupe · Pastoral CUSAFA',
  // Correo del equipo de Pastoral. Si lo rellenas, los correos salen desde esa dirección y las respuestas
  // llegan ahí, en vez de a la cuenta personal que ejecuta el script. Debe estar configurada en Gmail como
  // dirección "Enviar como" de esta cuenta (Gmail → Configuración → Cuentas → Enviar como). Si no, déjalo vacío.
  CORREO_EQUIPO: '',
  // Los avisos para Pastoral solo se ven en la app (sección Avisos); no se envía ningún correo de resumen.
  AVISO_ACUMULADAS: 0
};

// Versión del script. La web la compara con la suya para avisar si hay que actualizar Code.gs.
const VERSION_API = '2026-10-25b';

const TIPOS_DOC = {
  cert: 'Certificado de delitos de naturaleza sexual',
  comp: 'Compromiso de voluntariado'
};

const HOJAS = {
  Usuarios: ['email', 'nombre', 'rol', 'estado', 'curso', 'coordEnts', 'alta', 'telefono', 'emailContacto', 'emergenciaNombre', 'emergenciaTelefono', 'avisos', 'ultimoAcceso'],
  Entidades: ['id', 'nombre', 'lugar', 'etiqueta', 'color', 'descripcion', 'horario', 'cupo', 'ig', 'activa', 'claves', 'whatsapp', 'editadoPor', 'editado'],
  Asignaciones: ['email', 'entidad', 'estado', 'fecha', 'origen'],
  Inscripciones: ['id', 'fecha', 'nombre', 'email', 'curso', 'preferencias', 'preferenciasTexto', 'motivo', 'estado', 'entidad', 'gestionadoPor', 'avisado'],
  Documentos: ['email', 'tipo', 'estado', 'fileId', 'archivo', 'fecha', 'revisadoPor', 'fechaRevision', 'nota'],
  Asistencia: ['sesion', 'fecha', 'entidad', 'email', 'horas', 'registradoPor', 'creado'],
  Noticias: ['id', 'fecha', 'titulo', 'detalle', 'tipo', 'autor'],
  Reflexiones: ['email', 'fecha', 'texto'],
  Registro: ['fecha', 'email', 'accion', 'detalle'],
  Compromisos: ['email', 'nombre', 'dni', 'telefono', 'curso', 'entidades', 'actividades', 'desde', 'hasta', 'acepta', 'firma', 'fecha'],
  Turnos: ['id', 'entidad', 'tipo', 'dia', 'fecha', 'inicio', 'fin', 'lugar', 'nota', 'activo', 'creadoPor', 'creado'],
  Apuntados: ['turno', 'email', 'fecha'],
  Confirmaciones: ['turno', 'fecha', 'email', 'respuesta', 'cuando'],
  Recordatorios: ['turno', 'fecha', 'email', 'enviado'],
  Multimedia: ['fileId', 'entidad', 'email', 'nombre', 'mime', 'fecha', 'descripcion', 'estado'],
  Incidencias: ['id', 'fecha', 'email', 'nombre', 'rol', 'tipo', 'asunto', 'descripcion', 'pantalla', 'navegador', 'adjunto', 'estado', 'respuesta', 'resueltoPor', 'resuelto'],
  Notificaciones: ['id', 'fecha', 'tipo', 'titulo', 'detalle', 'vista', 'leidaPor', 'resumidaPara'],
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
    notificar_('inscripcion', 'Nueva inscripción: ' + ins.nombre, (ins.curso ? ins.curso + ' · ' : '') + 'Prefiere: ' + (prefTxt || '—'), 'ins');
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
function doGet(e) {
  resetCache_();
  const p = (e && e.parameter) || {};
  if (p.r) return responderRecordatorio_(p);
  return json_({ ok: true, app: 'Voluntariado Arrupe', mensaje: 'API activa. La app se usa desde ' + CONFIG.APP_URL });
}

function doPost(e) {
  resetCache_();
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
    notificar_('solicitud', me.nombre + ' quiere servir en ' + ent.nombre, 'Solicitud desde la app', 'panel');
    log_(me, 'solicitarEntidad', ent.id);
    return bootstrap_(me);
  },
  dejarEntidad: (me, d) => {
    const ent = entidad_(d.entidad);
    withLock_(() => updateWhere_('Asignaciones', r => r.email === me.email && r.entidad === ent.id && r.estado !== 'baja', { estado: 'baja', fecha: new Date() }));
    const coords = coordinadores_(ent.id).map(u => u.email);
    if (coords.length) mail_(coords, 'Baja en ' + ent.nombre, `<p><b>${esc_(me.nombre)}</b> ha dejado el voluntariado de <b>${esc_(ent.nombre)}</b> desde la app.</p>`);
    notificar_('baja', me.nombre + ' ha dejado ' + ent.nombre, 'Baja desde la app', 'personas');
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
    notificar_('documento', 'Documento por revisar: ' + me.nombre, TIPOS_DOC[d.tipo], 'personas');
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
      const acc = { cert: 'Subir tu certificado de delitos de naturaleza sexual', comp: 'Firmar tu compromiso de voluntariado (se hace en la propia app, en Documentos)' };
      const pend = Object.keys(TIPOS_DOC).filter(t => (docs.find(x => x.email === u.email && x.tipo === t) || {}).estado !== 'ok').map(t => '<li>' + acc[t] + '</li>').join('');
      mail_([u.email], 'Te falta documentación del Voluntariado Arrupe',
        `<p>Hola, ${esc_(u.nombre.split(' ')[0])}:</p><p>Para seguir sirviendo en <b>${esc_(ent.nombre)}</b> te falta:</p><ul>${pend}</ul><p>Solo el Servicio de Pastoral puede ver tu documentación.</p>`,
        'Completar mi documentación', 'docs');
    });
    log_(me, 'recordarDocumentos', ent.id + ' · ' + faltan.length);
    return { enviados: faltan.length };
  },
  darBienvenida: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const u = findUser_(norm_(d.email));
    if (!u) throw httpErr_('Persona no encontrada');
    const msg = String(d.mensaje || '').trim();
    if (msg.length < 20) throw httpErr_('Escribe una breve presentación antes de enviar');
    if (msg.length > 1500) throw httpErr_('La presentación es demasiado larga (máximo 1500 caracteres)');
    const wa = String(d.whatsapp || '').trim() || String(ent.whatsapp || '');
    if (wa && !/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(wa)) throw httpErr_('El enlace del grupo de WhatsApp debe empezar por https://chat.whatsapp.com/');
    if (wa && wa !== String(ent.whatsapp || '')) withLock_(() => updateWhere_('Entidades', e => e.id === ent.id, { whatsapp: wa, editadoPor: me.email, editado: new Date() }));
    const parrafos = esc_(msg).split(/\n{2,}/).map(x => '<p>' + x.replace(/\n/g, '<br>') + '</p>').join('');
    const waHtml = wa
      ? `<p>Tenemos un <b>grupo de WhatsApp</b> del voluntariado de ${esc_(ent.nombre)} para organizarnos. Únete con este enlace:</p><p><a href="${esc_(wa)}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600">Unirme al grupo de WhatsApp</a></p>`
      : `<p>Vamos a crear un <b>grupo de WhatsApp</b> del voluntariado de ${esc_(ent.nombre)} para organizarnos. Para poder añadirte, comprueba que tu teléfono está en la app, en <b>Mis datos</b>.</p>`;
    mail_([u.email], 'Bienvenida a ' + ent.nombre,
      `<p>Hola, ${esc_(u.nombre.split(' ')[0])}:</p>${parrafos}
       <p style="margin-top:18px"><b>Horario:</b> ${esc_(ent.horario)}<br><b>Lugar:</b> ${esc_(ent.lugar)}</p>
       ${waHtml}
       <p>Antes de empezar, entra en la app para subir tu certificado de delitos de naturaleza sexual y firmar el compromiso de voluntariado. Puedes escribirme respondiendo a este correo.</p>
       <p style="margin-bottom:0">${esc_(me.nombre)}<br><span style="color:#6E8193;font-size:13px">Coordinación · ${esc_(ent.nombre)}</span></p>`,
      'Abrir la app', 'vinicio', me.email);
    withLock_(() => updateWhere_('Asignaciones', r => r.email === u.email && r.entidad === ent.id && r.estado === 'activa', { origen: 'bienvenida enviada' }));
    log_(me, 'darBienvenida', u.email);
    return bootstrap_(me);
  },

  guardarInfoEntidad: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const wa = String(d.whatsapp || '').trim();
    if (wa && !/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/.test(wa)) throw httpErr_('El enlace del grupo de WhatsApp debe empezar por https://chat.whatsapp.com/');
    const desc = String(d.descripcion || '').trim(), hor = String(d.horario || '').trim(), lug = String(d.lugar || '').trim();
    if (!hor || !lug) throw httpErr_('El horario y el lugar no pueden quedar vacíos');
    withLock_(() => updateWhere_('Entidades', e => e.id === ent.id, { descripcion: desc.slice(0, 1200) || ent.descripcion, horario: hor.slice(0, 300), lugar: lug.slice(0, 200), whatsapp: wa, editadoPor: me.email, editado: new Date() }));
    log_(me, 'guardarInfoEntidad', ent.id);
    return bootstrap_(me);
  },
  invitarVoluntarios: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const equipo = {};
    equipo_(ent.id).forEach(u => equipo[u.email] = u);
    const emails = [...new Set((d.emails || []).map(norm_))].filter(e => equipo[e] && e !== me.email);
    if (!emails.length) throw httpErr_('Selecciona al menos a una persona de tu equipo');
    if (emails.length > 40) throw httpErr_('Como máximo 40 invitaciones de una vez');
    const nuevas = [];
    withLock_(() => {
      const usados = new Set(rows_('Invitaciones').map(r => String(r.codigo)));
      emails.forEach(email => {
        updateWhere_('Invitaciones', r => r.email === email && r.estado === 'enviada' && r.rol === 'vol' && splitList_(r.entidades).indexOf(ent.id) >= 0, { estado: 'anulada' });
        let codigo; do { codigo = nuevoCodigo_(); } while (usados.has(codigo)); usados.add(codigo);
        const inv = { codigo, email, nombre: equipo[email].nombre, rol: 'vol', entidades: ent.id, estado: 'enviada', creado: new Date(), creadoPor: me.email, usadoPor: '', usadoEn: '' };
        append_('Invitaciones', inv);
        nuevas.push(inv);
      });
    });
    nuevas.forEach(inv => mailInvitacion_(inv, me));
    log_(me, 'invitarVoluntarios', ent.id + ' · ' + nuevas.length);
    return bootstrap_(me);
  },

  // ── pastoral ──
  // Preselección: asigna sin escribir a la persona. El correo de agradecimiento se envía después, desde Asignadas.
  asignarInscripcion: (me, d) => ACCIONES.asignarInscripciones(me, { items: [{ id: d.id, entidades: d.entidades && d.entidades.length ? d.entidades : [d.entidad] }] }),
  asignarInscripciones: (me, d) => {
    pastoral_(me);
    const items = (d.items || []).map(x => ({ id: String(x.id), entidades: [...new Set((x.entidades || []).filter(Boolean))] }));
    if (!items.length) throw httpErr_('Selecciona al menos una inscripción');
    if (items.length > 80) throw httpErr_('Como máximo 80 inscripciones de una vez');
    const todas = rows_('Inscripciones');
    const saltadas = [];
    for (let k = items.length - 1; k >= 0; k--) {
      const ins = todas.find(r => String(r.id) === items[k].id);
      if (ins && ins.estado === 'asignada') { saltadas.push(ins.nombre); items.splice(k, 1); }
    }
    if (!items.length) { const out = bootstrap_(me); out.hechas = 0; out.aviso = 'Ya estaban preseleccionadas por otra persona del equipo: ' + saltadas.join(', '); return out; }
    items.forEach(x => {
      const ins = todas.find(r => String(r.id) === x.id);
      if (!ins) throw httpErr_('Hay una inscripción que ya no existe. Recarga la página.');
      if (!ins.email) throw httpErr_('La inscripción de ' + (ins.nombre || 'una persona') + ' no tiene correo. Añádelo en la hoja Inscripciones.');
      if (!x.entidades.length) throw httpErr_('Elige al menos una entidad para ' + ins.nombre);
      if (x.entidades.length > 3) throw httpErr_('Como máximo tres entidades para ' + ins.nombre);
      x.entidades.forEach(entidad_);
      x.ins = ins;
    });
    const porEntidad = {};
    withLock_(() => items.forEach(x => {
      updateWhere_('Inscripciones', r => String(r.id) === x.id, { estado: 'asignada', entidad: x.entidades.join(','), gestionadoPor: me.email });
      upsertUser_(x.ins.email, { nombre: x.ins.nombre, curso: x.ins.curso, estado: 'activo' });
      x.entidades.forEach(id => { asignar_(x.ins.email, id, 'inscripción'); (porEntidad[id] = porEntidad[id] || []).push(x.ins); });
    }));
    // Un solo aviso por entidad a su coordinación, con la lista de la tanda
    Object.keys(porEntidad).forEach(id => {
      const ent = entidad_(id), coords = coordinadores_(id).map(u => u.email);
      if (!coords.length) return;
      const lista = porEntidad[id].map(i => `<li><b>${esc_(i.nombre)}</b> · ${esc_(i.curso || '')} · ${esc_(i.email)}</li>`).join('');
      mail_(coords, (porEntidad[id].length === 1 ? 'Nueva incorporación' : porEntidad[id].length + ' nuevas incorporaciones') + ' en ' + ent.nombre,
        `<p>Pastoral ha preseleccionado para <b>${esc_(ent.nombre)}</b> a:</p><ul>${lista}</ul><p>En breve recibirán un correo de agradecimiento anunciando que os pondréis en contacto con ellos. Desde la app podréis escribirles una bienvenida personal e invitarlos.</p>`,
        'Ver mi equipo', 'cinicio');
    });
    log_(me, 'asignarInscripciones', items.length + ' inscripciones');
    const out = bootstrap_(me);
    out.hechas = items.length;
    if (saltadas.length) out.aviso = saltadas.length + (saltadas.length === 1 ? ' ya estaba preseleccionada' : ' ya estaban preseleccionadas') + ' por otra persona del equipo: ' + saltadas.join(', ');
    return out;
  },
  enviarAgradecimiento: (me, d) => {
    pastoral_(me);
    const ids = new Set((d.ids || []).map(String));
    const lista = rows_('Inscripciones').filter(r => ids.has(String(r.id)) && r.estado === 'asignada' && r.email);
    if (!lista.length) throw httpErr_('Selecciona al menos una inscripción asignada');
    if (lista.length > 80) throw httpErr_('Como máximo 80 correos de una vez');
    lista.forEach(ins => mailAgradecimiento_(ins, me));
    withLock_(() => lista.forEach(ins => updateWhere_('Inscripciones', r => String(r.id) === String(ins.id), { avisado: new Date() })));
    log_(me, 'enviarAgradecimiento', lista.length + ' correos');
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
      coordEnts.forEach(x => { if (asig.indexOf(x) < 0) asig.push(x); }); // quien coordina también sirve en esa entidad
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
      horario: d.horario, cupo: Number(d.cupo) || 0, ig: d.ig || '', activa: d.activa === false ? 'no' : 'sí', claves: d.claves || '', whatsapp: d.whatsapp || '', editadoPor: me.email, editado: new Date()
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

  // ── mis datos ──
  guardarMisDatos: (me, d) => {
    const nombre = String(d.nombre || '').trim();
    if (nombre.length < 3) throw httpErr_('Escribe tu nombre y apellidos');
    const tel = String(d.telefono || '').trim();
    if (tel && !/^[+\d][\d\s]{6,}$/.test(tel)) throw httpErr_('El teléfono no parece válido');
    const ec = norm_(d.emailContacto);
    if (ec && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ec)) throw httpErr_('El correo de contacto no es válido');
    withLock_(() => updateWhere_('Usuarios', u => u.email === me.email, {
      nombre, curso: String(d.curso || '').trim(), telefono: txt_(tel), emailContacto: ec,
      emergenciaNombre: String(d.emergenciaNombre || '').trim(), emergenciaTelefono: txt_(String(d.emergenciaTelefono || '').trim()),
      avisos: d.avisos === false ? 'no' : 'sí'
    }));
    log_(me, 'guardarMisDatos', '');
    return bootstrap_(findUser_(me.email));
  },

  // ── compromiso de voluntariado firmado en la app ──
  firmarCompromiso: (me, d) => {
    activo_(me);
    const nombre = String(d.nombre || '').trim(), dni = String(d.dni || '').trim().toUpperCase().replace(/\s|-/g, '');
    const tel = String(d.telefono || '').trim(), curso = String(d.curso || '').trim();
    if (nombre.length < 5) throw httpErr_('Escribe tu nombre y apellidos completos');
    if (!/^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z0-9]{6,12})$/.test(dni)) throw httpErr_('Revisa el DNI, NIE o pasaporte');
    if (!/^[+\d][\d\s]{6,}$/.test(tel)) throw httpErr_('Indica un teléfono de contacto');
    if (!curso) throw httpErr_('Indica tu grado y curso');
    const acepta = d.acepta || {};
    if (!['derechos', 'confidencialidad', 'gratuidad', 'datos'].every(k => acepta[k] === true)) throw httpErr_('Para firmar tienes que marcar las cuatro casillas');
    const normN = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    if (normN(d.firma) !== normN(nombre)) throw httpErr_('Para firmar, escribe tu nombre exactamente igual que arriba');
    const ents = rows_('Asignaciones').filter(a => a.email === me.email && a.estado === 'activa').map(a => a.entidad);
    if (!ents.length) throw httpErr_('Aún no tienes ningún voluntariado asignado');
    const hoy = hoyISO_(0);
    const rec = { email: me.email, nombre, dni: txt_(dni), telefono: txt_(tel), curso, entidades: ents.join(','), actividades: String(d.actividades || '').trim().slice(0, 1000),
      desde: txt_(hoy), hasta: txt_(CONFIG.FIN_CURSO), acepta: 'derechos, confidencialidad, gratuidad, datos', firma: d.firma, fecha: new Date() };
    withLock_(() => {
      if (rows_('Compromisos').some(r => r.email === me.email)) updateWhere_('Compromisos', r => r.email === me.email, rec);
      else append_('Compromisos', rec);
      const docRec = { email: me.email, tipo: 'comp', estado: 'ok', fileId: '', archivo: 'Firmado en la app', fecha: new Date(), revisadoPor: 'firma electrónica', fechaRevision: new Date(), nota: '' };
      if (rows_('Documentos').some(r => r.email === me.email && r.tipo === 'comp')) updateWhere_('Documentos', r => r.email === me.email && r.tipo === 'comp', docRec);
      else append_('Documentos', docRec);
      updateWhere_('Usuarios', u => u.email === me.email, { nombre, telefono: txt_(tel), curso });
    });
    mailCompromiso_(rec, ents);
    log_(me, 'firmarCompromiso', ents.join(','));
    return bootstrap_(findUser_(me.email));
  },

  // ── horarios ──
  guardarTurno: (me, d) => {
    const ent = entidad_(d.entidad);
    puedeCoordinar_(me, ent.id);
    const tipo = d.tipo === 'fecha' ? 'fecha' : 'semanal';
    const hm = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!hm.test(d.inicio) || !hm.test(d.fin) || d.fin <= d.inicio) throw httpErr_('Revisa la hora de inicio y de fin');
    if (tipo === 'semanal' && !(Number(d.dia) >= 1 && Number(d.dia) <= 7)) throw httpErr_('Elige el día de la semana');
    if (tipo === 'fecha' && !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha || '')) throw httpErr_('Elige la fecha');
    const rec = { id: d.id || Utilities.getUuid().slice(0, 8), entidad: ent.id, tipo, dia: tipo === 'semanal' ? Number(d.dia) : '', fecha: tipo === 'fecha' ? txt_(d.fecha) : '',
      inicio: txt_(d.inicio), fin: txt_(d.fin), lugar: String(d.lugar || ent.lugar || '').trim(), nota: String(d.nota || '').trim(), activo: 'sí', creadoPor: me.email, creado: new Date() };
    withLock_(() => {
      if (d.id && rows_('Turnos').some(t => String(t.id) === String(d.id) && t.entidad === ent.id)) updateWhere_('Turnos', t => String(t.id) === String(d.id), rec);
      else append_('Turnos', rec);
    });
    log_(me, 'guardarTurno', ent.id);
    return bootstrap_(me);
  },
  borrarTurno: (me, d) => {
    const t = rows_('Turnos').find(x => String(x.id) === String(d.id));
    if (!t) throw httpErr_('Turno no encontrado');
    puedeCoordinar_(me, t.entidad);
    withLock_(() => updateWhere_('Turnos', x => String(x.id) === String(d.id), { activo: 'no' }));
    return bootstrap_(me);
  },
  apuntarTurno: (me, d) => {
    activo_(me);
    const t = rows_('Turnos').find(x => String(x.id) === String(d.turno) && x.activo !== 'no');
    if (!t) throw httpErr_('Turno no encontrado');
    if (!rows_('Asignaciones').some(a => a.email === me.email && a.entidad === t.entidad && a.estado === 'activa')) throw httpErr_('No participas en esta entidad');
    withLock_(() => {
      deleteWhere_('Apuntados', a => String(a.turno) === String(t.id) && a.email === me.email);
      if (d.apuntar) append_('Apuntados', { turno: t.id, email: me.email, fecha: new Date() });
    });
    return bootstrap_(me);
  },
  confirmarAsistencia: (me, d) => {
    activo_(me);
    const t = rows_('Turnos').find(x => String(x.id) === String(d.turno));
    if (!t) throw httpErr_('Encuentro no encontrado');
    if (!rows_('Asignaciones').some(a => a.email === me.email && a.entidad === t.entidad && a.estado === 'activa')) throw httpErr_('No participas en esta entidad');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha || '') || d.fecha < hoyISO_(0)) throw httpErr_('Fecha no válida');
    const resp = d.respuesta === 'no' ? 'no' : 'sí';
    guardarConfirmacion_(t, d.fecha, me.email, resp);
    if (resp === 'no') avisoAusencia_(t, d.fecha, me);
    return bootstrap_(me);
  },

  // ── fotos y vídeos ──
  subirMultimedia: (me, d) => {
    activo_(me);
    const ent = entidad_(d.entidad);
    puedeSubirMedia_(me, ent.id);
    if (d.permiso !== true) throw httpErr_('Confirma que no aparecen menores identificables y que tienes permiso de quienes salen');
    if (!/^(image|video)\//.test(d.mime || '')) throw httpErr_('Solo se pueden subir fotos o vídeos');
    const bytes = Utilities.base64Decode(d.base64);
    if (bytes.length > 25 * 1024 * 1024) throw httpErr_('El archivo supera los 25 MB');
    const folder = carpetaMedia_(ent);
    const ext = (d.nombre || '').split('.').pop().slice(0, 5);
    const nombre = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyyMMdd-HHmmss') + '_' + me.email.split('@')[0] + '.' + ext;
    const file = folder.createFile(Utilities.newBlob(bytes, d.mime, nombre));
    if (d.descripcion) file.setDescription(String(d.descripcion).slice(0, 500));
    withLock_(() => append_('Multimedia', { fileId: file.getId(), entidad: ent.id, email: me.email, nombre: d.nombre || nombre, mime: d.mime, fecha: new Date(), descripcion: String(d.descripcion || '').slice(0, 500), estado: 'activa' }));
    log_(me, 'subirMultimedia', ent.id);
    return { ok: true, misSubidas: rows_('Multimedia').filter(m => m.email === me.email && m.estado === 'activa').length };
  },
  galeria: (me, d) => {
    const ent = entidad_(d.entidad);
    if (me.rol !== 'pastoral' && splitList_(me.coordEnts).indexOf(ent.id) < 0) throw httpErr_('Solo la coordinación de la entidad ve la galería');
    const users = {}; rows_('Usuarios').forEach(u => users[u.email] = u.nombre);
    const items = rows_('Multimedia').filter(m => m.entidad === ent.id && m.estado === 'activa').reverse().slice(0, Number(d.max) || 36);
    return {
      entidad: ent.id,
      carpetaUrl: me.rol === 'pastoral' ? carpetaMedia_(ent).getUrl() : '',
      items: items.map(m => {
        let thumb = '';
        try { const b = DriveApp.getFileById(m.fileId).getThumbnail(); if (b) thumb = 'data:' + (b.getContentType() || 'image/png') + ';base64,' + Utilities.base64Encode(b.getBytes()); } catch (e) { }
        return { id: m.fileId, mime: m.mime, fecha: iso_(m.fecha), autor: nombreCorto_(users[m.email] || m.email), descripcion: m.descripcion, thumb, url: me.rol === 'pastoral' ? 'https://drive.google.com/file/d/' + m.fileId + '/view' : '' };
      })
    };
  },
  quitarMultimedia: (me, d) => {
    const m = rows_('Multimedia').find(x => x.fileId === d.id);
    if (!m) throw httpErr_('Archivo no encontrado');
    puedeCoordinar_(me, m.entidad);
    try { DriveApp.getFileById(m.fileId).setTrashed(true); } catch (e) { }
    withLock_(() => updateWhere_('Multimedia', x => x.fileId === d.id, { estado: 'retirada' }));
    log_(me, 'quitarMultimedia', d.id);
    return ACCIONES.galeria(me, { entidad: m.entidad });
  },

  // ── incidencias / soporte ──
  enviarIncidencia: (me, d) => {
    const tipos = { error: 'Algo no funciona', sugerencia: 'Sugerencia de mejora', duda: 'Duda sobre la app' };
    const tipo = tipos[d.tipo] ? d.tipo : 'error';
    const asunto = String(d.asunto || '').trim().slice(0, 140), desc = String(d.descripcion || '').trim().slice(0, 4000);
    if (asunto.length < 4) throw httpErr_('Escribe un asunto breve');
    if (desc.length < 10) throw httpErr_('Cuéntanos un poco más qué ha pasado');
    const recientes = rows_('Incidencias').filter(r => r.email === me.email && daysAgo_(r.fecha) < 1 / 24).length;
    if (recientes >= 5) throw httpErr_('Has enviado varias incidencias en la última hora. Espera un poco, por favor.');
    let adjunto = '';
    if (d.base64) {
      if (!/^image\/(png|jpeg|webp|heic|heif)$/.test(d.mime || '')) throw httpErr_('La captura debe ser una imagen');
      const bytes = Utilities.base64Decode(d.base64);
      if (bytes.length > 6 * 1024 * 1024) throw httpErr_('La captura supera los 6 MB');
      const f = carpetaIncidencias_().createFile(Utilities.newBlob(bytes, d.mime, Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyyMMdd-HHmm') + '_' + me.email.split('@')[0] + '.' + String(d.mime).split('/')[1]));
      f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
      adjunto = f.getId();
    }
    const id = 'INC-' + Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyMMdd') + '-' + Utilities.getUuid().slice(0, 4).toUpperCase();
    const inc = { id, fecha: new Date(), email: me.email, nombre: me.nombre, rol: me.rol, tipo, asunto, descripcion: desc, pantalla: String(d.pantalla || '').slice(0, 60), navegador: String(d.navegador || '').slice(0, 300), adjunto, estado: 'abierta', respuesta: '', resueltoPor: '', resuelto: '' };
    withLock_(() => append_('Incidencias', inc));
    const rolTxt = { pastoral: 'Pastoral', coord: 'Coordinación', vol: 'Voluntariado' }[me.rol] || me.rol;
    mail_(equipoPastoral_(), '[' + id + '] ' + tipos[tipo] + ': ' + asunto,
      `<p><b>${esc_(me.nombre)}</b> (${esc_(me.email)} · ${esc_(rolTxt)}) ha enviado una incidencia desde la app.</p>
       <div style="border:1px solid #D9E3EC;border-radius:12px;padding:14px 16px">
       <p style="margin:0 0 6px"><b>${esc_(tipos[tipo])}</b> · ${esc_(id)}</p>
       <p style="margin:0 0 10px;font-size:17px"><b>${esc_(asunto)}</b></p>
       ${esc_(desc).split(/\n{2,}/).map(x => '<p style="margin:0 0 8px">' + x.replace(/\n/g, '<br>') + '</p>').join('')}
       <p style="margin:10px 0 0;color:#6E8193;font-size:13px">Pantalla: ${esc_(inc.pantalla || '—')}<br>Navegador: ${esc_(inc.navegador || '—')}${adjunto ? '<br>Captura: <a href="https://drive.google.com/file/d/' + adjunto + '/view">abrir en Drive</a>' : ''}</p></div>
       <p>Responde a este correo para escribir directamente a ${esc_(me.nombre.split(' ')[0])}, o márcala como resuelta en la app.</p>`,
      'Ver incidencias', 'soporte', me.email);
    notificar_('incidencia', 'Incidencia de ' + me.nombre + ': ' + asunto, tipos[tipo], 'soporte');
    log_(me, 'enviarIncidencia', id);
    const out = bootstrap_(me); out.ticket = id; return out;
  },
  resolverIncidencia: (me, d) => {
    pastoral_(me);
    const inc = rows_('Incidencias').find(r => String(r.id) === String(d.id));
    if (!inc) throw httpErr_('Incidencia no encontrada');
    const respuesta = String(d.respuesta || '').trim().slice(0, 2000);
    const estado = d.reabrir ? 'abierta' : 'resuelta';
    withLock_(() => updateWhere_('Incidencias', r => String(r.id) === String(d.id), { estado, respuesta: respuesta || inc.respuesta, resueltoPor: d.reabrir ? '' : me.email, resuelto: d.reabrir ? '' : new Date() }));
    if (!d.reabrir && respuesta) mail_([inc.email], 'Hemos revisado tu incidencia · ' + inc.asunto,
      `<p>Hola, ${esc_(String(inc.nombre || '').split(' ')[0])}:</p><p>Gracias por avisarnos. Hemos revisado tu incidencia <b>${esc_(inc.asunto)}</b> (${esc_(inc.id)}).</p>
       <div style="border-left:3px solid #12679A;padding:4px 0 4px 12px">${esc_(respuesta).split(/\n{2,}/).map(x => '<p style="margin:0 0 8px">' + x.replace(/\n/g, '<br>') + '</p>').join('')}</div>
       <p style="margin-bottom:0">Un abrazo,<br>El equipo de Pastoral</p>`, 'Abrir la app', 'soporte', CONFIG.CORREO_EQUIPO);
    log_(me, 'resolverIncidencia', d.id + ' · ' + estado);
    return bootstrap_(me);
  },
  marcarNotificaciones: (me, d) => {
    pastoral_(me);
    const ids = d.todas ? null : new Set((d.ids || []).map(String));
    withLock_(() => {
      const sh = sheet_('Notificaciones'), vals = sh.getDataRange().getValues(), head = vals[0];
      const iId = head.indexOf('id'), iL = head.indexOf('leidaPor');
      for (let r = 1; r < vals.length; r++) {
        if (ids && !ids.has(String(vals[r][iId]))) continue;
        const l = splitList_(vals[r][iL]);
        if (l.indexOf(me.email) < 0) { l.push(me.email); sh.getRange(r + 1, iL + 1).setValue(l.join(',')); }
      }
      delete _cache.Notificaciones;
    });
    return bootstrap_(me);
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
    ocupadas: asigs.filter(a => a.entidad === e.id && a.estado === 'activa').length,
    whatsapp: (me.rol === 'pastoral' || splitList_(me.coordEnts).indexOf(e.id) >= 0 || asigs.some(a => a.email === me.email && a.entidad === e.id && a.estado === 'activa')) ? (e.whatsapp || '') : '',
    editadoPor: e.editadoPor ? nombreCorto_((users.find(u => u.email === e.editadoPor) || {}).nombre || e.editadoPor) : '', editado: iso_(e.editado)
  }));

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const noticias = rows_('Noticias').map(n => ({ id: n.id, fecha: iso_(n.fecha), titulo: n.titulo, detalle: n.detalle, tipo: n.tipo }))
    .sort((a, b) => a.fecha < b.fecha ? -1 : 1);

  const out = {
    me: { email: me.email, nombre: me.nombre, rol: me.rol, estado: me.estado, curso: me.curso, coordEnts: splitList_(me.coordEnts), foto: me.foto,
      telefono: String(me.telefono || ''), emailContacto: me.emailContacto || '', emergenciaNombre: me.emergenciaNombre || '', emergenciaTelefono: String(me.emergenciaTelefono || ''), avisos: String(me.avisos) !== 'no' },
    config: { horasReferencia: CONFIG.HORAS_REFERENCIA, tiposDoc: TIPOS_DOC, finCurso: CONFIG.FIN_CURSO, hoy: hoyISO_(0) },
    entidades, noticias, version: VERSION_API
  };

  // Lo propio (cualquiera)
  out.mio = {
    asignaciones: asigs.filter(a => a.email === me.email && a.estado !== 'baja').map(a => ({ entidad: a.entidad, estado: a.estado })),
    docs: Object.keys(TIPOS_DOC).reduce((o, t) => { const r = docs.find(x => x.email === me.email && x.tipo === t); o[t] = { estado: r ? r.estado : 'pend', fecha: r ? iso_(r.fechaRevision || r.fecha) : '', nota: r ? r.nota : '' }; return o; }, {}),
    horas: asis.filter(a => a.email === me.email).map(a => ({ fecha: iso_(a.fecha), entidad: a.entidad, horas: Number(a.horas) })).sort((a, b) => a.fecha < b.fecha ? 1 : -1),
    reflexiones: rows_('Reflexiones').filter(r => r.email === me.email).map(r => ({ fecha: iso_(r.fecha), texto: r.texto })).reverse().slice(0, 20)
  };
  const comp = rows_('Compromisos').find(r => r.email === me.email);
  out.mio.compromiso = comp ? { nombre: comp.nombre, dni: String(comp.dni), telefono: String(comp.telefono), curso: comp.curso, entidades: splitList_(comp.entidades), actividades: comp.actividades, desde: iso_(comp.desde), hasta: iso_(comp.hasta), fecha: iso_(comp.fecha) } : null;
  const turnos = rows_('Turnos').filter(t => t.activo !== 'no').map(turnoOut_);
  const apuntados = rows_('Apuntados');
  const confs = rows_('Confirmaciones');
  const misEnts = asigs.filter(a => a.email === me.email && a.estado === 'activa').map(a => a.entidad);
  const hoyS = hoyISO_(0), hasta14 = hoyISO_(14);
  out.mio.turnos = turnos.filter(t => misEnts.indexOf(t.entidad) >= 0).map(t => Object.assign({}, t, { apuntado: apuntados.some(a => String(a.turno) === t.id && a.email === me.email) }));
  out.mio.proximos = [];
  out.mio.turnos.forEach(t => {
    const conAp = apuntados.some(a => String(a.turno) === t.id);
    if (t.tipo === 'semanal' && conAp && !t.apuntado) return;
    ocurrencias_(t, hoyS, hasta14).forEach(f => {
      const c = confs.find(x => String(x.turno) === t.id && iso_(x.fecha) === f && x.email === me.email);
      out.mio.proximos.push({ turno: t.id, entidad: t.entidad, fecha: f, inicio: t.inicio, fin: t.fin, lugar: t.lugar, nota: t.nota, respuesta: c ? c.respuesta : '' });
    });
  });
  out.mio.proximos.sort((a, b) => (a.fecha + a.inicio) < (b.fecha + b.inicio) ? -1 : 1);
  const incs = rows_('Incidencias');
  const incOut = r => ({ id: String(r.id), fecha: r.fecha instanceof Date ? r.fecha.toISOString() : String(r.fecha), nombre: r.nombre, email: r.email, rol: r.rol, tipo: r.tipo, asunto: r.asunto, descripcion: r.descripcion, pantalla: r.pantalla, estado: r.estado, respuesta: r.respuesta, adjunto: me.rol === 'pastoral' && r.adjunto ? 'https://drive.google.com/file/d/' + r.adjunto + '/view' : '', resuelto: iso_(r.resuelto) });
  out.mio.incidencias = incs.filter(r => r.email === me.email).reverse().slice(0, 20).map(incOut);
  if (me.rol === 'pastoral') out.incidencias = incs.slice(-80).reverse().map(incOut);
  out.mio.misSubidas = rows_('Multimedia').filter(m => m.email === me.email && m.estado === 'activa').length;
  if (me.rol === 'pastoral') asegurarRecordatorios_();

  // Coordinación: solo sus entidades, y de los documentos solo el estado (nunca el archivo)
  const coordIds = me.rol === 'pastoral' ? [] : splitList_(me.coordEnts);
  const invs = coordIds.length ? rows_('Invitaciones') : [];
  if (coordIds.length && me.estado === 'activo') {
    out.coord = {};
    coordIds.forEach(id => {
      const team = asigs.filter(a => a.entidad === id && a.estado === 'activa').map(a => byEmail[a.email]).filter(Boolean);
      out.coord[id] = {
        equipo: team.map(u => ({
          email: u.email, nombre: u.nombre, curso: u.curso, telefono: String(u.telefono || ''), emergencia: [u.emergenciaNombre, u.emergenciaTelefono].filter(String).join(' · '),
          otras: asigs.filter(a => a.email === u.email && a.estado === 'activa' && a.entidad !== id).map(a => a.entidad),
          cert: docState(u.email, 'cert'), comp: docState(u.email, 'comp'), horas: horasDe(u.email, id),
          coordina: splitList_(u.coordEnts).indexOf(id) >= 0,
          acceso: !!u.ultimoAcceso,
          invitacion: (() => { const r = invs.filter(x => x.email === u.email && x.rol === 'vol' && splitList_(x.entidades).indexOf(id) >= 0 && x.estado !== 'anulada').pop(); return r ? r.estado : ''; })(),
          nuevo: asigs.some(a => a.email === u.email && a.entidad === id && a.estado === 'activa' && a.origen !== 'bienvenida enviada' && a.origen !== 'histórico' && !splitList_(u.coordEnts).length && daysAgo_(a.fecha) < 30)
        })),
        sesiones: sesiones_(asis.filter(a => a.entidad === id), byEmail),
        turnos: turnos.filter(t => t.entidad === id).map(t => Object.assign({}, t, { apuntados: apuntados.filter(a => String(a.turno) === t.id).map(a => byEmail[a.email] ? nombreCorto_(byEmail[a.email].nombre) : a.email) })),
        proximos: []
      };
      turnos.filter(t => t.entidad === id).forEach(t => {
        const tRow = { id: t.id, tipo: t.tipo };
        const esperados = esperados_(tRow, team.filter(u => u.estado === 'activo'), apuntados);
        ocurrencias_(t, hoyS, hasta14).forEach(f => out.coord[id].proximos.push({
          turno: t.id, fecha: f, inicio: t.inicio, fin: t.fin, lugar: t.lugar,
          personas: esperados.map(u => { const c = confs.find(x => String(x.turno) === t.id && iso_(x.fecha) === f && x.email === u.email); return { email: u.email, nombre: u.nombre, respuesta: c ? c.respuesta : '' }; })
        }));
      });
      out.coord[id].proximos.sort((a, b) => (a.fecha + a.inicio) < (b.fecha + b.inicio) ? -1 : 1);
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
        horas: horasDe(u.email),
        telefono: String(u.telefono || ''), emailContacto: u.emailContacto || '', emergencia: [u.emergenciaNombre, u.emergenciaTelefono].filter(String).join(' · '),
        compromiso: (() => { const r = rows_('Compromisos').find(x => x.email === u.email); return r ? { dni: String(r.dni), fecha: iso_(r.fecha), hasta: iso_(r.hasta), actividades: r.actividades } : null; })()
      })),
      inscripciones: rows_('Inscripciones').map(r => ({
        id: String(r.id), fecha: iso_(r.fecha), nombre: r.nombre, email: r.email, curso: r.curso,
        preferencias: splitList_(r.preferencias), preferenciasTexto: r.preferenciasTexto, motivo: r.motivo, estado: r.estado, entidad: r.entidad, entidades: splitList_(r.entidad), avisado: iso_(r.avisado)
      })).reverse(),
      sesiones: sesiones_(asis, byEmail).slice(0, 40),
      invitaciones: rows_('Invitaciones').map(r => ({
        codigo: String(r.codigo), email: r.email, nombre: r.nombre, rol: r.rol || 'coord', entidades: splitList_(r.entidades), estado: r.estado,
        creado: iso_(r.creado), usadoPor: r.usadoPor, usadoEn: iso_(r.usadoEn)
      })).reverse(),
      notificaciones: rows_('Notificaciones').slice(-60).reverse().map(n => ({ id: String(n.id), fecha: n.fecha instanceof Date ? n.fecha.toISOString() : String(n.fecha), tipo: n.tipo, titulo: n.titulo, detalle: n.detalle, vista: n.vista, leida: splitList_(n.leidaPor).indexOf(me.email) >= 0 })),
      hojaUrl: SpreadsheetApp.openById(prop_('SHEET_ID')).getUrl(),
      multimediaUrl: carpetaMediaRaiz_().getUrl(),
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
  const cid = String(CONFIG.CLIENT_ID || '').trim();
  if (p.aud !== cid) throw authErr_('El ID de cliente no coincide: la web usa ' + String(p.aud).slice(0, 18) + '… y el script tiene ' + (cid.slice(0, 18) || '(vacío)') + '…. Revisa CONFIG.CLIENT_ID en Code.gs y publica una versión nueva.');
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
      notificar_('cuenta', 'Cuenta pendiente de aprobar: ' + who.nombre, who.email, 'panel');
    }
  } else if (esPastoral && (u.rol !== 'pastoral' || u.estado !== 'activo')) {
    withLock_(() => updateWhere_('Usuarios', r => r.email === who.email, { rol: 'pastoral', estado: 'activo' }));
    u.rol = 'pastoral'; u.estado = 'activo';
  }
  if (u.estado === 'baja') throw authErr_('Tu cuenta está dada de baja. Escribe al Servicio de Pastoral.');
  const sinPlaza = splitList_(u.coordEnts).filter(e => !rows_('Asignaciones').some(a => a.email === who.email && a.entidad === e && a.estado === 'activa'));
  if (sinPlaza.length && u.estado === 'activo') withLock_(() => sinPlaza.forEach(e => asignar_(who.email, e, 'coordinación')));
  if (iso_(u.ultimoAcceso) !== hoyISO_(0)) { try { updateWhere_('Usuarios', r => r.email === who.email, { ultimoAcceso: new Date() }); u.ultimoAcceso = new Date(); } catch (e) { } }
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

// ───────────────────────── HORARIOS Y RECORDATORIOS ─────────────────────────
const DIAS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
function hoyISO_(off) { return Utilities.formatDate(new Date(Date.now() + (off || 0) * 86400000), 'Europe/Madrid', 'yyyy-MM-dd'); }
function diaSemana_(iso) { const d = new Date(iso + 'T12:00:00Z'); return ((d.getUTCDay() + 6) % 7) + 1; }
function hhmm_(v) { if (v instanceof Date) return Utilities.formatDate(v, 'Europe/Madrid', 'HH:mm'); return String(v || '').replace(/^'/, '').slice(0, 5); }
function turnoOut_(t) { return { id: String(t.id), entidad: t.entidad, tipo: t.tipo, dia: Number(t.dia) || 0, fecha: iso_(t.fecha), inicio: hhmm_(t.inicio), fin: hhmm_(t.fin), lugar: t.lugar, nota: t.nota }; }
function ocurrencias_(t, desde, hasta) {
  if (t.activo === 'no') return [];
  if (t.tipo === 'fecha') { const f = iso_(t.fecha); return (f >= desde && f <= hasta) ? [f] : []; }
  const out = []; let d = new Date(desde + 'T12:00:00Z'); const end = new Date(hasta + 'T12:00:00Z');
  while (d <= end) { const iso = d.toISOString().slice(0, 10); if (diaSemana_(iso) === Number(t.dia) && iso <= CONFIG.FIN_CURSO) out.push(iso); d = new Date(d.getTime() + 86400000); }
  return out;
}
// Quién está convocado: en fechas concretas, todo el equipo; en turnos semanales, quienes lo han elegido (o todo el equipo si nadie lo ha elegido aún)
function esperados_(t, team, apuntados) {
  if (t.tipo === 'fecha') return team;
  const ap = (apuntados || rows_('Apuntados')).filter(a => String(a.turno) === String(t.id)).map(a => a.email);
  return ap.length ? team.filter(u => ap.indexOf(u.email) >= 0) : team;
}
function guardarConfirmacion_(t, fecha, email, resp) {
  withLock_(() => {
    deleteWhere_('Confirmaciones', c => String(c.turno) === String(t.id) && iso_(c.fecha) === fecha && c.email === email);
    append_('Confirmaciones', { turno: t.id, fecha: txt_(fecha), email, respuesta: resp, cuando: new Date() });
  });
}
function avisoAusencia_(t, fecha, u) {
  const ent = entidad_(t.entidad);
  const coords = coordinadores_(ent.id).map(c => c.email);
  if (!coords.length) { notificar_('ausencia', (u.nombre || u.email) + ' no podrá ir a ' + ent.nombre, fechaLarga_(fecha) + ' · ' + hhmm_(t.inicio), 'personas'); return; }
  mail_(coords, (u.nombre || u.email) + ' no podrá ir · ' + ent.nombre,
    `<p><b>${esc_(u.nombre || u.email)}</b> ha avisado de que <b>no podrá ir</b> al voluntariado de <b>${esc_(ent.nombre)}</b> el ${esc_(fechaLarga_(fecha))} (${esc_(hhmm_(t.inicio))}–${esc_(hhmm_(t.fin))}).</p><p>Puedes responder a este correo para escribirle.</p>`,
    'Ver horarios', 'chorario', u.email);
}
function fechaLarga_(iso, conAnio) {
  const d = new Date(iso + 'T12:00:00Z');
  const m = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return (conAnio ? '' : DIAS[diaSemana_(iso)] + ' ') + d.getUTCDate() + ' de ' + m[d.getUTCMonth()] + (conAnio ? ' de ' + d.getUTCFullYear() : '');
}
function secreto_() { const p = PropertiesService.getScriptProperties(); let s = p.getProperty('SECRET'); if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('SECRET', s); } return s; }
function firmaEnlace_(msg) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(msg, secreto_())).replace(/=+$/, '').slice(0, 24); }
function enlaceRespuesta_(t, fecha, email, r) {
  const base = CONFIG.API_URL || ScriptApp.getService().getUrl();
  return base + '?r=' + r + '&t=' + encodeURIComponent(t.id) + '&f=' + fecha + '&u=' + encodeURIComponent(email) + '&s=' + firmaEnlace_([t.id, fecha, email, r].join('|'));
}
function responderRecordatorio_(p) {
  try {
    if (firmaEnlace_([p.t, p.f, norm_(p.u), p.r].join('|')) !== p.s) throw new Error('Este enlace no es válido.');
    const t = rows_('Turnos').find(x => String(x.id) === String(p.t));
    if (!t) throw new Error('Este encuentro ya no existe.');
    if (p.f < hoyISO_(0)) throw new Error('Este encuentro ya ha pasado.');
    const u = findUser_(p.u) || { email: norm_(p.u), nombre: p.u };
    const ent = entidad_(t.entidad);
    const resp = p.r === 'no' ? 'no' : 'sí';
    guardarConfirmacion_(t, p.f, u.email, resp);
    if (resp === 'no') avisoAusencia_(t, p.f, u);
    return pagina_(resp === 'sí' ? '¡Gracias por confirmar!' : 'Gracias por avisar',
      resp === 'sí' ? `Te esperamos el ${fechaLarga_(p.f)} a las ${hhmm_(t.inicio)} en ${ent.nombre}.` : `Hemos avisado a la coordinación de ${ent.nombre}. Si cambias de idea, vuelve a abrir el correo y pulsa “Confirmo asistencia”.`);
  } catch (err) { return pagina_('No se ha podido registrar', err.message); }
}
function pagina_(titulo, texto) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc_(titulo)}</title></head>
  <body style="margin:0;font-family:Arial,sans-serif;background:#F5F8FB;color:#152433;display:grid;place-items:center;min-height:100vh">
  <div style="max-width:440px;margin:24px;background:#fff;border:1px solid #D9E3EC;border-radius:18px;padding:28px;text-align:center">
  <div style="height:6px;border-radius:6px;background:linear-gradient(90deg,#E58A00,#D9007A,#3A2A85,#8E5A32,#12679A,#D9312B,#55595D,#25995A);margin-bottom:18px"></div>
  <h1 style="font-size:22px;margin:0 0 10px">${esc_(titulo)}</h1><p style="line-height:1.5;margin:0 0 20px">${esc_(texto)}</p>
  <a href="${CONFIG.APP_URL}" style="display:inline-block;background:#12679A;color:#fff;padding:11px 18px;border-radius:10px;text-decoration:none;font-weight:600">Abrir la app</a></div></body></html>`;
  return HtmlService.createHtmlOutput(html).setTitle(titulo).addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
/** Se ejecuta cada día (lo instala la app sola). Envía el recordatorio de los encuentros de mañana. */
function enviarRecordatorios() {
  resetCache_();
  const man = hoyISO_(1);
  const ya = new Set(rows_('Recordatorios').map(r => String(r.turno) + '|' + iso_(r.fecha) + '|' + r.email));
  const apuntados = rows_('Apuntados');
  rows_('Turnos').filter(t => t.activo !== 'no').forEach(t => {
    if (!ocurrencias_(t, man, man).length) return;
    let ent; try { ent = entidad_(t.entidad); } catch (e) { return; }
    const team = equipo_(t.entidad).filter(u => u.estado === 'activo' && String(u.avisos) !== 'no');
    esperados_(t, team, apuntados).forEach(u => {
      const k = String(t.id) + '|' + man + '|' + u.email;
      if (ya.has(k)) return;
      mailRecordatorio_(t, ent, man, u);
      append_('Recordatorios', { turno: t.id, fecha: txt_(man), email: u.email, enviado: new Date() });
    });
  });
}
function mailRecordatorio_(t, ent, fecha, u) {
  const coords = coordinadores_(ent.id).map(c => c.email);
  const si = enlaceRespuesta_(t, fecha, u.email, 'si'), no = enlaceRespuesta_(t, fecha, u.email, 'no');
  const asunto = 'Mañana tienes voluntariado · ' + ent.nombre + ' · ' + hhmm_(t.inicio);
  const mailto = 'mailto:' + coords.join(',') + '?subject=' + encodeURIComponent('Voluntariado ' + ent.nombre + ' · ' + fechaLarga_(fecha));
  const btn = (href, txt, bg, fg) => `<a href="${href}" style="display:inline-block;margin:4px 6px 4px 0;background:${bg};color:${fg};padding:11px 16px;border-radius:10px;text-decoration:none;font-weight:600">${txt}</a>`;
  mail_([u.email], asunto,
    `<p>Hola, ${esc_(String(u.nombre || '').split(' ')[0])}:</p>
     <p>Te recordamos que mañana, <b>${esc_(fechaLarga_(fecha))}</b>, tienes voluntariado en <b>${esc_(ent.nombre)}</b>.</p>
     <p><b>Horario:</b> ${esc_(hhmm_(t.inicio))}–${esc_(hhmm_(t.fin))}<br><b>Lugar:</b> ${esc_(t.lugar || ent.lugar)}${t.nota ? '<br><b>Nota:</b> ' + esc_(t.nota) : ''}</p>
     <p style="margin:20px 0 8px">${btn(si, 'Confirmo asistencia', '#25995A', '#fff')}${btn(no, 'No podré ir', '#EEF3F8', '#152433')}</p>
     ${coords.length ? `<p style="font-size:14px">¿Algún problema? <a href="${mailto}" style="color:#12679A;font-weight:600">Escribe a tu coordinación</a>.</p>` : ''}
     <p style="font-size:12px;color:#6E8193">Puedes desactivar estos recordatorios en la app, en Mis datos.</p>`,
    null, null, coords[0] || '');
}
function asegurarRecordatorios_() {
  const p = PropertiesService.getScriptProperties();
  if (p.getProperty('TRIG_REC') === '1') return;
  try {
    if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'enviarRecordatorios'))
      ScriptApp.newTrigger('enviarRecordatorios').timeBased().everyDays(1).atHour(CONFIG.HORA_RECORDATORIO).inTimezone('Europe/Madrid').create();
    p.setProperty('TRIG_REC', '1');
  } catch (e) { Logger.log('No se pudo instalar el recordatorio diario: ' + e); }
}
/** Por si quieres instalar a mano el envío diario de recordatorios. */
function instalarRecordatorios() { PropertiesService.getScriptProperties().deleteProperty('TRIG_REC'); asegurarRecordatorios_(); Logger.log('Recordatorio diario instalado a las ' + CONFIG.HORA_RECORDATORIO + ':00'); }

// ───────────────────────── COMPROMISO ─────────────────────────
function mailCompromiso_(rec, ents) {
  const nombres = ents.map(id => { const e = entidad_(id); return `<li><b>${esc_(e.nombre)}</b> · ${esc_(e.lugar)} · ${esc_(e.horario)}</li>`; }).join('');
  mail_([rec.email], 'Tu compromiso de voluntariado firmado',
    `<p>Hola, ${esc_(rec.nombre.split(' ')[0])}:</p><p>Hemos recibido tu <b>compromiso de voluntariado</b> firmado en la app. Te dejamos una copia.</p>
     <div style="border:1px solid #D9E3EC;border-radius:12px;padding:14px 16px;font-size:14px">
     <p style="margin:0 0 8px"><b>Entre</b> el centro SAFA-Úbeda (Fundación Escuelas Profesionales de la Sagrada Familia, CIF G23633266, Avda. de Cristo Rey, 25, 23400 Úbeda) <b>y</b> ${esc_(rec.nombre)}, con documento ${esc_(String(rec.dni).replace(/^'/, ''))}.</p>
     <p style="margin:0 0 6px"><b>Voluntariado en:</b></p><ul style="margin:0 0 8px">${nombres}</ul>
     ${rec.actividades ? `<p style="margin:0 0 8px"><b>Actividades:</b> ${esc_(rec.actividades)}</p>` : ''}
     <p style="margin:0 0 8px"><b>Vigencia:</b> del ${esc_(fechaLarga_(String(rec.desde).replace(/^'/, ''), true))} al ${esc_(fechaLarga_(CONFIG.FIN_CURSO, true))}.</p>
     <p style="margin:0"><b>Aceptado:</b> derechos y obligaciones de la persona voluntaria y de la entidad, confidencialidad, carácter gratuito y tratamiento de datos. <b>Firma:</b> ${esc_(rec.firma)} · ${esc_(Utilities.formatDate(rec.fecha, 'Europe/Madrid', "dd/MM/yyyy 'a las' HH:mm"))}</p></div>
     <p>Puedes dejar este compromiso cuando quieras, avisando con al menos 15 días de antelación.</p>`,
    'Abrir la app', 'docs');
}

// ───────────────────────── MULTIMEDIA ─────────────────────────
function carpetaMediaRaiz_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('MEDIA_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const f = DriveApp.createFolder('Voluntariado Arrupe · Fotos y vídeos');
  f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  const owner = norm_(Session.getEffectiveUser().getEmail());
  CONFIG.PASTORAL.map(norm_).filter(e => e !== owner && e.indexOf('@') > 0 && e.indexOf('correo_de') !== 0).forEach(e => { try { f.addEditor(e); } catch (x) { } });
  p.setProperty('MEDIA_ID', f.getId());
  return f;
}
function carpetaMedia_(ent) {
  const root = carpetaMediaRaiz_();
  const it = root.getFoldersByName(ent.nombre);
  return it.hasNext() ? it.next() : root.createFolder(ent.nombre);
}
function puedeSubirMedia_(me, entId) {
  if (me.rol === 'pastoral' || splitList_(me.coordEnts).indexOf(entId) >= 0) return;
  if (!rows_('Asignaciones').some(a => a.email === me.email && a.entidad === entId && a.estado === 'activa')) throw httpErr_('Solo puedes subir fotos de tus voluntariados');
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
  if (inv.rol === 'vol') return aplicarInvitacionVol_(email, nombre, inv);
  const u = findUser_(email);
  const ents = splitList_(inv.entidades);
  const coordEnts = u ? splitList_(u.coordEnts) : [];
  ents.forEach(e => { if (coordEnts.indexOf(e) < 0) coordEnts.push(e); });
  upsertUser_(email, {
    nombre: (u && u.nombre && u.nombre !== email && u.nombre !== email.split('@')[0]) ? u.nombre : (inv.nombre || nombre || email),
    rol: u && u.rol === 'pastoral' ? 'pastoral' : (inv.rol || 'coord'),
    estado: 'activo', coordEnts: coordEnts.join(',')
  });
  ents.forEach(e => { if (!rows_('Asignaciones').some(a => a.email === email && a.entidad === e && a.estado === 'activa')) asignar_(email, e, 'coordinación'); });
  updateWhere_('Invitaciones', r => String(r.codigo) === String(inv.codigo), { estado: 'usada', usadoPor: email, usadoEn: new Date() });
}
// Invitación de voluntariado: da acceso a la cuenta que la usa. Si es otra cuenta distinta del correo invitado, la plaza pasa a esa cuenta.
function aplicarInvitacionVol_(email, nombre, inv) {
  const invitado = norm_(inv.email);
  const u = findUser_(email), orig = findUser_(invitado);
  upsertUser_(email, {
    nombre: (u && u.nombre && u.nombre !== email && u.nombre !== email.split('@')[0]) ? u.nombre : ((orig && orig.nombre) || inv.nombre || nombre || email),
    curso: (u && u.curso) || (orig && orig.curso) || '',
    rol: u && (u.rol === 'pastoral' || u.rol === 'coord') ? u.rol : 'vol',
    estado: 'activo'
  });
  splitList_(inv.entidades).forEach(e => {
    const yaTiene = rows_('Asignaciones').some(a => a.email === email && a.entidad === e && a.estado === 'activa');
    if (email !== invitado) {
      if (yaTiene) updateWhere_('Asignaciones', a => a.email === invitado && a.entidad === e && a.estado === 'activa', { estado: 'baja', fecha: new Date(), origen: 'pasa a ' + email });
      else if (rows_('Asignaciones').some(a => a.email === invitado && a.entidad === e && a.estado === 'activa'))
        updateWhere_('Asignaciones', a => a.email === invitado && a.entidad === e && a.estado === 'activa', { email, origen: 'invitación' });
      else asignar_(email, e, 'invitación');
    } else if (!yaTiene) asignar_(email, e, 'invitación');
  });
  updateWhere_('Invitaciones', r => String(r.codigo) === String(inv.codigo), { estado: 'usada', usadoPor: email, usadoEn: new Date() });
}
function mailInvitacion_(inv, me) {
  if (inv.rol === 'vol') return mailInvitacionVol_(inv, me);
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
    'Abrir la app', '', CONFIG.CORREO_EQUIPO, url);
}

function mailInvitacionVol_(inv, me) {
  const ents = splitList_(inv.entidades).map(id => { try { return entidad_(id).nombre; } catch (e) { return id; } });
  const url = CONFIG.APP_URL.replace(/\/?$/, '/') + '?codigo=' + encodeURIComponent(inv.codigo);
  const saludo = inv.nombre ? 'Hola, ' + esc_(String(inv.nombre).split(' ')[0]) + ':' : 'Hola:';
  mail_([inv.email], 'Tu acceso a la app del Voluntariado Arrupe',
    `<p>${saludo}</p>
     <p>Soy ${esc_(me.nombre)} y coordino el voluntariado de <b>${esc_(ents.join(' y '))}</b>. Te invito a entrar en la app del Voluntariado Arrupe.</p>
     <p>Allí verás tu horario y podrás confirmar tu asistencia, firmar el compromiso de voluntariado, subir tu certificado y consultar tus horas.</p>
     <p style="margin:22px 0 6px">Tu código de acceso:</p>
     <p style="font-family:Consolas,Menlo,monospace;font-size:28px;font-weight:700;letter-spacing:.12em;color:#12679A;background:#E3F0F8;display:inline-block;padding:10px 18px;border-radius:10px;margin:0">${esc_(inv.codigo)}</p>
     <ol style="padding-left:20px">
       <li>Pulsa el botón de abajo para abrir la app.</li>
       <li>Entra con tu cuenta de Google. Si usas este mismo correo (${esc_(inv.email)}), entrarás directamente.</li>
       <li>Si prefieres otra cuenta de Google, escribe el código cuando te lo pida.</li>
     </ol>
     <p>Si tienes cualquier duda, responde a este correo.</p>`,
    'Entrar en la app', '', me.email, url);
}

function mailAgradecimiento_(ins, me) {
  const ents = splitList_(ins.entidad).map(id => { try { return entidad_(id); } catch (e) { return null; } }).filter(Boolean);
  const lista = ents.map(e => `<li><b>${esc_(e.nombre)}</b> · ${esc_(e.lugar)}<br><span style="color:#4A5C6E;font-size:14px">${esc_(e.horario)}</span></li>`).join('');
  const varias = ents.length > 1;
  mail_([ins.email], 'Gracias por inscribirte en el Voluntariado Arrupe',
    `<p>Hola, ${esc_(String(ins.nombre || '').split(' ')[0])}:</p>
     <p>Gracias por inscribirte en el Voluntariado Arrupe. Que hayas dado este paso ya dice mucho de ti.</p>
     <p>Te hemos preseleccionado para ${varias ? 'estos voluntariados' : 'este voluntariado'}:</p><ul style="padding-left:20px">${lista}</ul>
     <p>En los próximos días <b>${varias ? 'las personas que coordinan cada voluntariado' : 'la persona que coordina este voluntariado'} se pondrá${varias ? 'n' : ''} en contacto contigo</b> para darte la bienvenida y contarte cómo empezar.</p>
     <p>Mientras tanto, puedes entrar en la app con esta cuenta de Google para ir completando tu documentación: el certificado de delitos de naturaleza sexual y el compromiso de voluntariado.</p>
     <p style="margin-bottom:0">Un abrazo,<br>El equipo de Pastoral<br><span style="color:#6E8193;font-size:13px">Centro Universitario Sagrada Familia</span></p>`,
    'Entrar en la app', 'docs', CONFIG.CORREO_EQUIPO);
}

function carpetaIncidencias_() {
  const p = PropertiesService.getScriptProperties(), id = p.getProperty('INC_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const f = DriveApp.createFolder('Voluntariado Arrupe · Incidencias (capturas)');
  f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  const owner = norm_(Session.getEffectiveUser().getEmail());
  equipoPastoral_().filter(e => e !== owner).forEach(e => { try { f.addEditor(e); } catch (x) { } });
  p.setProperty('INC_ID', f.getId());
  return f;
}

// ───────────────────────── NOTIFICACIONES PARA PASTORAL ─────────────────────────
function equipoPastoral_() { return CONFIG.PASTORAL.map(norm_).filter(e => e.indexOf('@') > 0 && e.indexOf('correo_de') !== 0); }
function notificar_(tipo, titulo, detalle, vista) {
  try {
    withLock_(() => append_('Notificaciones', { id: Utilities.getUuid().slice(0, 10), fecha: new Date(), tipo, titulo: String(titulo).slice(0, 200), detalle: String(detalle || '').slice(0, 300), vista: vista || 'panel', leidaPor: '', resumidaPara: '' }));
  } catch (e) { Logger.log('No se pudo guardar la notificación: ' + e); }
}
// Envía a cada persona de Pastoral un correo con lo que tiene sin leer y aún no se le ha resumido,
// si se han acumulado CONFIG.AVISO_ACUMULADAS o, en el repaso diario, si hay alguna de hace más de un día.
function resumenNotificaciones_(diario) {
  if (!CONFIG.AVISO_ACUMULADAS) return; // desactivado: los avisos se revisan en la app
  const rows = rows_('Notificaciones');
  equipoPastoral_().forEach(email => {
    const pend = rows.filter(n => splitList_(n.leidaPor).indexOf(email) < 0 && splitList_(n.resumidaPara).indexOf(email) < 0);
    if (!pend.length) return;
    const viejas = pend.some(n => daysAgo_(n.fecha) >= 1);
    if (!(pend.length >= (CONFIG.AVISO_ACUMULADAS || 5) || (diario && viejas))) return;
    const items = pend.slice(-30).reverse().map(n => `<li style="margin-bottom:6px"><b>${esc_(n.titulo)}</b>${n.detalle ? '<br><span style="color:#4A5C6E;font-size:14px">' + esc_(n.detalle) + '</span>' : ''}</li>`).join('');
    mail_([email], pend.length + (pend.length === 1 ? ' aviso pendiente' : ' avisos pendientes') + ' en el Voluntariado Arrupe',
      `<p>Tenéis ${pend.length === 1 ? 'un aviso' : pend.length + ' avisos'} sin revisar en la app:</p><ul style="padding-left:20px">${items}</ul>${pend.length > 30 ? '<p>…y algunos más.</p>' : ''}<p>Los avisos se marcan como leídos al abrirlos en la app.</p>`,
      'Ver los avisos', 'avisos');
    const ids = new Set(pend.map(n => String(n.id)));
    withLock_(() => {
      const sh = sheet_('Notificaciones'), vals = sh.getDataRange().getValues(), head = vals[0];
      const iId = head.indexOf('id'), iR = head.indexOf('resumidaPara');
      for (let r = 1; r < vals.length; r++) if (ids.has(String(vals[r][iId]))) { const l = splitList_(vals[r][iR]); if (l.indexOf(email) < 0) { l.push(email); sh.getRange(r + 1, iR + 1).setValue(l.join(',')); } }
      delete _cache.Notificaciones;
    });
  });
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
     <p>Entra en la app con esta cuenta de Google para completar tu documentación, ver tu horario y tus horas.${coords.length ? ' Te escribirá ' + esc_(coords.map(c => c.nombre).join(' y ')) + ', que coordina esta entidad.' : ''}</p>`,
    'Entrar en la app', 'vinicio');
  if (coords.length) mail_(coords.map(c => c.email), 'Nueva incorporación en ' + ent.nombre,
    `<p>Pastoral ha incorporado a <b>${esc_(nombre)}</b> (${esc_(email)}) a <b>${esc_(ent.nombre)}</b>. Escríbele para darle la bienvenida.</p>`,
    'Ver mi equipo', 'cinicio');
}

let _ss = null; const _cache = {}; const _headOk = {};
function resetCache_() { Object.keys(_cache).forEach(k => delete _cache[k]); Object.keys(_headOk).forEach(k => delete _headOk[k]); }
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
  if (HOJAS[name] && !_headOk[name]) { // añade columnas nuevas al final si la hoja es de una versión anterior
    const w = HOJAS[name].length, lc = Math.max(1, s.getLastColumn());
    const cur = s.getRange(1, 1, 1, Math.max(w, lc)).getValues()[0];
    if (HOJAS[name].some((h, i) => cur[i] !== h) && cur.slice(0, lc).every((h, i) => h === '' || h === HOJAS[name][i]))
      s.getRange(1, 1, 1, w).setValues([HOJAS[name]]).setFontWeight('bold').setBackground('#E3F0F8');
    _headOk[name] = true;
  }
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
function txt_(v) { v = String(v == null ? '' : v); return v ? "'" + v.replace(/^'/, '') : ''; }
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
    const opts = { htmlBody: body, name: CONFIG.REMITENTE };
    const resp = replyTo || CONFIG.CORREO_EQUIPO;
    if (resp) opts.replyTo = resp;
    if (CONFIG.CORREO_EQUIPO) {
      try { GmailApp.sendEmail(to.join(','), subject, '', Object.assign({ from: CONFIG.CORREO_EQUIPO }, opts)); return; }
      catch (e) { Logger.log('No se pudo enviar desde ' + CONFIG.CORREO_EQUIPO + ', se envía desde la cuenta del script: ' + e); }
    }
    MailApp.sendEmail(Object.assign({ to: to.join(','), subject: subject }, opts));
  } catch (e) { Logger.log('Correo no enviado: ' + e); }
}
