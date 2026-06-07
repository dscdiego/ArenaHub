import { Link } from 'react-router-dom';
import { money } from '../utils/storage.js';

export default function ArenaCard({ arena }) {
  const esportes = arena.esportes?.length ? arena.esportes.join(' • ') : arena.descricao || 'Arena esportiva';

  return (
    <Link className="arena-card" to={`/arenas/${arena.id}`}>
      <img src={arena.imagemUrl || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80'} alt={arena.nome} />
      <div className="arena-card-info">
        <strong>{arena.nome}</strong>
        <p><span className="star">★</span> {arena.nota || '4.7'} <span>{esportes}</span></p>
        <p>A partir de <b>{money(arena.valorHora)}/h</b></p>
      </div>
    </Link>
  );
}
