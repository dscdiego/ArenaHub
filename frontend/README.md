# ArenaHub Frontend refeito

Frontend React + Vite com visual inspirado no protótipo enviado:

- Login com escolha de tipo de conta: usuário comum ou proprietário.
- Cadastro com tipo de conta.
- Tela inicial do usuário com busca por nome da arena ou esporte.
- Filtros rápidos: Futebol, Beach Tennis, Vôlei de Praia e Futevôlei.
- Detalhes da arena com horários disponíveis.
- Tela de pagamento simulada antes de confirmar a reserva.
- Minhas reservas para usuário comum.
- Perfil para usuário comum.
- Painel do proprietário com valores das reservas.
- Minhas arenas, cadastro/edição de arena, agenda, reservas recebidas, financeiro e perfil do proprietário.

## Rodar

```bash
cd frontend
npm install
npm run dev
```

Configure a API no arquivo `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

## Responsividade

O frontend possui breakpoints de responsividade:

- Até 899px: visual estilo aplicativo mobile, com menu inferior.
- A partir de 900px: layout desktop, com largura maior, cards em grade e menu lateral.
- A partir de 1200px: cards maiores para aproveitar melhor monitores grandes.

Assim, no computador o sistema fica com aparência de desktop e no celular ele se adapta para o formato mobile.
