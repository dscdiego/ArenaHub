import { NavLink } from 'react-router-dom';

export default function BottomNav({ role = 'USUARIO' }) {
  const usuarioItems = [
    { to: '/usuario/dashboard', icon: '🏠', label: 'Início' },
    { to: '/usuario/buscar', icon: '🔎', label: 'Buscar' },
    { to: '/usuario/reservas', icon: '🗓️', label: 'Reservas' },
    { to: '/usuario/perfil', icon: '👤', label: 'Perfil' },
  ];

  const proprietarioItems = [
    { to: '/proprietario/dashboard', icon: '🏠', label: 'Home' },
    { to: '/proprietario/horarios', icon: '📅', label: 'Agenda' },
    { to: '/proprietario/reservas', icon: '🗓️', label: 'Reservas' },
    { to: '/proprietario/financeiro', icon: '💰', label: 'Financeiro' },
    { to: '/proprietario/perfil', icon: '👤', label: 'Perfil' },
  ];

  const items = role === 'PROPRIETARIO' ? proprietarioItems : usuarioItems;

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </NavLink>
      ))}
    </nav>
  );
}
