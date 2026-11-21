-- Tarea 8 · Modelo de productos (José Farías)
-- Las reglas también las garantiza la base de datos, aunque falle una validación del código:
-- nombre y categoría no vacíos, y precio mayor que 0.

CREATE TABLE IF NOT EXISTS productos (
    id             SERIAL        PRIMARY KEY,
    nombre         VARCHAR(120)  NOT NULL CHECK (char_length(trim(nombre)) > 0),
    descripcion    VARCHAR(500)  NOT NULL CHECK (char_length(trim(descripcion)) > 0),
    categoria      VARCHAR(60)   NOT NULL CHECK (char_length(trim(categoria)) > 0),
    precio         NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    creado_en      TIMESTAMP     NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Acelera el filtro GET /productos?categoria=... (sin distinguir mayúsculas)
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (LOWER(categoria));
