-- TecnoStock: tablas de compras y ventas (aditivo; no elimina datos existentes)
CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  proveedor VARCHAR(200),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  costo_unitario NUMERIC(12,2) NOT NULL CHECK (costo_unitario > 0),
  total NUMERIC(14,2) NOT NULL CHECK (total >= 0),
  observacion TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cliente VARCHAR(200),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario > 0),
  costo_unitario_snapshot NUMERIC(12,2) NOT NULL,
  total NUMERIC(14,2) NOT NULL CHECK (total >= 0),
  utilidad NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(created_at);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(created_at);
CREATE INDEX IF NOT EXISTS idx_compras_producto ON compras(producto_id);
CREATE INDEX IF NOT EXISTS idx_ventas_producto ON ventas(producto_id);
