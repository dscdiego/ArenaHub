package com.arenahub.dto;

import java.math.BigDecimal;

public record ArenaResponse(
    Long id,
    String nome,
    String descricao,
    String endereco,
    String cidade,
    String bairro,
    String telefone,
    BigDecimal valorHora,
    String imagemUrl,
    Boolean ativa,
    Long proprietarioId,
    String proprietarioNome
) {}
