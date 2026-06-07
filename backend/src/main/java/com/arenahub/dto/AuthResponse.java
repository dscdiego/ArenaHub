package com.arenahub.dto;

public record AuthResponse(
    String token,
    UsuarioResponse usuario
) {}
