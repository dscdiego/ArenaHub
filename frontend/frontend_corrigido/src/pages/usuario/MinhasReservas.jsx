import { useEffect, useState } from 'react';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import BottomNav from '../../components/BottomNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Loading from '../../components/Loading.jsx';
import { getApiMessage } from '../../services/api.js';
import { cancelarReserva, minhasReservas } from '../../services/reservaService.js';
import { money, onlyDate, onlyHour } from '../../utils/storage.js';

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setLoading(true);
    minhasReservas().then(setReservas).finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, []);

  async function cancelar(id) {
    setErro('');
    try {
      await cancelarReserva(id);
      await carregar();
    } catch (error) {
      setErro(getApiMessage(error));
    }
  }

  return (
    <>
      <TopNav role="USUARIO" />
      <main className="screen with-nav">
        <AppHeader title="Minhas Reservas" subtitle="Acompanhe seus jogos marcados" showBack />
        {erro && <div className="message error">{erro}</div>}
        {loading ? <Loading /> : reservas.length ? <div className="reservation-grid">{reservas.map((reserva) => (
          <article key={reserva.id} className="reservation-card">
            <div><strong>{reserva.arenaNome}</strong><span className={`status ${reserva.status?.toLowerCase()}`}>{reserva.status === 'CONFIRMADA' ? '✓ ' : ''}{reserva.status}</span></div>
            <p>📅 {onlyDate(reserva.data)} • 🕐 {onlyHour(reserva.horaInicio)} às {onlyHour(reserva.horaFim)}</p>
            <p>💰 Valor total: <strong>{money(reserva.valorHora)}</strong></p>
            <p style={{ fontSize: '0.85rem', color: '#13a85a' }}>✓ Entrada paga: <strong>{money(reserva.valorPago || reserva.valorHora / 2)}</strong></p>
            {reserva.status !== 'CANCELADA' && <button className="outline-button" onClick={() => cancelar(reserva.id)}>Cancelar reserva</button>}
          </article>
        ))}</div> : <EmptyState title="Você ainda não tem reservas" text="Busque uma arena, escolha o horário e partiu jogo." />}
      </main>
      <BottomNav role="USUARIO" />
    </>
  );
}
