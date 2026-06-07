import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import ArenaCard from '../components/ArenaCard.jsx';
import SearchAndSports from '../components/SearchAndSports.jsx';
import TopNav from '../components/TopNav.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { filtrarArenas, listarArenas } from '../services/arenaService.js';
import { getUsuarioLogado } from '../utils/storage.js';

export default function Home() {
  const usuario = getUsuarioLogado();
  const [termo, setTermo] = useState('');
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarArenas().then(setArenas).finally(() => setLoading(false));
  }, []);

  const filtradas = useMemo(() => filtrarArenas(arenas, termo), [arenas, termo]);

  return (
    <>
      {usuario?.tipoUsuario === 'USUARIO' && <TopNav role="USUARIO" />}
      <main className="screen with-nav">
        <AppHeader title="ArenaHub" subtitle="Encontre sua arena e reserve em poucos cliques." />
        {!usuario && (
          <section className="hero-card">
            <h1>Reserve campos, quadras e arenas sem dor de cabeça.</h1>
            <p>Procure pelo nome da arena ou pelo esporte. Achou? Reservou. Simples assim.</p>
            <div className="hero-actions"><Link to="/login" className="primary-button">Entrar</Link><Link to="/cadastro" className="outline-button white">Criar conta</Link></div>
          </section>
        )}

        <SearchAndSports termo={termo} setTermo={setTermo} />
        <section className="section-title"><h2>Arenas próximas</h2><span>{filtradas.length} encontradas</span></section>
        {loading ? <Loading /> : filtradas.length ? <div className="arena-grid">{filtradas.map((arena) => <ArenaCard key={arena.id} arena={arena} />)}</div> : <EmptyState text="Nenhuma arena bateu com sua busca. Tente Futebol, Beach Tennis, Vôlei ou Futevôlei." />}
      </main>
      {usuario?.tipoUsuario === 'USUARIO' && <BottomNav role="USUARIO" />}
    </>
  );
}
