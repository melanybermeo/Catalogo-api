-- Tarea 9 · Modelo de favoritos (José Farías)
-- Une un usuario con un producto. No se permiten duplicados (UNIQUE).
--
-- Tarea 10 · Regla acordada (Ambos): BORRADO EN CASCADA.
-- Si se elimina un producto, se eliminan automáticamente los favoritos que lo contienen
-- (ON DELETE CASCADE). Lo mismo si se elimina un usuario. Así nunca quedan favoritos
-- apuntando a algo que ya no existe.

CREATE TABLE IF NOT EXISTS favoritos (
    id          SERIAL    PRIMARY KEY,
    usuario_id  INTEGER   NOT NULL,
    producto_id INTEGER   NOT NULL,
    creado_en   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_favoritos_usuario  FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)  ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_producto FOREIGN KEY (producto_id)
        REFERENCES productos (id) ON DELETE CASCADE,
    CONSTRAINT uq_favoritos_usuario_producto UNIQUE (usuario_id, producto_id)
);

-- El índice UNIQUE ya acelera las búsquedas por usuario_id.
-- Este acelera el borrado en cascada cuando se elimina un producto.
CREATE INDEX IF NOT EXISTS idx_favoritos_producto ON favoritos (producto_id);
