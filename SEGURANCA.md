# 🔒 Guia de Segurança - ArenaHub

## ✅ Implementação de Segurança Avançada

Este documento detalha a segurança implementada no ArenaHub, cobrindo desde criação de contas até pagamentos.

---

## 📋 Índice

1. [Autenticação & Contas](#autenticação--contas)
2. [Dois Fatores (2FA)](#dois-fatores-2fa)
3. [Biometria (WebAuthn)](#biometria-webauthn)
4. [Rate Limiting & Proteção contra Força Bruta](#rate-limiting--proteção-contra-força-bruta)
5. [Auditoria & Logging](#auditoria--logging)
6. [Segurança de Dados](#segurança-de-dados)
7. [Proteção contra Ataques Web](#proteção-contra-ataques-web)
8. [Preparação para Pagamentos](#preparação-para-pagamentos)

---

## 🔐 Autenticação & Contas

### 1. Hash de Senhas (BCrypt)
```java
// Senhas são sempre criptografadas com BCrypt (10 rounds)
// Nunca armazenar senhas em texto plano
String senhaHash = passwordEncoder.encode(senha);
```

**Características:**
- ✅ Criptografia automática com BCrypt
- ✅ Salto único por senha (salt)
- ✅ Impossível recuperar senha original
- ✅ Adaptável a ataques futuros (aumentar rounds)

### 2. Validação de Email
```java
// Campo emailVerificado rastreia se email foi validado
usuario.setEmailVerificado(false);
usuario.setEmailVerificacaoToken(UUID.randomUUID().toString());

// Token enviado por email ao usuário
// Após clique no link, email é marcado como verificado
```

### 3. Proteção contra Força Bruta
```
Após 5 tentativas falhadas:
- Email é bloqueado por 30 minutos
- IP é rate-limitado
- Evento é registrado em auditoria
- Usuário recebe alerta de segurança
```

### 4. Sessão & Token Seguro
```java
// JWT com expiração configurável
app.jwt.secret=sua_jwt_secret_key_muito_segura_minimo_32_caracteres
app.jwt.expiration-ms=86400000 // 24 horas

// Token nunca salvo em localStorage (usar HttpOnly cookie)
// Refresh token separado para renovação silenciosa
```

---

## 🔑 Dois Fatores (2FA)

### Implementação: TOTP (Time-based One-Time Password)

**Compatível com:**
- ✅ Google Authenticator
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ LastPass
- ✅ Qualquer app TOTP

### Fluxo de Ativação

```
1. Usuário solicita ativar 2FA
   → /api/auth/2fa/init

2. Sistema gera:
   - Secret criptografado
   - QR Code (exibido na tela)
   - 10 Backup Codes

3. Usuário escaneia QR com app autenticador
   → Insere código exibido pela app

4. Verificação
   → /api/auth/2fa/enable (com código TOTP)
   → Sistema valida código com margem de 30 segundos

5. 2FA ativado
   → Backup codes salvos em local seguro
   → Código expirado removido
```

### Fluxo de Login com 2FA

```
1. Email + Senha corretos
   → Sistema pede código TOTP ou Backup Code

2. Usuário digita código da app autenticadora

3. Verificação
   → /api/auth/2fa/verify

4. Aceito
   → JWT gerado
   → Login bem-sucedido

5. Se código inválido 3x
   → Bloqueio temporário de 15 minutos
```

### Código de Exemplo (Frontend React)

```javascript
// Ativar 2FA
const response = await api.post('/auth/2fa/init');
const { qrCodeUrl, backupCodes, secret } = response.data;

// Exibir QR Code ao usuário
<img src={qrCodeUrl} />

// Após escanear
const confirmResponse = await api.post('/auth/2fa/enable', {
  code: userEnteredCode // Código de 6 dígitos
});

// Salvar backup codes em local seguro!
```

---

## 👤 Biometria (WebAuthn)

### Suporte Nativo para:
- ✅ Windows Hello (Face, Iris, Fingerprint)
- ✅ MacBook Touch ID
- ✅ iPhone Face ID / Touch ID
- ✅ Android Face / Fingerprint
- ✅ Security Keys (Yubikey, etc)

### Vantagens:
- Sem senha necessária
- Impossível fazer phishing
- Credenciais nunca saem do dispositivo
- Chave privada protegida pelo SO

### Fluxo de Registro

```
1. Usuário quer registrar biometria
   → /api/auth/biometric/register-init

2. Sistema gera challenge
   → Enviado para frontend

3. Frontend solicita biometria (WebAuthn API)
   → Face ID / Touch ID / Windows Hello

4. Dispositivo cria par de chaves:
   - Chave privada (protegida pelo OS, nunca sai)
   - Chave pública (enviada ao servidor)

5. Servidor valida e armazena:
   - Credential ID (referência)
   - Chave pública
   - Tipo de autenticador
   - Contador (detecção de clonagem)

6. Login com biometria
   → Usuário só precisa tocar/olhar para câmera
   → Sem necessidade de digitar senha
```

---

## 🚫 Rate Limiting & Proteção contra Força Bruta

### Rate Limits Implementados

```
Por IP:
- 5 requisições por segundo (300/minuto)
- Limite de 10 minutos por sessão

Por Email (Login):
- 5 tentativas por 15 minutos
- Bloqueio automático após limite
- Desbloqueio automático após 30 minutos
```

### Comportamento de Bloqueio

```
Tentativa 1-4: Normal
Tentativa 5:   Email bloqueado
Minuto 5-30:   Impossível fazer login com esse email
Minuto 31:     Desbloqueio automático
```

### Para Admin Desbloquear Manualmente

```java
// Através do serviço
rateLimitService.unlockEmail("usuario@email.com");
```

---

## 📊 Auditoria & Logging

### Eventos Registrados

Todos os eventos de segurança são registrados:

```
- LOGIN (sucesso)
- FAILED_LOGIN (com motivo)
- LOGOUT
- REGISTER (nova conta)
- PASSWORD_CHANGED
- EMAIL_VERIFIED
- 2FA_ENABLED
- 2FA_DISABLED
- BIOMETRIC_ADDED
- BIOMETRIC_REMOVED
- ACCOUNT_LOCKED
- ACCOUNT_UNLOCKED
- SUSPICIOUS_ACTIVITY
- PAYMENT_INITIATED
- PAYMENT_COMPLETED
- PAYMENT_FAILED
```

### Informações Capturadas

```java
SecurityAuditLog {
  usuario_id          // Quem?
  evento              // O quê?
  descricao           // Detalhes?
  ip_address          // De onde?
  user_agent          // Que dispositivo?
  timestamp           // Quando?
  sucesso             // Resultou?
}
```

### Visualizar Histórico

```bash
# Frontend
GET /api/audit/history
GET /api/audit/suspicious-activity

# Backend (Admin)
usuarioRepository.findById(id).getAuditLogs()
```

---

## 🔐 Segurança de Dados

### 1. Proteção contra SQL Injection
```java
// ✅ SEGURO - Usando JPA (prepared statements)
Usuario usuario = usuarioRepository.findByEmail(email);

// ❌ INSEGURO - Concatenação (NUNCA fazer isso!)
String query = "SELECT * FROM usuarios WHERE email = '" + email + "'";
```

### 2. Proteção contra XSS (Cross-Site Scripting)
```java
// ✅ Headers de segurança adicionados automaticamente
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 3. CSRF (Cross-Site Request Forgery)
```java
// ✅ Protegido pelo Spring Security
// Tokens CSRF validados em todas as requisições POST/PUT/DELETE
```

### 4. Criptografia de Dados em Repouso
```java
// Sensitive data criptografado com Jasypt
@Column
@Convert(converter = JasyptConverter.class)
private String numeroCartao; // Criptografado no banco
```

### 5. HTTPS/SSL
```yaml
# Em produção, ativar:
server.ssl.key-store=keystore.p12
server.ssl.key-store-password=
server.ssl.key-store-type=PKCS12
```

---

## 🛡️ Proteção contra Ataques Web

### Headers de Segurança Implementados

```
X-Frame-Options: DENY
  → Proteção contra clickjacking

X-Content-Type-Options: nosniff
  → Impede MIME sniffing

X-XSS-Protection: 1; mode=block
  → Proteção XSS

Content-Security-Policy: default-src 'self'
  → Restringe origem de scripts

Strict-Transport-Security: max-age=31536000
  → Força HTTPS (depois de ativo uma vez)

Referrer-Policy: strict-origin-when-cross-origin
  → Controla informações de referência

Permissions-Policy: geolocation=(), microphone=()
  → Restringe permissões
```

### Validação de Input

```java
@Email
@NotEmpty
private String email;

@Size(min = 8, max = 50)
@NotEmpty
private String senha;

@Pattern(regexp = "\\d{11}")
private String telefone;
```

---

## 💳 Preparação para Pagamentos (Mercado Pago)

### Estrutura Criada

```
Models:
- Pagamento (tabela de registros de pagamento)
- CartaoCreditoToken (salva token, nunca cartão real)

Services:
- MercadoPagoService (integração)
- PagamentoService (lógica de negócio)

Controllers:
- PagamentoController (/api/pagamentos)

Repositórios:
- PagamentoRepository
```

### Boas Práticas PCI DSS

```
✅ NUNCA armazenar dados de cartão no servidor
   → Usar tokenização (Mercado Pago cria token)
   → Servidor recebe apenas token

✅ Comunicação HTTPS obrigatória
   → Criptografa dados em trânsito

✅ Validação de CVC a cada transação
   → CVC não armazenado

✅ Tentativas de fraude registradas
   → Auditoria de todas as transações

✅ 3D Secure (se necessário)
   → Autenticação adicional do banco
```

### Fluxo de Pagamento Seguro

```
1. Frontend requisita payment intent
   → POST /api/pagamentos/iniciar

2. Servidor gera referência de pagamento
   → Salva em banco com status PENDENTE

3. Frontend abre formulário Mercado Pago
   → Cliente digita dados do cartão (em iframe seguro)
   → Mercado Pago retorna token

4. Frontend envia token ao backend
   → POST /api/pagamentos/confirmar?token=...

5. Backend valida e processa
   → Comunica com Mercado Pago via API
   → Salva resultado (sucesso/falha)
   → Retorna resposta

6. Webhook recebe confirmação Mercado Pago
   → POST /api/pagamentos/webhook
   → Valida assinatura
   → Atualiza status
   → Dispara email de confirmação
```

---

## 🔧 Próximos Passos

### Curto Prazo (Esta Sprint)
- [ ] Testes de segurança (unit e integration)
- [ ] Validação de senhas fortes (OWASP)
- [ ] Email verification implementado
- [ ] Backup codes bem documentados
- [ ] Alertas de atividade suspeita

### Médio Prazo (Próximas Sprints)
- [ ] Implementar Mercado Pago completo
- [ ] Suporte a autenticação social (Google, Facebook)
- [ ] Verificação de telefone (SMS 2FA opcional)
- [ ] Análise de risco (Machine Learning)
- [ ] Dashboard de segurança para usuários

### Longo Prazo
- [ ] Compliance PCI DSS
- [ ] Compliance LGPD/GDPR
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Security SLA monitoring

---

## 📞 Suporte & Questões de Segurança

Para reportar vulnerabilidades:
- Email: security@arenahub.com
- NÃO divulgar publicamente antes da correção
- Responderemos em até 48 horas

---

**Última atualização**: Junho 2026  
**Status**: ✅ Em Produção com Segurança Avançada
