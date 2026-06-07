import { useState, useMemo } from 'react';
import { onlyHour, money } from '../utils/storage.js';
import '../styles/calendario.css';

export default function CalendarioAgendamentos({ reservas = [] }) {
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [selecionado, setSelecionado] = useState(null);

  const diasDoMes = useMemo(() => {
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const dias = [];
    
    // Preencher com dias vazios do mês anterior
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }
    
    // Adicionar dias do mês
    for (let i = 1; i <= ultimoDia; i++) {
      dias.push(i);
    }
    
    return dias;
  }, [mes, ano]);

  const agendamentosPorDia = useMemo(() => {
    const mapa = {};
    reservas.forEach(r => {
      if (r.data && r.status !== 'CANCELADA') {
        const [ano, mes, dia] = r.data.split('-');
        const chave = `${ano}-${mes}-${dia}`;
        if (!mapa[chave]) mapa[chave] = [];
        mapa[chave].push(r);
      }
    });
    return mapa;
  }, [reservas]);

  const mudarMes = (incremento) => {
    let novoMes = mes + incremento;
    let novoAno = ano;
    
    if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    } else if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    }
    
    setMes(novoMes);
    setAno(novoAno);
  };

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const nomeSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const ehHoje = (dia) => {
    if (!dia) return false;
    const hoje = new Date();
    return dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
  };

  const getCorStatus = (status) => {
    switch(status) {
      case 'CONFIRMADA': return '#13a85a';
      case 'PENDENTE': return '#f59e0b';
      case 'CANCELADA': return '#d92d20';
      default: return '#6b7788';
    }
  };

  return (
    <section className="calendario-section">
      <div className="calendario-header">
        <button onClick={() => mudarMes(-1)} className="nav-btn">←</button>
        <h3>{nomesMeses[mes]} {ano}</h3>
        <button onClick={() => mudarMes(1)} className="nav-btn">→</button>
      </div>

      {/* Cabeçalho da semana */}
      <div className="calendario-grid">
        <div className="calendario-header-dias">
          {nomeSemana.map(dia => (
            <div key={dia} className="dia-semana">{dia}</div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="calendario-dias">
          {diasDoMes.map((dia, idx) => {
            const chave = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const agendamentos = agendamentosPorDia[chave] || [];
            const ehSelecionado = dia === selecionado;

            return (
              <div 
                key={idx} 
                className={`calendario-dia ${!dia ? 'vazio' : ''} ${ehSelecionado ? 'selecionado' : ''}`}
                onClick={() => agendamentos.length > 0 && setSelecionado(dia === selecionado ? null : dia)}
                style={{
                  cursor: agendamentos.length > 0 ? 'pointer' : 'default',
                  backgroundColor: ehSelecionado ? '#d4edda' : '#fafafa',
                  border: ehSelecionado ? '2px solid #13a85a' : '1px solid #e0e0e0'
                }}
              >
                {dia && (
                  <>
                    <div className="dia-numero">
                      {dia}
                    </div>
                    <div className="agendamentos-preview">
                      {agendamentos.slice(0, 2).map((r, i) => (
                        <div 
                          key={i} 
                          className="agendamento-preview"
                          style={{ 
                            backgroundColor: getCorStatus(r.status),
                            fontSize: '12px',
                            padding: '8px 6px',
                            borderRadius: '4px',
                            lineHeight: '1.3',
                            minHeight: '50px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '2px'
                          }}
                          title={`${onlyHour(r.horaInicio)} - ${r.usuarioNome}`}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                            {onlyHour(r.horaInicio)}
                          </div>
                          <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            👤 {r.usuarioNome || 'Cliente'}
                          </div>
                          {r.arenaNome && (
                            <div style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              ⚽ {r.arenaNome.split(' ').slice(0, 1).join(' ')}
                            </div>
                          )}
                        </div>
                      ))}
                      {agendamentos.length > 2 && (
                        <div className="agendamento-mais" style={{ fontSize: '12px', fontWeight: 'bold' }}>+{agendamentos.length - 2}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalhes do dia selecionado */}
      {selecionado && agendamentosPorDia[`${ano}-${String(mes + 1).padStart(2, '0')}-${String(selecionado).padStart(2, '0')}`] && (
        <div className="agendamentos-detalhes">
          <h4>📅 Agendamentos em {selecionado} de {nomesMeses[mes]}</h4>
          <div className="lista-agendamentos">
            {agendamentosPorDia[`${ano}-${String(mes + 1).padStart(2, '0')}-${String(selecionado).padStart(2, '0')}`].map((r) => (
              <div key={r.id} className="agendamento-card" style={{ borderLeft: `4px solid ${getCorStatus(r.status)}` }}>
                <div className="agendamento-header">
                  <strong>{onlyHour(r.horaInicio)} - {onlyHour(r.horaFim)}</strong>
                  <span className="status-badge" style={{ backgroundColor: getCorStatus(r.status) }}>
                    {r.status}
                  </span>
                </div>
                <div className="agendamento-info">
                  <p>🏟️ <strong>{r.arenaNome}</strong></p>
                  <p>👤 {r.usuarioNome}</p>
                  {r.usuarioEmail && <p>📧 {r.usuarioEmail}</p>}
                  {r.usuarioTelefone && <p>📱 {r.usuarioTelefone}</p>}
                  <p className="valor">💰 {money(r.valorHora)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reservas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <p>📭 Nenhum agendamento recebido ainda</p>
        </div>
      )}
    </section>
  );
}
