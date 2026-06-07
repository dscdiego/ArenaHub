# ArenaHub - Backend

API REST em Spring Boot para agendamento de arenas esportivas.

## Rodar o banco

```sql
CREATE DATABASE arenahub_db;
```

Confira usuário e senha em `src/main/resources/application.properties`.

## Rodar o backend

```bash
cd backend
mvn spring-boot:run
```

API: `http://localhost:8080/api`

## Testes

```bash
mvn test
```

## Fluxo principal

1. `POST /api/auth/register` cria usuário ou proprietário.
2. `POST /api/auth/login` retorna token JWT.
3. Proprietário cria arena em `POST /api/arenas`.
4. Proprietário cria horários em `POST /api/arenas/{arenaId}/horarios`.
5. Usuário reserva em `POST /api/reservas`.
