# Pedro Vargas Fotografía — Fullstack App

Sitio web y plataforma de gestión para un estudio de fotografía profesional. Incluye portal público, portal de clientes, dashboard de administración e invitaciones digitales con sistema RSVP.

---

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Despliegue en producción (Hostinger)](#despliegue-en-producción-hostinger)
- [API — Rutas principales](#api--rutas-principales)
- [Modelos de datos](#modelos-de-datos)
- [Lecciones aprendidas y gotchas críticos](#lecciones-aprendidas-y-gotchas-críticos)

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19 | Framework de UI |
| React Router | 7 | Enrutamiento SPA |
| TypeScript | 5.7 | Tipado estático |
| Vite | 6 | Build tool y dev server |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| Framer Motion | 12 | Animaciones |
| Lucide React | 0.475 | Iconografía |

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | 4.18 | Framework HTTP |
| TypeScript | 5.4 | Tipado estático |
| Prisma ORM | 5.10 | Acceso a base de datos |
| SQLite | — | Base de datos (archivo local) |
| JWT | — | Autenticación (access + refresh tokens) |
| bcryptjs | — | Hashing de contraseñas |
| Multer | — | Subida de archivos/imágenes |
| Nodemailer | — | Envío de emails (SMTP) |
| Helmet | — | Headers de seguridad HTTP |
| express-rate-limit | — | Rate limiting |
| QRCode | — | Generación de QR para invitaciones |

---

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│                    Cliente                       │
│  React SPA (Vite build → /dist/)                 │
│  Servido como archivos estáticos por Express     │
└──────────────────────┬──────────────────────────┘
                       │ HTTP /api/*
┌──────────────────────▼──────────────────────────┐
│              Express API Server                  │
│  server/dist/server.js  (puerto: $PORT || 3001)  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Auth    │  │  Admin   │  │   Client     │   │
│  │  Routes  │  │  Routes  │  │   Routes     │   │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │               │            │
│  ┌────▼──────────────▼───────────────▼────────┐  │
│  │          Prisma ORM                         │  │
│  └─────────────────────┬───────────────────────┘  │
│                        │                          │
│  ┌─────────────────────▼───────────────────────┐  │
│  │          SQLite Database (dev.db)            │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Flujo de la aplicación:**
- El servidor Express sirve el frontend (`/dist/index.html`) para todas las rutas que no sean `/api/*`
- Las rutas `/api/*` son manejadas por los controladores de Express
- Al iniciar, el servidor ejecuta automáticamente las migraciones de Prisma y crea el usuario admin si no existe

---

## Funcionalidades

### Portal público
- Galería de portfolio por categorías
- Sección de servicios con precios
- Testimonios de clientes
- Formulario de contacto
- Showcase de invitaciones digitales

### Portal de clientes (autenticado)
- Ver y crear reservas de servicios
- Historial de reservas (con archivo automático)
- Crear y gestionar invitaciones digitales personalizadas
- Subir fotos al evento
- Sistema de invitados con RSVP individual por token único
- QR code por invitado

### Dashboard de administración
- Métricas y actividad reciente
- Gestión de solicitudes de contacto
- Gestión completa de reservas
- Gestión de portfolio (imágenes, categorías, orden)
- Gestión de testimonios y servicios
- Gestión de clientes y cuentas
- Gestión de invitaciones digitales
- Registro de actividad (audit log) y notificaciones
- Configuración del sitio (textos, contacto, redes sociales)

---

## Estructura del proyecto

```
pedrovargasfotografia.com/
├── dist/                        # Frontend compilado (Vite output, git-ignored*)
├── public/                      # Archivos públicos estáticos (git-ignored*)
├── uploads/                     # Imágenes subidas por usuarios
│
├── src/                         # Código fuente del frontend
│   ├── api/
│   │   └── client.ts            # HTTP client con auto-refresh de tokens
│   ├── assets/                  # Imágenes y recursos
│   │   ├── photos-raw/          # Fotos originales (no incluidas en build)
│   │   └── photos-web/          # Fotos optimizadas para web
│   ├── components/
│   │   ├── admin/               # Componentes del dashboard admin
│   │   ├── client/              # Componentes del portal de clientes
│   │   └── invitations/         # Sistema de invitaciones digitales
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto global de autenticación
│   ├── data/                    # Datos estáticos (galleryData.ts)
│   └── types/                   # Definiciones TypeScript adicionales
│
├── server/                      # Código fuente del backend
│   ├── dist/                    # Backend compilado (tsc output, en git)
│   │   ├── server.js            # ⚡ Entry point — corre migraciones + seed al iniciar
│   │   ├── app.js               # Configuración de Express
│   │   ├── controllers/         # Lógica de negocio compilada
│   │   ├── routes/              # Rutas compiladas
│   │   ├── middleware/          # Middleware compilado
│   │   ├── services/            # Servicios compilados
│   │   └── utils/               # Utilidades compiladas
│   ├── prisma/
│   │   ├── schema.prisma        # Definición del esquema de BD
│   │   ├── migrations/          # Migraciones de Prisma
│   │   └── seed.ts              # Script de seed completo (dev)
│   └── src/                     # Código fuente TypeScript del backend
│       ├── server.ts            # Entry point con initDatabase()
│       ├── app.ts               # Setup de Express, middlewares y rutas
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── adminController.ts
│       │   ├── clientController.ts
│       │   ├── contactController.ts
│       │   └── notificationController.ts
│       ├── middleware/
│       │   ├── auth.ts          # JWT verification
│       │   ├── roles.ts         # requireAdmin / requireClient
│       │   ├── upload.ts        # Multer config
│       │   └── errorHandler.ts  # Error handler global
│       ├── routes/
│       │   ├── auth.ts          # /api/auth/*
│       │   ├── admin.ts         # /api/admin/*
│       │   ├── client.ts        # /api/client/*
│       │   ├── contact.ts       # /api/contact
│       │   └── public.ts        # /api/public/*
│       ├── services/
│       │   └── archivalService.ts  # Archivo automático de registros
│       ├── types/
│       │   └── index.ts         # Tipos Express extendidos
│       └── utils/
│           ├── prisma.ts        # Singleton de PrismaClient
│           ├── jwt.ts           # sign/verify tokens
│           ├── password.ts      # hash/compare bcrypt
│           ├── response.ts      # Helpers de respuesta HTTP
│           ├── activityLogger.ts
│           └── email.ts         # Nodemailer
│
├── .env                         # Variables de entorno (⚠️ NO commitear)
├── .env.production              # Variables de entorno producción (⚠️ NO commitear)
├── .gitignore
├── package.json                 # Dependencias raíz + scripts de despliegue
├── tsconfig.json                # Configuración TypeScript (frontend)
├── vite.config.ts               # Configuración Vite
└── tailwind.config.js           # Configuración Tailwind CSS
```

> **Nota:** `server/dist/` está en git porque Hostinger no tiene `ts-node` disponible en producción. El código compilado es el que ejecuta el servidor.

---

## Desarrollo local

### Prerequisitos
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### 1. Instalar dependencias

```bash
# Dependencias del frontend y backend raíz
npm install

# Dependencias del servidor (tipos, ts-node-dev, etc.)
npm install --prefix server
```

> El `postinstall` del root construye automáticamente el frontend y genera el cliente de Prisma. Para desarrollo esto no es necesario, pero ocurre.

### 2. Configurar variables de entorno

Crea los archivos de entorno (ver sección [Variables de entorno](#variables-de-entorno)):

```bash
# Variables del frontend (Vite las embebe en el bundle en tiempo de compilación)
cp .env.example .env

# Variables del backend
cp server/.env.example server/.env
```

### 3. Configurar la base de datos

```bash
# Crear la base de datos y aplicar migraciones
npx prisma migrate dev --schema=server/prisma/schema.prisma

# Poblar con datos de prueba (admin, cliente demo, portfolio, etc.)
npm run db:seed --prefix server
```

### 4. Ejecutar en modo desarrollo

```bash
# Inicia frontend (Vite) y backend (ts-node-dev) en paralelo
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

### 5. Compilar para producción

```bash
# Compila frontend (Vite → dist/) y backend (tsc → server/dist/)
npm run build:all
```

---

## Variables de entorno

### Frontend (archivo raíz `.env`)

Vite embebe estas variables **en tiempo de compilación** en el bundle JS. No son accesibles en runtime. Deben empezar con `VITE_`.

```env
# URL base de la API. Usar /api para producción (misma origen).
# Usar http://localhost:3001/api solo para desarrollo si el proxy no está configurado.
VITE_API_URL=/api
```

> **Crítico:** En producción en Hostinger, este valor debe ser `/api` (ruta relativa).
> El servidor Express sirve el frontend en el mismo origen, por lo que `/api` resuelve correctamente.

### Backend (archivo `server/.env`)

```env
# ─── Base de datos ─────────────────────────────────────────────────────────────
# SQLite: ruta al archivo de base de datos relativa al directorio de trabajo (cwd)
DATABASE_URL="file:./dev.db"

# ─── Servidor ──────────────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tudominio.com

# ─── JWT — CAMBIAR EN PRODUCCIÓN ───────────────────────────────────────────────
# Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=tu_secreto_de_acceso_muy_largo_y_aleatorio
JWT_REFRESH_SECRET=tu_secreto_de_refresco_diferente_al_anterior

JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ─── Admin inicial ─────────────────────────────────────────────────────────────
# Se crea automáticamente al arrancar el servidor si no existe en la BD
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=TuPasswordSegura123!
ADMIN_NAME=Nombre del Admin

# ─── Email / SMTP ──────────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucorreo@gmail.com
SMTP_PASS=tu_app_password_de_gmail
SMTP_FROM="Pedro Vargas Fotografía <tucorreo@gmail.com>"

# ─── Archivos ──────────────────────────────────────────────────────────────────
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760   # 10 MB en bytes

# ─── Archivado automático ──────────────────────────────────────────────────────
BOOKING_ARCHIVE_AFTER_DAYS=180
INVITATION_ARCHIVE_AFTER_DAYS=365
ARCHIVE_SWEEP_INTERVAL_MINUTES=60
```

---

## Base de datos

### ORM y motor
- **Prisma ORM** con **SQLite** como motor de base de datos
- La base de datos es un archivo local (`dev.db` por defecto, configurable con `DATABASE_URL`)
- Requiere que el directorio de trabajo tenga permisos de escritura

### Comandos útiles (desarrollo)

```bash
# Crear nueva migración después de cambiar el schema
npx prisma migrate dev --schema=server/prisma/schema.prisma --name nombre_migracion

# Aplicar migraciones existentes (producción)
npx prisma migrate deploy --schema=server/prisma/schema.prisma

# Generar el cliente de Prisma (después de cambiar schema o en postinstall)
npx prisma generate --schema=server/prisma/schema.prisma

# Explorar la BD visualmente
npx prisma studio --schema=server/prisma/schema.prisma

# Reset completo + seed (solo desarrollo)
npm run db:reset --prefix server
```

### Inicialización automática en producción

El archivo `server/dist/server.js` ejecuta automáticamente al arrancar:

1. **Migraciones:** `prisma migrate deploy` vía `execSync` — aplica todas las migraciones pendientes
2. **Admin:** Crea el usuario admin (con los datos de `ADMIN_EMAIL`/`ADMIN_PASSWORD`) si no existe
3. **SiteSettings:** Crea la configuración inicial del sitio si no existe

Esto significa que **no es necesario correr comandos manuales de BD** al desplegar una nueva versión.

### Modelos principales

| Modelo | Tabla | Descripción |
|---|---|---|
| `User` | `users` | Usuarios (ADMIN \| CLIENT), roles, autenticación |
| `RefreshToken` | `refresh_tokens` | Tokens de sesión activos |
| `ContactRequest` | `contact_requests` | Formularios de contacto públicos |
| `Booking` | `bookings` | Reservas de servicios fotográficos |
| `PortfolioItem` | `portfolio_items` | Galería del portfolio |
| `Testimonial` | `testimonials` | Testimonios de clientes |
| `Service` | `services` | Servicios ofrecidos con precios |
| `DigitalInvitation` | `digital_invitations` | Invitaciones digitales con RSVP |
| `InvitationGuest` | `invitation_guests` | Invitados individuales con token RSVP |
| `ActivityLog` | `activity_logs` | Registro de auditoría de acciones |
| `SiteSettings` | `site_settings` | Configuración global del sitio (singleton) |

---

## Despliegue en producción (Hostinger)

Esta sección documenta el proceso completo para desplegar en **Hostinger Business Hosting** con la opción **Web Applications (Node.js)**, específicamente con el preset **Express**.

### Requisitos en hPanel

1. Ir a **Aplicaciones Web** → **Crear aplicación**
2. Configurar:
   - **Framework:** Express
   - **Node.js version:** 18 (crítico — Node 22 tiene incompatibilidades)
   - **Entry file:** `server/dist/server.js`
   - **Output directory:** `dist`
   - **Repository:** conectar el repositorio de GitHub (rama `main`)

> **Importante:** El preset Express ejecuta `npm install` y luego `node server/dist/server.js` directamente.
> **NO** ejecuta `npm start` ni `npm run build`. El `postinstall` sí se ejecuta automáticamente.

### Flujo de despliegue (lo que hace Hostinger automáticamente)

```
git push origin main
        ↓
Hostinger detecta cambios
        ↓
npm install  (instala dependencies del root package.json)
        ↓
postinstall: npx vite build && npx prisma generate
  ├── Compila el frontend → /dist/
  └── Genera el cliente de Prisma
        ↓
node server/dist/server.js  (entry point)
  ├── initDatabase()
  │   ├── prisma migrate deploy  (crea/actualiza tablas)
  │   ├── Crea admin si no existe
  │   └── Crea siteSettings si no existe
  └── app.listen(PORT)  ← servidor listo
```

### Variables de entorno en Hostinger

Importar en hPanel → **Aplicaciones Web** → tu app → **Variables de entorno** (o importar archivo `.env`):

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./dev.db
FRONTEND_URL=https://tudominio.com
JWT_ACCESS_SECRET=<secreto_largo_aleatorio>
JWT_REFRESH_SECRET=<otro_secreto_largo_aleatorio>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=TuPasswordSegura123!
ADMIN_NAME=Nombre Admin
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=correo@gmail.com
SMTP_PASS=app_password
SMTP_FROM=Pedro Vargas Fotografía <correo@gmail.com>
UPLOAD_DIR=uploads
```

> **No incluir** `VITE_API_URL` en el panel de Hostinger — esa variable se embebe en el bundle durante `postinstall` y siempre debe ser `/api`.

### Por qué todas las dependencias están en `dependencies` (no `devDependencies`)

Hostinger solo instala `dependencies`, no `devDependencies`. Por eso estas librerías que normalmente serían `devDependencies` están en `dependencies`:

- `typescript` — para `npx tsc` en postinstall (build del frontend)
- `vite`, `@vitejs/plugin-react` — para `npx vite build`
- `tailwindcss`, `autoprefixer`, `postcss` — necesarios para Vite build
- `@types/react`, `@types/react-dom` — necesarios para `tsc`

### Por qué `server/dist/` está commiteado en git

El backend está escrito en TypeScript (`server/src/`) pero Hostinger no tiene `ts-node` disponible. La compilación TypeScript (`tsc`) se hace **localmente en desarrollo** y el resultado (`server/dist/`) se commitea para que Hostinger pueda ejecutarlo directamente.

**Flujo de trabajo para cambios en el backend:**

```bash
# 1. Editar archivos en server/src/
# 2. Compilar
npm run build:all

# 3. Verificar que server/dist/ tiene los cambios
# 4. Commitear AMBOS: los .ts y los .js compilados
git add server/src/ server/dist/
git commit -m "descripción del cambio"
git push origin main
```

### Scripts de npm relevantes

```json
{
  "postinstall": "npx vite build && npx prisma generate --schema=server/prisma/schema.prisma",
  "start": "node server/dist/server.js",
  "build": "npx tsc -b && npx vite build",
  "build:all": "npm run build && npm run build --prefix server",
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "dev:client": "vite",
  "dev:server": "npm run dev --prefix server"
}
```

### Errores comunes en Hostinger y soluciones

| Error | Causa | Solución |
|---|---|---|
| `"package.json null"` (en Hostinger logs) | El `postinstall` o `start` falla antes de que el servidor arranque | Ver los logs reales del proceso — este mensaje es genérico de Hostinger |
| `tsc: command not found` | `typescript` está en `devDependencies` | Mover `typescript` y `vite` a `dependencies` |
| TypeScript errors `TS7016` | `@types/react` en `devDependencies` | Mover a `dependencies` |
| `VITE_API_URL` hardcodeado a `localhost:3001` | Variable embebida en build previo | Cambiar en `.env` a `VITE_API_URL=/api` y forzar rebuild |
| `new URL('/api/...')` throws | `new URL()` no acepta rutas relativas | Prepend `window.location.origin` para rutas relativas |
| 503 Service Unavailable | Framework en `Vite` (solo estático) sin server | Cambiar a preset `Express` en hPanel |
| 500 en `/api/auth/login` | Tablas no existen (migrate nunca corrió) | Las migraciones ahora corren automáticamente en `initDatabase()` |
| `secretOrPrivateKey must have a value` | `JWT_ACCESS_SECRET` no está seteado | Agregar variables JWT en hPanel |
| Node version 22 incompatible | Hostinger por defecto puede usar Node 22 | Fijar a Node 18 en hPanel o con `.nvmrc` |

---

## API — Rutas principales

### Autenticación (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro de nuevo cliente |
| POST | `/api/auth/login` | No | Login — retorna access + refresh tokens |
| POST | `/api/auth/refresh` | No | Renovar access token con refresh token |
| POST | `/api/auth/logout` | No | Invalidar refresh token |
| GET | `/api/auth/me` | JWT | Obtener perfil del usuario actual |
| PATCH | `/api/auth/me` | JWT | Actualizar nombre/teléfono |
| PATCH | `/api/auth/change-password` | JWT | Cambiar contraseña |
| PATCH | `/api/auth/accept-terms` | JWT | Registrar aceptación de T&C |

### Público (`/api/public`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/public/portfolio` | No | Items del portfolio visibles |
| GET | `/api/public/testimonials` | No | Testimonios visibles |
| GET | `/api/public/services` | No | Servicios activos |
| GET | `/api/public/settings` | No | Configuración del sitio |
| POST | `/api/contact` | No | Enviar formulario de contacto |
| GET | `/api/public/invitations/:token` | No | Ver invitación por token compartido |
| GET | `/api/public/invitations/guest/:token` | No | RSVP de invitado por token único |
| POST | `/api/public/invitations/guest/:token/rsvp` | No | Confirmar asistencia |

### Cliente (`/api/client`) — Requiere JWT con rol CLIENT o ADMIN

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/api/client/bookings` | Listar / crear reservas |
| GET/PATCH | `/api/client/bookings/:id` | Ver / cancelar reserva |
| GET | `/api/client/bookings/history` | Historial de reservas archivadas |
| GET/POST | `/api/client/invitations` | Listar / crear invitaciones |
| GET/PUT/DELETE | `/api/client/invitations/:id` | Ver / editar / eliminar invitación |
| POST | `/api/client/invitations/:id/photos` | Subir foto a la invitación |
| GET/POST | `/api/client/invitations/:id/guests` | Listar / agregar invitados |
| DELETE | `/api/client/invitations/:id/guests/:guestId` | Eliminar invitado |

### Admin (`/api/admin`) — Requiere JWT con rol ADMIN

| Área | Rutas |
|---|---|
| Dashboard | `GET /api/admin/dashboard` |
| Contactos | `GET/PATCH/DELETE /api/admin/contacts` |
| Reservas | `GET/PUT/POST /api/admin/bookings` (con archivado) |
| Portfolio | `GET/POST/PUT/DELETE /api/admin/portfolio` |
| Testimonios | `GET/POST/PUT/DELETE /api/admin/testimonials` |
| Servicios | `GET/PUT /api/admin/services` |
| Clientes | `GET/POST/PATCH /api/admin/clients` |
| Cuentas | `GET/POST/PATCH /api/admin/accounts` |
| Invitaciones | CRUD completo + fotos + invitados + archivo |
| Configuración | `GET/PUT /api/admin/settings` |
| Notificaciones | `GET/PATCH /api/admin/notifications` |

### Autenticación con tokens JWT

```
Registro/Login → { accessToken, refreshToken }

Peticiones autenticadas:
Authorization: Bearer <accessToken>   (header)

Renovar token:
POST /api/auth/refresh
Body: { "refreshToken": "..." }
→ { "accessToken": "...", "refreshToken": "..." }
```

El cliente (`src/api/client.ts`) maneja el refresh automáticamente: si recibe 401, intenta renovar el token y reintenta la petición original.

---

## Modelos de datos

### Esquema de relaciones

```
User (1) ──────── (N) Booking
User (1) ──────── (N) RefreshToken
User (1) ──────── (N) DigitalInvitation
User (1) ──────── (N) ActivityLog
DigitalInvitation (1) ── (N) InvitationGuest
```

### Roles de usuario

| Rol | Acceso |
|---|---|
| `ADMIN` | Dashboard completo, gestión de todos los datos |
| `CLIENT` | Portal de clientes, sus propias reservas e invitaciones |

### Estados de reserva

`PENDING` → `CONFIRMED` → `DEPOSIT_PAID` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`

Las reservas con estado `COMPLETED` o `CANCELLED` se archivan automáticamente después de 180 días (configurable).

### Archivado automático

El servicio `archivalService` corre cada 60 minutos y archiva:
- Reservas `COMPLETED`/`CANCELLED` con más de 180 días → `archivedAt = now()`
- Invitaciones con más de 365 días → `archivedAt = now()`

Los registros archivados no aparecen en los listados normales pero son recuperables.

---

## Lecciones aprendidas y gotchas críticos

Estas notas existen para no repetir los mismos problemas en futuros proyectos.

### 1. Variables de entorno de Vite son build-time, no runtime

`VITE_*` se embeben **en el momento de compilar**, no cuando el servidor arranca. Esto significa:
- Si cambias `VITE_API_URL` en el panel de Hostinger, **no tiene efecto**
- La variable debe estar disponible cuando corre `vite build` (en `postinstall`)
- Para producción, garantizar que `VITE_API_URL=/api` esté en el `.env` del repositorio o disponible en el ambiente de build

### 2. `new URL()` requiere URL absoluta

```js
// ❌ Lanza error en el navegador
new URL('/api/auth/login')

// ✅ Correcto
new URL(`${window.location.origin}/api/auth/login`)
```

El `buildUrl()` en `src/api/client.ts` maneja esto automáticamente.

### 3. Hostinger no ejecuta `npm start` — ejecuta `node <entry file>` directamente

El preset Express de Hostinger corre:
```
npm install → [postinstall] → node server/dist/server.js
```

**No** corre `npm start`. Por eso las migraciones de Prisma están embebidas en `server/dist/server.js` con `initDatabase()`.

### 4. Todas las dependencias de build deben estar en `dependencies`

Hostinger no instala `devDependencies`. Mover a `dependencies`:
- `typescript`, `vite`, `@vitejs/plugin-react`
- `tailwindcss`, `autoprefixer`, `postcss`
- `@types/react`, `@types/react-dom` (necesarios para `tsc`)

### 5. El cliente de Prisma (`@prisma/client`) debe generarse antes de usarse

Prisma genera código a medida (`node_modules/.prisma/client/`) basado en el schema.
El `postinstall` incluye `npx prisma generate` para garantizar que siempre está generado.

### 6. SQLite y rutas relativas

Con `DATABASE_URL=file:./dev.db`, el archivo se crea en `process.cwd()`.
En Hostinger, `cwd` es el directorio raíz del proyecto. Asegurarse de que ese directorio tiene permisos de escritura.

### 7. `server/dist/` debe estar en git

Al contrario del convencional `.gitignore dist/`, este proyecto **commitea `server/dist/`** porque:
- Hostinger no puede compilar TypeScript (no tiene `ts-node` ni `tsc` en PATH)
- El postinstall compila el frontend pero no el backend
- El servidor ejecuta directamente el JS compilado

### 8. Node.js versión 18, no 22

Node 22 puede tener incompatibilidades con algunas dependencias. Fijar Node 18:
- En hPanel al crear la aplicación
- Con `.nvmrc` conteniendo `18`

### 9. CORS y mismo origen en producción

En producción, el frontend y el backend están en el mismo dominio (Express sirve el frontend).
La variable `FRONTEND_URL` en la configuración de CORS debe ser el dominio de producción exacto.

### 10. El error `"package.json null"` de Hostinger es engañoso

Cuando Hostinger muestra "Diagnosis: package.json null", el error real puede ser cualquier cosa:
- Un script (`postinstall`, `start`) que falla con exit code != 0
- Node version incompatible
- Variable de entorno faltante
- Prisma generate fallando

Siempre revisar los logs completos del proceso, no solo el mensaje de diagnosis de Hostinger.

---

## Notas de desarrollo

### Para agregar una nueva ruta API

1. Crear o editar el controlador en `server/src/controllers/`
2. Agregar la ruta en `server/src/routes/`
3. Registrar el router en `server/src/app.ts` si es una ruta nueva
4. Compilar: `npm run build --prefix server`
5. Commitear `server/src/` y `server/dist/` juntos

### Para agregar un nuevo modelo de Prisma

1. Editar `server/prisma/schema.prisma`
2. Crear migración: `npx prisma migrate dev --schema=server/prisma/schema.prisma --name nombre`
3. Regenerar cliente: `npx prisma generate --schema=server/prisma/schema.prisma`
4. Commitear `server/prisma/migrations/` y el schema actualizado

### Para cambiar el diseño del frontend

1. Editar archivos en `src/`
2. Compilar frontend: `npm run build`
3. Commitear `src/` y `dist/` juntos (o dejar que `postinstall` compile en Hostinger)
