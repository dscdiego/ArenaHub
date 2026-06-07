import api from './api.js';
import { salvarSessao, sair } from '../utils/storage.js';

export async function login(payload) {
  try {
    const { data } = await api.post('/auth/login', payload);
    salvarSessao(data);
    console.log(`Login bem-sucedido para usuario: ${payload.email}`);
    return data;
  } catch (error) {
    console.error('Erro ao fazer login:', error?.message);
    throw error;
  }
}

export async function cadastrar(payload) {
  try {
    const { data } = await api.post('/auth/register', payload);
    console.log(`Cadastro bem-sucedido para usuario: ${payload.email}`);
    return data;
  } catch (error) {
    console.error('Erro ao cadastrar:', error?.message);
    throw error;
  }
}

export function logout() {
  sair();
  console.log('Usuario fez logout');
}
