import { Link, useNavigate } from 'react-router-dom';
import { getUsuarioLogado } from '../utils/storage.js';

export default function AppHeader({ title = 'ArenaHub', subtitle, showBack = false, profilePath }) {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const perfil = profilePath || (usuario?.tipoUsuario === 'PROPRIETARIO' ? '/proprietario/perfil' : '/usuario/perfil');

  return (
    <header className="app-header">
      <div className="top-row">
        {showBack ? <button className="icon-button" onClick={() => navigate(-1)}>‹</button> : <span />}
        <button className="brand-mini" onClick={() => navigate('/')} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}><span className="ball">⚽</span>{title}</button>
        {usuario ? <Link className="profile-dot" to={perfil}>👤</Link> : <Link className="login-link" to="/login">Entrar</Link>}
      </div>
      {subtitle && <p className="header-subtitle">{subtitle}</p>}
    </header>
  );
}
