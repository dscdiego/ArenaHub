import { Navigate, Route, Routes } from 'react-router-dom';
import Apresentacao from './pages/Apresentacao.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import ArenaDetalhes from './pages/ArenaDetalhes.jsx';
import Pagamento from './pages/Pagamento.jsx';
import DashboardUsuario from './pages/usuario/DashboardUsuario.jsx';
import BuscarUsuario from './pages/usuario/BuscarUsuario.jsx';
import MinhasReservas from './pages/usuario/MinhasReservas.jsx';
import PerfilUsuario from './pages/usuario/PerfilUsuario.jsx';
import DashboardProprietario from './pages/proprietario/DashboardProprietario.jsx';
import MinhasArenas from './pages/proprietario/MinhasArenas.jsx';
import FormArena from './pages/proprietario/FormArena.jsx';
import GerenciarHorarios from './pages/proprietario/GerenciarHorarios.jsx';
import ReservasRecebidas from './pages/proprietario/ReservasRecebidas.jsx';
import FinanceiroProprietario from './pages/proprietario/FinanceiroProprietario.jsx';
import PerfilProprietario from './pages/proprietario/PerfilProprietario.jsx';
import ArenaStatusProprietario from './pages/proprietario/ArenaStatusProprietario.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/arenas/:id" element={<ArenaDetalhes />} />

      <Route element={<ProtectedRoute allowedRole="USUARIO" />}>
        <Route path="/usuario/dashboard" element={<DashboardUsuario />} />
        <Route path="/usuario/buscar" element={<BuscarUsuario />} />
        <Route path="/usuario/reservas" element={<MinhasReservas />} />
        <Route path="/usuario/perfil" element={<PerfilUsuario />} />
        <Route path="/pagamento" element={<Pagamento />} />
      </Route>

      <Route element={<ProtectedRoute allowedRole="PROPRIETARIO" />}>
        <Route path="/proprietario/dashboard" element={<DashboardProprietario />} />
        <Route path="/proprietario/arenas" element={<MinhasArenas />} />
        <Route path="/proprietario/arenas/nova" element={<FormArena />} />
        <Route path="/proprietario/arenas/:id/editar" element={<FormArena />} />
        <Route path="/proprietario/arenas/:id/status" element={<ArenaStatusProprietario />} />
        <Route path="/proprietario/horarios" element={<GerenciarHorarios />} />
        <Route path="/proprietario/reservas" element={<ReservasRecebidas />} />
        <Route path="/proprietario/financeiro" element={<FinanceiroProprietario />} />
        <Route path="/proprietario/perfil" element={<PerfilProprietario />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
