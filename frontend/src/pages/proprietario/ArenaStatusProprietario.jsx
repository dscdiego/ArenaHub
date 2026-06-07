import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import Loading from '../../components/Loading.jsx';
import { getApiMessage } from '../../services/api.js';
import { buscarArena } from '../../services/arenaService.js';
import { horariosDisponiveis } from '../../services/horarioService.js';
import { money, onlyHour } from '../../utils/storage.js';

export default function ArenaStatusProprietario() {
  const { id } = useParams();
  const [arena, setArena] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const arenaData = await buscarArena(id);
        setArena(arenaData);
        const horariosData = await horariosDisponiveis(id);
        setHorarios(horariosData);
      } catch (error) {
        setErro(getApiMessage(error));
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id]);

  if (loading) return <><TopNav role="PROPRIETARIO" /><Loading /></>;
  if (erro) return <><TopNav role="PROPRIETARIO" /><main className="screen"><AppHeader title="Erro" showBack /><div className="message error" style={{ margin: '14px' }}>{erro}</div></main></>;
  if (!arena) return <><TopNav role="PROPRIETARIO" /><main className="screen"><AppHeader title="Arena não encontrada" showBack /></main></>;

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <>
      <TopNav role="PROPRIETARIO" />
      <main className="screen owner-screen">
        <AppHeader title={arena.nome} subtitle={`${arena.cidade} • ${arena.bairro}`} showBack />

        {/* Informações Gerais */}
        <section className="owner-form" style={{ marginBottom: '14px' }}>
          <h2>Informações da Arena</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', background: '#f4f7f5', borderRadius: '8px' }}>
            <div>
              <small style={{ color: '#6b7788' }}>Telefone</small>
              <p style={{ margin: '4px 0', fontWeight: '600' }}>{arena.telefone}</p>
            </div>
            <div>
              <small style={{ color: '#6b7788' }}>Valor/Hora</small>
              <p style={{ margin: '4px 0', fontWeight: '600' }}>{money(arena.valorHora)}</p>
            </div>
          </div>
          <p style={{ marginTop: '12px', lineHeight: '1.5' }}>{arena.descricao}</p>
        </section>

        {/* Campos da Arena */}
        <section className="schedule-card">
          <h2>Campos/Quadras</h2>
          {arena.campos && arena.campos.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {arena.campos.map((campo, index) => (
                <div key={index} style={{ padding: '12px', background: '#f4f7f5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500' }}>{campo}</span>
                  <span style={{ background: '#13a85a', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Disponível</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Nenhum campo cadastrado</p>
          )}
        </section>

        {/* Esportes */}
        <section className="schedule-card">
          <h2>Esportes Disponíveis</h2>
          {arena.esportes && arena.esportes.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {arena.esportes.map((esporte, index) => (
                <span key={index} style={{ background: '#08713b', color: 'white', padding: '8px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
                  ⚽ {esporte}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Nenhum esporte cadastrado</p>
          )}
        </section>

        {/* Horários Cadastrados */}
        <section className="schedule-card">
          <h2>Horários Cadastrados</h2>
          {horarios.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {diasSemana.map((dia, diaIndex) => {
                const horariosDodia = horarios.filter(h => h.diaSemana === diaIndex);
                if (horariosDodia.length === 0) return null;
                return (
                  <div key={diaIndex} style={{ padding: '12px', background: '#f4f7f5', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#08713b' }}>{dia}</h4>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {horariosDodia.map(h => (
                        <div key={h.id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{onlyHour(h.horaInicio)} - {onlyHour(h.horaFim)}</span>
                          <span style={{ 
                            background: h.bloqueado ? '#d92d20' : (h.disponivel ? '#13a85a' : '#f8b51e'),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {h.bloqueado ? 'Bloqueado' : (h.disponivel ? 'Livre' : 'Ocupado')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>Nenhum horário cadastrado. <a href={`/proprietario/horarios`} style={{ color: '#13a85a', fontWeight: '600' }}>Cadastre agora!</a></p>
          )}
        </section>
      </main>
    </>
  );
}
