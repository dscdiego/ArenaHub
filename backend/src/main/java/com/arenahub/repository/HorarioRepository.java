package com.arenahub.repository;

import com.arenahub.model.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByArenaIdOrderByDataAscHoraInicioAsc(Long arenaId);
    
    @Query("SELECT h FROM Horario h WHERE h.arena.id = :arenaId AND h.bloqueado = false AND h.data >= :hoje ORDER BY h.data ASC, h.horaInicio ASC")
    List<Horario> findByArenaIdAndBloqueadoFalseAndDataFuturoOrderByDataAscHoraInicioAsc(@Param("arenaId") Long arenaId, @Param("hoje") LocalDate hoje);
    
    boolean existsByArenaIdAndDataAndHoraInicioAndHoraFim(Long arenaId, LocalDate data, LocalTime horaInicio, LocalTime horaFim);
}
