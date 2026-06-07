package com.arenahub.dto;

import com.arenahub.model.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequest(
    @NotBlank(message = "Email é obrigatório") @Email(message = "Email inválido") String email,
    @NotBlank(message = "Senha é obrigatória") String senha,
    @NotNull(message = "Tipo de usuário é obrigatório") TipoUsuario tipoUsuario
) {}
