package com.arenahub.repository;

import com.arenahub.model.BiometricCredential;
import com.arenahub.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BiometricCredentialRepository extends JpaRepository<BiometricCredential, Long> {
    Optional<BiometricCredential> findByCredentialId(String credentialId);
    List<BiometricCredential> findByUsuarioAndHabilitadoTrue(Usuario usuario);
    List<BiometricCredential> findByUsuario(Usuario usuario);
    Integer countByUsuarioAndHabilitadoTrue(Usuario usuario);
}
