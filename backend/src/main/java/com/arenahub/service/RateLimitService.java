package com.arenahub.service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.RateLimiter;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Serviço de Rate Limiting para proteção contra força bruta
 */
@Service
public class RateLimitService {
    
    // Rate limiter por IP (5 tentativas por minuto)
    private final LoadingCache<String, RateLimiter> rateLimiters = CacheBuilder.newBuilder()
        .maximumSize(100000)
        .expireAfterAccess(10, TimeUnit.MINUTES)
        .build(new CacheLoader<String, RateLimiter>() {
            @Override
            public RateLimiter load(String key) {
                return RateLimiter.create(5.0); // 5 requisições por segundo = ~300 por minuto
            }
        });

    // Contador de tentativas falhadas por email
    private final LoadingCache<String, Integer> failedAttempts = CacheBuilder.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(15, TimeUnit.MINUTES)
        .build(new CacheLoader<String, Integer>() {
            @Override
            public Integer load(String key) {
                return 0;
            }
        });

    // Cache de bloqueios por email
    private final LoadingCache<String, Boolean> blockedEmails = CacheBuilder.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build(new CacheLoader<String, Boolean>() {
            @Override
            public Boolean load(String key) {
                return false;
            }
        });

    /**
     * Verificar se IP pode fazer requisição
     */
    public boolean allowRequest(String ipAddress) {
        try {
            return rateLimiters.get(ipAddress).tryAcquire();
        } catch (ExecutionException e) {
            return false;
        }
    }

    /**
     * Registrar tentativa de login falhada
     */
    public void recordFailedLoginAttempt(String email) {
        try {
            int attempts = failedAttempts.get(email);
            failedAttempts.put(email, attempts + 1);

            // Bloquear após 5 tentativas
            if (attempts + 1 >= 5) {
                blockedEmails.put(email, true);
            }
        } catch (ExecutionException e) {
            // Erro ao atualizar cache
        }
    }

    /**
     * Verificar se email está bloqueado
     */
    public boolean isEmailBlocked(String email) {
        try {
            return blockedEmails.get(email);
        } catch (ExecutionException e) {
            return false;
        }
    }

    /**
     * Limpar tentativas falhadas após login bem-sucedido
     */
    public void clearFailedAttempts(String email) {
        failedAttempts.invalidate(email);
        blockedEmails.invalidate(email);
    }

    /**
     * Obter número de tentativas falhadas
     */
    public int getFailedAttempts(String email) {
        try {
            return failedAttempts.get(email);
        } catch (ExecutionException e) {
            return 0;
        }
    }

    /**
     * Desbloquear email manualmente
     */
    public void unlockEmail(String email) {
        blockedEmails.put(email, false);
        failedAttempts.put(email, 0);
    }
}
