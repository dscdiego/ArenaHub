import api from './api.js';
import { fallbackHorarios } from './mockData.js';

export async function horariosDisponiveis(arenaId) {
  try {
    console.log(`📋 Buscando horários da arena ${arenaId}...`);
    // Adicionar timestamp para quebrar cache HTTP
    const timestamp = Date.now();
    const { data } = await api.get(`/arenas/${arenaId}/horarios?_t=${timestamp}`);
    console.log(`✅ ${data.length} horários encontrados (disponíveis e ocupados)`);
    return data;
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar horarios da arena ${arenaId}:`, error?.message);
    return fallbackHorarios.filter((h) => Number(h.arenaId) === Number(arenaId));
  }
}

export async function todosHorariosDaArena(arenaId) {
  try {
    const { data } = await api.get(`/arenas/${arenaId}/horarios/todos`);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar todos horarios da arena ${arenaId}:`, error?.message);
    throw error;
  }
}

export async function criarHorario(arenaId, payload) {
  try {
    const { data } = await api.post(`/arenas/${arenaId}/horarios`, payload);
    return data;
  } catch (error) {
    console.error(`Erro ao criar horario da arena ${arenaId}:`, error?.message);
    throw error;
  }
}

export async function atualizarHorario(id, payload) {
  try {
    const { data } = await api.put(`/horarios/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar horario ${id}:`, error?.message);
    throw error;
  }
}

export async function excluirHorario(id) {
  try {
    await api.delete(`/horarios/${id}`);
  } catch (error) {
    console.error(`Erro ao deletar horario ${id}:`, error?.message);
    throw error;
  }
}
