import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader.jsx';
import ArenaCard from '../../components/ArenaCard.jsx';
import TopNav from '../../components/TopNav.jsx';
import BottomNav from '../../components/BottomNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Loading from '../../components/Loading.jsx';
import SearchAndSports from '../../components/SearchAndSports.jsx';
import { filtrarArenas, listarArenas } from '../../services/arenaService.js';
import { minhasReservas } from '../../services/reservaService.js';
import { getUsuarioLogado, onlyHour } from '../../utils/storage.js';

export default function DashboardUsuario() {
  const usuario = getUsuarioLogado();
  const [termo, setTermo] = useState('');
  const [arenas, setArenas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('todos');

  useEffect(() => {
    Promise.all([listarArenas(), minhasReservas()]).then(([listaArenas, listaReservas]) => {
      setArenas(listaArenas);
      setReservas(listaReservas);
    }).finally(() => setLoading(false));
  }, []);

  const filtradas = useMemo(() => {
    let resultado = filtrarArenas(arenas, termo);
    
    if (filterTab === 'favoritos') {
      resultado = resultado.filter(a => a.favorito);
    } else if (filterTab === 'recentes') {
      resultado = resultado.slice(0, 6);
    }
    
    return resultado;
  }, [arenas, termo, filterTab]);
  
  const proxima = reservas.find((reserva) => reserva.status !== 'CANCELADA');

  return (
    <>
      <TopNav role="USUARIO" />
      <main className="screen with-nav">
        <AppHeader title="ArenaHub" subtitle={`Olá, ${usuario?.nome || 'jogador'}! Bora marcar esse jogo?`} />
      <SearchAndSports termo={termo} setTermo={setTermo} />

      {proxima && (
        <section className="next-booking">
          <span>⏰ Próxima reserva</span>
          <strong>{proxima.arenaNome}</strong>
          <small>📍 {proxima.data} • 🕐 {onlyHour(proxima.horaInicio)} às {onlyHour(proxima.horaFim)}</small>
        </section>
      )}

      <section className="filter-tabs">
        <button 
          className={`${filterTab === 'todos' ? 'active' : ''}`}
          onClick={() => setFilterTab('todos')}
        >
          🔥 Todos
        </button>
        <button 
          className={`${filterTab === 'recentes' ? 'active' : ''}`}
          onClick={() => setFilterTab('recentes')}
        >
          ⏱️ Recentes
        </button>
        <button 
          className={`${filterTab === 'favoritos' ? 'active' : ''}`}
          onClick={() => setFilterTab('favoritos')}
        >
          ❤️ Favoritos
        </button>
      </section>

      <section className="section-title"><h2>Arenas próximas</h2><span>{filtradas.length} opções</span></section>
      {loading ? <Loading /> : filtradas.length ? <div className="arena-grid">{filtradas.map((arena) => <ArenaCard key={arena.id} arena={arena} />)}</div> : <EmptyState text="Digite o nome da arena ou esporte que você quer jogar." />}
      </main>
      <BottomNav role="USUARIO" />
    </>
  );
}
