import { useEffect, useState } from 'react';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import Loading from '../../components/Loading.jsx';
import { getApiMessage } from '../../services/api.js';
import { minhasArenas } from '../../services/arenaService.js';
import { criarHorario, excluirHorario, todosHorariosDaArena } from '../../services/horarioService.js';
import { reservasDoProprietario, cancelarReserva } from '../../services/reservaService.js';
import { money, onlyHour } from '../../utils/storage.js';

export default function GerenciarHorarios() {
  const [arenas, setArenas] = useState([]);
  const [arenaId, setArenaId] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]); // ✅ NOVO: armazenar reservas
  const [horariosTemp, setHorariosTemp] = useState([]); // Cópia para edição local
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFim, setHorarioFim] = useState('23:00');
  const [valorHora, setValorHora] = useState('');

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const diasAbrev = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Gerar array de horas
  const gerarHoras = () => {
    const horas = [];
    const inicio = parseInt(horarioInicio.split(':')[0]);
    const fim = parseInt(horarioFim.split(':')[0]);
    for (let i = inicio; i <= fim; i++) {
      horas.push(`${String(i).padStart(2, '0')}:00`);
    }
    return horas;
  };

  const horas = gerarHoras();

  useEffect(() => {
    minhasArenas().then((lista) => {
      setArenas(lista);
      if (lista[0]) {
        setArenaId(String(lista[0].id));
        setValorHora(lista[0].valorHora || '');
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (arenaId) {
      // ✅ NOVO: Buscar horários E reservas simultaneamente
      Promise.all([
        todosHorariosDaArena(arenaId),
        reservasDoProprietario()
      ]).then(([h, r]) => {
        // Filtrar reservas para apenas a arena atual
        const reservasArena = r.filter(res => String(res.arenaId) === String(arenaId));
        setReservas(reservasArena);

        // Se não houver horários, criar padrão (todos disponíveis de seg a dom, 8h a 23h)
        if (h.length === 0) {
          const horariosDefault = [];
          for (let dia = 0; dia < 7; dia++) {
            for (let hora = 8; hora <= 23; hora++) {
              horariosDefault.push({
                id: `temp-${dia}-${hora}`,
                diaSemana: dia,
                horaInicio: `${String(hora).padStart(2, '0')}:00`,
                horaFim: `${String(hora).padStart(2, '0')}:00`,
                valorHora: parseFloat(valorHora) || 0,
                disponivel: true,
                bloqueado: false,
              });
            }
          }
          setHorarios(horariosDefault);
          setHorariosTemp(JSON.parse(JSON.stringify(horariosDefault)));
        } else {
          setHorarios(h);
          setHorariosTemp(JSON.parse(JSON.stringify(h)));
        }
      });
    }
  }, [arenaId]);

  const handleChangeArena = (e) => {
    const id = e.target.value;
    setArenaId(id);
    const arena = arenas.find(a => String(a.id) === String(id));
    if (arena) setValorHora(arena.valorHora || '');
  };

  // Verificar se um horário está disponível
  const verificarDisponibilidade = (diaSemana, hora) => {
    return horariosTemp.some(h => 
      h.diaSemana === diaSemana && 
      onlyHour(h.horaInicio) === hora && 
      !h.bloqueado
    );
  };

  // Verificar se um horário está bloqueado
  const verificarBloqueado = (diaSemana, hora) => {
    return horariosTemp.some(h => 
      h.diaSemana === diaSemana && 
      onlyHour(h.horaInicio) === hora && 
      h.bloqueado
    );
  };

  // ✅ NOVO: Verificar se um horário tem uma reserva confirmada/pendente
  const verificarOcupado = (diaSemana, hora) => {
    // Converter diaSemana de índice 0-6 para nome da semana
    const diasSemanaNum = [1, 2, 3, 4, 5, 6, 0]; // 0=seg, 1=ter, ... 6=dom
    const hoje = new Date();
    
    return reservas.some(r => {
      if (!r.data || r.status === 'CANCELADA') return false;
      
      const [ano, mes, dia] = r.data.split('-').map(Number);
      const dataReserva = new Date(ano, mes - 1, dia);
      const diaSemanaBD = dataReserva.getDay();
      const diaSemanaNormalizado = diaSemanaBD === 0 ? 6 : diaSemanaBD - 1;
      
      const horaReserva = onlyHour(r.horaInicio);
      
      return diaSemanaNormalizado === diaSemana && horaReserva === hora;
    });
  };

  // ✅ NOVO: Liberar um horário ocupado (cancelar reserva)
  const liberarHorario = async (diaSemana, hora) => {
    const diasSemanaNum = [1, 2, 3, 4, 5, 6, 0];
    
    // Encontrar a reserva para este horário
    const reserva = reservas.find(r => {
      if (!r.data || r.status === 'CANCELADA') return false;
      
      const [ano, mes, dia] = r.data.split('-').map(Number);
      const dataReserva = new Date(ano, mes - 1, dia);
      const diaSemanaBD = dataReserva.getDay();
      const diaSemanaNormalizado = diaSemanaBD === 0 ? 6 : diaSemanaBD - 1;
      const horaReserva = onlyHour(r.horaInicio);
      
      return diaSemanaNormalizado === diaSemana && horaReserva === hora;
    });

    if (!reserva) {
      alert('Nenhuma reserva encontrada para este horário');
      return;
    }

    if (confirm(`Tem certeza que deseja cancelar a reserva de ${onlyHour(reserva.horaInicio)}?`)) {
      try {
        setSalvando(true);
        await cancelarReserva(reserva.id);
        console.log('✅ Reserva cancelada com sucesso');
        
        // Recarregar as reservas
        const atualizadas = await reservasDoProprietario();
        const reservasArena = atualizadas.filter(res => String(res.arenaId) === String(arenaId));
        setReservas(reservasArena);
        setSucesso('Horário liberado com sucesso!');
      } catch (err) {
        setErro(getApiMessage(err) || 'Erro ao liberar horário');
      } finally {
        setSalvando(false);
      }
    }
  };

  // Alternar disponibilidade de um horário (apenas na memória)
  function alternarHorario(diaSemana, hora) {
    setErro('');
    setSucesso('');
    
    const novoHorarios = [...horariosTemp];
    const indexExistente = novoHorarios.findIndex(h => 
      h.diaSemana === diaSemana && 
      onlyHour(h.horaInicio) === hora
    );

    if (indexExistente >= 0) {
      // Se existe, remove
      novoHorarios.splice(indexExistente, 1);
    } else {
      // Se não existe, adiciona
      novoHorarios.push({
        id: `temp-${diaSemana}-${hora}`,
        diaSemana,
        horaInicio: hora,
        horaFim: hora,
        valorHora: parseFloat(valorHora) || 0,
        disponivel: true,
        bloqueado: false,
      });
    }
    
    setHorariosTemp(novoHorarios);
  }

  // Salvar todos os horários na API
  async function salvarTodosHorarios() {
    setErro('');
    setSucesso('');
    setSalvando(true);

    try {
      // Excluir apenas horários que NÃO estão mais em horariosTemp
      // (foram desmarcados pelo usuário) e têm ID real no banco
      const idsTemp = new Set(
        horariosTemp
          .filter(h => !String(h.id).startsWith('temp-'))
          .map(h => String(h.id))
      );

      for (const horario of horarios) {
        const idStr = String(horario.id);
        if (!idStr.startsWith('temp-') && !idsTemp.has(idStr)) {
          try {
            await excluirHorario(horario.id);
          } catch (err) {
            console.warn('Erro ao excluir horário (pode ter reserva vinculada):', err);
          }
        }
      }

      // Criar apenas os horários que são temporários (novos, ainda não salvos)
      console.log(`📝 Processando ${horariosTemp.length} horários temporários para criação...`);
      for (const horario of horariosTemp) {
        if (!String(horario.id).startsWith('temp-')) continue; // já existe no banco, pula

        const horaInicioStr = String(horario.horaInicio).trim();
        const horaInicioNum = parseInt(horaInicioStr.split(':')[0]);
        if (isNaN(horaInicioNum) || horaInicioNum < 0 || horaInicioNum > 23) {
          console.error('❌ horaInicio inválida (deve estar entre 0-23):', horario);
          setErro(`❌ Hora inválida: ${horaInicioStr}. Deve estar entre 00:00 e 23:00`);
          setSalvando(false);
          return;
        }
        
        // ✅ CORRIGIDO: Validação melhorada para horaFim
        let horaFimNum = horaInicioNum + 1;
        if (horaFimNum > 24) {
          console.warn('⚠️ Hora fim ultrapassa 24h, ajustando para 23:00');
          horaFimNum = 24; // 00:00 do dia seguinte não faz sentido, usar 23:59 (que vira 23:00)
        }
        const horaFim = `${String(Math.min(horaFimNum, 23)).padStart(2, '0')}:00`;

        const diaSemanaNum = parseInt(horario.diaSemana);
        if (isNaN(diaSemanaNum) || diaSemanaNum < 0 || diaSemanaNum > 6) {
          console.error('❌ diaSemana inválido (deve estar entre 0-6):', horario);
          setErro(`❌ Dia inválido: ${diaSemanaNum}. Deve estar entre 0 (seg) e 6 (dom)`);
          setSalvando(false);
          return;
        }

        const payload = {
          diaSemana: diaSemanaNum,
          horaInicio: horaInicioStr,
          horaFim: horaFim,
          data: new Date().toISOString().split('T')[0], // YYYY-MM-DD (backend sobrescreve pelo diaSemana)
          disponivel: true,
        };

        try {
          console.log(`✅ Criando horário recorrente: ${diasSemana[diaSemanaNum]} ${horaInicioStr}-${horaFim}:`, payload);
          await criarHorario(arenaId, payload);
          console.log(`✅ Horário criado com sucesso para 13 semanas (${diasSemana[diaSemanaNum]} ${horaInicioStr}-${horaFim})`);
        } catch (err) {
          // 409 = já existe no banco, não é erro crítico
          const status = err?.response?.status;
          if (status === 409) {
            console.warn('⚠️ Horários já existem no banco para este slot:', payload);
          } else {
            console.error('❌ Erro ao criar horário:', err?.message);
            throw err; // outros erros propagam normalmente
          }
        }
      }
      console.log(`✅ Processamento de horários concluído`);

      // Recarregar lista atualizada do banco
      const horariosAtualizados = await todosHorariosDaArena(arenaId);
      setHorarios(horariosAtualizados);
      setHorariosTemp(JSON.parse(JSON.stringify(horariosAtualizados)));

      setSucesso('Horários salvos com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      const mensagemErro = getApiMessage(error) || error?.message || 'Erro ao salvar horários';
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  const arenaAtual = arenas.find((arena) => String(arena.id) === String(arenaId));

  return (
    <>
      <TopNav role="PROPRIETARIO" />
      <main className="screen owner-screen">
        <AppHeader title="Horários" subtitle="Configure a disponibilidade de sua arena" showBack />
        {loading ? <Loading /> : (
          <>
            <section className="owner-form" style={{ padding: '1rem' }}>
              <select 
                value={arenaId} 
                onChange={handleChangeArena}
                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                {arenas.map((arena) => (
                  <option key={arena.id} value={arena.id}>{arena.nome}</option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>Horário Início</label>
                  <input 
                    type="time" 
                    value={horarioInicio} 
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>Horário Fim</label>
                  <input 
                    type="time" 
                    value={horarioFim} 
                    onChange={(e) => setHorarioFim(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>Valor/Hora (R$)</label>
                  <input 
                    type="number" 
                    value={valorHora} 
                    onChange={(e) => setValorHora(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              {erro && <div style={{ color: '#d32f2f', padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{erro}</div>}

              {sucesso && <div style={{ color: '#2e7d32', padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{sucesso}</div>}

              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Clique nas células abaixo para marcar horários como <strong>disponíveis (verde)</strong> ou <strong>indisponíveis</strong>.
              </p>

              <button 
                onClick={salvarTodosHorarios}
                disabled={salvando}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: salvando ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  marginBottom: '1rem',
                  transition: 'background-color 0.3s'
                }}
              >
                {salvando ? 'Salvando...' : '💾 Salvar Horários'}
              </button>
            </section>

            {/* Grade de Horários */}
            <section style={{ padding: '1rem', overflowX: 'auto' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `80px repeat(7, 1fr)`,
                gap: '4px',
                minWidth: '100%'
              }}>
                {/* Header - Vazio + Dias da Semana */}
                <div style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'center', fontSize: '0.85rem', color: '#333' }}>
                  Hora
                </div>
                {diasAbrev.map((dia, index) => (
                  <div 
                    key={`header-${index}`}
                    style={{ 
                      padding: '0.75rem', 
                      fontWeight: 600, 
                      textAlign: 'center', 
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px 8px 0 0',
                      fontSize: '0.85rem',
                      color: '#333'
                    }}
                  >
                    {dia}
                  </div>
                ))}

                {/* Linhas de Horários */}
                {horas.map((hora) => (
                  <div key={`row-${hora}`} style={{ display: 'contents' }}>
                    <div style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'center', fontSize: '0.85rem', color: '#333', backgroundColor: '#f9f9f9' }}>
                      {hora}
                    </div>
                    {[0, 1, 2, 3, 4, 5, 6].map((diaSemana) => {
                      const disponivel = verificarDisponibilidade(diaSemana, hora);
                      const bloqueado = verificarBloqueado(diaSemana, hora);
                      const ocupado = verificarOcupado(diaSemana, hora); // ✅ NOVO: verificar se tem reserva

                      const handleClick = () => {
                        if (ocupado) {
                          liberarHorario(diaSemana, hora); // ✅ Liberar se ocupado
                        } else {
                          alternarHorario(diaSemana, hora); // ✅ Alterar disponibilidade se livre
                        }
                      };

                      return (
                        <button
                          key={`${diaSemana}-${hora}`}
                          onClick={handleClick}
                          disabled={salvando}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: salvando ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease',
                            backgroundColor: ocupado ? '#d32f2f' : disponivel ? '#4CAF50' : bloqueado ? '#ff9800' : '#e0e0e0',
                            color: ocupado || disponivel || bloqueado ? 'white' : '#666',
                            opacity: salvando ? 0.6 : 1,
                            transform: 'scale(1)',
                          }}
                          onMouseEnter={(e) => !salvando && (e.target.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => !salvando && (e.target.style.transform = 'scale(1)')}
                          title={ocupado ? 'Clique para cancelar a reserva' : 'Clique para alterar disponibilidade'}
                        >
                          {ocupado ? '🔴 Ocupado' : disponivel ? '✓' : bloqueado ? '✕' : '—'}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legenda */}
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Legenda:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#4CAF50', borderRadius: '4px' }}></div>
                    <span>Disponível</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#d32f2f', borderRadius: '4px' }}></div>
                    <span>🔴 Ocupado</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#ff9800', borderRadius: '4px' }}></div>
                    <span>Bloqueado</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                    <span>Sem horário</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}