package com.arenahub.repository;

import com.arenahub.model.Reserva;
import com.arenahub.model.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    boolean existsByHorarioIdAndStatusIn(Long horarioId, Collection<StatusReserva> status);
    List<Reserva> findByUsuarioIdOrderByHorarioDataDescHorarioHoraInicioDesc(Long usuarioId);
    
    @Query("SELECT r FROM Reserva r JOIN FETCH r.usuario JOIN FETCH r.arena JOIN FETCH r.horario WHERE r.arena.proprietario.id = :proprietarioId ORDER BY r.horario.data DESC, r.horario.horaInicio DESC")
    List<Reserva> findByArenaProprietarioIdOrderByHorarioDataDescHorarioHoraInicioDesc(@Param("proprietarioId") Long proprietarioId);
    
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.arena.proprietario.id = :proprietarioId AND r.status IN :statuses")
    long countByArenaProprietarioIdAndStatusIn(@Param("proprietarioId") Long proprietarioId, @Param("statuses") Collection<StatusReserva> statuses);
    
    @Query("SELECT r FROM Reserva r JOIN FETCH r.usuario JOIN FETCH r.arena JOIN FETCH r.horario")
    List<Reserva> findAllWithDetails();
}
