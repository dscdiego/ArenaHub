CREATE DATABASE IF NOT EXISTS arenahub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE arenahub_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    tipo_usuario VARCHAR(30) NOT NULL,
    data_criacao DATETIME NOT NULL,
    CONSTRAINT uk_usuario_email_tipo UNIQUE (email, tipo_usuario)
);

CREATE TABLE IF NOT EXISTS arenas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(120),
    bairro VARCHAR(120),
    telefone VARCHAR(30),
    valor_hora DECIMAL(10,2) NOT NULL,
    imagem_url VARCHAR(600),
    proprietario_id BIGINT NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_arena_proprietario FOREIGN KEY (proprietario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS horarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    arena_id BIGINT NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_horario_arena FOREIGN KEY (arena_id) REFERENCES arenas(id),
    CONSTRAINT uk_horario_arena_data_horas UNIQUE (arena_id, data, hora_inicio, hora_fim)
);

CREATE TABLE IF NOT EXISTS reservas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    arena_id BIGINT NOT NULL,
    horario_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    data_reserva DATETIME NOT NULL,
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_reserva_arena FOREIGN KEY (arena_id) REFERENCES arenas(id),
    CONSTRAINT fk_reserva_horario FOREIGN KEY (horario_id) REFERENCES horarios(id)
);
