import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, getUsuarioLogado } from '../utils/storage.js';

export default function ProtectedRoute({ allowedRole }) {
  const location = useLocation();
  const token = getToken();
  const usuario = getUsuarioLogado();

  if (!token || !usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRole && usuario.tipoUsuario !== allowedRole) {
    const destino = usuario.tipoUsuario === 'PROPRIETARIO' ? '/proprietario/dashboard' : '/usuario/dashboard';
    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
}
