# 🚀 Guia de Deploy - ArenaHub

## Pré-requisitos

- **Docker** 20.10+ ([Instalar](https://docs.docker.com/get-docker/))
- **Docker Compose** 1.29+ (geralmente vem com Docker)
- **Git** para clonar o repositório

## Verificar instalação

```bash
docker --version
docker-compose --version
```

---

## 📋 Preparação

### 1. Clonar o repositório

```bash
git clone https://github.com/dscdiego/ArenaHub.git
cd ArenaHub
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas configurações
# IMPORTANTE: Alterar as senhas padrão!
nano .env  # ou use seu editor favorito
```

**Senhas recomendadas:**
- Gerar uma senha forte: `openssl rand -base64 32`
- Usar diferentes senhas para produção
- Armazenar senhas em um gerenciador seguro

---

## 🐳 Deployment com Docker

### Opção 1: Desenvolvimento Local

```bash
# Build das imagens
docker-compose build

# Iniciar os serviços
docker-compose up

# Para rodar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

A aplicação estará disponível em:
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Banco de Dados**: localhost:3306

### Opção 2: Servidor de Produção

#### A. VPS/Servidor Linux (AWS EC2, DigitalOcean, etc.)

```bash
# 1. Conectar ao servidor
ssh seu-usuario@seu-servidor.com

# 2. Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Clonar o repositório
git clone https://github.com/dscdiego/ArenaHub.git
cd ArenaHub

# 4. Configurar variáveis
cp .env.example .env
# Editar .env com configurações reais
nano .env

# 5. Iniciar
docker-compose up -d

# 6. Ver status
docker-compose ps
```

#### B. Azure Container Instances

```bash
# 1. Login no Azure
az login

# 2. Criar resource group
az group create --name arenahub-rg --location eastus

# 3. Build e push para Container Registry
az acr build --registry <seu-registry> --image arenahub:latest .

# 4. Deploy da imagem
az container create \
  --resource-group arenahub-rg \
  --name arenahub \
  --image <seu-registry>.azurecr.io/arenahub:latest \
  --ports 80 8080
```

#### C. Heroku/Railway (Simples)

Railway oferece deploy com um clique via GitHub. Veja: https://railway.app

---

## 📊 Gerenciar a Aplicação

### Ver logs
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Acessar banco de dados
```bash
docker-compose exec db mysql -u arenahub_user -p arenahub
# Digite a senha quando solicitado
```

### Criar backup do banco
```bash
docker-compose exec db mysqldump -u arenahub_user -p arenahub > backup.sql
```

### Restaurar backup
```bash
docker-compose exec -T db mysql -u arenahub_user -p arenahub < backup.sql
```

### Reiniciar serviços
```bash
docker-compose restart
```

### Atualizar código
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🔒 Segurança em Produção

### 1. Alterar senhas padrão
```env
# .env (NUNCA commitar este arquivo)
MYSQL_ROOT_PASSWORD=seu_senha_segura_muito_longa
MYSQL_PASSWORD=outra_senha_muito_segura
JWT_SECRET=gerar_com_openssl_rand_base64_32
```

### 2. Usar HTTPS
Recomendado usar Nginx reverse proxy com SSL:
- **Let's Encrypt** (gratuito) com Certbot
- **AWS Certificate Manager** (para AWS)
- **Azure Key Vault** (para Azure)

### 3. Firewall
- Bloquear porta 3306 (MySQL) de acesso externo
- Usar apenas porta 80 (HTTP redirecionando para 443)
- Porta 443 (HTTPS) aberta apenas para usuários

### 4. Backups automáticos
```bash
# Adicionar ao crontab para backup diário
0 2 * * * docker-compose exec -T db mysqldump -u arenahub_user -p[senha] arenahub > /backups/arenahub_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Mudar porta no docker-compose.yml
# De: "80:80" para "8081:80" (por exemplo)
```

### Problema com banco de dados
```bash
# Resetar volume do banco (CUIDADO: apaga dados!)
docker-compose down -v
docker-compose up
```

### Backend não conecta ao banco
```bash
# Verificar se MySQL está rodando
docker-compose ps

# Ver logs do backend
docker-compose logs backend

# Verificar conectividade
docker-compose exec backend ping db
```

### Frontend mostra erro de CORS
- Verificar configuração de CORS no backend (SecurityConfig.java)
- Adicionar origem correta: `http://seu-dominio.com`

---

## 📈 Performance e Otimização

### 1. Aumentar limites de memória
```yaml
# No docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### 2. Cache no Nginx
Já configurado em `nginx.conf` com:
- Gzip compression
- Cache headers para assets
- Proxy buffering

### 3. Escalar aplicação (load balancing)
```bash
docker-compose up -d --scale backend=3
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `docker-compose logs`
2. Verificar saúde dos containers: `docker-compose ps`
3. Ler documentação do Docker: https://docs.docker.com

---

## ✅ Checklist de Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Senhas alteradas para valores seguros
- [ ] Banco de dados inicializado com schema
- [ ] Backend buildado e testado
- [ ] Frontend buildado e testado
- [ ] Portas configuradas corretamente
- [ ] Firewall configurado
- [ ] Backups automatizados
- [ ] Monitoramento/Alertas configurados
- [ ] HTTPS/SSL ativo em produção
- [ ] Domínio apontando para servidor

---

**Última atualização**: Junho 2026  
**Versão**: 1.0
