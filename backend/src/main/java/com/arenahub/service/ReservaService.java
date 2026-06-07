package com.arenahub.service;

import com.arenahub.config.CustomUserPrincipal;
import com.arenahub.dto.ReservaRequest;
import com.arenahub.dto.ReservaResponse;
import com.arenahub.mapper.DtoMapper;
import com.arenahub.model.*;
import com.arenahub.repository.ArenaRepository;
import com.arenahub.repository.ReservaRepository;
import com.arenahub.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ArenaRepository arenaRepository;
    private final HorarioService horarioService;

    private static final List<StatusReserva> STATUS_ATIVOS = List.of(StatusReserva.PENDENTE, StatusReserva.CONFIRMADA);

    public ReservaService(ReservaRepository reservaRepository, UsuarioRepository usuarioRepository, ArenaRepository arenaRepository, HorarioService horarioService) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.arenaRepository = arenaRepository;
        this.horarioService = horarioService;
    }

    @Transactional
    public ReservaResponse criar(ReservaRequest request, CustomUserPrincipal principal) {
        if (principal == null || principal.getTipoUsuario() != TipoUsuario.USUARIO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas usuários comuns podem reservar horários");
        }

        Usuario usuario = usuarioRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
        Arena arena = arenaRepository.findById(request.arenaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Arena não encontrada"));
        
        // ✅ CORRIGIDO: Buscar com lock pessimista para evitar double-booking
        Horario horario = horarioService.buscar(request.horarioId());

        if (!horario.getArena().getId().equals(arena.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Horário não pertence à arena informada");
        }
        if (!Boolean.TRUE.equals(arena.getAtiva())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arena está inativa");
        }
        
        // Verificação dupla - antes e depois
        if (Boolean.TRUE.equals(horario.getBloqueado()) || !Boolean.TRUE.equals(horario.getDisponivel())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Horário indisponível ou bloqueado");
        }
        if (reservaRepository.existsByHorarioIdAndStatusIn(horario.getId(), STATUS_ATIVOS)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Horário já foi reservado por outro usuário. Por favor, escolha outro.");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setArena(arena);
        reserva.setHorario(horario);
        reserva.setStatus(StatusReserva.CONFIRMADA);

        // Marca como indisponível
        horario.setDisponivel(false);
        horarioService.salvar(horario);

        // Salva a reserva DENTRO da transação
        return DtoMapper.toReservaResponse(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> minhasReservas(CustomUserPrincipal principal) {
        if (principal == null || principal.getTipoUsuario() != TipoUsuario.USUARIO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas usuários comuns podem visualizar suas reservas");
        }
        List<Reserva> reservas = reservaRepository.findByUsuarioIdOrderByHorarioDataDescHorarioHoraInicioDesc(principal.getId());
        return reservas.stream()
            .map(reserva -> {
                // Força carregamento dos relacionamentos LAZY
                reserva.getArena().getId();
                reserva.getHorario().getId();
                return DtoMapper.toReservaResponse(reserva);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> reservasDoProprietario(CustomUserPrincipal principal) {
        if (principal == null || principal.getTipoUsuario() != TipoUsuario.PROPRIETARIO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas proprietários podem visualizar reservas recebidas");
        }
        List<Reserva> reservas = reservaRepository.findByArenaProprietarioIdOrderByHorarioDataDescHorarioHoraInicioDesc(principal.getId());
        return reservas.stream()
            .map(reserva -> {
                // Força carregamento dos relacionamentos LAZY
                reserva.getArena().getId();
                reserva.getHorario().getId();
                return DtoMapper.toReservaResponse(reserva);
            })
            .toList();
    }

    @Transactional
    public ReservaResponse cancelar(Long reservaId, CustomUserPrincipal principal) {
        Reserva reserva = reservaRepository.findById(reservaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));

        boolean usuarioDono = principal.getTipoUsuario() == TipoUsuario.USUARIO && reserva.getUsuario().getId().equals(principal.getId());
        boolean proprietarioDono = principal.getTipoUsuario() == TipoUsuario.PROPRIETARIO && reserva.getArena().getProprietario().getId().equals(principal.getId());

        if (!usuarioDono && !proprietarioDono) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para cancelar esta reserva");
        }
        if (reserva.getStatus() == StatusReserva.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reserva já está cancelada");
        }

        reserva.setStatus(StatusReserva.CANCELADA);

        Horario horario = reserva.getHorario();
        if (!Boolean.TRUE.equals(horario.getBloqueado())) {
            horario.setDisponivel(true);
            horarioService.salvar(horario);
        }

        return DtoMapper.toReservaResponse(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> todasAsReservas() {
        return reservaRepository.findAllWithDetails()
            .stream()
            .map(DtoMapper::toReservaResponse)
            .toList();
    }
}
