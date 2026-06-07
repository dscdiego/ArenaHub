package com.arenahub.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ArenaRequest(
    @NotBlank(message = "Nome da arena é obrigatório") String nome,
    String descricao,
    @NotBlank(message = "Endereço é obrigatório") String endereco,
    String cidade,
    String bairro,
    String telefone,
    @NotNull(message = "Valor por hora é obrigatório") @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que zero") BigDecimal valorHora,
    String imagemUrl,
    Boolean ativa
) {}
