# API REST: Catálogo de productos con favoritos y acceso por roles

## Integrantes

| Integrante | Aportes principales |
|---|---|
| Melanie Bermeo | Estructura del proyecto, modelo de usuarios, formato de respuestas y manejo de errores, registro, login con JWT, middlewares de autenticación y rol, script del administrador, pruebas de autenticación, permisos y aislamiento |
| José Farías | Conexión a la base de datos, modelos de productos y favoritos, datos de ejemplo, CRUD de productos, favoritos, entorno y colección de Postman |

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

<!-- ======================================================
     PARTE 2 (José Farías): Instalación, variables de entorno,
     inicialización de datos y del administrador, comandos de ejecución.
     Datos útiles para esa sección:
       - Script de usuarios: db/01_usuarios.sql
       - Administrador: definir ADMIN_NOMBRE, ADMIN_CORREO, ADMIN_PASSWORD en .env
         y ejecutar `npm run crear-admin`
       - Variables de JWT: JWT_SECRET (mín. 32 caracteres), JWT_EXPIRES_IN (ej. 1h)
     ====================================================== -->

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

<!-- Sección de recursos (Ambos, Tarea 38) -->
