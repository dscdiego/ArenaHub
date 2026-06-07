package com.arenahub.service;

import com.arenahub.config.CustomUserPrincipal;
import com.arenahub.dto.ArenaRequest;
import com.arenahub.dto.ArenaResponse;
import com.arenahub.mapper.DtoMapper;
import com.arenahub.model.Arena;
import com.arenahub.model.TipoUsuario;
import com.arenahub.model.Usuario;
import com.arenahub.repository.ArenaRepository;
import com.arenahub.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ArenaService {
    private final ArenaRepository arenaRepository;
    private final UsuarioRepository usuarioRepository;

    public ArenaService(ArenaRepository arenaRepository, UsuarioRepository usuarioRepository) {
        this.arenaRepository = arenaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ArenaResponse> listarAtivas() {
        return arenaRepository.findByAtivaTrueOrderByNomeAsc().stream().map(DtoMapper::toArenaResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ArenaResponse> listarMinhas(CustomUserPrincipal principal) {
        garantirProprietario(principal);
        return arenaRepository.findByProprietarioIdAndAtivaTrueOrderByNomeAsc(principal.getId())
            .stream().map(DtoMapper::toArenaResponse).toList();
    }

    @Transactional(readOnly = true)
    public ArenaResponse buscarPorId(Long id) {
        Arena arena = arenaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Arena não encontrada"));
        if (!Boolean.TRUE.equals(arena.getAtiva())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arena não encontrada");
        }
        return DtoMapper.toArenaResponse(arena);
    }

    @Transactional
    public ArenaResponse criar(ArenaRequest request, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        Usuario proprietario = usuarioRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário autenticado não encontrado"));

        Arena arena = new Arena();
        arena.setProprietario(proprietario);
        aplicarDados(arena, request);
        arena.setAtiva(true);

        return DtoMapper.toArenaResponse(arenaRepository.save(arena));
    }

    @Transactional
    public ArenaResponse atualizar(Long id, ArenaRequest request, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        Arena arena = buscarArenaDoProprietario(id, principal.getId());
        aplicarDados(arena, request);
        if (request.ativa() != null) arena.setAtiva(request.ativa());
        return DtoMapper.toArenaResponse(arenaRepository.save(arena));
    }

    @Transactional
    public void desativar(Long id, CustomUserPrincipal principal) {
        garantirProprietario(principal);
        Arena arena = buscarArenaDoProprietario(id, principal.getId());
        arena.setAtiva(false);
        arenaRepository.save(arena);
    }

    @Transactional(readOnly = true)
    public Arena buscarArenaDoProprietario(Long arenaId, Long proprietarioId) {
        Arena arena = arenaRepository.findById(arenaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Arena não encontrada"));
        if (!arena.getProprietario().getId().equals(proprietarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode gerenciar suas próprias arenas");
        }
        return arena;
    }

    private void aplicarDados(Arena arena, ArenaRequest request) {
        arena.setNome(request.nome().trim());
        arena.setDescricao(request.descricao());
        arena.setEndereco(request.endereco().trim());
        arena.setCidade(request.cidade());
        arena.setBairro(request.bairro());
        arena.setTelefone(request.telefone());
        arena.setValorHora(request.valorHora());
        arena.setImagemUrl(request.imagemUrl());
    }

    private void garantirProprietario(CustomUserPrincipal principal) {
        if (principal == null || principal.getTipoUsuario() != TipoUsuario.PROPRIETARIO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas proprietários podem realizar esta ação");
        }
    }
}
