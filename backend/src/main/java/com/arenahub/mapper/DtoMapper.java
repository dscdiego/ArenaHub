package com.arenahub.mapper;

import com.arenahub.dto.*;
import com.arenahub.model.*;

public class DtoMapper {
    private DtoMapper() {}

    public static UsuarioResponse toUsuarioResponse(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getTelefone(), usuario.getTipoUsuario()
        );
    }

    public static ArenaResponse toArenaResponse(Arena arena) {
        return new ArenaResponse(
            arena.getId(), arena.getNome(), arena.getDescricao(), arena.getEndereco(), arena.getCidade(),
            arena.getBairro(), arena.getTelefone(), arena.getValorHora(), arena.getImagemUrl(), arena.getAtiva(),
            arena.getProprietario().getId(), arena.getProprietario().getNome()
        );
    }

    public static HorarioResponse toHorarioResponse(Horario horario) {
        return new HorarioResponse(
            horario.getId(), horario.getArena().getId(), horario.getArena().getNome(), horario.getData(),
            horario.getHoraInicio(), horario.getHoraFim(), horario.getDisponivel(), horario.getBloqueado()
        );
    }

    public static ReservaResponse toReservaResponse(Reserva reserva) {
        return new ReservaResponse(
            reserva.getId(), reserva.getUsuario().getId(), reserva.getUsuario().getNome(),
            reserva.getUsuario().getEmail(), reserva.getUsuario().getTelefone(),
            reserva.getArena().getId(), reserva.getArena().getNome(), reserva.getArena().getValorHora(),
            reserva.getHorario().getId(), reserva.getHorario().getData(), reserva.getHorario().getHoraInicio(),
            reserva.getHorario().getHoraFim(), reserva.getStatus(), reserva.getDataReserva()
        );
    }
}
