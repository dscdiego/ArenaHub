import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Loading from '../../components/Loading.jsx';
import { getApiMessage } from '../../services/api.js';
import { excluirArena, minhasArenas } from '../../services/arenaService.js';
import { money } from '../../utils/storage.js';

export default function MinhasArenas() {
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setLoading(true);
    minhasArenas().then(setArenas).finally(() => setLoading(false));
  }

  useEffect(() => { carregar(); }, []);

  async function desativar(id) {
    setErro('');
    try {
      await excluirArena(id);
      await carregar();
    } catch (error) {
      setErro(getApiMessage(error));
    }
  }

  return (
    <>
      <TopNav role="PROPRIETARIO" />
      <main className="screen">
        <AppHeader title="Minhas Arenas" subtitle="Cadastre, edite e desative suas arenas" showBack />
        <Link className="primary-button full" to="/proprietario/arenas/nova">+ Cadastrar Arena</Link>
        {erro && <div className="message error">{erro}</div>}
        {loading ? <Loading /> : arenas.length ? <div className="owner-cards-grid">{arenas.map((arena) => (
          <article key={arena.id} className="owner-arena-card">
            <img src={arena.imagemUrl || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80'} alt={arena.nome} />
            <div><strong>{arena.nome}</strong><p>{arena.cidade} • {arena.bairro}</p><b>{money(arena.valorHora)}/h</b></div>
            <div className="card-actions"><Link to={`/proprietario/arenas/${arena.id}/status`}>Ver Status</Link><Link to={`/proprietario/arenas/${arena.id}/editar`}>Editar</Link><button onClick={() => desativar(arena.id)}>Desativar</button></div>
          </article>
        ))}</div> : <EmptyState title="Nenhuma arena cadastrada" text="Cadastre sua primeira arena para começar a receber reservas." />}
      </main>
    </>
  );
}
