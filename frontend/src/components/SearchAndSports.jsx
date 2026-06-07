const esportes = [
  { nome: 'Futebol', icon: '⚽' },
  { nome: 'Beach Tennis', icon: '🏓' },
  { nome: 'Vôlei de Praia', icon: '🏐' },
  { nome: 'Futevôlei', icon: '🥅' },
];

export default function SearchAndSports({ termo, setTermo }) {
  return (
    <section className="search-panel">
      <div className="location-line">📍 Fortaleza - CE⌄</div>
      <label className="search-box">
        <span>🔎</span>
        <input
          value={termo}
          onChange={(event) => setTermo(event.target.value)}
          placeholder="Buscar arenas ou esportes"
        />
      </label>
      <div className="sport-chips">
        {esportes.map((esporte) => (
          <button key={esporte.nome} type="button" onClick={() => setTermo(esporte.nome)}>
            <span>{esporte.icon}</span>{esporte.nome}
          </button>
        ))}
      </div>
    </section>
  );
}
