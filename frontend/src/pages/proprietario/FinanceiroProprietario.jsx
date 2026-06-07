import { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import { reservasDoProprietario } from '../../services/reservaService.js';
import { money } from '../../utils/storage.js';

export default function FinanceiroProprietario() {
  const [reservas, setReservas] = useState([]);

  useEffect(() => { reservasDoProprietario().then(setReservas); }, []);

  const resumo = useMemo(() => {
    const ativas = reservas.filter((r) => r.status !== 'CANCELADA');
    const canceladas = reservas.filter((r) => r.status === 'CANCELADA');
    const total = ativas.reduce((soma, r) => soma + Number(r.valorPago || r.valorHora / 2 || 0), 0);
    return { total, ativas: ativas.length, canceladas: canceladas.length };
  }, [reservas]);

  return (
    <>
      <TopNav role="PROPRIETARIO" />
      <main className="screen">
        <AppHeader title="Financeiro" subtitle="Resumo dos valores das reservas" showBack />
        <section className="finance-hero"><span>Total recebido</span><strong>{money(resumo.total)}</strong><p>{resumo.ativas} reservas ativas</p></section>
        <section className="owner-grid"><div className="metric-card"><span>Confirmadas</span><strong>{resumo.ativas}</strong></div><div className="metric-card"><span>Canceladas</span><strong>{resumo.canceladas}</strong></div></section>
        <section className="list-card"><h2>Observação</h2><p className="muted">Este painel soma os valores das reservas não canceladas. É uma visão simples para seu TCC ficar redondinho, sem inventar moda demais.</p></section>
      </main>
    </>
  );
}
