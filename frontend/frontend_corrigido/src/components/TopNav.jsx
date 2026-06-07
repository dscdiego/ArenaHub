import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUsuarioLogado } from '../utils/storage.js';

export default function TopNav({ role = 'USUARIO' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const usuario = getUsuarioLogado();
  const navigate = useNavigate();

  const usuarioItems = [
    { to: '/usuario/dashboard', icon: '🏠', label: 'Início' },
    { to: '/usuario/buscar', icon: '🔎', label: 'Buscar' },
    { to: '/usuario/reservas', icon: '🗓️', label: 'Reservas' },
    { to: '/usuario/perfil', icon: '👤', label: 'Perfil' },
  ];

  const proprietarioItems = [
    { to: '/proprietario/dashboard', icon: '🏠', label: 'Home' },
    { to: '/proprietario/arenas', icon: '🏟️', label: 'Arenas' },
    { to: '/proprietario/horarios', icon: '🕐', label: 'Horários' },
    { to: '/proprietario/reservas', icon: '🗓️', label: 'Reservas' },
    { to: '/proprietario/financeiro', icon: '💰', label: 'Financeiro' },
    { to: '/proprietario/perfil', icon: '👤', label: 'Perfil' },
  ];

  const items = role === 'PROPRIETARIO' ? proprietarioItems : usuarioItems;

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setProfileMenuOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="top-nav">
      <div className="top-nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <span className="logo-icon">⚽</span>
          <span className="logo-text">ArenaHub</span>
        </div>

        {/* Hamburger Menu */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User Profile */}
        <div className="nav-profile">
          <button
            className="profile-avatar"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            title="Abrir menu de perfil"
          >
            {usuario?.nome?.charAt(0) || '👤'}
          </button>
        </div>
      </div>

      {/* Profile Menu - Fora da navbar para não ter problemas de stacking */}
      {profileMenuOpen && (
        <div className="profile-menu">
          <span className="profile-name">{usuario?.nome || 'Usuário'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      {menuOpen && <div className="nav-overlay" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}></div>}
    </nav>
  );
}
