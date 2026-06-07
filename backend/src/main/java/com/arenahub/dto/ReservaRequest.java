package com.arenahub.dto;

import jakarta.validation.constraints.NotNull;

public record ReservaRequest(
    @NotNull(message = "Arena é obrigatória") Long arenaId,
    @NotNull(message = "Horário é obrigatório") Long horarioId
) {}
