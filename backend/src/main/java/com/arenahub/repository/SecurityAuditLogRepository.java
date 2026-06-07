package com.arenahub.repository;

import com.arenahub.model.SecurityAuditLog;
import com.arenahub.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {
    List<SecurityAuditLog> findByUsuarioOrderByTimestampDesc(Usuario usuario);
    Page<SecurityAuditLog> findByUsuarioOrderByTimestampDesc(Usuario usuario, Pageable pageable);
    
    @Query("SELECT s FROM SecurityAuditLog s WHERE s.usuario = :usuario AND s.timestamp BETWEEN :inicio AND :fim ORDER BY s.timestamp DESC")
    List<SecurityAuditLog> findByUsuarioAndDataRange(@Param("usuario") Usuario usuario, 
                                                      @Param("inicio") LocalDateTime inicio,
                                                      @Param("fim") LocalDateTime fim);
    
    @Query("SELECT s FROM SecurityAuditLog s WHERE s.usuario = :usuario AND s.sucesso = false ORDER BY s.timestamp DESC LIMIT 10")
    List<SecurityAuditLog> findUltimasAtividadesSuspeitosas(@Param("usuario") Usuario usuario);
    
    Page<SecurityAuditLog> findByEvento(String evento, Pageable pageable);
}
