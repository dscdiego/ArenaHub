package com.arenahub.repository;

import com.arenahub.model.TwoFactorAuth;
import com.arenahub.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuth, Long> {
    Optional<TwoFactorAuth> findByUsuario(Usuario usuario);
    Optional<TwoFactorAuth> findByUsuarioAndHabilitadoTrue(Usuario usuario);
}
