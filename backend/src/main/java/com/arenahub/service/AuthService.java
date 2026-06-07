package com.arenahub.service;

import com.arenahub.config.JwtService;
import com.arenahub.dto.AuthResponse;
import com.arenahub.dto.LoginRequest;
import com.arenahub.dto.RegisterRequest;
import com.arenahub.mapper.DtoMapper;
import com.arenahub.model.Usuario;
import com.arenahub.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String emailNormalizado = request.email().trim().toLowerCase();

        if (usuarioRepository.existsByEmailAndTipoUsuario(emailNormalizado, request.tipoUsuario())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma conta desse tipo com este email");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(emailNormalizado);
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setTelefone(request.telefone().trim());
        usuario.setTipoUsuario(request.tipoUsuario());

        Usuario salvo = usuarioRepository.save(usuario);
        return new AuthResponse(jwtService.generateToken(salvo), DtoMapper.toUsuarioResponse(salvo));
    }

    public AuthResponse login(LoginRequest request) {
        String emailNormalizado = request.email().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmailAndTipoUsuario(emailNormalizado, request.tipoUsuario())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email, senha ou tipo de conta inválidos"));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email, senha ou tipo de conta inválidos");
        }

        return new AuthResponse(jwtService.generateToken(usuario), DtoMapper.toUsuarioResponse(usuario));
    }
}
