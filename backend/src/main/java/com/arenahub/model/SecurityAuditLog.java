package com.arenahub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Auditoria de segurança - Log de todas as atividades importantes
 */
@Entity
@Table(name = "security_audit_logs", indexes = {
    @Index(name = "idx_usuario_id", columnNames = "usuario_id"),
    @Index(name = "idx_timestamp", columnNames = "timestamp"),
    @Index(name = "idx_evento", columnNames = "evento")
})
public class SecurityAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String evento; // LOGIN, LOGOUT, REGISTER, 2FA_ENABLE, FAILED_LOGIN, etc

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false)
    private String ipAddress;

    @Column(length = 255)
    private String userAgent;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Boolean sucesso = true;

    // Construtores
    public SecurityAuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public SecurityAuditLog(Usuario usuario, String evento, String ipAddress) {
        this.usuario = usuario;
        this.evento = evento;
        this.ipAddress = ipAddress;
        this.timestamp = LocalDateTime.now();
        this.sucesso = true;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getEvento() { return evento; }
    public void setEvento(String evento) { this.evento = evento; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Boolean getSucesso() { return sucesso; }
    public void setSucesso(Boolean sucesso) { this.sucesso = sucesso; }
}
