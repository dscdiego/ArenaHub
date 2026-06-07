#!/bin/bash

# ArenaHub Deploy Script
# Uso: ./deploy.sh [start|stop|restart|logs|build|update]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
print_info() {
    echo -e "${BLUE}ℹ  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠  $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado. Instale em https://docs.docker.com/get-docker/"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não está instalado."
        exit 1
    fi
    print_success "Docker e Docker Compose encontrados"
}

# Verificar arquivo .env
check_env() {
    if [ ! -f .env ]; then
        print_error "Arquivo .env não encontrado!"
        print_info "Copie o arquivo .env.example: cp .env.example .env"
        exit 1
    fi
    print_success "Arquivo .env encontrado"
}

# Start
start() {
    print_info "Iniciando ArenaHub..."
    docker-compose up -d
    print_success "ArenaHub iniciado!"
    print_info "Frontend: http://localhost"
    print_info "Backend API: http://localhost/api"
    print_info "Ver logs: ./deploy.sh logs"
}

# Stop
stop() {
    print_info "Parando ArenaHub..."
    docker-compose down
    print_success "ArenaHub parado!"
}

# Restart
restart() {
    print_info "Reiniciando ArenaHub..."
    docker-compose restart
    print_success "ArenaHub reiniciado!"
}

# Logs
logs() {
    docker-compose logs -f "$@"
}

# Build
build() {
    print_info "Buildando imagens..."
    docker-compose build
    print_success "Build concluído!"
}

# Update
update() {
    print_info "Atualizando código..."
    git pull origin main
    print_info "Reconstruindo imagens..."
    docker-compose build --no-cache
    print_info "Reiniciando serviços..."
    docker-compose restart
    print_success "Atualização concluída!"
}

# Status
status() {
    print_info "Status dos serviços:"
    docker-compose ps
}

# Backup
backup() {
    BACKUP_DIR="backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p "$BACKUP_DIR"
    print_info "Criando backup do banco de dados..."
    
    docker-compose exec -T db mysqldump \
        -u ${MYSQL_USER:-arenahub_user} \
        -p${MYSQL_PASSWORD:-arenahub_password} \
        ${MYSQL_DATABASE:-arenahub} \
        > "$BACKUP_DIR/arenahub_$TIMESTAMP.sql"
    
    print_success "Backup criado em: $BACKUP_DIR/arenahub_$TIMESTAMP.sql"
}

# Restore
restore() {
    if [ -z "$1" ]; then
        print_error "Especifique o arquivo de backup"
        print_info "Uso: ./deploy.sh restore backup_file.sql"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Arquivo $1 não encontrado"
        exit 1
    fi
    
    print_warning "Isso vai restaurar o backup. Tem certeza? (s/n)"
    read -r confirm
    
    if [ "$confirm" != "s" ]; then
        print_info "Operação cancelada"
        exit 0
    fi
    
    print_info "Restaurando backup..."
    docker-compose exec -T db mysql \
        -u ${MYSQL_USER:-arenahub_user} \
        -p${MYSQL_PASSWORD:-arenahub_password} \
        ${MYSQL_DATABASE:-arenahub} \
        < "$1"
    
    print_success "Backup restaurado!"
}

# Main
case "${1:-help}" in
    start)
        check_docker
        check_env
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        shift
        logs "$@"
        ;;
    build)
        check_docker
        build
        ;;
    update)
        update
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    *)
        echo -e "${BLUE}ArenaHub Deploy Script${NC}"
        echo ""
        echo "Uso: $0 [COMMAND]"
        echo ""
        echo "Comandos:"
        echo "  start       Iniciar aplicação"
        echo "  stop        Parar aplicação"
        echo "  restart     Reiniciar aplicação"
        echo "  logs        Ver logs em tempo real (use: $0 logs [backend|frontend|db])"
        echo "  build       Build das imagens Docker"
        echo "  status      Ver status dos serviços"
        echo "  update      Atualizar código e reiniciar"
        echo "  backup      Criar backup do banco de dados"
        echo "  restore     Restaurar backup (uso: $0 restore arquivo.sql)"
        echo ""
        echo "Exemplo:"
        echo "  $0 start"
        echo "  $0 logs backend"
        echo "  $0 backup"
        ;;
esac
