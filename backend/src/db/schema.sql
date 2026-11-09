PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'operador'
    CHECK (rol IN ('administrador', 'operador')),
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sesiones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TEXT NOT NULL,
  creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materiales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT NOT NULL,
  unidad TEXT NOT NULL,
  stock_actual REAL NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  demanda_promedio REAL NOT NULL CHECK (demanda_promedio > 0),
  demanda_maxima REAL NOT NULL CHECK (demanda_maxima >= demanda_promedio),
  plazo_entrega_dias INTEGER NOT NULL CHECK (plazo_entrega_dias > 0),
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordenes_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_orden TEXT NOT NULL UNIQUE,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
  fecha_orden TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'RECIBIDA'
    CHECK (estado IN ('BORRADOR', 'APROBADA', 'RECIBIDA', 'ANULADA')),
  contrato_aplicable INTEGER NOT NULL DEFAULT 0 CHECK (contrato_aplicable IN (0, 1)),
  observaciones TEXT
);

CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  stock_resultante REAL NOT NULL CHECK (stock_resultante >= 0),
  fecha_movimiento TEXT NOT NULL,
  referencia TEXT NOT NULL,
  responsable TEXT NOT NULL,
  observaciones TEXT,
  creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alertas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK (tipo IN ('REORDEN')),
  material_id INTEGER NOT NULL REFERENCES materiales(id),
  mensaje TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA', 'CERRADA')),
  creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cerrada_en TEXT
);

CREATE INDEX IF NOT EXISTS idx_ordenes_proveedor_material_fecha
  ON ordenes_compra (proveedor_id, material_id, fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_fecha
  ON ordenes_compra (estado, fecha_orden);
CREATE INDEX IF NOT EXISTS idx_movimientos_material_fecha
  ON movimientos (material_id, fecha_movimiento);
CREATE INDEX IF NOT EXISTS idx_alertas_estado_tipo
  ON alertas (estado, tipo);
CREATE INDEX IF NOT EXISTS idx_sesiones_token_expiracion
  ON sesiones (token_hash, expira_en);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario
  ON sesiones (usuario_id);
