-- ============================================
-- ArtesanosMX - Script de base de datos
-- Ejecutar: psql -U artesano_user -d artesanos -f database.sql
-- ============================================

-- Limpiar tablas si existen (orden por dependencias)
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS artesanos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================
-- TABLAS
-- ============================================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente',
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artesanos (
    id_artesano SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    descripcion TEXT,
    estado VARCHAR(100),
    foto_url VARCHAR(500),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

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

-- ============================================
-- CATEGORÍAS
-- ============================================

INSERT INTO categorias (nombre) VALUES
('Textiles'),
('Cerámica'),
('Joyería'),
('Mezcal'),
('Alimentos'),
('Madera');

-- ============================================
-- USUARIOS DE PRUEBA
-- Todas las contraseñas son: 1234
-- Hash generado con bcrypt salt=10
-- ============================================

INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES
-- Admin (contraseña: 1234)
('Administrador', 'admin@artesanosmx.com',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'admin', 'activo'),

-- Artesanos (contraseña: 1234)
('María Artesana', 'maria@artesanosmx.com',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'artesano', 'activo'),

('Don Rufino Méndez', 'rufino@artesanosmx.com',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'artesano', 'activo'),

('Doña Catalina García', 'catalina@artesanosmx.com',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'artesano', 'pendiente'),

-- Cliente (contraseña: 1234)
('Cliente Prueba', 'cliente@artesanosmx.com',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'cliente', 'activo');

-- ============================================
-- PERFILES DE ARTESANOS Y CLIENTES
-- ============================================

INSERT INTO artesanos (id_usuario, descripcion, estado) VALUES
(2, 'Artesana especializada en bordados oaxaqueños con técnicas heredadas de su abuela. Cada pieza es única y representa la cultura zapoteca.', 'Oaxaca'),
(3, 'Maestro mezcalero con 30 años de experiencia en San Dionisio Ocotepec. Sus tapetes de lana son reconocidos en toda la región.', 'Oaxaca'),
(4, 'Ceramista de la región de Coyotepec, especializada en barro negro. Sus jarras son piezas de colección.', 'Oaxaca');

INSERT INTO clientes (id_usuario) VALUES (5);

-- ============================================
-- PRODUCTOS DE PRUEBA
-- ============================================

INSERT INTO productos (id_artesano, id_categoria, nombre, descripcion, precio, stock) VALUES
(1, 1, 'Blusa bordada zapoteca', 'Blusa tradicional con bordados florales hechos a mano con hilo de seda. Talla única adaptable.', 850.00, 5),
(1, 1, 'Camino de mesa bordado', 'Camino de mesa de 2 metros con diseños geométricos zapotecos en hilo de colores naturales.', 450.00, 8),
(2, 1, 'Tapete de lana natural', 'Tapete tejido en telar de pedal con lana teñida con tintes naturales. 1.5m x 1m.', 1500.00, 3),
(2, 4, 'Mezcal artesanal joven', 'Mezcal 100% agave espadín, producción artesanal en palenque familiar. 750ml.', 320.00, 20),
(2, 4, 'Mezcal reposado premium', 'Mezcal reposado 6 meses en barrica de encino. Notas ahumadas y frutales. 750ml.', 580.00, 10),
(3, 2, 'Jarra de barro negro', 'Jarra tradicional de barro negro de San Bartolo Coyotepec. Pieza artesanal única.', 680.00, 4),
(3, 2, 'Olla de barro mediana', 'Olla para cocinar de barro negro. Ideal para mole y caldos tradicionales. 3 litros.', 420.00, 6),
(3, 2, 'Figura de barro decorativa', 'Figura representando a una mujer zapoteca en traje tradicional. Pieza de colección.', 350.00, 10);

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================

SELECT '✅ Tablas creadas correctamente' AS status;
SELECT 'Usuarios: ' || COUNT(*) || ' registros' AS info FROM usuarios;
SELECT 'Artesanos: ' || COUNT(*) || ' registros' AS info FROM artesanos;
SELECT 'Productos: ' || COUNT(*) || ' registros' AS info FROM productos;
SELECT 'Categorias: ' || COUNT(*) || ' registros' AS info FROM categorias;
