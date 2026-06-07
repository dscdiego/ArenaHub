import api from './api.js';

export async function criarReserva(payload) {
  try {
    const { data } = await api.post('/reservas', payload);
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar reserva:', error?.message);
    throw error; // Propaga o erro para o componente lidar
  }
}

export async function minhasReservas() {
  try {
    const { data } = await api.get('/reservas/minhas');
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar minhas reservas:', error?.message);
    throw error; // Propaga o erro para o componente lidar
  }
}

export async function reservasDoProprietario() {
  try {
    const { data } = await api.get('/reservas/proprietario');
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar reservas do proprietário:', error?.message);
    throw error; // Propaga o erro para o componente lidar
  }
}

export async function cancelarReserva(id) {
  try {
    const { data } = await api.put(`/reservas/${id}/cancelar`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao cancelar reserva ${id}:`, error?.message);
    throw error; // Propaga o erro para o componente lidar
  }
}
