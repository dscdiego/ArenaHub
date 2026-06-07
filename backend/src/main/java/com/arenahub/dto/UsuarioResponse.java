package com.arenahub.dto;

import com.arenahub.model.TipoUsuario;

public record UsuarioResponse(
    Long id,
    String nome,
    String email,
    String telefone,
    TipoUsuario tipoUsuario
) {}
