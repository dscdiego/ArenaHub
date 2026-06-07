package com.arenahub.controller;

import com.arenahub.config.CustomUserPrincipal;
import com.arenahub.dto.ReservaRequest;
import com.arenahub.dto.ReservaResponse;
import com.arenahub.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {
    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse criar(@Valid @RequestBody ReservaRequest request, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return reservaService.criar(request, principal);
    }

    @GetMapping("/minhas")
    public List<ReservaResponse> minhas(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return reservaService.minhasReservas(principal);
    }

    @GetMapping("/proprietario")
    public List<ReservaResponse> proprietario(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return reservaService.reservasDoProprietario(principal);
    }

    @PutMapping("/{id}/cancelar")
    public ReservaResponse cancelar(@PathVariable Long id, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return reservaService.cancelar(id, principal);
    }
}
