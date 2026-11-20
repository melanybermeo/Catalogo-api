-- Tarea 7 · Modelo de usuarios (Melanie Bermeo)
-- El correo se guarda siempre en minúsculas desde la API y es único.
-- Solo existen dos roles; el registro público siempre crea 'usuario'.

CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL       PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL CHECK (char_length(trim(nombre)) > 0),
    correo        VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                  CHECK (rol IN ('usuario', 'admin')),
    creado_en     TIMESTAMP    NOT NULL DEFAULT NOW()
);
