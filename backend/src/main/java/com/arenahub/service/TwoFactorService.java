package com.arenahub.service;

import com.arenahub.model.TwoFactorAuth;
import com.arenahub.model.Usuario;
import com.arenahub.repository.TwoFactorAuthRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Serviço para gerenciar autenticação de dois fatores (2FA) com TOTP
 * Compatível com Google Authenticator, Microsoft Authenticator, etc
 * Implementação TOTP RFC 6238 sem dependências externas
 */
@Service
public class TwoFactorService {
    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private static final String TOTP_ALGORITHM = "HmacSHA1";
    private static final int TOTP_LENGTH = 6;
    private static final int TOTP_TIME_STEP = 30; // segundos
    private static final int WINDOW_SIZE = 1; // margem de 1 passo para sincronização

    public TwoFactorService(TwoFactorAuthRepository twoFactorAuthRepository) {
        this.twoFactorAuthRepository = twoFactorAuthRepository;
    }

    /**
     * Gerar novo secret (Base32 encoded) e informações de QR code para 2FA
     */
    @Transactional
    public TwoFactorInitResponse generateTwoFactorSecret(Usuario usuario) {
        // Gerar secret de 20 bytes (160 bits) - convertido para Base32
        String secret = generateBase32Secret();

        // Criar registro no banco
        TwoFactorAuth twoFactorAuth = new TwoFactorAuth(usuario, secret);
        twoFactorAuth.setVerificado(false);
        twoFactorAuth.setHabilitado(false);
        
        TwoFactorAuth saved = twoFactorAuthRepository.save(twoFactorAuth);

        // Gerar URL do QR code (otpauth://)
        String qrCodeUrl = generateOtpauthUrl(usuario.getEmail(), secret, "ArenaHub");

        // Gerar backup codes
        List<String> backupCodes = generateBackupCodes();
        saved.setBackupCodes(backupCodesToJson(backupCodes));
        twoFactorAuthRepository.save(saved);

        return new TwoFactorInitResponse(secret, qrCodeUrl, backupCodes);
    }

    /**
     * Verificar código TOTP e habilitar 2FA
     */
    @Transactional
    public void enableTwoFactor(Usuario usuario, String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Código TOTP não pode estar vazio");
        }

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUsuario(usuario)
            .orElseThrow(() -> new EntityNotFoundException("2FA não configurado para este usuário"));

        // Verificar código (permite margem de erro de tempo)
        if (!verifyCode(twoFactorAuth.getSecret(), code)) {
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
        if (code == null || code.trim().isEmpty()) {
            return false;
        }

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUsuarioAndHabilitadoTrue(usuario)
            .orElse(null);

        if (twoFactorAuth == null) {
            return false;
        }

        return verifyCode(twoFactorAuth.getSecret(), code);
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
     * Gerar Base32 secret (20 bytes = 160 bits)
     */
    private String generateBase32Secret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /**
     * Codificar para Base32
     */
    private static String base32Encode(byte[] data) {
        final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        StringBuilder result = new StringBuilder();

        int buffer = 0;
        int bufferSize = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bufferSize += 8;
            while (bufferSize >= 5) {
                bufferSize -= 5;
                result.append(BASE32_ALPHABET.charAt((buffer >> bufferSize) & 0x1f));
            }
        }

        if (bufferSize > 0) {
            result.append(BASE32_ALPHABET.charAt((buffer << (5 - bufferSize)) & 0x1f));
        }

        return result.toString();
    }

    /**
     * Decodificar Base32 para bytes
     */
    private static byte[] base32Decode(String encoded) {
        final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        byte[] bytes = new byte[encoded.length() * 5 / 8];
        
        int buffer = 0;
        int bufferSize = 0;
        int index = 0;

        for (char c : encoded.toCharArray()) {
            int digit = BASE32_ALPHABET.indexOf(Character.toUpperCase(c));
            if (digit < 0) continue;
            
            buffer = (buffer << 5) | digit;
            bufferSize += 5;
            
            if (bufferSize >= 8) {
                bufferSize -= 8;
                bytes[index++] = (byte) ((buffer >> bufferSize) & 0xff);
            }
        }

        byte[] result = new byte[index];
        System.arraycopy(bytes, 0, result, 0, index);
        return result;
    }

    /**
     * Gerar URL otpauth:// para QR code (compatível com Google Authenticator)
     */
    private String generateOtpauthUrl(String email, String secret, String issuer) {
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
            issuer, email, secret, issuer, TOTP_LENGTH, TOTP_TIME_STEP
        );
    }

    /**
     * Verificar código TOTP com janela de tempo (RFC 6238)
     * Permite margem de 1 passo antes e depois
     */
    private boolean verifyCode(String secret, String code) {
        try {
            long timeCounter = System.currentTimeMillis() / 1000 / TOTP_TIME_STEP;

            // Verificar código atual + margem de erro (±1 passo)
            for (int i = -WINDOW_SIZE; i <= WINDOW_SIZE; i++) {
                String generatedCode = generateTOTPCode(secret, timeCounter + i);
                if (generatedCode.equals(code)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Gerar código TOTP para um timestamp específico
     */
    private String generateTOTPCode(String secret, long timeCounter) throws Exception {
        byte[] secretBytes = base32Decode(secret);
        byte[] message = new byte[8];
        
        // Converter contador para bytes (big-endian)
        for (int i = 7; i >= 0; i--) {
            message[i] = (byte) (timeCounter & 0xff);
            timeCounter >>= 8;
        }

        // HMAC-SHA1
        Mac mac = Mac.getInstance(TOTP_ALGORITHM);
        mac.init(new SecretKeySpec(secretBytes, 0, secretBytes.length, TOTP_ALGORITHM));
        byte[] hash = mac.doFinal(message);

        // Dinâmico truncamento (RFC 4226)
        int offset = hash[hash.length - 1] & 0xf;
        long truncatedHash = 0;
        for (int i = 0; i < 4; ++i) {
            truncatedHash <<= 8;
            truncatedHash |= (hash[offset + i] & 0xff);
        }

        truncatedHash &= 0x7fffffff;
        truncatedHash %= (int) Math.pow(10, TOTP_LENGTH);

        return String.format("%06d", truncatedHash);
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
     * Converter lista de códigos para string (comma-separated)
     */
    private String backupCodesToJson(List<String> codes) {
        return String.join(",", codes);
    }

    /**
     * Parsear string para lista de códigos
     */
    private List<String> parseBackupCodes(String json) {
        List<String> codes = new ArrayList<>();
        if (json != null && !json.trim().isEmpty()) {
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

        public String getSecret() { return secret; }
        public String getQrCodeUrl() { return qrCodeUrl; }
        public List<String> getBackupCodes() { return backupCodes; }
    }
}
