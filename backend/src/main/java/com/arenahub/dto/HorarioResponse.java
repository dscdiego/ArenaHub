package com.arenahub.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record HorarioResponse(
    Long id,
    Long arenaId,
    String arenaNome,
    LocalDate data,
    LocalTime horaInicio,
    LocalTime horaFim,
    Boolean disponivel,
    Boolean bloqueado
) {}
