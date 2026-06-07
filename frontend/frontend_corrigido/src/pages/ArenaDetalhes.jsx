import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import TopNav from '../components/TopNav.jsx';
import Loading from '../components/Loading.jsx';
import { buscarArena } from '../services/arenaService.js';
import { horariosDisponiveis } from '../services/horarioService.js';
import { getUsuarioLogado, money, onlyHour } from '../utils/storage.js';

export default function ArenaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = getUsuarioLogado();
  const [arena, setArena] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [selecionados, setSelecionados] = useState([]); // Array de IDs de horários selecionados
  const [loading, setLoading] = useState(true);
  const [recarregandoHorarios, setRecarregandoHorarios] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(null);

  const [todasAsDatas, setTodasAsDatas] = useState([]); // Todas as datas do intervalo
  const dateTabsRef = useRef(null); // Ref para o container de datas

  const carregarDados = async (arenaId) => {
    try {
      const [arenaAtual, listaHorarios] = await Promise.all([
        buscarArena(arenaId),
        horariosDisponiveis(arenaId)
      ]);
      setArena(arenaAtual);
      setHorarios(listaHorarios);
      
      // Gerar todas as datas - sempre 7 dias (uma semana) começando de hoje
      const todasDatas = [];
      const dataInicio = new Date();
      dataInicio.setHours(0, 0, 0, 0);
      
      // Gerar próximos 7 dias (semana completa)
      for (let i = 0; i < 7; i++) {
        const data = new Date(dataInicio);
        data.setDate(data.getDate() + i);
        todasDatas.push(data.toISOString().split('T')[0]);
      }
      
      console.log(`📅 ${todasDatas.length} dias da semana gerados (${todasDatas[0]} até ${todasDatas[6]})`);
      setTodasAsDatas(todasDatas);
      setDataSelecionada(todasDatas[0]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // ✅ CORRIGIDO: Consolidar todos os recarregamentos em um único sistema de polling eficiente
  useEffect(() => {
    carregarDados(id).finally(() => setLoading(false));    
    
    let superCount = 0;
    let isDestroyed = false;
    
    // Função auxiliar para recarregar horários
    const recarregarHorarios = async (motivo = 'periódico') => {
      if (isDestroyed) return;
      try {
        const listaHorarios = await horariosDisponiveis(id);
        if (!isDestroyed) {
          setHorarios(listaHorarios);
          if (superCount < 5) {
            console.log(`⚡ Recarregamento #${superCount + 1}/5: ${listaHorarios.length} horários`);
          }
        }
      } catch (err) {
        if (!isDestroyed) {
          console.warn(`⚠️ Erro ao recarregar (${motivo}):`, err?.message);
        }
      }
    };

    // 1️⃣ Recarregamento super agressivo nos primeiros 5 segundos
    const superInterval = setInterval(() => {
      if (superCount < 5) {
        recarregarHorarios('super-agressivo');
        superCount++;
      } else {
        clearInterval(superInterval);
        // Depois mudar para recarregamento periódico (8s)
      }
    }, 1000); // A cada 1 segundo

    // 2️⃣ Recarregamento periódico (8s) após os 5 segundos iniciais
    const periodicoTimeout = setTimeout(() => {
      if (!isDestroyed) {
        const periodicoInterval = setInterval(() => {
          if (!isDestroyed) {
            recarregarHorarios('periódico');
          }
        }, 8000);
        
        return () => clearInterval(periodicoInterval);
      }
    }, 5000);

    // 3️⃣ Listeners para visibility e focus
    const handleVisibilityChange = () => {
      if (!document.hidden && !isDestroyed) {
        recarregarHorarios('volta-aba');
      }
    };

    const handleWindowFocus = () => {
      if (!isDestroyed) {
        recarregarHorarios('window-focus');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      isDestroyed = true;
      clearInterval(superInterval);
      clearTimeout(periodicoTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [id]);

  // Recarregar horários quando volta da página de pagamento (se reserva foi feita com sucesso)
  useEffect(() => {
    if (location.state?.recarregarHorarios) {
      setRecarregandoHorarios(true);
      horariosDisponiveis(id)
        .then(listaHorarios => setHorarios(listaHorarios))
        .finally(() => setRecarregandoHorarios(false));
      // Limpar o state
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.recarregarHorarios, id]);

  // Resetar scroll do container de datas para o início
  useEffect(() => {
    if (dateTabsRef.current) {
      setTimeout(() => {
        dateTabsRef.current.scrollLeft = 0;
      }, 100);
    }
  }, [todasAsDatas]);

  // Obter datas únicas dos horários
  const datasComHorarios = useMemo(() => {
    const datasUnicas = new Set(horarios.map(h => h.data || new Date().toISOString().split('T')[0]));
    return Array.from(datasUnicas).sort();
  }, [horarios]);

  // Se a data selecionada desaparecer (todos horários foram reservados), ir para próxima data
  useEffect(() => {
    if (dataSelecionada && todasAsDatas.length > 0) {
      if (!todasAsDatas.includes(dataSelecionada)) {
        console.log(`⚠️ Data ${dataSelecionada} foi removida, ajustando...`);
        // Encontrar próxima data disponível
        const proximaData = todasAsDatas.find(d => d > dataSelecionada) || todasAsDatas[0];
        setDataSelecionada(proximaData);
      }
    }
  }, [todasAsDatas, dataSelecionada]);

  // Formatar data para exibição
  const formatarData = (dataStr) => {
    const data = new Date(dataStr + 'T00:00:00');
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diaSemana = diasSemana[data.getDay()];
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    
    const hoje = new Date();
    const ehHoje = data.toDateString() === hoje.toDateString();
    
    return ehHoje ? 'Hoje' : `${diaSemana} ${dia}/${mes}`;
  };

  // Horários filtrados pela data selecionada
  // ✅ CORRIGIDO: Adicionar validação para evitar undefined
  const horariosFiltrados = useMemo(() => {
    if (!dataSelecionada || !Array.isArray(horarios)) return [];
    return horarios
      .filter(h => h && (h.data || new Date().toISOString().split('T')[0]) === dataSelecionada)
      .sort((a, b) => String(a?.horaInicio || '').localeCompare(String(b?.horaInicio || '')));
  }, [horarios, dataSelecionada]);

  function toggleSelecionarHorario(horario) {
    setSelecionados(prev => {
      const jaSelecionado = prev.find(h => h.id === horario.id);
      if (jaSelecionado) {
        return prev.filter(h => h.id !== horario.id);
      } else {
        return [...prev, horario];
      }
    });
  }

  function irPagamento() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    if (usuario.tipoUsuario !== 'USUARIO') {
      navigate('/proprietario/dashboard');
      return;
    }
    if (selecionados.length === 0) {
      alert('Por favor, selecione pelo menos um horário disponível antes de continuar.');
      return;
    }
    navigate('/pagamento', { state: { arena, horarios: selecionados } });
  }

  const precoTotal = selecionados.length * (arena?.valorHora || 0);

  if (loading || !arena) return <main className="screen"><AppHeader showBack /><Loading /></main>;

  return (
    <>
      {usuario?.tipoUsuario === 'USUARIO' && <TopNav role="USUARIO" />}
      <main className="screen details-screen">
        <AppHeader title="ArenaHub" showBack />
        <section className="image-hero">
          <img src={arena.imagemUrl || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80'} alt={arena.nome} />
          <div className="dots"><span /><span /><span /><span /></div>
        </section>

        <section className="arena-detail-card">
          <div>
            <h1>{arena.nome}</h1>
            <p><span className="star">★</span> {arena.nota || 4.7} • {arena.avaliacoes || 120} avaliações</p>
            <p>⚽ {(arena.esportes || ['Futebol Society', 'Fut7']).join(' • ')}</p>
          </div>
          <button className="small-primary" onClick={irPagamento} disabled={selecionados.length === 0}>Reservar</button>
        </section>

        <section className="schedule-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>Horários Disponíveis</h2>
            <button 
              className="small-primary"
              onClick={() => {
                setRecarregandoHorarios(true);
                horariosDisponiveis(id)
                  .then(listaHorarios => setHorarios(listaHorarios))
                  .finally(() => setRecarregandoHorarios(false));
              }}
              disabled={recarregandoHorarios}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Recarregar horários disponíveis"
            >
              {recarregandoHorarios ? '⏳ Atualizando...' : '🔄 Atualizar'}
            </button>
          </div>

          {/* Abas de Datas Dinâmicas */}
          <div ref={dateTabsRef} className="date-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '5px', paddingLeft: '0px', paddingRight: '10px', scrollBehavior: 'smooth' }}>
            {todasAsDatas.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Nenhuma data disponível</p>
            ) : (
              todasAsDatas.map((data) => {
                // Verifica se essa data tem horários cadastrados
                const temHorariosNessaDia = datasComHorarios.includes(data);
                // Verifica se há horários DISPONÍVEIS nessa data
                const temDisponiveisNessaDia = horarios.some(h => 
                  (h.data || new Date().toISOString().split('T')[0]) === data && h.disponivel && !h.bloqueado
                );
                const selecionada = dataSelecionada === data;
                
                return (
                  <button
                    key={data}
                    onClick={() => setDataSelecionada(data)}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid',
                      borderRadius: '6px',
                      backgroundColor: selecionada 
                        ? (temDisponiveisNessaDia ? '#13a85a' : '#d92d20')
                        : (temDisponiveisNessaDia ? '#f5f5f5' : '#ffe8e8'),
                      color: selecionada ? 'white' : (temDisponiveisNessaDia ? '#333' : '#d92d20'),
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: selecionada ? 'bold' : 'normal',
                      whiteSpace: 'nowrap',
                      borderColor: selecionada 
                        ? (temDisponiveisNessaDia ? '#13a85a' : '#d92d20')
                        : (temDisponiveisNessaDia ? '#ddd' : '#ffcccc'),
                      transition: 'all 0.2s ease'
                    }}
                    title={!temHorariosNessaDia ? 'Nenhum horário neste dia' : (temDisponiveisNessaDia ? 'Clique para ver horários' : 'Todos os horários reservados')}
                  >
                    {formatarData(data)} {!temDisponiveisNessaDia && temHorariosNessaDia ? '❌' : ''}
                  </button>
                );
              })
            )}
          </div>

          {/* Horários para a data selecionada */}
          {!datasComHorarios.includes(dataSelecionada) ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ddd' }}>
              <p className="muted" style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                ℹ️ Nenhum horário disponível em {formatarData(dataSelecionada)}
              </p>
            </div>
          ) : horariosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: '#ffe8e8', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffcccc' }}>
              <p className="muted" style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#d92d20', fontWeight: 'bold' }}>
                🚫 DIA OCUPADO
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                Todos os horários de <strong>{formatarData(dataSelecionada)}</strong> foram reservados
              </p>
              <p className="muted" style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                Selecione outro dia ou tente novamente mais tarde
              </p>
            </div>
          ) : (
            horariosFiltrados.map((horario) => {
              const livre = horario.disponivel && !horario.bloqueado;
              const ativo = selecionados.find(h => h.id === horario.id);
              return (
                <button
                  key={horario.id}
                  className={`hour-row ${ativo ? 'selected' : ''}`}
                  disabled={!livre}
                  onClick={() => livre && toggleSelecionarHorario(horario)}
                  title={!livre ? 'Este horário foi reservado' : 'Clique para selecionar/deselecionar'}
                  style={{
                    opacity: livre ? 1 : 0.6,
                    cursor: livre ? 'pointer' : 'not-allowed',
                    backgroundColor: ativo ? '#e8f5e9' : 'transparent',
                    borderLeft: ativo ? '4px solid #13a85a' : '4px solid transparent'
                  }}
                >
                  <span>{onlyHour(horario.horaInicio)}</span>
                  <small style={{ color: !livre ? '#d92d20' : '#13a85a', fontWeight: !livre ? 'bold' : 'normal' }}>
                    {livre ? '✓ Disponível' : '❌ Ocupado'}
                  </small>
                  <b>{ativo ? '✔️' : ''} {money(arena.valorHora)} {ativo ? '' : '›'}</b>
                </button>
              );
            })
          )}

          <button className="primary-button full" onClick={irPagamento} disabled={selecionados.length === 0}>
            {selecionados.length > 0 ? `Continuar - ${selecionados.length}x ${money(arena.valorHora)} = ${money(precoTotal)}` : 'Selecione pelo menos um horário'}
          </button>
        </section>

        <section className="comments-card">
          <h2>Comentários</h2>
          <div className="rating-line"><strong>4.7</strong> ⭐⭐⭐⭐⭐ <span>120 avaliações</span></div>
          <article><div>👨🏻</div><p><b>Pedro Silva</b><span>Ótima quadra! O espaço é excelente e o atendimento também.</span></p></article>
          <article><div>👩🏻</div><p><b>Ana Costa</b><span>Lugar top! Recomendo demais.</span></p></article>
        </section>
      </main>
    </>
  );
}
