import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import BottomNav from '../../components/BottomNav.jsx';
import Loading from '../../components/Loading.jsx';
import CalendarioAgendamentos from '../../components/CalendarioAgendamentos.jsx';
import { minhasArenas } from '../../services/arenaService.js';
import { reservasDoProprietario } from '../../services/reservaService.js';
import { getUsuarioLogado, money, onlyHour } from '../../utils/storage.js';

export default function DashboardProprietario() {
  const usuario = getUsuarioLogado();
  const [arenas, setArenas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([minhasArenas(), reservasDoProprietario()]).then(([listaArenas, listaReservas]) => {
      setArenas(listaArenas);
      setReservas(listaReservas);
    }).finally(() => setLoading(false));
  }, []);

  const faturamento = useMemo(() => reservas.filter((r) => r.status !== 'CANCELADA').reduce((total, r) => total + Number(r.valorHora || 0), 0), [reservas]);
  const reservasConfirmadas = reservas.filter((r) => r.status !== 'CANCELADA').length;
  const proximas = reservas.filter((r) => r.status !== 'CANCELADA').slice(0, 3);
  
  const ocupacao = arenas.length > 0 ? Math.round((reservasConfirmadas / (arenas.length * 24)) * 100) : 0;

  if (loading) return <><TopNav role="PROPRIETARIO" /><main className="screen"><AppHeader title="Painel" /><Loading /></main></>;

  return (
    <>
      <TopNav role="PROPRIETARIO" />
      <main className="screen owner-screen with-nav">
      <AppHeader title="Meu Painel" subtitle={`Painel do proprietário • ${usuario?.nome || 'ArenaHub'}`} />
      
      <div className="dashboard-welcome">
        <strong>👋 Bem-vindo de volta!</strong>
        <p>Gerencie suas arenas e acompanhe suas reservas em tempo real</p>
      </div>

      <Link className="primary-button full" to="/proprietario/arenas/nova">+ Cadastrar Nova Arena</Link>

      <section className="owner-grid">
        <div className="metric-card">
          <span>🏟️ Arenas</span>
          <strong>{arenas.length}</strong>
          <div className="trend-icon">📈</div>
        </div>
        <div className="metric-card">
          <span>🗓️ Reservas</span>
          <strong>{reservasConfirmadas}</strong>
          <div className="trend-icon">📈</div>
        </div>
        <div className="metric-card wide">
          <span>💰 Faturamento</span>
          <strong>{money(faturamento)}</strong>
          <div className="trend-icon">💵</div>
        </div>
      </section>

      <section className="finance-hero">
        <span>Receita Este Mês</span>
        <strong>{money(faturamento)}</strong>
        <div className="finance-chart">
          <div className="finance-bar">
            <div className="finance-bar-visual">
              <div className="finance-bar-fill" style={{width: '45%'}}></div>
            </div>
            <span className="finance-bar-label">Semana 1</span>
          </div>
          <div className="finance-bar">
            <div className="finance-bar-visual">
              <div className="finance-bar-fill" style={{width: '65%'}}></div>
            </div>
            <span className="finance-bar-label">Semana 2</span>
          </div>
          <div className="finance-bar">
            <div className="finance-bar-visual">
              <div className="finance-bar-fill" style={{width: ocupacao + '%'}}></div>
            </div>
            <span className="finance-bar-label">Ocupação</span>
          </div>
        </div>
      </section>

      {proximas.length > 0 && (
        <section className="reservations-timeline">
          <h2>⏰ Próximos Agendamentos</h2>
          {proximas.map((reserva) => (
            <div key={reserva.id} className="timeline-item">
              <div className="timeline-time">
                {onlyHour(reserva.horaInicio)}
              </div>
              <div className="timeline-content">
                <p>{reserva.arenaNome}</p>
                <p>👤 {reserva.usuarioNome} • {reserva.data}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Calendário de Agendamentos */}
      <CalendarioAgendamentos reservas={reservas} />

      <section className="quick-actions">
        <Link to="/proprietario/arenas">
          <span>Minhas Arenas</span>
        </Link>
        <Link to="/proprietario/horarios">
          <span>Gerenciar Horários</span>
        </Link>
        <Link to="/proprietario/reservas">
          <span>Reservas Recebidas</span>
        </Link>
        <Link to="/proprietario/perfil">
          <span>Meu Perfil</span>
        </Link>
      </section>
      </main>
      <BottomNav role="PROPRIETARIO" />
    </>
  );
}
