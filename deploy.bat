@echo off
REM ArenaHub Deploy Script para Windows
REM Uso: deploy.bat [start|stop|restart|logs|build|update]

setlocal enabledelayedexpansion

if "%1"=="" (
    echo.
    echo ArenaHub Deploy Script
    echo.
    echo Uso: deploy.bat [COMMAND]
    echo.
    echo Comandos:
    echo   start       Iniciar aplicacao
    echo   stop        Parar aplicacao
    echo   restart     Reiniciar aplicacao
    echo   logs        Ver logs em tempo real
    echo   build       Build das imagens Docker
    echo   status      Ver status dos servicos
    echo   update      Atualizar codigo e reiniciar
    echo.
    goto :end
)

if "%1"=="start" (
    echo [*] Iniciando ArenaHub...
    docker-compose up -d
    echo [+] ArenaHub iniciado!
    echo.
    echo Frontend: http://localhost
    echo Backend API: http://localhost/api
    echo Ver logs: deploy.bat logs
    goto :end
)

if "%1"=="stop" (
    echo [*] Parando ArenaHub...
    docker-compose down
    echo [+] ArenaHub parado!
    goto :end
)

if "%1"=="restart" (
    echo [*] Reiniciando ArenaHub...
    docker-compose restart
    echo [+] ArenaHub reiniciado!
    goto :end
)

if "%1"=="logs" (
    docker-compose logs -f %2
    goto :end
)

if "%1"=="build" (
    echo [*] Buildando imagens...
    docker-compose build
    echo [+] Build concluido!
    goto :end
)

if "%1"=="status" (
    echo [*] Status dos servicos:
    docker-compose ps
    goto :end
)

if "%1"=="update" (
    echo [*] Atualizando codigo...
    git pull origin main
    echo [*] Reconstruindo imagens...
    docker-compose build --no-cache
    echo [*] Reiniciando servicos...
    docker-compose restart
    echo [+] Atualizacao concluida!
    goto :end
)

:end
endlocal
