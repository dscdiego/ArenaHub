package com.arenahub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;

public record HorarioRequest(
    @NotNull(message = "Data é obrigatória") 
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate data,
    
    @Min(value = 0, message = "Dia da semana deve estar entre 0 e 6") 
    @Max(value = 6, message = "Dia da semana deve estar entre 0 e 6") 
    Integer diaSemana,
    
    @NotNull(message = "Hora inicial é obrigatória") 
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "HH:mm")
    LocalTime horaInicio,
    
    @NotNull(message = "Hora final é obrigatória") 
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "HH:mm")
    LocalTime horaFim,
    
    Boolean disponivel,
    Boolean bloqueado
) {}
