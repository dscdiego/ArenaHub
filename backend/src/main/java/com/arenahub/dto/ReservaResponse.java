package com.arenahub.dto;

import com.arenahub.model.StatusReserva;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservaResponse(
    Long id,
    Long usuarioId,
    String usuarioNome,
    String usuarioEmail,
    String usuarioTelefone,
    Long arenaId,
    String arenaNome,
    BigDecimal valorHora,
    Long horarioId,
    LocalDate data,
    LocalTime horaInicio,
    LocalTime horaFim,
    StatusReserva status,
    LocalDateTime dataReserva
) {}
