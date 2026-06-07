package com.arenahub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Two-Factor Authentication - TOTP (Google Authenticator)
 */
@Entity
@Table(name = "two_factor_auth", indexes = {
    @Index(name = "idx_usuario_2fa", columnNames = "usuario_id")
})
public class TwoFactorAuth {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 255)
    private String secret; // Secret criptografado (nunca mostrar em texto plano após criação)

    @Column(nullable = false)
    private Boolean habilitado = false;

    @Column(nullable = false)
    private Boolean verificado = false; // Necessário verificar com código TOTP antes de habilitar

    @Column(name = "backup_codes", columnType = "TEXT")
    private String backupCodes; // Códigos de backup em JSON (criptografados)

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_habilitacao")
    private LocalDateTime dataHabilitacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) dataCriacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }

    // Construtores
    public TwoFactorAuth() {}

    public TwoFactorAuth(Usuario usuario, String secret) {
        this.usuario = usuario;
        this.secret = secret;
        this.habilitado = false;
        this.verificado = false;
        this.dataCriacao = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public Boolean getHabilitado() { return habilitado; }
    public void setHabilitado(Boolean habilitado) { this.habilitado = habilitado; }

    public Boolean getVerificado() { return verificado; }
    public void setVerificado(Boolean verificado) { this.verificado = verificado; }

    public String getBackupCodes() { return backupCodes; }
    public void setBackupCodes(String backupCodes) { this.backupCodes = backupCodes; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public LocalDateTime getDataHabilitacao() { return dataHabilitacao; }
    public void setDataHabilitacao(LocalDateTime dataHabilitacao) { this.dataHabilitacao = dataHabilitacao; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}
