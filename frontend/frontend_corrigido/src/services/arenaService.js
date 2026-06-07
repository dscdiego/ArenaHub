import api from './api.js';
import { fallbackArenas } from './mockData.js';

function normalizarArena(arena) {
  const esportes = arena.esportes || arena.descricao?.split(',') || [];
  return {
    nota: arena.nota || 4.7,
    avaliacoes: arena.avaliacoes || 120,
    esportes,
    ...arena,
  };
}

export async function listarArenas() {
  try {
    const { data } = await api.get('/arenas');
    return data.map(normalizarArena);
  } catch (error) {
    console.warn('⚠️ Erro ao listar arenas da API, usando dados locais:', error?.message);
    return fallbackArenas.map(normalizarArena);
  }
}

export async function buscarArena(id) {
  try {
    const { data } = await api.get(`/arenas/${id}`);
    return normalizarArena(data);
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar arena ${id}, usando dados locais:`, error?.message);
    return fallbackArenas.find((arena) => Number(arena.id) === Number(id)) || fallbackArenas[0];
  }
}

export async function minhasArenas() {
  try {
    const { data } = await api.get('/arenas/minhas');
    return data.map(normalizarArena);
  } catch (error) {
    console.error('❌ Erro ao buscar minhas arenas:', error?.message);
    return [];
  }
}

export async function criarArena(payload) {
  const { data } = await api.post('/arenas', payload);
  return data;
}

export async function atualizarArena(id, payload) {
  const { data } = await api.put(`/arenas/${id}`, payload);
  return data;
}

export async function excluirArena(id) {
  await api.delete(`/arenas/${id}`);
}

export function filtrarArenas(arenas, termo) {
  const busca = termo.trim().toLowerCase();
  if (!busca) return arenas;
  return arenas.filter((arena) => {
    const esportes = (arena.esportes || []).join(' ').toLowerCase();
    return `${arena.nome} ${arena.descricao} ${arena.cidade} ${arena.bairro} ${esportes}`.toLowerCase().includes(busca);
  });
}
