export function getUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function salvarSessao(authResponse) {
  localStorage.setItem('token', authResponse.token);
  localStorage.setItem('usuario', JSON.stringify(authResponse.usuario));
}

export function sair() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function rotaInicialPorPerfil(tipoUsuario) {
  return tipoUsuario === 'PROPRIETARIO' ? '/proprietario/dashboard' : '/usuario/dashboard';
}

export function money(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function onlyDate(value) {
  if (!value) return '';
  return new Date(value + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function onlyHour(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}
