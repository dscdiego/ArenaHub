# ⚡ Quick Start - ArenaHub Deployment

## 30 segundos para rodar localmente

### Pré-requisitos
- Docker instalado ([Download](https://www.docker.com/products/docker-desktop))

### Passos

```bash
# 1. Clonar repositório
git clone https://github.com/dscdiego/ArenaHub.git
cd ArenaHub

# 2. Copiar arquivo de ambiente
cp .env.example .env

# 3. Iniciar tudo
docker-compose up
```

Pronto! Acesse em **http://localhost**

---

## Usando Scripts (Opcional)

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh start   # Iniciar
./deploy.sh logs    # Ver logs
./deploy.sh stop    # Parar
```

### Windows
```bash
deploy.bat start    # Iniciar
deploy.bat logs     # Ver logs
deploy.bat stop     # Parar
```

---

## Verificar se está funcionando

```bash
# Ver status
docker-compose ps

# Ver logs do backend
docker-compose logs backend

# Testar API
curl http://localhost/api/actuator/health
```

---

## Próximas etapas

- [ ] Ler [DEPLOY.md](DEPLOY.md) para deploy em produção
- [ ] Alterar senhas padrão em `.env`
- [ ] Configurar seu domínio
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar backups automáticos

---

## Troubleshooting

**"Port 80 is already in use"**
```bash
# Mudar porta em docker-compose.yml
# Alterar: "80:80" para "8081:80"
```

**"Cannot connect to database"**
```bash
# Verificar se MySQL está pronto
docker-compose logs db

# Aguardar alguns segundos e tentar novamente
```

**"Frontend mostra erro branco"**
```bash
# Checar logs
docker-compose logs frontend

# Limpar cache
docker-compose exec frontend rm -rf /usr/share/nginx/html/*
docker-compose restart frontend
```

---

Precisa de ajuda? Veja [DEPLOY.md](DEPLOY.md) para documentação completa.
