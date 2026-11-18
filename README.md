# ArtesanosMX

Plataforma de comercio electrónico para conectar artesanos mexicanos con compradores. Desarrollada con Node.js + Express + PostgreSQL.

---

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 18 LTS | https://nodejs.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download |
| Git | cualquiera | https://git-scm.com |

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/artesanos-app.git
cd artesanos-app
```

---

### 2. Configurar la base de datos

Abre **pgAdmin** o la terminal de PostgreSQL y ejecuta:

```sql
-- Crear la base de datos
CREATE DATABASE artesanosmx;

-- Crear el usuario
CREATE USER artesano_user WITH PASSWORD '1234';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE artesanosmx TO artesano_user;
```

Luego conéctate a la base de datos `artesanosmx` y ejecuta el esquema de tablas:

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente',
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tabla de artesanos
CREATE TABLE artesanos (
    id_artesano SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    descripcion TEXT,
    estado VARCHAR(100),
    foto_url VARCHAR(500),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de categorías
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de productos
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    id_artesano INT REFERENCES artesanos(id_artesano) ON DELETE CASCADE,
    id_categoria INT REFERENCES categorias(id_categoria),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    stock INT,
    imagen_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Insertar categorías base
INSERT INTO categorias (nombre) VALUES
('Textiles'), ('Cerámica'), ('Joyería'),
('Mezcal'), ('Alimentos'), ('Madera');

-- Crear usuario administrador
-- (contraseña: admin123)
INSERT INTO usuarios (nombre, email, password, rol, estado)
VALUES (
    'Administrador',
    'admin@artesanosmx.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'activo'
);
```

> **Nota:** El hash de la contraseña del admin corresponde a `admin123` con bcrypt. Puedes cambiarla después desde el panel.

---

### 3. Configurar variables de entorno del backend

Entra a la carpeta del backend:

```bash
cd backend
```

Copia el archivo de ejemplo:

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Abre el archivo `.env` y edítalo con tus datos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artesanosmx
DB_USER=artesano_user
DB_PASSWORD=1234
JWT_SECRET=mi_clave_secreta_super_segura_2026
PORT=3000
```

> `JWT_SECRET` puede ser cualquier texto largo y aleatorio. Solo asegúrate de que todos usen el mismo valor.

---

### 4. Instalar dependencias del backend

Dentro de la carpeta `backend/`:

```bash
npm install
```

---

### 5. Correr el servidor

```bash
npm run dev
```

Deberías ver en la consola:

```
[nodemon] starting `node server.js`
[OK] Conectado a PostgreSQL
[OK] Servidor corriendo en http://localhost:3000
```

---

### 6. Abrir el frontend

El frontend son archivos HTML estáticos. Tienes dos opciones:

**Opción A — Extensión Live Server (recomendada para desarrollo):**
1. Instala la extensión **Live Server** en VS Code
2. Haz clic derecho sobre `frontend/index.html`
3. Selecciona **"Open with Live Server"**
4. Se abrirá en `http://127.0.0.1:5500`

**Opción B — Abrir directo en el navegador:**
1. Ve a la carpeta `frontend/`
2. Abre `index.html` directamente con doble clic

---

## Estructura del proyecto

```
artesanos-app/
├── backend/
│   ├── config/
│   │   └── db.js                  # Conexión a PostgreSQL
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── artesano.controller.js
│   │   ├── auth.controller.js
│   │   ├── categoria.controller.js
│   │   └── producto.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT + roles
│   │   └── upload.middleware.js    # Multer (imágenes)
│   ├── models/
│   │   ├── artesano.model.js
│   │   ├── categoria.model.js
│   │   ├── producto.model.js
│   │   └── usuario.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── artesano.routes.js
│   │   ├── auth.routes.js
│   │   ├── categoria.routes.js
│   │   ├── producto.routes.js
│   │   └── upload.routes.js
│   ├── uploads/                    # Imágenes subidas (se crea automático)
│   │   ├── productos/
│   │   └── artesanos/
│   ├── .env.example
│   ├── app.js
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html                  # Landing page
    └── pages/
        ├── admin.html              # Panel de administrador
        ├── artesanos.html          # Directorio de artesanos
        ├── Artesano dashboard.html # Panel del artesano
        ├── auth.html               # Login / Registro
        ├── carrito.html            # Carrito de compras
        ├── catalogo.html           # Catálogo de productos
        ├── confirmacion.html       # Confirmación de pedido
        ├── cuenta.html             # Mi cuenta
        ├── pago.html               # Proceso de pago
        └── producto_detalle.html   # Detalle de producto
```

---

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@artesanosmx.com | admin123 |
| Artesano | Registrate con rol "Artesano" y apruébalo desde el admin | — |
| Cliente | Registrate con rol "Cliente" | — |

---

## Endpoints principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Detalle de producto |
| POST | `/api/productos` | Crear producto (artesano) |
| GET | `/api/artesanos` | Listar artesanos |
| GET | `/api/categorias` | Listar categorías |
| POST | `/api/upload/productos` | Subir imagen de producto |
| GET | `/api/admin/stats` | Estadísticas (admin) |
| GET | `/api/admin/usuarios` | Listar usuarios (admin) |
| PATCH | `/api/admin/usuarios/:id/estado` | Aprobar/rechazar artesano |

---

## Problemas frecuentes

**El servidor no conecta a PostgreSQL:**
- Verifica que PostgreSQL esté corriendo
- Revisa que los datos en `.env` coincidan con los de tu base de datos
- En Windows puedes verificarlo en los Servicios del sistema o con `pg_isready`

**Error "Cannot GET /frontend/pages/...":**
- Abre el archivo HTML directamente desde la carpeta, no desde la URL del backend
- Usa Live Server en VS Code

**Las imágenes no se suben:**
- Verifica que la carpeta `backend/uploads/` exista (se crea automáticamente al iniciar el servidor)
- Asegúrate de estar autenticado al subir imágenes

**El admin no puede hacer login:**
- Verifica que el INSERT del usuario admin se ejecutó correctamente en la BD
- Puedes consultar con: `SELECT * FROM usuarios WHERE rol = 'admin';`

---

## Tecnologías usadas

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js 18, Express.js 4
- **Base de datos:** PostgreSQL 14
- **Autenticación:** JSON Web Tokens (JWT)
- **Encriptación:** bcrypt
- **Subida de archivos:** Multer
- **Servidor de desarrollo:** Nodemon

---

## Contacto

Desarrollado por **Isaac Cruz** — Programación Web 2026
