package com.arenahub;

import com.arenahub.dto.RegisterRequest;
import com.arenahub.model.TipoUsuario;
import com.arenahub.repository.UsuarioRepository;
import com.arenahub.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {
    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deveCadastrarUsuarioComSenhaCriptografada() {
        authService.register(new RegisterRequest("Diego", "diego@email.com", "123456", "85999999999", TipoUsuario.USUARIO));

        var usuario = usuarioRepository.findByEmailAndTipoUsuario("diego@email.com", TipoUsuario.USUARIO).orElseThrow();
        assertNotEquals("123456", usuario.getSenha());
        assertTrue(usuario.getSenha().startsWith("$2"));
    }

    @Test
    void devePermitirMesmoEmailEmTiposDiferentes() {
        authService.register(new RegisterRequest("Cliente", "arena@email.com", "123456", "85999999999", TipoUsuario.USUARIO));
        authService.register(new RegisterRequest("Dono", "arena@email.com", "123456", "85999999999", TipoUsuario.PROPRIETARIO));

        assertTrue(usuarioRepository.existsByEmailAndTipoUsuario("arena@email.com", TipoUsuario.USUARIO));
        assertTrue(usuarioRepository.existsByEmailAndTipoUsuario("arena@email.com", TipoUsuario.PROPRIETARIO));
    }

    @Test
    void naoDevePermitirMesmoEmailNoMesmoTipo() {
        authService.register(new RegisterRequest("Cliente", "repete@email.com", "123456", "85999999999", TipoUsuario.USUARIO));

        assertThrows(ResponseStatusException.class, () ->
            authService.register(new RegisterRequest("Outro", "repete@email.com", "123456", "85999999999", TipoUsuario.USUARIO))
        );
    }
}
