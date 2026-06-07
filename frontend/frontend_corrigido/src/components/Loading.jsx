export default function Loading({ texto = 'Carregando...' }) {
  return <div className="loading">⏳ {texto}</div>;
}
