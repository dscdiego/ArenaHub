import { Link } from 'react-router-dom';
import './Apresentacao.css';

export default function Apresentacao() {
  return (
    <main className="apresentacao-screen">
      {/* Header Hero */}
      <section className="apresentacao-hero">
        <div className="hero-content">
          <div className="hero-logo">
            <span>⚽</span>
          </div>
          <h1>Bem-vindo ao ArenaHub</h1>
          <p className="hero-subtitle">A plataforma mais fácil para reservar espaços esportivos</p>
          <div className="hero-actions">
            <Link to="/login" className="primary-button">Entrar</Link>
            <Link to="/cadastro" className="outline-button">Criar conta</Link>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="ball ball-1">⚽</div>
          <div className="ball ball-2">🏀</div>
          <div className="ball ball-3">🎾</div>
        </div>
      </section>

      {/* O que é ArenaHub */}
      <section className="apresentacao-section">
        <div className="section-container">
          <h2>O que é ArenaHub?</h2>
          <p className="section-description">
            ArenaHub é a plataforma completa para gerenciar reservas de espaços esportivos. 
            Se você quer <strong>jogar</strong>, encontre a arena perfeita. 
            Se você <strong>aluga arenas</strong>, gerencie tudo em um só lugar.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Busque Fácil</h3>
              <p>Encontre arenas por nome, localização ou tipo de esporte</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Reserve Rápido</h3>
              <p>Escolha data e horário, confirme o pagamento e pronto!</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Pagamento Seguro</h3>
              <p>Múltiplas opções: Cartão, Pix, Google Pay e mais</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Seu Perfil</h3>
              <p>Acompanhe suas reservas e histórico de pagamentos</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard</h3>
              <p>Para proprietários: gerencie suas arenas e ganhos</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Avaliações</h3>
              <p>Veja comentários e notas de outros usuários</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="apresentacao-section how-it-works">
        <div className="section-container">
          <h2>Como Funciona?</h2>
          
          <div className="two-columns">
            {/* Para Jogadores */}
            <div className="column">
              <h3>👤 Para Jogadores</h3>
              <ol className="steps">
                <li>
                  <strong>Crie sua conta</strong>
                  <p>Cadastre-se com email e senha</p>
                </li>
                <li>
                  <strong>Busque arenas</strong>
                  <p>Procure por nome, localização ou esporte</p>
                </li>
                <li>
                  <strong>Escolha horário</strong>
                  <p>Veja disponibilidade e reserve</p>
                </li>
                <li>
                  <strong>Pague e confirme</strong>
                  <p>50% de entrada + restante na confirmação</p>
                </li>
                <li>
                  <strong>Bom jogo!</strong>
                  <p>Apareça na hora certa e divirta-se</p>
                </li>
              </ol>
            </div>

            {/* Para Proprietários */}
            <div className="column">
              <h3>🏢 Para Proprietários</h3>
              <ol className="steps">
                <li>
                  <strong>Cadastre como proprietário</strong>
                  <p>Crie sua conta com tipo "Proprietário"</p>
                </li>
                <li>
                  <strong>Cadastre suas arenas</strong>
                  <p>Adicione fotos, descrição e valor da hora</p>
                </li>
                <li>
                  <strong>Configure horários</strong>
                  <p>Defina disponibilidade (dias e horários)</p>
                </li>
                <li>
                  <strong>Receba reservas</strong>
                  <p>Confirme ou rejeite reservas de jogadores</p>
                </li>
                <li>
                  <strong>Ganhe dinheiro</strong>
                  <p>Acompanhe seu faturamento em tempo real</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="apresentacao-section benefits">
        <div className="section-container">
          <h2>Por que escolher ArenaHub?</h2>
          
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-number">✨</div>
              <div className="benefit-text">
                <h4>Simples de usar</h4>
                <p>Interface intuitiva sem complicações</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">🔒</div>
              <div className="benefit-text">
                <h4>Seguro e confiável</h4>
                <p>Seus dados e pagamentos protegidos</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">⚡</div>
              <div className="benefit-text">
                <h4>Rápido e eficiente</h4>
                <p>Reserve em poucos cliques</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">🌍</div>
              <div className="benefit-text">
                <h4>Amplitud geográfica</h4>
                <p>Encontre arenas em toda a região</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">💰</div>
              <div className="benefit-text">
                <h4>Melhor preço</h4>
                <p>Compare preços e escolha a melhor opção</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-number">📱</div>
              <div className="benefit-text">
                <h4>Acesse de qualquer lugar</h4>
                <p>Funciona em celular, tablet e computador</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Esportes Disponíveis */}
      <section className="apresentacao-section sports">
        <div className="section-container">
          <h2>Esportes Disponíveis</h2>
          <p className="section-description">Reserve espaços para seus esportes favoritos</p>
          
          <div className="sports-grid">
            <div className="sport-badge">⚽ Futebol</div>
            <div className="sport-badge">🏀 Basquete</div>
            <div className="sport-badge">🎾 Tênis</div>
            <div className="sport-badge">🏐 Vôlei</div>
            <div className="sport-badge">🏑 Futevôlei</div>
            <div className="sport-badge">🏸 Badminton</div>
            <div className="sport-badge">🏑 Squash</div>
            <div className="sport-badge">⛳ Mini Golf</div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="apresentacao-section cta-final">
        <div className="section-container">
          <h2>Pronto para começar?</h2>
          <p>Escolha seu tipo de conta e comece agora mesmo!</p>
          
          <div className="cta-buttons">
            <Link to="/cadastro" className="primary-button large">
              Criar conta
            </Link>
            <Link to="/login" className="outline-button large">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="apresentacao-footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>ArenaHub</h4>
              <p>A plataforma completa para gerenciar reservas de espaços esportivos</p>
            </div>
            
            <div className="footer-section">
              <h4>Rápidos Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/cadastro">Cadastro</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contato</h4>
              <p>📧 suporte@arenahub.com</p>
              <p>📱 (11) 98765-4321</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 ArenaHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
