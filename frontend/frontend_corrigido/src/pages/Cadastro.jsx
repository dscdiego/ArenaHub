import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiMessage } from '../services/api.js';
import { cadastrar } from '../services/authService.js';

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '', tipoUsuario: 'USUARIO' });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function update(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setMensagem('');
    
    // Validação de campos
    if (!form.nome?.trim()) {
      setErro('Nome é obrigatório');
      return;
    }
    if (!form.email?.trim()) {
      setErro('Email é obrigatório');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErro('Email inválido');
      return;
    }
    if (!form.telefone?.trim()) {
      setErro('Telefone é obrigatório');
      return;
    }
    if (form.senha.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    setLoading(true);
    try {
      await cadastrar(form);
      setMensagem('Conta criada. Agora faça login com o tipo de conta escolhido.');
      setTimeout(() => navigate('/login'), 700);
    } catch (error) {
      setErro(getApiMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen cadastro-bg">
      <section className="auth-card auth-card-plain">
        <div className="logo-large"><span>⚽</span>ArenaHub</div>
        <h1>Criar conta</h1>
        <p className="auth-subtitle">Escolha se você quer reservar horários ou cadastrar arenas.</p>

        <div className="role-toggle">
          <button type="button" className={form.tipoUsuario === 'USUARIO' ? 'selected' : ''} onClick={() => update('tipoUsuario', 'USUARIO')}>Usuário comum</button>
          <button type="button" className={form.tipoUsuario === 'PROPRIETARIO' ? 'selected' : ''} onClick={() => update('tipoUsuario', 'PROPRIETARIO')}>Proprietário</button>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <input placeholder="Nome completo" value={form.nome} onChange={(e) => update('nome', e.target.value)} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          <input placeholder="Telefone" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} required />
          <input type="password" placeholder="Senha com mínimo de 6 caracteres" value={form.senha} onChange={(e) => update('senha', e.target.value)} required minLength={6} />
          {erro && <div className="message error">{erro}</div>}
          {mensagem && <div className="message success">{mensagem}</div>}
          <button className="primary-button" disabled={loading}>{loading ? 'Criando...' : 'Cadastrar'}</button>
        </form>
        <Link to="/login" className="link-center">Já tenho conta</Link>
      </section>
    </main>
  );
}
