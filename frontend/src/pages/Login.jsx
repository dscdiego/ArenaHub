import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiMessage } from '../services/api.js';
import { login } from '../services/authService.js';
import { rotaInicialPorPerfil } from '../utils/storage.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '', tipoUsuario: 'USUARIO' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function update(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!form.email.trim()) {
      setErro('Por favor, insira seu email.');
      return;
    }

    if (!validarEmail(form.email)) {
      setErro('Email inválido. Verifique e tente novamente.');
      return;
    }

    if (!form.senha.trim()) {
      setErro('Por favor, insira sua senha.');
      return;
    }

    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const auth = await login(form);
      navigate(rotaInicialPorPerfil(auth.usuario.tipoUsuario), { replace: true });
    } catch (error) {
      const mensagem = getApiMessage(error);
      setErro(mensagem || 'Email ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-overlay" />
      <section className="auth-card">
        <div className="logo-large"><span>⚽</span>ArenaHub</div>
        <p className="auth-subtitle">Entre para reservar ou gerenciar arenas.</p>

        <div className="role-toggle">
          <button type="button" className={form.tipoUsuario === 'USUARIO' ? 'selected' : ''} onClick={() => update('tipoUsuario', 'USUARIO')}>Usuário</button>
          <button type="button" className={form.tipoUsuario === 'PROPRIETARIO' ? 'selected' : ''} onClick={() => update('tipoUsuario', 'PROPRIETARIO')}>Proprietário</button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <label className="input-icon"><span>✉️</span><input type="email" placeholder="Seu email" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
          <label className="input-icon"><span>🔒</span><input type="password" placeholder="Sua senha" value={form.senha} onChange={(e) => update('senha', e.target.value)} /></label>
          {erro && <div className="message error">{erro}</div>}
          <button className="primary-button" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <div className="divider"><span>ou</span></div>
        <Link className="outline-button" to="/cadastro">Criar conta</Link>
        <button className="google-button" type="button">G Entrar com Google</button>
        <small>Ao entrar ou criar uma conta, você concorda com os Termos de serviço.</small>
      </section>
    </main>
  );
}
