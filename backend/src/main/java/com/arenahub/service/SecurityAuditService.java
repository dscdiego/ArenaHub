package com.arenahub.service;

import com.arenahub.model.SecurityAuditLog;
import com.arenahub.model.Usuario;
import com.arenahub.repository.SecurityAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Serviço para auditoria e logging de segurança
 * Registra todas as atividades importantes de segurança
 */
@Service
public class SecurityAuditService {
    private final SecurityAuditLogRepository auditLogRepository;

    public SecurityAuditService(SecurityAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Registrar evento de segurança
     */
    @Transactional
    public void logEvent(Usuario usuario, String evento) {
        logEvent(usuario, evento, null, true);
    }

    /**
     * Registrar evento com descrição
     */
    @Transactional
    public void logEvent(Usuario usuario, String evento, String descricao) {
        logEvent(usuario, evento, descricao, true);
    }

    /**
     * Registrar evento com sucesso/falha
     */
    @Transactional
    public void logEvent(Usuario usuario, String evento, String descricao, Boolean sucesso) {
        String ipAddress = getClientIpAddress();
        String userAgent = getUserAgent();

        SecurityAuditLog log = new SecurityAuditLog();
        log.setUsuario(usuario);
        log.setEvento(evento);
        log.setDescricao(descricao);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setSucesso(sucesso);
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }

    /**
     * Registrar tentativa de login falhada
     */
    @Transactional
    public void logFailedLogin(String email, String motivo) {
        String ipAddress = getClientIpAddress();
        String userAgent = getUserAgent();

        SecurityAuditLog log = new SecurityAuditLog();
        log.setEvento("FAILED_LOGIN");
        log.setDescricao("Tentativa falhada de login: " + motivo + " (Email: " + email + ")");
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setSucesso(false);
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }

    /**
     * Registrar login bem-sucedido
     */
    @Transactional
    public void logSuccessfulLogin(Usuario usuario) {
        logEvent(usuario, "LOGIN", "Login realizado com sucesso");
    }

    /**
     * Registrar logout
     */
    @Transactional
    public void logLogout(Usuario usuario) {
        logEvent(usuario, "LOGOUT", "Logout realizado");
    }

    /**
     * Registrar alteração de senha
     */
    @Transactional
    public void logPasswordChange(Usuario usuario) {
        logEvent(usuario, "PASSWORD_CHANGED", "Senha alterada");
    }

    /**
     * Registrar ativação de 2FA
     */
    @Transactional
    public void logTwoFactorEnabled(Usuario usuario) {
        logEvent(usuario, "2FA_ENABLED", "Autenticação de dois fatores ativada");
    }

    /**
     * Registrar desativação de 2FA
     */
    @Transactional
    public void logTwoFactorDisabled(Usuario usuario) {
        logEvent(usuario, "2FA_DISABLED", "Autenticação de dois fatores desativada");
    }

    /**
     * Registrar adição de biometria
     */
    @Transactional
    public void logBiometricAdded(Usuario usuario, String tipo) {
        logEvent(usuario, "BIOMETRIC_ADDED", "Credencial biométrica adicionada: " + tipo);
    }

    /**
     * Registrar remoção de biometria
     */
    @Transactional
    public void logBiometricRemoved(Usuario usuario, String tipo) {
        logEvent(usuario, "BIOMETRIC_REMOVED", "Credencial biométrica removida: " + tipo);
    }

    /**
     * Obter histórico de auditoria do usuário
     */
    public List<SecurityAuditLog> getAuditHistory(Usuario usuario) {
        return auditLogRepository.findByUsuarioOrderByTimestampDesc(usuario);
    }

    /**
     * Obter atividades suspeitas (login falhados)
     */
    public List<SecurityAuditLog> getSuspiciousActivity(Usuario usuario) {
        return auditLogRepository.findUltimasAtividadesSuspeitosas(usuario);
    }

    /**
     * Obter endereço IP do cliente
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // Verificar X-Forwarded-For (proxy)
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0];
                }
                
                // Verificar X-Real-IP
                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty()) {
                    return xRealIp;
                }
                
                // IP direto
                return request.getRemoteAddr();
            }
        } catch (IllegalStateException e) {
            // Fora do contexto web
        }
        return "UNKNOWN";
    }

    /**
     * Obter User-Agent do cliente
     */
    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                return attributes.getRequest().getHeader("User-Agent");
            }
        } catch (IllegalStateException e) {
            // Fora do contexto web
        }
        return "UNKNOWN";
    }
}
