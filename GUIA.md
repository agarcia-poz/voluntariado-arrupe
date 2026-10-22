# Voluntariado Arrupe · Guía de puesta en marcha

La app tiene dos piezas:

- **La web** (carpeta `docs/`), que se publica gratis con GitHub Pages en **https://agarcia-poz.github.io/voluntariado-arrupe/**. No guarda ningún dato.
- **El cerebro** (carpeta `apps-script/`), que vive en tu cuenta de Google. Es lo único que toca la hoja de cálculo, la carpeta de documentos y el correo, y antes de responder comprueba quién pregunta y con qué perfil.

Tiempo estimado: unos 30 minutos. No hay que instalar nada en tu ordenador.

---

## Paso 1 · Crear el cerebro en Apps Script

1. Entra en **script.google.com** con tu cuenta del centro y pulsa **Nuevo proyecto**. Llámalo `Voluntariado Arrupe`.
2. Borra lo que haya en `Código.gs` y pega el contenido de `apps-script/Code.gs`.
3. Ve a **Configuración del proyecto** (rueda dentada) y marca **Mostrar el archivo de manifiesto "appsscript.json" en el editor**. Vuelve al editor, abre `appsscript.json` y sustitúyelo por el de `apps-script/appsscript.json`.
4. Arriba de `Code.gs`, en `CONFIG`, cambia:
   - `PASTORAL`: pon el correo real de Lorena en lugar de `CORREO_DE_LORENA@…`.
   - `CLIENT_ID`: lo rellenarás en el paso 2.
5. Elige la función **setup** en el desplegable y pulsa **Ejecutar**. Google pedirá permisos:
   - Elige tu cuenta.
   - Si aparece "Google no ha verificado esta aplicación", pulsa **Configuración avanzada** y luego **Ir a Voluntariado Arrupe**. Es tu propio script.
   - Acepta.
6. En el **Registro de ejecución** verás dos enlaces: la hoja **Voluntariado Arrupe · Datos (PRIVADO)** y la carpeta **Voluntariado Arrupe · Documentos (PRIVADO)**. Ya están creadas, con las 9 entidades cargadas y compartidas solo con Lorena.

> No compartas nunca la hoja ni la carpeta con nadie más. Los coordinadores no las necesitan: trabajan desde la app.

## Paso 2 · Crear el "ID de cliente" de Google (para el botón *Continuar con Google*)

1. Entra en **console.cloud.google.com** con la misma cuenta.
2. Arriba, en el selector de proyectos, pulsa **Proyecto nuevo** y llámalo `Voluntariado Arrupe`.
3. Menú → **APIs y servicios** → **Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**. Así pueden entrar también quienes usan Gmail o @cusafa.es.
   - Nombre de la app: `Voluntariado Arrupe`. Correo de asistencia: el tuyo.
   - No añadas permisos extra: la app solo necesita saber el nombre y el correo de quien entra.
   - Al terminar, pulsa **Publicar la aplicación** para pasarla a producción. Con estos permisos básicos Google no pide verificación.
4. Menú → **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - **Orígenes de JavaScript autorizados**: añade exactamente `https://agarcia-poz.github.io` (sin barra final y sin `/voluntariado-arrupe`).
   - Guarda y copia el **ID de cliente**, que acaba en `.apps.googleusercontent.com`.
5. Pega ese ID en dos sitios:
   - En `CONFIG.CLIENT_ID` dentro de `Code.gs`. Guarda el proyecto.
   - En `docs/config.js` del repositorio, en `CLIENT_ID`. En GitHub, abre el archivo, pulsa el lápiz (*Edit*), cambia el valor y pulsa **Commit changes**.

## Paso 3 · Publicar el cerebro como aplicación web

1. En Apps Script: **Implementar** → **Nueva implementación** → tipo **Aplicación web**.
2. Rellena:
   - Descripción: `v1`.
   - **Ejecutar como: Yo**.
   - **Quién tiene acceso: Cualquier usuario**. La seguridad la pone el inicio de sesión con Google: el script rechaza cualquier petición sin un token válido.
3. Pulsa **Implementar** y copia la **URL de la aplicación web**, que acaba en `/exec`.
4. Pégala en `docs/config.js`, en `API_URL`, igual que antes: lápiz, cambiar y **Commit changes**.

> Cada vez que cambies `Code.gs`, ve a **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**. Así la URL no cambia.

## Paso 4 · Activar la web en GitHub Pages

El código ya está subido al repositorio `agarcia-poz/voluntariado-arrupe`. Solo hay que encender la publicación:

> **Antes:** con una cuenta gratuita de GitHub, Pages solo funciona en repositorios **públicos**. Si el tuyo es privado, ve a **Settings → General**, baja hasta **Danger Zone → Change repository visibility** y elige **Public**. No expone nada sensible: el repositorio solo tiene código; los datos están en tu Drive.

1. En GitHub, abre el repositorio y ve a **Settings → Pages**.
2. En **Build and deployment**, elige **Source: Deploy from a branch**.
3. En **Branch**, elige **main** y la carpeta **/docs**. Pulsa **Save**.
4. En un par de minutos la web estará en **https://agarcia-poz.github.io/voluntariado-arrupe/**.

Cada vez que se cambie algo en la carpeta `docs` (por ejemplo, `config.js`), GitHub vuelve a publicar la web solo, en uno o dos minutos.

> El código de la app es visible en el repositorio, pero no contiene ningún dato personal ni ninguna contraseña. El ID de cliente y la URL del script no son secretos: sin una cuenta de Google autorizada no dan acceso a nada.

## Paso 5 · Conectar el formulario de inscripción

1. Abre tu formulario de Google en modo edición y copia su dirección.
2. Pégala en `CONFIG.FORM` dentro de `Code.gs` y guarda.
3. Ejecuta la función **conectarFormulario**. Desde ese momento:
   - cada inscripción nueva aparece en **Inscripciones** dentro de la app;
   - os llega un correo de aviso a Lorena y a ti.
4. Si el formulario ya tiene respuestas, ejecuta una vez **importarRespuestasExistentes**.

Para que las respuestas se lean bien, las preguntas del formulario deben contener estas palabras:

| Pregunta | Debe contener |
| --- | --- |
| Nombre | "nombre" |
| Correo | "correo" o "email". También vale activar *Recopilar correos electrónicos* en el formulario. |
| Curso | "curso" |
| Preferencia | "voluntariado" o "entidad" |
| Motivación | "motivo" o "por qué" |

Las entidades marcadas se reconocen por su nombre o por las **palabras clave** que puedes editar en *Entidades*.

## Paso 6 · Primer uso

1. Abre la web y entra con tu cuenta: entrarás directamente como Pastoral.
2. En **Personas → Añadir persona**, da de alta a cada coordinador o coordinadora:
   - su correo de Google;
   - perfil *Coordinación*;
   - la entidad que coordina, marcada en **Coordina**;
   - si además sirve en ella, márcala también en **Sirve en**.
3. Revisa el texto, las plazas y el horario de cada entidad en **Entidades**.

## Cómo funciona cada perfil

- **Pastoral (Lorena y tú)** lo ve todo:
  - inscripciones, cuentas por aprobar y solicitudes;
  - los archivos de documentación, que se abren desde la ficha de cada persona en *Personas*;
  - validar o pedir que se repita un documento (la persona recibe un correo con el motivo);
  - publicar noticias y encuentros.
- **Coordinación** ve solo su entidad:
  - su equipo, con correos y horas;
  - el *estado* de la documentación, nunca el archivo;
  - registra sesiones de asistencia, envía la bienvenida y recuerda por correo lo que falta.
- **Voluntariado** ve:
  - sus voluntariados y sus horas;
  - sube su documentación;
  - pide plaza en otra entidad o deja una;
  - tiene un espacio semanal para mirar lo vivido.
- **Alguien que entra por primera vez** sin estar dado de alta queda *pendiente*. Os llega un correo y lo aprobáis desde el Panel.

## Privacidad y protección de datos

- La hoja y la carpeta están en tu Drive y son privadas. La web no guarda datos: solo los pide al script con el token de Google de quien entra.
- Los certificados de delitos de naturaleza sexual solo los podéis abrir Lorena y tú.
- Las reflexiones semanales del voluntariado se guardan en la pestaña *Reflexiones* de la hoja. En la app no las ve nadie más que su autor. Os recomendamos no abrir esa pestaña: es un espacio personal.
- Os recomiendo acordar con la persona responsable de protección de datos del centro dos cosas:
  - un plazo de conservación, por ejemplo borrar la carpeta de documentos al cerrar cada curso;
  - una cláusula informativa en el formulario de inscripción.
- La pestaña *Registro* guarda quién hizo cada cambio y cuándo.

## Novedades: compromiso, horarios, recordatorios y fotos

- **Compromiso de voluntariado:** ya no se sube como archivo. Cada persona lo completa y lo firma en la app (Documentos → Completar y firmar) y recibe una copia por correo. Los datos quedan en la pestaña *Compromisos* de la hoja, que solo veis vosotros.
- **Mis datos:** cada persona mantiene su teléfono, un correo alternativo y un contacto de emergencia. La coordinación ve el teléfono y el contacto de emergencia de su equipo.
- **Horarios:** la coordinación fija turnos semanales o fechas concretas en *Horarios*. El voluntariado los ve en *Mi horario*, marca su turno y puede añadirlo a Google Calendar.
- **Recordatorios:** cada día a las 10:00 sale un correo a quien tiene voluntariado al día siguiente, con botones para confirmar o avisar de que no puede, y un enlace para escribir a la coordinación. El envío diario se instala solo la primera vez que Pastoral entra en la app tras actualizar el script. Si quieres instalarlo a mano, ejecuta `instalarRecordatorios()`.
- **Fotos y vídeos:** voluntariado y coordinación pueden subirlos (con aviso sobre menores identificables). Se guardan en la carpeta privada *Voluntariado Arrupe · Fotos y vídeos*, ordenados por entidad, y la coordinación los ve en *Mi entidad*.

Las hojas nuevas se crean solas. Al actualizar `Code.gs`, revisa que `CONFIG.API_URL` sea la dirección `/exec` de tu aplicación web y que `CONFIG.FIN_CURSO` sea el último día del curso.
