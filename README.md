# Constructora Del Valle S.A. — Gestión de Inventarios

Aplicación web didáctica con Node.js, Express y SQLite para consultar existencias, calcular stock de seguridad/punto de reorden, registrar movimientos y señalar posibles órdenes duplicadas.

> **Importante:** no se recibieron las tablas del cuestionario original. Los materiales, órdenes, precios, fechas, proveedores, existencias y supuestos del informe son datos de ejemplo. Sustitúyalos por los datos entregados por su curso antes de presentar el trabajo.

## Requisitos

- Node.js 20 o superior (recomendado Node.js 22 LTS).
- npm.

## Instalación y ejecución

El proyecto separa el sitio web estático en `frontend/` y la API/servidor en `backend/`. Express sirve el contenido del frontend, así que ambos funcionan juntos en el mismo puerto.

Desde una terminal, instale y ejecute las dependencias del backend:

```powershell
cd "C:\Users\HP78D\OneDrive\Desktop\backend\quiz 2"
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Abra `http://localhost:3000`. Para ejecutar sin recarga automática use `npm start`.

En el primer inicio se crea `backend/data/inventario.sqlite` y se cargan los datos de demostración. La semilla se aplica solo si la tabla de materiales está vacía. Para empezar de nuevo, detenga el servidor y elimine **solo** `backend/data/inventario.sqlite` y sus archivos SQLite auxiliares; al iniciar se vuelve a crear. No borre la base si contiene sus propios datos.

`DB_PATH` define una ruta de SQLite relativa al directorio `backend/` desde el que se inicia Node, y `PORT` el puerto HTTP. El archivo `backend/.env` es local y no se incluye en el ZIP.

El proyecto también incluye un conector MySQL opcional en `backend/src/config/database.js`, que exporta `{ pool, testConnection }` y lee `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. Esta conexión no reemplaza todavía el SQLite que usan los modelos actuales; para comprobar MySQL desde un script, importa `testConnection()` y ejecútalo con el servidor MySQL iniciado y la base `inventario_constructora` creada. MySQL Workbench es el cliente gráfico; también debe estar activo el servidor MySQL.

El frontend no requiere instalación aparte: al iniciar el backend, abre `http://localhost:3000`. Está separado por componentes, páginas y rutas hash: `frontend/components/`, `frontend/pages/` y `frontend/routes/`. El punto de entrada es `frontend/app.js`.

## Inicio de sesión

La aplicación presenta la pantalla de acceso antes de permitir el uso del inventario. En la primera ejecución se crea un administrador:

- Correo demo: `admin@delvalle.local`
- Contraseña demo: `DelValleDemo2026!`

Para usar credenciales propias, configura `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env` **antes de la primera ejecución**. La contraseña debe tener al menos 12 caracteres. El proceso de arranque crea el usuario solo si el correo aún no existe; cambiar el `.env` después no restablece una contraseña ya creada.

La contraseña se almacena como hash scrypt con sal aleatoria, nunca en texto plano. Las sesiones usan una cookie `HttpOnly`, `SameSite=Lax`, con expiración de ocho horas; la base de datos conserva el hash del token y su fecha de expiración. Si despliegas bajo HTTPS, configura `COOKIE_SECURE=true`. Las credenciales de demostración son solo para desarrollo académico: reemplázalas antes de usar datos reales.

## Funcionalidad de la página

- Resumen de materiales, stock, stock de seguridad y punto de reorden.
- Alertas cuando el stock disponible es igual o menor al PR.
- Formulario para registrar entradas y salidas; impide saldos negativos.
- Consulta de posibles duplicados bajo la regla: mismo proveedor, mismo SKU, misma cantidad y órdenes separadas por un máximo de 7 días.
- Los candidatos a duplicado son señales para revisión; no se anulan ni se consideran fraude automáticamente.

## API

Todas las respuestas están en JSON. La página se sirve desde el mismo Express, por lo que no requiere configurar CORS.

| Método y ruta | Descripción |
|---|---|
| `GET /api/health` | Estado del servicio |
| `POST /api/auth/login` | Inicia sesión con `{ "email": "...", "password": "..." }` |
| `GET /api/auth/me` | Consulta la identidad de la sesión |
| `POST /api/auth/logout` | Revoca la sesión y elimina la cookie |
| `GET /api/materiales` | Catálogo `{ success, data }` con stock, SS, PR y estado de reposición |
| `GET /api/materiales/:id/stock` | Existencia y hasta 50 movimientos recientes |
| `POST /api/movimientos` | Registra movimiento y actualiza saldo en una transacción; responde `{ success, message, data }` |
| `GET /api/alertas?estado=ABIERTA` | Lista alertas abiertas; `estado=CERRADA` consulta el historial cerrado |
| `PATCH /api/alertas/:id/cerrar` | Cierra una alerta abierta |
| `GET /api/alertas/reorden` | Alertas abiertas recalculadas |
| `GET /api/ordenes/posibles-duplicados` | Devuelve `{ success, total_encontrados, criterio, data }` para pares del mismo proveedor/material, cantidades ±10% y hasta 7 días |

### Ejemplo de movimiento

```http
POST /api/movimientos
Content-Type: application/json
```

```json
{
  "material_id": 1,
  "tipo": "ENTRADA",
  "cantidad": 25,
  "referencia": "OC-2026-2001 / recepción",
  "responsable": "Nombre Apellido",
  "observaciones": "Recepción conforme"
}
```

`tipo` debe ser `ENTRADA` o `SALIDA`; `cantidad` debe ser un número mayor que cero. `referencia` y `responsable` son obligatorios. `fecha_movimiento` es opcional; sin ella se usa la fecha/hora actual. Una salida superior al saldo devuelve HTTP 400 y no modifica el stock ni inserta el movimiento.

## Casos de prueba manuales

1. **Dashboard:** abra la página y confirme 4 materiales; cemento y block aparecen en alertas.
2. **API de salud:** `GET http://localhost:3000/api/health` devuelve `{"estado":"ok",...}`.
3. **Reorden:** `GET /api/materiales` debe mostrar cemento PR 140/stock 115 y block PR 300/stock 280.
4. **Duplicados:** `GET /api/ordenes/posibles-duplicados` detecta OC-2026-1001/1002 y OC-2026-1005/1006.
5. **Entrada:** registre una entrada de 30 sacos de cemento. El saldo pasa de 115 a 145 y se cierra la alerta de cemento.
6. **Salida válida:** registre una salida de 5 sacos; el saldo pasa a 140 y vuelve a estar en el PR, generando alerta.
7. **Salida inválida:** intente retirar una cantidad mayor al stock. El servidor responde HTTP 400 y no altera el saldo.
8. **Validación:** envíe `tipo: "AJUSTE"` o una cantidad negativa; el servidor responde HTTP 400.

Para validar sintaxis y pruebas automatizadas, abra otra terminal dentro de `backend/`:

```powershell
cd "C:\Users\HP78D\OneDrive\Desktop\backend\quiz 2\backend"
npm test
```

## Estructura de carpetas

```text
quiz 2/
├── INFORME.md
├── README.md
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── components/
│   │   ├── alertsPanel.js
│   │   ├── duplicatesPanel.js
│   │   ├── footer.js
│   │   ├── header.js
│   │   ├── loginForm.js
│   │   ├── materialsTable.js
│   │   ├── metrics.js
│   │   ├── movementForm.js
│   │   ├── pageHeading.js
│   │   ├── pageShell.js
│   │   └── utils.js
│   ├── pages/
│   │   ├── alertsPage.js
│   │   ├── dashboardPage.js
│   │   ├── loginPage.js
│   │   ├── materialsPage.js
│   │   ├── notFoundPage.js
│   │   └── ordersPage.js
│   ├── routes/
│   │   └── router.js
│   └── services/
│       └── api.js
└── backend/
    ├── package.json
    ├── package-lock.json
    ├── .env.example
    ├── .gitignore
    ├── test/
    │   ├── database.test.js
    │   ├── alertModel.test.js
    │   ├── password.test.js
    │   └── services.test.js
    └── src/
        ├── index.js
        ├── controllers/
        │   ├── alertaController.js
        │   ├── authController.js
        │   ├── materialController.js
        │   ├── movimientoController.js
        │   └── ordenController.js
        ├── db/
        │   ├── database.js
        │   ├── schema.sql
        │   └── seed.sql
        ├── config/
        │   └── database.js
        ├── middleware/
        │   └── authRequired.js
        ├── models/
        │   ├── alertaModel.js
        │   ├── materialModel.js
        │   ├── movimientoModel.js
        │   ├── ordenModel.js
        │   ├── sessionModel.js
        │   └── userModel.js
        ├── routes/
        │   ├── alertas.js
        │   ├── auth.js
        │   ├── materiales.js
        │   ├── movimientos.js
        │   └── ordenes.js
        └── services/
            ├── duplicados.js
            ├── password.js
            └── reorden.js
```

Las tablas SQLite incluyen `usuarios`, `sesiones`, `materiales`, `proveedores`, `ordenes_compra`, `movimientos` y `alertas`, creadas desde `backend/src/db/schema.sql`. La inicialización crea la cuenta administrativa desde la configuración y carga el catálogo de demostración si está vacío. El archivo físico se genera en `backend/data/inventario.sqlite` al arrancar.

Las rutas del frontend (`frontend/routes/`) resuelven `#/login`, `#/`, `#/materiales`, `#/alertas` y `#/ordenes`, y cargan la página correspondiente desde `frontend/pages/`. Los componentes reutilizables están en `frontend/components/`; el acceso a la API vive en `frontend/services/api.js`. En el backend, las rutas conectan los endpoints HTTP con controladores, y los modelos encapsulan consultas y transacciones SQLite.

## Alcance

El ejemplo está pensado para entrega académica y ejecución local. Incluye inicio de sesión básico, pero no administración de usuarios ni restablecimiento de contraseñas; tampoco aprobación real de compras, integración fiscal o despliegue multiobra endurecido para producción. La matriz, criterios y cifras del `INFORME.md` son supuestos y deben ajustarse al enunciado recibido.
