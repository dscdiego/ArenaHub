package com.arenahub.dto;

import com.arenahub.model.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Nome é obrigatório") String nome,
    @NotBlank(message = "Email é obrigatório") @Email(message = "Email inválido") String email,
    @NotBlank(message = "Senha é obrigatória") @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres") String senha,
    @NotBlank(message = "Telefone é obrigatório") String telefone,
    @NotNull(message = "Tipo de usuário é obrigatório") TipoUsuario tipoUsuario
) {}
