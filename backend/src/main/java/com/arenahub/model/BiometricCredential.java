package com.arenahub.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Biometric Credential - WebAuthn/FIDO2 (Face, Fingerprint)
 */
@Entity
@Table(name = "biometric_credentials", indexes = {
    @Index(name = "idx_usuario_biometrica", columnNames = "usuario_id"),
    @Index(name = "idx_credencial_id", columnNames = "credential_id")
})
public class BiometricCredential {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "credential_id", nullable = false, unique = true, length = 500)
    private String credentialId;

    @Column(name = "public_key", nullable = false, columnType = "LONGTEXT")
    private String publicKey; // Chave pública em Base64

    @Column(name = "aaguid", length = 100)
    private String aaguid; // Authenticator ID

    @Column(name = "tipo_autenticador", length = 100)
    private String tipoAutenticador; // "platform" (Windows Hello, TouchID) ou "cross-platform" (Security Keys)

    @Column(name = "nome_dispositivo", length = 255)
    private String nomeDispositivo; // iPhone Face ID, Windows Hello, etc

    @Column(nullable = false)
    private Boolean habilitado = true;

    @Column(name = "contador", nullable = false)
    private Long contador = 0L; // Contador de uso (detecção de clonagem)

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "ultimo_uso")
    private LocalDateTime ultimoUso;

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) dataCriacao = LocalDateTime.now();
    }

    // Construtores
    public BiometricCredential() {}

    public BiometricCredential(Usuario usuario, String credentialId, String publicKey, String tipoAutenticador) {
        this.usuario = usuario;
        this.credentialId = credentialId;
        this.publicKey = publicKey;
        this.tipoAutenticador = tipoAutenticador;
        this.habilitado = true;
        this.dataCriacao = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }

    public String getPublicKey() { return publicKey; }
    public void setPublicKey(String publicKey) { this.publicKey = publicKey; }

    public String getAaguid() { return aaguid; }
    public void setAaguid(String aaguid) { this.aaguid = aaguid; }

    public String getTipoAutenticador() { return tipoAutenticador; }
    public void setTipoAutenticador(String tipoAutenticador) { this.tipoAutenticador = tipoAutenticador; }

    public String getNomeDispositivo() { return nomeDispositivo; }
    public void setNomeDispositivo(String nomeDispositivo) { this.nomeDispositivo = nomeDispositivo; }

    public Boolean getHabilitado() { return habilitado; }
    public void setHabilitado(Boolean habilitado) { this.habilitado = habilitado; }

    public Long getContador() { return contador; }
    public void setContador(Long contador) { this.contador = contador; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public LocalDateTime getUltimoUso() { return ultimoUso; }
    public void setUltimoUso(LocalDateTime ultimoUso) { this.ultimoUso = ultimoUso; }
}
