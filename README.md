# API REST: Catálogo de productos con favoritos y acceso por roles

## Integrantes

| Integrante | Aportes principales |
|---|---|
| Melanie Bermeo | Estructura del proyecto, modelo de usuarios, formato de respuestas y manejo de errores, registro, login con JWT, middlewares de autenticación y rol, script del administrador, pruebas de autenticación, permisos y aislamiento, revisión de código de favoritos, interfaz web opcional |
| José Farías | Conexión a la base de datos, modelos de productos y favoritos, datos de ejemplo, CRUD de productos, favoritos, entorno y colección de Postman, README parte 2 |

## Propósito

API REST hecha con Node.js y Express para gestionar un catálogo de productos y la lista de favoritos de cada usuario. Cualquier persona puede consultar el catálogo sin iniciar sesión. Los usuarios registrados inician sesión con JWT y gestionan **solo sus propios** favoritos. Únicamente el **administrador** puede crear, actualizar y eliminar productos.

## Elección de base de datos: PostgreSQL (`pg`)

Elegimos **PostgreSQL** porque los datos del proyecto son relacionales: un favorito une a un usuario con un producto.

- **Integridad garantizada por la base de datos:** `UNIQUE (usuario_id, producto_id)` impide favoritos duplicados, las claves foráneas impiden referencias a productos o usuarios inexistentes y `CHECK (precio > 0)` impide precios inválidos, aunque falle una validación en el código.
- **Borrado en cascada:** con `ON DELETE CASCADE`, al eliminar un producto se eliminan sus favoritos y los datos quedan consistentes.
- **Consultas parametrizadas** (`$1, $2…`) con `pg`, que evitan la inyección SQL.
- Correo único y rol restringido con `UNIQUE` y `CHECK (rol IN ('usuario','admin'))`.

## Requisitos

- Node.js 18 o superior (probado con Node.js 22) y npm
- PostgreSQL 14 o superior
- Postman (para ejecutar las pruebas)
- Git

## Instalación

1. Clonar el repositorio e instalar las dependencias:

   ```bash
   git clone https://github.com/melanybermeo/Catalogo-api.git
   cd Catalogo-api
   npm install
   ```

2. Tener PostgreSQL encendido y conocer el usuario y la contraseña con los que se entra (por defecto, el usuario `postgres`).

3. Crear el archivo `.env` a partir de la plantilla y completar los valores (ver la tabla siguiente):

   ```bash
   cp .env.example .env        # Windows (CMD): copy .env.example .env
   ```

   El archivo `.env` **no se sube** al repositorio (está en `.gitignore`).

## Variables de entorno

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `DB_HOST` | `localhost` | Servidor de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | *(la suya)* | Contraseña de ese usuario |
| `DB_NAME` | `catalogo_api` | Nombre de la base de datos (se crea sola si no existe) |
| `JWT_SECRET` | *(texto aleatorio)* | Clave para firmar los tokens, **mínimo 32 caracteres** |
| `JWT_EXPIRES_IN` | `1h` | Tiempo de vida del token |
| `ADMIN_NOMBRE` | `Administrador` | Nombre del administrador |
| `ADMIN_CORREO` | `admin@catalogo.com` | Correo del administrador |
| `ADMIN_PASSWORD` | *(mínimo 8 caracteres)* | Contraseña del administrador |

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Inicialización de la base de datos y del administrador

Ejecutar **una vez**, en este orden:

```bash
npm run db:init      # crea la base (si no existe) y las tablas de db/*.sql
npm run seed         # carga 6 productos de ejemplo
npm run crear-admin  # crea el administrador con los datos ADMIN_* del .env
```

- `db:init` ejecuta en orden `db/01_usuarios.sql`, `db/02_productos.sql` y `db/03_favoritos.sql`.
- Los tres comandos se pueden repetir sin duplicar nada.
- El rol `admin` **solo** se obtiene con `npm run crear-admin`; el registro público siempre crea usuarios con rol `usuario`.
- Regla de borrado: al eliminar un producto, sus favoritos se eliminan automáticamente (`ON DELETE CASCADE`).

## Comandos de ejecución

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia la API en `http://localhost:3000/api` |
| `npm run dev` | Inicia la API y la reinicia sola al guardar cambios |
| `npm run db:init` | Crea la base de datos y las tablas |
| `npm run seed` | Carga los productos de ejemplo |
| `npm run crear-admin` | Crea (o promueve) el administrador |
| `npm run token-vencido` | Genera un token vencido para la prueba de 401 en Postman |

Para comprobar que funciona, abrir `http://localhost:3000/api` (responde `"API Catálogo funcionando"`) o `http://localhost:3000/api/productos`.

## Rutas de la API

Prefijo de todas las rutas: `/api`. Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

### Formato de respuesta

Todas las respuestas tienen el mismo formato JSON:

```json
{ "ok": true, "mensaje": "Inicio de sesión correcto", "data": { } }
```

```json
{ "ok": false, "error": { "codigo": "DATOS_INVALIDOS", "mensaje": "Hay datos con formato inválido", "detalles": ["correo: formato inválido"] } }
```

Los errores internos responden `500` con un mensaje genérico. Nunca se envían al cliente el stack, las consultas SQL, los secretos ni los hashes de contraseña.

### Tabla de rutas

| Método y ruta | Permiso | Cuerpo de la petición | Respuestas |
|---|---|---|---|
| `POST /api/auth/registro` | Público | `{ "nombre", "correo", "password" }` (el campo `rol` se ignora) | `201` usuario creado con rol `usuario` · `400` faltan campos · `422` correo inválido o password de menos de 8 caracteres · `409` correo ya registrado |
| `POST /api/auth/login` | Público | `{ "correo", "password" }` | `200` `{ token, tipo, expiraEn, usuario }` · `400` faltan campos · `401` credenciales incorrectas |
| `GET /api/productos?categoria=x` | Público | — | `200` lista de productos (filtrada si se envía `categoria`) |
| `GET /api/productos/:id` | Público | — | `200` producto · `400` id inválido · `404` no existe |
| `POST /api/productos` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | `201` creado · `400` faltan campos · `422` precio ≤ 0 · `401` sin token, token inválido o vencido · `403` no es admin |
| `PUT /api/productos/:id` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | `200` actualizado · `400` / `422` · `401` · `403` · `404` no existe |
| `DELETE /api/productos/:id` | Admin | — | `200` o `204` eliminado (sus favoritos se borran en cascada) · `401` · `403` · `404` |
| `GET /api/favoritos` | Autenticado | — | `200` favoritos del usuario del token · `401` |
| `POST /api/favoritos` | Autenticado | `{ "productoId" }` | `201` agregado · `400` productoId inválido · `404` producto inexistente · `409` ya está en favoritos · `401` |
| `DELETE /api/favoritos/:productoId` | Autenticado | — | `200` o `204` eliminado · `404` no está en los favoritos de **este** usuario · `401` |

> El id del usuario **siempre** se toma del token verificado (`req.usuario.id`), nunca del cuerpo, de la URL ni de la consulta.

### Criterio 400 vs 422

- **400 Bad Request:** la petición está **incompleta o mal formada**. Por ejemplo: JSON mal escrito, campos obligatorios ausentes o vacíos, o un id que no es un número (`/productos/abc`).
- **422 Unprocessable Entity:** la petición está completa y bien formada, pero **algún valor no cumple las reglas**. Por ejemplo: precio ≤ 0, correo con formato inválido o contraseña demasiado corta.

En resumen: si falta algo o no se puede interpretar, es 400; si llegó todo, pero algún valor no es aceptable, es 422.

### Otros códigos

`401` sin token, token inválido o vencido, o credenciales incorrectas · `403` autenticado pero sin el rol necesario · `404` recurso o ruta inexistente · `409` duplicado (correo o favorito).

## Pasos para ejecutar las pruebas

1. Levantar la API (`npm start`) con la base inicializada, los productos de ejemplo cargados y el administrador creado (ver la sección de instalación).
2. En Postman: **Import** → seleccionar la colección y el entorno de la carpeta `postman/`.
3. En el entorno, llenar solo el **Current value** (no se exporta) de:
   - `adminCorreo` y `adminPassword`: los mismos datos del `.env`.
   - `tokenVencido`: ejecutar `npm run token-vencido` y pegar el resultado.
   - `productoId`: el id de un producto existente (por ejemplo `1`).
4. Seleccionar el entorno y ejecutar la colección **en orden** con **Run collection**. Los login guardan automáticamente `tokenA`, `tokenB` y `tokenAdmin`.
5. Los correos de los usuarios A y B se generan en cada ejecución, así que la colección se puede ejecutar varias veces.
6. **Persistencia:** detener el servidor (`Ctrl + C`), volver a ejecutar `npm start` y repetir *Login usuario A* y *A sigue teniendo su favorito*. Los datos deben seguir ahí.

## Interfaz web (opcional)

Con el servidor encendido, abrir `http://localhost:3000` en el navegador. La página (`public/index.html`) consume la misma API: catálogo con filtro por categoría, registro e inicio de sesión, favoritos del usuario y creación, edición y eliminación de productos para el administrador. Es opcional y no reemplaza las pruebas de Postman.

## Recursos y herramientas de apoyo

**Documentación consultada**
- [Express](https://expressjs.com/) — rutas, middlewares y manejo de errores
- [node-postgres (pg)](https://node-postgres.com/) — conexión y consultas parametrizadas
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — firma y verificación de JWT
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — hash de contraseñas
- [PostgreSQL](https://www.postgresql.org/docs/) — restricciones UNIQUE, CHECK y ON DELETE CASCADE
- [Postman Learning Center](https://learning.postman.com/) — colecciones, entornos y scripts de prueba

**Herramientas**
- Visual Studio Code, Postman, PostgreSQL / pgAdmin, Git y GitHub

**Asistentes de IA**
- Melanie Bermeo: Claude (Anthropic) como asistente durante el desarrollo (autenticación, middlewares, pruebas de Postman e interfaz web). El código fue revisado, probado y adaptado por los integrantes, que pueden explicarlo en su totalidad.
- José Farías: Claude (Anthropic) como asistente durante el desarrollo de su parte (productos, favoritos y pruebas de Postman). El código fue revisado, probado y adaptado por los integrantes, que pueden explicarlo en su totalidad.
