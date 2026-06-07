package com.arenahub.controller;

import com.arenahub.config.CustomUserPrincipal;
import com.arenahub.dto.ArenaRequest;
import com.arenahub.dto.ArenaResponse;
import com.arenahub.service.ArenaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/arenas")
public class ArenaController {
    private final ArenaService arenaService;

    public ArenaController(ArenaService arenaService) {
        this.arenaService = arenaService;
    }

    @GetMapping
    public List<ArenaResponse> listarAtivas() {
        return arenaService.listarAtivas();
    }

    @GetMapping("/minhas")
    public List<ArenaResponse> listarMinhas(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return arenaService.listarMinhas(principal);
    }

    @GetMapping("/{id}")
    public ArenaResponse buscar(@PathVariable Long id) {
        return arenaService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArenaResponse criar(@Valid @RequestBody ArenaRequest request, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return arenaService.criar(request, principal);
    }

    @PutMapping("/{id}")
    public ArenaResponse atualizar(@PathVariable Long id, @Valid @RequestBody ArenaRequest request, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return arenaService.atualizar(id, request, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id, @AuthenticationPrincipal CustomUserPrincipal principal) {
        arenaService.desativar(id, principal);
    }
}
