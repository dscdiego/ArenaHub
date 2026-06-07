package com.arenahub.service;

import com.arenahub.model.TwoFactorAuth;
import com.arenahub.model.Usuario;
import com.arenahub.repository.TwoFactorAuthRepository;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.exceptions.CodeGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.util.Utils;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Serviço para gerenciar autenticação de dois fatores (2FA) com TOTP
 * Compatível com Google Authenticator, Microsoft Authenticator, etc
 */
@Service
public class TwoFactorService {
    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final CodeGenerator codeGenerator;
    private final CodeVerifier codeVerifier;
    private final DefaultSecretGenerator secretGenerator;

    public TwoFactorService(TwoFactorAuthRepository twoFactorAuthRepository) {
        this.twoFactorAuthRepository = twoFactorAuthRepository;
        this.codeGenerator = new DefaultCodeGenerator();
        this.codeVerifier = new DefaultCodeVerifier();
        this.secretGenerator = new DefaultSecretGenerator();
    }

    /**
     * Gerar novo secret e QR code para 2FA
     */
    @Transactional
    public TwoFactorInitResponse generateTwoFactorSecret(Usuario usuario) throws CodeGenerationException {
        // Gerar secret único
        String secret = secretGenerator.generate();

        // Criar registro no banco
        TwoFactorAuth twoFactorAuth = new TwoFactorAuth(usuario, secret);
        twoFactorAuth.setVerificado(false);
        twoFactorAuth.setHabilitado(false);
        
        TwoFactorAuth saved = twoFactorAuthRepository.save(twoFactorAuth);

        // Gerar QR code
        String qrCodeDataUrl = generateQrCode(usuario, secret);

        // Gerar backup codes
        List<String> backupCodes = generateBackupCodes();
        saved.setBackupCodes(backupCodesToJson(backupCodes));
        twoFactorAuthRepository.save(saved);

        return new TwoFactorInitResponse(secret, qrCodeDataUrl, backupCodes);
    }

    /**
     * Verificar código TOTP e habilitar 2FA
     */
    @Transactional
    public void enableTwoFactor(Usuario usuario, String code) {
        if (StringUtils.isBlank(code)) {
            throw new IllegalArgumentException("Código TOTP não pode estar vazio");
        }

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUsuario(usuario)
            .orElseThrow(() -> new EntityNotFoundException("2FA não configurado para este usuário"));

        // Verificar código (permite pequena margem de erro de tempo)
        if (!codeVerifier.isValidCode(twoFactorAuth.getSecret(), code)) {
            throw new IllegalArgumentException("Código TOTP inválido ou expirado");
        }

        // Habilitar 2FA
        twoFactorAuth.setVerificado(true);
        twoFactorAuth.setHabilitado(true);
        twoFactorAuth.setDataHabilitacao(LocalDateTime.now());
        twoFactorAuthRepository.save(twoFactorAuth);
    }

    /**
     * Verificar código TOTP durante login
     */
    public boolean verifyTotpCode(Usuario usuario, String code) {
        if (StringUtils.isBlank(code)) {
            return false;
        }

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUsuarioAndHabilitadoTrue(usuario)
            .orElse(null);

        if (twoFactorAuth == null) {
            return false;
        }

        return codeVerifier.isValidCode(twoFactorAuth.getSecret(), code);
    }

    /**
     * Verificar usando backup code
     */
    @Transactional
    public boolean verifyBackupCode(Usuario usuario, String backupCode) {
        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUsuarioAndHabilitadoTrue(usuario)
            .orElse(null);

        if (twoFactorAuth == null || twoFactorAuth.getBackupCodes() == null) {
            return false;
        }

        List<String> codes = parseBackupCodes(twoFactorAuth.getBackupCodes());
        if (codes.contains(backupCode)) {
            // Remover código usado
            codes.remove(backupCode);
            twoFactorAuth.setBackupCodes(backupCodesToJson(codes));
            twoFactorAuthRepository.save(twoFactorAuth);
            return true;
        }

        return false;
    }

    /**
     * Desabilitar 2FA
     */
    @Transactional
    public void disableTwoFactor(Usuario usuario) {
        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUsuario(usuario)
            .orElseThrow(() -> new EntityNotFoundException("2FA não configurado"));

        twoFactorAuth.setHabilitado(false);
        twoFactorAuth.setVerificado(false);
        twoFactorAuthRepository.save(twoFactorAuth);
    }

    /**
     * Verificar se usuário tem 2FA habilitado
     */
    public boolean isTwoFactorEnabled(Usuario usuario) {
        return twoFactorAuthRepository.findByUsuarioAndHabilitadoTrue(usuario).isPresent();
    }

    /**
     * Gerar QR Code com dados do usuário
     */
    private String generateQrCode(Usuario usuario, String secret) throws CodeGenerationException {
        QrData qrData = new QrData.Builder()
            .label(usuario.getEmail())
            .secret(secret)
            .issuer("ArenaHub")
            .algorithm(dev.samstevens.totp.util.Utils.Algorithm.SHA1)
            .digits(6)
            .period(30)
            .build();

        QrGenerator qrGenerator = new ZxingPngQrGenerator();
        byte[] imageData = qrGenerator.generate(qrData);
        return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(imageData);
    }

    /**
     * Gerar 10 códigos de backup
     */
    private List<String> generateBackupCodes() {
        return IntStream.range(0, 10)
            .mapToObj(i -> UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .collect(Collectors.toList());
    }

    /**
     * Converter lista de códigos para JSON
     */
    private String backupCodesToJson(List<String> codes) {
        return String.join(",", codes);
    }

    /**
     * Parsear JSON para lista de códigos
     */
    private List<String> parseBackupCodes(String json) {
        List<String> codes = new ArrayList<>();
        if (StringUtils.isNotBlank(json)) {
            codes.addAll(java.util.Arrays.asList(json.split(",")));
        }
        return codes;
    }

    /**
     * DTO para resposta de inicialização de 2FA
     */
    public static class TwoFactorInitResponse {
        public final String secret;
        public final String qrCodeUrl;
        public final List<String> backupCodes;

        public TwoFactorInitResponse(String secret, String qrCodeUrl, List<String> backupCodes) {
            this.secret = secret;
            this.qrCodeUrl = qrCodeUrl;
            this.backupCodes = backupCodes;
        }
    }
}
