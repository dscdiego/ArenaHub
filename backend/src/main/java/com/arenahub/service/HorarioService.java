package com.arenahub.service;

import com.arenahub.config.CustomUserPrincipal;
import com.arenahub.dto.HorarioRequest;
import com.arenahub.dto.HorarioResponse;
import com.arenahub.mapper.DtoMapper;
import com.arenahub.model.Arena;
import com.arenahub.model.Horario;
import com.arenahub.model.TipoUsuario;
import com.arenahub.repository.HorarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class HorarioService {
    private final HorarioRepository horarioRepository;
    private final ArenaService arenaService;

    public HorarioService(HorarioRepository horarioRepository, ArenaService arenaService) {
        this.horarioRepository = horarioRepository;
        this.arenaService = arenaService;
    }

    @Transactional(readOnly = true)
    public List<HorarioResponse> listarDisponiveis(Long arenaId) {
        // Retorna todos os horários a partir de hoje (disponíveis E ocupados), exceto bloqueados
        return horarioRepository.findByArenaIdAndBloqueadoFalseAndDataFuturoOrderByDataAscHoraInicioAsc(arenaId, LocalDate.now())
            .stream().map(DtoMapper::toHorarioResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<HorarioResponse> listarTodosDaMinhaArena(Long arenaId, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        arenaService.buscarArenaDoProprietario(arenaId, principal.getId());
        return horarioRepository.findByArenaIdOrderByDataAscHoraInicioAsc(arenaId)
            .stream().map(DtoMapper::toHorarioResponse).toList();
    }

    @Transactional
    public HorarioResponse criar(Long arenaId, HorarioRequest request, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        Arena arena = arenaService.buscarArenaDoProprietario(arenaId, principal.getId());

        validarHoras(request);
        
        // Se diaSemana foi enviado, criar horários para as próximas 13 semanas (recorrência)
        if (request.diaSemana() != null) {
            return criarHorarioRecorrente(arena, request, arenaId);
        }
        
        // Caso contrário, criar apenas para a data específica informada
        LocalDate dataFinal = request.data();
        if (horarioRepository.existsByArenaIdAndDataAndHoraInicioAndHoraFim(arenaId, dataFinal, request.horaInicio(), request.horaFim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe esse horário para esta arena");
        }

        Horario horario = new Horario();
        horario.setArena(arena);
        horario.setData(dataFinal);
        horario.setHoraInicio(request.horaInicio());
        horario.setHoraFim(request.horaFim());
        horario.setDisponivel(request.disponivel() != null ? request.disponivel() : true);
        horario.setBloqueado(request.bloqueado() != null ? request.bloqueado() : false);

        if (Boolean.TRUE.equals(horario.getBloqueado())) {
            horario.setDisponivel(false);
        }

        return DtoMapper.toHorarioResponse(horarioRepository.save(horario));
    }

    /**
     * Cria horários recorrentes para as próximas 13 semanas
     * quando um diaSemana é informado
     */
    private HorarioResponse criarHorarioRecorrente(Arena arena, HorarioRequest request, Long arenaId) {
        HorarioResponse ultimoHorario = null;
        
        // Criar horário para cada uma das próximas 13 semanas
        for (int semana = 0; semana < 13; semana++) {
            LocalDate data = calcularProximaData(request.diaSemana()).plusWeeks(semana);
            
            // Verificar se já existe
            if (horarioRepository.existsByArenaIdAndDataAndHoraInicioAndHoraFim(
                    arenaId, data, request.horaInicio(), request.horaFim())) {
                // Se já existe, apenas continua para próxima semana
                continue;
            }

            Horario horario = new Horario();
            horario.setArena(arena);
            horario.setData(data);
            horario.setHoraInicio(request.horaInicio());
            horario.setHoraFim(request.horaFim());
            horario.setDisponivel(request.disponivel() != null ? request.disponivel() : true);
            horario.setBloqueado(request.bloqueado() != null ? request.bloqueado() : false);

            if (Boolean.TRUE.equals(horario.getBloqueado())) {
                horario.setDisponivel(false);
            }

            ultimoHorario = DtoMapper.toHorarioResponse(horarioRepository.save(horario));
        }
        
        if (ultimoHorario == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Todos os horários já existem para esta arena");
        }
        
        return ultimoHorario;
    }

    @Transactional
    public HorarioResponse atualizar(Long id, HorarioRequest request, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        Horario horario = horarioRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horário não encontrado"));
        arenaService.buscarArenaDoProprietario(horario.getArena().getId(), principal.getId());
        validarHoras(request);

        aplicarDados(horario, request);
        return DtoMapper.toHorarioResponse(horarioRepository.save(horario));
    }

    @Transactional
    public void excluir(Long id, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        Horario horario = horarioRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horário não encontrado"));
        arenaService.buscarArenaDoProprietario(horario.getArena().getId(), principal.getId());
        horarioRepository.delete(horario);
    }

    @Transactional(readOnly = true)
    public Horario buscar(Long id) {
        return horarioRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horário não encontrado"));
    }

    @Transactional
    public void salvar(Horario horario) {
        horarioRepository.save(horario);
    }

    private void aplicarDados(Horario horario, HorarioRequest request) {
        LocalDate dataFinal = request.data();
        if (request.diaSemana() != null) {
            dataFinal = calcularProximaData(request.diaSemana());
        }
        
        horario.setData(dataFinal);
        horario.setHoraInicio(request.horaInicio());
        horario.setHoraFim(request.horaFim());

        if (request.bloqueado() != null) horario.setBloqueado(request.bloqueado());
        if (request.disponivel() != null) horario.setDisponivel(request.disponivel());

        if (Boolean.TRUE.equals(horario.getBloqueado())) {
            horario.setDisponivel(false);
        }
    }

    private void validarHoras(HorarioRequest request) {
        if (!request.horaFim().isAfter(request.horaInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hora final deve ser maior que hora inicial");
        }
    }

    private void garantirProprietario(CustomUserPrincipal principal) {
        if (principal == null || principal.getTipoUsuario() != TipoUsuario.PROPRIETARIO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas proprietários podem gerenciar horários");
        }
    }

    /**
     * Calcula a próxima data que corresponde ao dia da semana informado
     * @param diaSemana 0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta, 5=Sábado, 6=Domingo
     * @return A próxima data correspondente ao dia da semana
     * @throws ResponseStatusException se diaSemana for inválido
     */
    private LocalDate calcularProximaData(int diaSemana) {
        // ✅ CORRIGIDO: Validar e lançar exceção em vez de retornar silenciosamente
        if (diaSemana < 0 || diaSemana > 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Dia da semana inválido. Deve estar entre 0 (segunda) e 6 (domingo), recebido: " + diaSemana);
        }
        
        LocalDate hoje = LocalDate.now();
        
        // Mapa de diaSemana (0-6) para DayOfWeek (MONDAY=1, ..., SUNDAY=7)
        // 0=Seg, 1=Ter, 2=Qua, 3=Qui, 4=Sex, 5=Sab, 6=Dom
        DayOfWeek[] dias = {
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY,
            DayOfWeek.SUNDAY
        };
        
        DayOfWeek targetDay = dias[diaSemana];
        return hoje.with(TemporalAdjusters.nextOrSame(targetDay));
    }
}
