import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import TopNav from '../components/TopNav.jsx';
import { getApiMessage } from '../services/api.js';
import { criarReserva } from '../services/reservaService.js';
import { money, onlyHour, getUsuarioLogado } from '../utils/storage.js';

export default function Pagamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const arena = location.state?.arena;
  const horarios = location.state?.horarios || [];
  const [metodo, setMetodo] = useState('cartao');
  const [cupom, setCupom] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Calcular preço total
  const valorTotal = horarios.length * (arena?.valorHora || 0);
  const valorEntrada = valorTotal / 2;
  const valorRestante = valorTotal / 2;

  if (!arena || horarios.length === 0) {
    return (
      <>
        <TopNav role="USUARIO" />
        <main className="screen payment-screen">
          <AppHeader title="Pagamento" showBack />
          <section className="payment-summary" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ color: '#d92d20', marginBottom: '10px' }}>Dados Incompletos</h2>
              <p>Volte e escolha pelo menos um horário primeiro para continuar.</p>
              <button className="primary-button" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Voltar</button>
            </div>
          </section>
        </main>
      </>
    );
  }

  async function confirmar() {
    setErro('');
    setLoading(true);
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 800));

      // Criar as reservas na API (uma para cada horário selecionado)
      try {
        console.log(`💳 Processando ${horarios.length} reserva(s)...`);
        const resultados = [];
        for (const horario of horarios) {
          console.log(`📋 Criando reserva para horário ${horario.id}`);
          const resultado = await criarReserva({ arenaId: arena.id, horarioId: horario.id });
          resultados.push(resultado);
          console.log(`✅ Reserva criada:`, resultado);
        }
        console.log(`✅ Todas as ${resultados.length} reservas criadas com sucesso!`);
      } catch (apiError) {
        console.error('❌ Erro ao criar reserva(s) na API:', apiError?.message);
        throw apiError;
      }

      setSucesso(true);
      setTimeout(() => {
        console.log('🔄 Redirecionando para arena com flag de recarregamento...');
        navigate(`/arena/${arena?.id}`, { 
          state: { recarregarHorarios: true, reservaSucesso: true }
        });
      }, 1500);
    } catch (error) {
      setErro(getApiMessage(error) || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopNav role="USUARIO" />
      <main className="screen payment-screen">
        <AppHeader title="Pagamento" showBack />
        <section className="payment-summary">
          <img src={arena?.imagemUrl || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80'} alt={arena?.nome || 'Arena'} />
          <div>
            <h1>{arena?.nome}</h1>
            <p>⭐ {arena?.nota || 4.7} • {arena?.avaliacoes || 120} avaliações</p>
            <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '10px' }}>
              <strong>{horarios.length} horário(s) selecionado(s):</strong>
            </p>
            {horarios.map((h, idx) => (
              <p key={h.id} style={{ fontSize: '0.9rem', color: '#13a85a', marginTop: '5px' }}>
                {idx + 1}. 🕐 {onlyHour(h.horaInicio)} → {onlyHour(h.horaFim)}
              </p>
            ))}
          </div>
          <strong style={{ color: '#d92d20' }}>{money(valorTotal)}</strong>
        </section>

        <section className="pay-card">
          <h2>💳 Forma de Pagamento</h2>
          <button className={metodo === 'cartao' ? 'pay-option selected' : 'pay-option'} onClick={() => setMetodo('cartao')} disabled={sucesso}><span>✅ 💳 Visa •••• 1234</span><small>Cartão de crédito ✎</small></button>
          <button className={metodo === 'pix' ? 'pay-option selected' : 'pay-option'} onClick={() => setMetodo('pix')} disabled={sucesso}><span>○ 📱 Pix</span><small>Pagamento instantâneo</small></button>
          <button className={metodo === 'google' ? 'pay-option selected' : 'pay-option'} onClick={() => setMetodo('google')} disabled={sucesso}><span>○ 🔵 Google Pay</span><small>Seguro e rápido</small></button>
        </section>

        <section className="total-card">
          <p style={{ color: '#6b7788', marginBottom: '10px', fontSize: '0.9rem' }}>� <strong>{horarios.length}x {money(arena?.valorHora)}</strong> - 50% de entrada na confirmação</p>
          <div><span>💰 Entrada (50%)</span><strong style={{ color: '#13a85a' }}>{money(valorEntrada)}</strong></div>
          <div style={{ opacity: 0.7, fontSize: '0.9rem' }}><span>Restante a pagar</span><strong>{money(valorRestante)}</strong></div>
          
          {!sucesso && (
            <button className="primary-button full" onClick={confirmar} disabled={loading}>
              {loading ? '⏳ Processando pagamento...' : `✓ Pagar ${money(valorEntrada)} para confirmar (${horarios.length} horário(s))`}
            </button>
          )}
          
          {sucesso && (
            <div className="message success" style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: '900' }}>
              ✅ Pagamento confirmado com sucesso!<br/><small style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Redirecionando...</small>
            </div>
          )}
          
          {erro && <div className="message error">❌ {erro}</div>}
          <p style={{ fontSize: '0.8rem' }}>Ao confirmar, você concorda com os Termos de serviço e a Política de privacidade.</p>
        </section>

        <section className="coupon-card">
          <h2>Cupom de Desconto <small>(opcional)</small></h2>
          <div className="coupon-row"><input placeholder="Digite seu cupom" value={cupom} onChange={(e) => setCupom(e.target.value)} /><button>Adicionar</button></div>
        </section>
      </main>
    </>
  );
}
