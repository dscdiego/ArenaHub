package com.arenahub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "usuarios",
    uniqueConstraints = @UniqueConstraint(name = "uk_usuario_email_tipo", columnNames = {"email", "tipo_usuario"})
)
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 160, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false, length = 30)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false, length = 30)
    private TipoUsuario tipoUsuario;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    // ===== CAMPOS DE SEGURANÇA =====

    @Column(name = "email_verificado", nullable = false)
    private Boolean emailVerificado = false;

    @Column(name = "email_verificacao_token", length = 500)
    private String emailVerificacaoToken;

    @Column(name = "data_verificacao_email")
    private LocalDateTime dataVerificacaoEmail;

    @Column(name = "tentativas_login_falhadas", nullable = false)
    private Integer tentativasLoginFalhadas = 0;

    @Column(name = "data_bloqueio")
    private LocalDateTime dataBloqueio; // Bloqueio temporário após múltiplas tentativas

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "senha_alterada_em")
    private LocalDateTime senhaAlteradaEm;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "deletado", nullable = false)
    private Boolean deletado = false;

    @Column(name = "data_delecao")
    private LocalDateTime dataDeletacao;

    // Relacionamentos com segurança
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private TwoFactorAuth twoFactorAuth;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<BiometricCredential> credenciaisBiometricas;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<SecurityAuditLog> auditLogs;

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) dataCriacao = LocalDateTime.now();
        if (senhaAlteradaEm == null) senhaAlteradaEm = LocalDateTime.now();
    }

    // ===== GETTERS E SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { 
        this.senha = senha;
        this.senhaAlteradaEm = LocalDateTime.now();
    }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public Boolean getEmailVerificado() { return emailVerificado; }
    public void setEmailVerificado(Boolean emailVerificado) { this.emailVerificado = emailVerificado; }

    public String getEmailVerificacaoToken() { return emailVerificacaoToken; }
    public void setEmailVerificacaoToken(String emailVerificacaoToken) { this.emailVerificacaoToken = emailVerificacaoToken; }

    public LocalDateTime getDataVerificacaoEmail() { return dataVerificacaoEmail; }
    public void setDataVerificacaoEmail(LocalDateTime dataVerificacaoEmail) { this.dataVerificacaoEmail = dataVerificacaoEmail; }

    public Integer getTentativasLoginFalhadas() { return tentativasLoginFalhadas; }
    public void setTentativasLoginFalhadas(Integer tentativasLoginFalhadas) { this.tentativasLoginFalhadas = tentativasLoginFalhadas; }

    public LocalDateTime getDataBloqueio() { return dataBloqueio; }
    public void setDataBloqueio(LocalDateTime dataBloqueio) { this.dataBloqueio = dataBloqueio; }

    public LocalDateTime getUltimoLogin() { return ultimoLogin; }
    public void setUltimoLogin(LocalDateTime ultimoLogin) { this.ultimoLogin = ultimoLogin; }

    public LocalDateTime getSenhaAlteradaEm() { return senhaAlteradaEm; }
    public void setSenhaAlteradaEm(LocalDateTime senhaAlteradaEm) { this.senhaAlteradaEm = senhaAlteradaEm; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public Boolean getDeletado() { return deletado; }
    public void setDeletado(Boolean deletado) { this.deletado = deletado; }

    public LocalDateTime getDataDeletacao() { return dataDeletacao; }
    public void setDataDeletacao(LocalDateTime dataDeletacao) { this.dataDeletacao = dataDeletacao; }

    public TwoFactorAuth getTwoFactorAuth() { return twoFactorAuth; }
    public void setTwoFactorAuth(TwoFactorAuth twoFactorAuth) { this.twoFactorAuth = twoFactorAuth; }

    public java.util.List<BiometricCredential> getCredenciaisBiometricas() { return credenciaisBiometricas; }
    public void setCredenciaisBiometricas(java.util.List<BiometricCredential> credenciaisBiometricas) { this.credenciaisBiometricas = credenciaisBiometricas; }

    public java.util.List<SecurityAuditLog> getAuditLogs() { return auditLogs; }
    public void setAuditLogs(java.util.List<SecurityAuditLog> auditLogs) { this.auditLogs = auditLogs; }
}
