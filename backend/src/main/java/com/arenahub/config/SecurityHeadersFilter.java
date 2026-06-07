package com.arenahub.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filtro para adicionar headers de segurança a todas as respostas
 */
@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Proteção contra clickjacking
        httpResponse.setHeader("X-Frame-Options", "DENY");

        // Proteção contra MIME sniffing
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");

        // Proteção contra XSS
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        httpResponse.setHeader("Content-Security-Policy", 
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");

        // HTTP Strict Transport Security (HSTS) - ativar apenas em produção
        // httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

        // Não cachear dados sensíveis
        httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        httpResponse.setHeader("Pragma", "no-cache");
        httpResponse.setHeader("Expires", "0");

        // Remover headers que revelam tecnologia
        httpResponse.setHeader("Server", "");

        // Permitir requisições de APIs
        httpResponse.setHeader("Access-Control-Expose-Headers", "Content-Length, X-JSON-Response");

        // Referrer Policy
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Feature Policy
        httpResponse.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig config) throws ServletException {
        // Inicialização do filtro
    }

    @Override
    public void destroy() {
        // Limpeza do filtro
    }
}
