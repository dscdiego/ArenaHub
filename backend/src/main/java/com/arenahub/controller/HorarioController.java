package com.arenahub.controller;

import com.arenahub.config.CustomUserPrincipal;
import com.arenahub.dto.HorarioRequest;
import com.arenahub.dto.HorarioResponse;
import com.arenahub.service.HorarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class HorarioController {
    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping("/api/arenas/{arenaId}/horarios")
    public List<HorarioResponse> listarDisponiveis(@PathVariable Long arenaId) {
        return horarioService.listarDisponiveis(arenaId);
    }

    @GetMapping("/api/arenas/{arenaId}/horarios/todos")
    public List<HorarioResponse> listarTodosDaMinhaArena(@PathVariable Long arenaId, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return horarioService.listarTodosDaMinhaArena(arenaId, principal);
    }

    @PostMapping("/api/arenas/{arenaId}/horarios")
    @ResponseStatus(HttpStatus.CREATED)
    public HorarioResponse criar(@PathVariable Long arenaId, @Valid @RequestBody HorarioRequest request, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return horarioService.criar(arenaId, request, principal);
    }

    @PutMapping("/api/horarios/{id}")
    public HorarioResponse atualizar(@PathVariable Long id, @Valid @RequestBody HorarioRequest request, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return horarioService.atualizar(id, request, principal);
    }

    @DeleteMapping("/api/horarios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @AuthenticationPrincipal CustomUserPrincipal principal) {
        horarioService.excluir(id, principal);
    }
}
