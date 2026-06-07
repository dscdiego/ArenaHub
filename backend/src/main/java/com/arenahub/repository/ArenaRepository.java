package com.arenahub.repository;

import com.arenahub.model.Arena;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArenaRepository extends JpaRepository<Arena, Long> {
    List<Arena> findByAtivaTrueOrderByNomeAsc();
    List<Arena> findByProprietarioIdAndAtivaTrueOrderByNomeAsc(Long proprietarioId);
    long countByProprietarioIdAndAtivaTrue(Long proprietarioId);
}
