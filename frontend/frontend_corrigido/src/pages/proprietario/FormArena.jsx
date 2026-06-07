import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../../components/AppHeader.jsx';
import TopNav from '../../components/TopNav.jsx';
import { getApiMessage } from '../../services/api.js';
import { atualizarArena, buscarArena, criarArena } from '../../services/arenaService.js';

const inicial = { nome: '', descricao: '', endereco: '', cidade: 'Fortaleza', bairro: '', telefone: '', valorHora: '', imagemUrl: '', ativa: true, campos: [], esportes: [] };

const ESPORTES_PREDEFINIDOS = [
  'Futebol',
  'Futsal',
  'Futebol Society',
  'Vôlei',
  'Basquete',
  'Tênis',
  'Badminton',
  'Handebol',
  'Quadra Poliesportiva',
  'Squash',
  'Pickleball',
  'Padel',
  'Beisebol',
  'Softball'
];

export default function FormArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(inicial);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalEsporte, setModalEsporte] = useState(false);
  const [esporteCustomizado, setEsporteCustomizado] = useState('');

  useEffect(() => {
    if (id) buscarArena(id).then((arena) => setForm({ ...inicial, ...arena }));
  }, [id]);

  function update(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function adicionarCampo() {
    const novoCampo = prompt('Nome do campo (ex: Quadra 1):');
    if (novoCampo?.trim()) {
      setForm((atual) => ({
        ...atual,
        campos: [...(atual.campos || []), novoCampo.trim()]
      }));
    }
  }

  function removerCampo(index) {
    setForm((atual) => ({
      ...atual,
      campos: atual.campos.filter((_, i) => i !== index)
    }));
  }

  function adicionarEsporte() {
    setModalEsporte(true);
    setEsporteCustomizado('');
  }

  function selecionarEsporte(esporte) {
    const esporteJaAdicionado = form.esportes.some(e => e.toLowerCase() === esporte.toLowerCase());
    if (esporteJaAdicionado) {
      setErro(`O esporte "${esporte}" já foi adicionado`);
      setTimeout(() => setErro(''), 3000);
      return;
    }
    setForm((atual) => ({
      ...atual,
      esportes: [...(atual.esportes || []), esporte]
    }));
    setModalEsporte(false);
    setEsporteCustomizado('');
  }

  function handleAdicionarCustomizado() {
    if (!esporteCustomizado.trim()) {
      setErro('Por favor, digite o nome do esporte');
      return;
    }
    selecionarEsporte(esporteCustomizado.trim());
  }

  function removerEsporte(index) {
    setForm((atual) => ({
      ...atual,
      esportes: atual.esportes.filter((_, i) => i !== index)
    }));
  }

  async function salvar(event) {
    event.preventDefault();
    setErro('');
    setLoading(true);
    const payload = { ...form, valorHora: Number(form.valorHora) };
    try {
      if (id) await atualizarArena(id, payload); else await criarArena(payload);
      navigate('/proprietario/arenas');
    } catch (error) {
      setErro(getApiMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TopNav role="PROPRIETARIO" />
      <main className="screen owner-screen">
        <AppHeader title={id ? 'Editar Arena' : 'Cadastrar Arena'} showBack />
        <form className="owner-form" onSubmit={salvar}>
          <button className="primary-button full" type="submit" disabled={loading}>{loading ? 'Salvando...' : '+ Salvar Arena'}</button>
          <h2>Área da Arena</h2>
          <input placeholder="Nome" value={form.nome} onChange={(e) => update('nome', e.target.value)} required />
          <div className="two-cols"><input placeholder="Localidade" value={form.cidade} onChange={(e) => update('cidade', e.target.value)} required /><input placeholder="Bairro" value={form.bairro} onChange={(e) => update('bairro', e.target.value)} /></div>
          <input placeholder="Logradouro / endereço" value={form.endereco} onChange={(e) => update('endereco', e.target.value)} required />
          <input placeholder="Telefone" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} />
          <input type="number" placeholder="Valor por hora" value={form.valorHora} onChange={(e) => update('valorHora', e.target.value)} required />
          <textarea placeholder="Esportes e descrição. Ex: Futebol Society, Fut7" value={form.descricao} onChange={(e) => update('descricao', e.target.value)} />
          <input placeholder="URL da imagem da arena" value={form.imagemUrl} onChange={(e) => update('imagemUrl', e.target.value)} />

          <h2>Campos da Arena</h2>
          <button type="button" className="secondary-button full" onClick={adicionarCampo}>+ Adicionar Campo/Quadra</button>
          {form.campos && form.campos.length > 0 && (
            <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
              {form.campos.map((campo, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f4f7f5', borderRadius: '8px' }}>
                  <span>{campo}</span>
                  <button type="button" onClick={() => removerCampo(index)} style={{ background: '#d92d20', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Remover</button>
                </div>
              ))}
            </div>
          )}

          <h2>Esportes Disponíveis</h2>
          <button type="button" className="secondary-button full" onClick={adicionarEsporte}>+ Adicionar Esporte</button>
          {form.esportes && form.esportes.length > 0 && (
            <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
              {form.esportes.map((esporte, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f4f7f5', borderRadius: '8px' }}>
                  <span>{esporte}</span>
                  <button type="button" onClick={() => removerEsporte(index)} style={{ background: '#d92d20', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Remover</button>
                </div>
              ))}
            </div>
          )}

          {/* Modal de Seleção de Esportes */}
          {modalEsporte && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'flex-end',
              zIndex: 1000
            }} onClick={() => setModalEsporte(false)}>
              <div style={{
                backgroundColor: 'white',
                width: '100%',
                borderRadius: '16px 16px 0 0',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '20px',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                animation: 'slideUp 0.3s ease-out'
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', textAlign: 'center' }}>Selecione um Esporte</h3>
                
                {/* Lista de Esportes Pré-definidos */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontWeight: '500' }}>ESPORTES POPULARES</p>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {ESPORTES_PREDEFINIDOS.map((esporte) => (
                      <button
                        key={esporte}
                        type="button"
                        onClick={() => selecionarEsporte(esporte)}
                        style={{
                          padding: '12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0f0f0';
                          e.target.style.borderColor = '#333';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        {esporte}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divisor */}
                <div style={{ borderTop: '1px solid #eee', margin: '15px 0' }} />

                {/* Campo para Esporte Customizado */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontWeight: '500' }}>ADICIONAR OUTRO</p>
                  <input
                    type="text"
                    placeholder="Digite o nome do esporte"
                    value={esporteCustomizado}
                    onChange={(e) => setEsporteCustomizado(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAdicionarCustomizado();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      marginBottom: '10px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarCustomizado}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                  >
                    Adicionar Esporte
                  </button>
                </div>

                {/* Botão Fechar */}
                <button
                  type="button"
                  onClick={() => setModalEsporte(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>

          <h2>Fotos da Arena</h2>
          <div className="photo-row"><div className="add-photo">🖼️<span>Adicionar Fotos</span></div><div className="photo-thumb" /><div className="photo-thumb" /><div className="photo-thumb" /></div>

          <h2>Promoção</h2>
          <input placeholder="Ex. 10% de desconto em Maio" />
          {erro && <div className="message error">{erro}</div>}
        </form>
      </main>
    </>
  );
}
