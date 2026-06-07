export default function EmptyState({ title = 'Nada encontrado', text = 'Tente ajustar os filtros ou cadastre novas informações.' }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
