import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 12000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiMessage(error) {
  if (!error?.response) {
    return 'Não consegui conectar com o backend. Confira se o Spring Boot está rodando em http://localhost:8080 e se o MySQL está ligado.';
  }

  const data = error.response.data;

  if (data?.fields && typeof data.fields === 'object') {
    return Object.values(data.fields).join(' | ');
  }

  return data?.message || data?.erro || data?.error || error?.message || 'Erro inesperado.';
}

export default api;
