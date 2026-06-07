package com.arenahub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
    private String allowedOriginPatterns;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/arenas", "/api/arenas/{id}", "/api/arenas/{arenaId}/horarios").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/reservas").hasRole("USUARIO")
                .requestMatchers(HttpMethod.GET, "/api/reservas/minhas").hasRole("USUARIO")
                .requestMatchers(HttpMethod.GET, "/api/reservas/proprietario").hasRole("PROPRIETARIO")
                .requestMatchers(HttpMethod.GET, "/api/arenas/minhas", "/api/arenas/{arenaId}/horarios/todos").hasRole("PROPRIETARIO")
                .requestMatchers(HttpMethod.POST, "/api/arenas", "/api/arenas/{arenaId}/horarios").hasRole("PROPRIETARIO")
                .requestMatchers(HttpMethod.PUT, "/api/arenas/{id}", "/api/horarios/{id}").hasRole("PROPRIETARIO")
                .requestMatchers(HttpMethod.DELETE, "/api/arenas/{id}", "/api/horarios/{id}").hasRole("PROPRIETARIO")
                .requestMatchers(HttpMethod.PUT, "/api/reservas/{id}/cancelar").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Em desenvolvimento, aceita localhost:5173. Em produção, use URL específica
        List<String> allowedOrigins = allowedOriginPatterns.contains("*")
            ? List.of("http://localhost:5173", "http://127.0.0.1:5173")
            : Arrays.stream(allowedOriginPatterns.split(",")).map(String::trim).toList();
        configuration.setAllowedOriginPatterns(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Cache-Control"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
