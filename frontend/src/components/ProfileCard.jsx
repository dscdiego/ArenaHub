import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService.js';
import { getUsuarioLogado } from '../utils/storage.js';
import AppHeader from './AppHeader.jsx';
import TopNav from './TopNav.jsx';
import BottomNav from './BottomNav.jsx';

export default function ProfileCard({ role }) {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <TopNav role={role} />
      <main className="screen with-nav">
        <AppHeader title="Perfil" subtitle="Seus dados da conta" showBack />
        <section className="profile-card big-card">
          <div className="avatar-large">👤</div>
          <h1>{usuario?.nome || 'Usuário ArenaHub'}</h1>
          <p>{usuario?.email || 'email não informado'}</p>
          <span className="role-pill">{role === 'PROPRIETARIO' ? 'Proprietário' : 'Usuário comum'}</span>
        </section>

        <section className="list-card">
          <div><b>Telefone</b><span>{usuario?.telefone || 'Não informado'}</span></div>
          <div><b>Tipo de conta</b><span>{role === 'PROPRIETARIO' ? 'Gerencia arenas e reservas' : 'Reserva arenas e acompanha histórico'}</span></div>
          <div><b>Status</b><span>Conta ativa</span></div>
        </section>

        <button className="danger-button" onClick={handleLogout}>Sair da conta</button>
      </main>
      <BottomNav role={role} />
    </>
  );
}
