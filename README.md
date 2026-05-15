<h1 align="center">controle-geral-api</h1>

<p align="center">
  API REST em TypeScript para o CRUD de militares — leve, validada, observável e pronta para deploy.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 22">
  <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
</p>

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Quick start](#quick-start)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados](#banco-de-dados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [API reference](#api-reference)
- [Contratos de resposta](#contratos-de-resposta)
- [Testes](#testes)
- [Docker](#docker)
- [Observabilidade](#observabilidade)
- [Segurança](#segurança)
- [CI/CD](#cicd)
- [Convenções](#convenções)
- [Decisões técnicas](#decisões-técnicas)
- [Troubleshooting](#troubleshooting)

---

## Visão geral

`controle-geral-api` é um serviço HTTP para cadastrar, consultar, atualizar e remover militares. O projeto entrega CRUD validado, health checks operacionais, documentação OpenAPI gerada automaticamente, logs estruturados com redaction de dados sensíveis, e está pronto para rodar localmente, em container ou em plataformas gerenciadas.

**Fora de escopo neste MVP:** autenticação, autorização, painel web e provisionamento do banco de produção.

---

## Stack

| Camada            | Tecnologia                              |
| ----------------- | --------------------------------------- |
| Runtime           | Node.js 22                              |
| Linguagem         | TypeScript (modo `strict`)              |
| Framework HTTP    | Fastify                                 |
| ORM               | Prisma                                  |
| Banco             | PostgreSQL (Supabase em produção)       |
| Validação         | Zod                                     |
| Logger            | Pino (via Fastify)                      |
| Testes            | Vitest                                  |
| Documentação API  | `@fastify/swagger` + `@fastify/swagger-ui` |
| Container         | Docker (multi-stage)                    |
| CI                | GitHub Actions                          |

---

## Quick start

Pré-requisitos: Node.js 22+, npm 10+, Docker (apenas para testes e produção).

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# edite .env com sua DATABASE_URL

# 3. Gerar Prisma Client e aplicar migrations
npm run prisma:generate
npm run prisma:migrate:dev

# 4. Subir a API em modo desenvolvimento
npm run dev
```

A API sobe em `http://localhost:3000` por padrão. Swagger UI em `http://localhost:3000/docs`.

---

## Variáveis de ambiente

Todas as 13 variáveis são validadas no boot via Zod. A aplicação falha imediatamente com mensagem clara se alguma estiver ausente ou inválida.

| Variável               | Obrigatória | Descrição                                              | Exemplo                                                  |
| ---------------------- | :---------: | ------------------------------------------------------ | -------------------------------------------------------- |
| `DATABASE_URL`         | sim         | Connection string usada em runtime                     | `postgresql://user:pass@host:5432/db?schema=public`      |
| `DIRECT_DATABASE_URL`  | sim         | Connection string direta, usada em migrations          | igual ou variante de `DATABASE_URL`                      |
| `NODE_ENV`             | sim         | Ambiente de execução                                   | `development` \| `test` \| `production`                  |
| `PORT`                 | sim         | Porta HTTP                                             | `3000`                                                   |
| `LOG_LEVEL`            | sim         | Nível mínimo de log                                    | `debug` \| `info` \| `warn` \| `error` \| `silent`       |
| `CORS_ORIGINS`         | sim         | Origens permitidas (lista separada por vírgula)        | `http://localhost:3000,http://localhost:5173`            |
| `BODY_LIMIT`           | sim         | Tamanho máximo do payload                              | `1048576`                                                |
| `RATE_LIMIT_MAX`       | sim         | Máximo de requisições por janela                       | `100`                                                    |
| `RATE_LIMIT_WINDOW`    | sim         | Janela de rate limit                                   | `1 minute`                                               |
| `OTEL_ENABLED`         | sim         | Habilita OpenTelemetry                                 | `false`                                                  |
| `SERVICE_NAME`         | sim         | Nome do serviço para logs e telemetria                 | `controle-geral-api`                                     |
| `APP_VERSION`          | sim         | Versão exibida em `/version`                           | `0.1.0`                                                  |
| `GIT_SHA`              | sim         | Commit exibido em `/version`                           | `local` \| `${{ github.sha }}`                           |

Arquivos de referência: [`.env.example`](.env.example) e [`.env.test.example`](.env.test.example). **Nunca commite `.env` ou credenciais reais.**

---

## Banco de dados

### Desenvolvimento

Use um projeto Supabase **DEV** separado de produção. Aponte `DATABASE_URL` para ele e rode:

```bash
npm run prisma:migrate:dev   # cria nova migration a partir do schema
```

### Produção / Staging

```bash
npm run prisma:migrate:deploy   # aplica migrations existentes, não cria novas
```

> ⚠️ Migrations **não** são executadas no `Dockerfile` durante o build. Aplique-as via pipeline de deploy.

### Notas sobre Supabase + Prisma

| Cenário                                  | Recomendação                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Ambiente suporta IPv6                    | Use **Direct Connection**                                                             |
| Ambiente exige IPv4                      | Use **Supavisor Session Pooler**                                                      |
| Precisa de Transaction Pooler com Prisma | Adicione `?pgbouncer=true` na connection string                                       |
| Migrations                               | **Sempre** use Direct Connection ou Session Pooler — nunca Transaction Pooler         |

### Testes

Testes de integração e e2e usam **PostgreSQL local via Docker** na porta `5433`. Nunca apontam para Supabase.

```bash
docker compose -f docker-compose.test.yml up -d
npm run prisma:migrate:deploy
npm run test:integration
npm run test:e2e
docker compose -f docker-compose.test.yml down
```

---

## Estrutura do projeto

```
src/
├── app.ts                          # compõe a instância Fastify
├── server.ts                       # boot, listen e graceful shutdown
├── config/
│   └── env.ts                      # validação Zod das envs
├── modules/
│   ├── militares/                  # CRUD de militares
│   │   ├── militar.routes.ts
│   │   ├── militar.controller.ts
│   │   ├── militar.service.ts
│   │   ├── militar.repository.ts
│   │   ├── militar.schemas.ts
│   │   ├── militar.mapper.ts
│   │   └── militar.types.ts
│   └── operacao/
│       └── operacao.routes.ts      # /health, /ready, /version
├── shared/
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── errorHandler.ts
│   └── http/
│       └── pagination.ts
└── infra/
    ├── database/prisma.ts
    ├── docs/swagger.ts
    ├── http/{cors,rate-limit}.ts
    └── observability/
        ├── logger.ts
        ├── request-context.ts
        └── telemetry.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── unit/
├── integration/
├── e2e/
└── helpers/
```

---

## API reference

Documentação interativa completa em [`/docs`](http://localhost:3000/docs). Contrato OpenAPI em [`/docs/json`](http://localhost:3000/docs/json).

### Operação

| Método | Rota         | Descrição                                |
| ------ | ------------ | ---------------------------------------- |
| `GET`  | `/health`    | Liveness check (sempre 200 se vivo)      |
| `GET`  | `/ready`     | Readiness check (valida conexão com DB)  |
| `GET`  | `/version`   | Versão, ambiente e commit do serviço     |

### Militares

| Método   | Rota                              | Descrição                              |
| -------- | --------------------------------- | -------------------------------------- |
| `POST`   | `/militares`                      | Cria militar                           |
| `GET`    | `/militares`                      | Lista paginada com busca opcional      |
| `GET`    | `/militares/:id`                  | Busca por UUID                         |
| `GET`    | `/militares/trigrama/:trigrama`   | Busca por trigrama                     |
| `PATCH`  | `/militares/:id`                  | Atualização parcial                    |
| `DELETE` | `/militares/:id`                  | Remoção                                |

#### Paginação

Query params em `GET /militares`:

| Param    | Default | Máximo | Descrição                                                              |
| -------- | :-----: | :----: | ---------------------------------------------------------------------- |
| `page`   |   `1`   |   —    | Número da página                                                       |
| `limit`  |  `20`   | `100`  | Itens por página                                                       |
| `search` |   —     |   —    | Busca por trigrama, nome completo, nome de guerra, SARAM, CPF ou email |

Ordenação padrão: `createdAt desc`.

#### Modelo Militar

| Campo (API)     | Tipo      | Obrigatório | Regra                                              |
| --------------- | --------- | :---------: | -------------------------------------------------- |
| `id`            | `uuid`    | gerado      | —                                                  |
| `trigrama`      | `string`  | **sim**     | Exatamente 3 caracteres, salvo em UPPERCASE, único |
| `nomeCompleto`  | `string`  | **sim**     | Máximo 160 caracteres                             |
| `nomeGuerra`    | `string`  | não         | —                                                  |
| `saram`         | `string`  | não         | Máximo 10 caracteres                               |
| `cpf`           | `string`  | **sim**     | Exatamente 11 dígitos, único                       |
| `email`         | `string`  | não         | Formato válido quando informado                    |
| `banco`         | `string`  | não         | —                                                  |
| `agencia`       | `string`  | não         | —                                                  |
| `contaCorrente` | `string`  | não         | —                                                  |
| `temDependente` | `boolean` | não         | Default `false`                                    |
| `createdAt`     | `string`  | gerado      | ISO 8601                                           |
| `updatedAt`     | `string`  | gerado      | ISO 8601                                           |

---

## Contratos de resposta

### Sucesso paginado

```json
{
  "dados": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### Erro padronizado

```json
{
  "erro": {
    "codigo": "ERRO_VALIDACAO",
    "mensagem": "payload invalido",
    "detalhes": [],
    "requestId": "01HXYZ..."
  }
}
```

### Códigos de erro

| HTTP | Código                          | Quando ocorre                              |
| :--: | ------------------------------- | ------------------------------------------ |
| 400  | `ERRO_VALIDACAO`                | Payload, params ou query inválidos         |
| 400  | `JSON_INVALIDO`                 | Body com JSON malformado                   |
| 404  | `MILITAR_NAO_ENCONTRADO`        | Recurso não existe                         |
| 409  | `TRIGRAMA_DUPLICADO`            | Trigrama já cadastrado                     |
| 413  | `PAYLOAD_MUITO_GRANDE`          | Body acima de `BODY_LIMIT`                 |
| 429  | `LIMITE_REQUISICOES_EXCEDIDO`   | Rate limit estourado                       |
| 500  | `ERRO_INTERNO`                  | Erro não previsto (sem vazar stack)        |

---

## Testes

A suíte é dividida em três níveis. Cobertura mínima exigida: **statements 80%, branches 70%, functions 90%, lines 80%**.

```bash
# Apenas unitários (sem banco)
npm run test:unit

# Integração (precisa do Postgres de teste rodando)
docker compose -f docker-compose.test.yml up -d
npm run test:integration

# End-to-end (sobe Fastify via app.inject, precisa do Postgres de teste)
npm run test:e2e

# Tudo + cobertura
npm run test:coverage
docker compose -f docker-compose.test.yml down
```

> Os testes **nunca** apontam para Supabase. `DATABASE_URL` em ambiente de teste vem de `.env.test` e aponta para `localhost:5433`.

---

## Docker

### Imagem de produção

Multi-stage build com Node LTS Alpine, instalação apenas de dependências de produção na imagem final e usuário não-root. Migrations **não** rodam no build.

```bash
docker build -t controle-geral-api .
docker run -p 3000:3000 --env-file .env controle-geral-api
```

### Compose para VPS (apenas API)

```bash
docker compose up -d --build
docker compose down
```

O `docker-compose.yml` versionado **não** contém Postgres — o banco principal é Supabase. O compose só aceita variáveis de ambiente.

### Compose para testes (apenas Postgres)

```bash
docker compose -f docker-compose.test.yml up -d
docker compose -f docker-compose.test.yml down -v
```

---

## Observabilidade

### Request ID

Toda requisição recebe um `requestId`:

- Se o cliente envia `x-request-id`, o valor é preservado.
- Caso contrário, a API gera um UUID.
- O valor é retornado no header `x-request-id` da resposta.
- Em respostas de erro, o valor aparece em `erro.requestId`.

Use o `requestId` para correlacionar logs e respostas durante debugging.

### Logs estruturados

Logs em JSON via Pino. Cada entrada inclui `requestId`, método, rota, status, tempo de resposta e ambiente. Os campos sensíveis são automaticamente substituídos por `"[REDACTED]"`:

```
req.headers.authorization
req.headers.cookie
req.body.cpf
req.body.email
req.body.banco
req.body.agencia
req.body.contaCorrente
res.headers.set-cookie
DATABASE_URL
DIRECT_DATABASE_URL
```

### Prisma logs por ambiente

| Ambiente      | Níveis           |
| ------------- | ---------------- |
| `development` | `warn`, `error`  |
| `test`        | `error`          |
| `production`  | `error`          |

Queries SQL completas nunca são logadas em produção.

### OpenTelemetry

Preparado, mas **desabilitado por padrão** (`OTEL_ENABLED=false`). Quando habilitado, inicializa instrumentação para traces HTTP, Fastify e Prisma sem exigir collector externo no MVP.

---

## Segurança

- **CORS** controlado por `CORS_ORIGINS`. Wildcard `*` é recusado em produção.
- **Rate limit** configurável via `RATE_LIMIT_MAX` e `RATE_LIMIT_WINDOW`. Excesso retorna 429 com código `LIMITE_REQUISICOES_EXCEDIDO`.
- **Body limit** configurável via `BODY_LIMIT`. Default sugerido: 1 MiB.
- **Redaction automática** nos logs.
- **Validação estrita** de variáveis de ambiente no boot.
- **Erros internos nunca vazam** stack trace, SQL, connection string ou variáveis de ambiente para o cliente.
- **Autenticação não está implementada neste MVP** — exposição pública em produção exige camada adicional.

---

## CI/CD

Pipeline em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executa em cada push e PR:

1. Checkout e setup Node 22
2. `npm ci`
3. Sobe service container PostgreSQL para testes
4. `prisma generate` e `prisma migrate deploy`
5. `npm run lint`
6. `npm run test:unit`
7. `npm run test:integration`
8. `npm run test:e2e`
9. `npm run test:coverage` (com thresholds)
10. `npm run build`

O CI **nunca** referencia Supabase. Todos os testes rodam contra Postgres em service container.

### Deploy

| Plataforma  | Mecanismo                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| Render      | Runtime Node ou Dockerfile, `DATABASE_URL` setada em Environment            |
| Northflank  | Buildpack ou Dockerfile, variáveis em Secret Group                          |
| VPS         | `docker compose up -d --build` com `.env` no host                           |

### Graceful shutdown

A API trata `SIGTERM` e `SIGINT`: para de aceitar conexões, aguarda requisições em andamento, fecha o Fastify, desconecta o Prisma e encerra o processo. Compatível com containers e plataformas gerenciadas.

---

## Convenções

### Código

- Português **sem** acentos ou cedilha em código, nomes de arquivo, mensagens públicas, commits e scripts.
- README e comentários **podem** usar acentos.
- API em `camelCase`, banco em `snake_case`, mapeamento via `@map` no Prisma.

### Booleanos

| Tipo de booleano             | Prefixo | Exemplo          |
| ---------------------------- | ------- | ---------------- |
| Estado                       | `eh`    | `ehAtivo`        |
| Posse, permissão ou relação  | `tem`   | `temDependente`  |

> Nunca usar `is`, `has` ou nomes sem prefixo (`dependente`).

### Commits

[Conventional Commits](https://www.conventionalcommits.org/) em português sem acentos:

```
feat(militares): cria crud inicial de militares
test(militares): adiciona testes de criacao e duplicidade
fix(militares): corrige validacao de trigrama
ci(pipeline): adiciona validacao de lint testes e build
docs(readme): adiciona instrucoes de uso local
```

### Husky

`pre-commit` roda Prisma generate, lint, build e cobertura completa antes de aceitar o commit. O hook sobe o Postgres de teste com `docker compose -f docker-compose.test.yml up -d`, executa `npm run test:coverage` e derruba o banco ao final.

---

## Decisões técnicas

| Decisão                          | Motivo                                       | Alternativas               | Status   |
| -------------------------------- | -------------------------------------------- | -------------------------- | -------- |
| Node.js + TypeScript             | Produtividade e tipagem estática             | JavaScript, Python, Go     | Aprovado |
| Fastify                          | Performance e plugins maduros                | Express, NestJS, Hono      | Aprovado |
| Prisma                           | Type safety e migrations claras              | Drizzle, TypeORM, Knex     | Aprovado |
| Supabase PostgreSQL              | Postgres gerenciado, bom custo-benefício     | RDS, Neon, Postgres em VPS | Aprovado |
| Supabase DEV separado de PROD    | Evitar testes contaminando dados reais       | Um único projeto Supabase  | Aprovado |
| Postgres local apenas em testes  | Reprodutibilidade e isolamento               | Testar no Supabase DEV     | Aprovado |
| API local fora do Docker         | Produtividade e debug                        | Tudo containerizado        | Aprovado |
| Projeto container-ready          | Portabilidade entre Render, Northflank e VPS | Apenas runtime Node        | Aprovado |
| Migrations fora do Dockerfile    | Build determinístico                         | Migrar no build            | Aprovado |
| `prisma migrate dev` em DEV      | Versionar evolução do schema                 | `db push`                  | Aprovado |
| `prisma migrate deploy` em PROD  | Aplicar migrations sem criar novas           | `migrate dev` em PROD      | Aprovado |
| camelCase na API, snake_case DB  | Convenções nativas de cada camada            | Mesmo padrão em ambos      | Aprovado |
| `@map` no Prisma                 | Preservar convenções distintas               | Nomes iguais nas duas pontas | Aprovado |
| `temDependente`                  | Padrão do projeto para posse/relação         | `isDependent`, `dependente` | Aprovado |
| Pino com Fastify                 | Logs estruturados em JSON                    | Winston, `console.log`     | Aprovado |
| `requestId` em toda requisição   | Rastreabilidade ponta a ponta                | Sem correlação             | Aprovado |
| Redaction automática             | Proteção contra vazamento em logs            | Disciplina manual          | Aprovado |
| `/health`, `/ready`, `/version`  | Compatibilidade com plataformas e monitoria  | Apenas `/health`           | Aprovado |
| Graceful shutdown                | Encerramento seguro em containers            | Encerramento padrão        | Aprovado |
| Prisma log por ambiente          | Evitar SQL e dados sensíveis em produção     | Logar queries sempre       | Aprovado |
| OpenTelemetry preparado, off     | Caminho pronto sem complexidade no MVP       | Não preparar telemetria    | Aprovado |
| CORS por env, sem wildcard       | Segurança em APIs expostas                   | CORS aberto                | Aprovado |
| Body limit configurável          | Evitar payloads excessivos                   | Limite padrão sem controle | Aprovado |
| Rate limit configurável          | Proteção contra abuso                        | Sem rate limit             | Aprovado |
| Sem autenticação no MVP          | Foco no CRUD base                            | JWT/API key agora          | Temporário |
| Swagger desde o início           | Contrato visível e testável                  | README manual              | Aprovado |
| Vitest                           | Velocidade e integração com TypeScript       | Jest                       | Aprovado |
| Husky no pre-commit              | Bloquear commit com erro                     | Validar só no CI           | Aprovado |
| GitHub Actions                   | CI integrado ao repositório                  | CI externo                 | Aprovado |
| DELETE físico no MVP             | Simplicidade inicial                         | Soft delete                | Temporário |
| `functions` 90%, `branches` 70%  | TDD eleva functions; branches mantém piso da task | 80/70 ou 65 em branches | Aprovado |

---

## Troubleshooting

| Sintoma                                       | Causa provável                                                | Solução                                                              |
| --------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev` falha no boot                   | Variável de ambiente ausente ou inválida                      | Confira `.env` contra `.env.example`. A mensagem indica qual variável. |
| `/ready` retorna 503                          | Banco indisponível ou `DATABASE_URL` incorreta                | Valide a connection string e a rede até o banco.                     |
| Testes de integração não rodam                | Postgres de teste não está de pé                              | `docker compose -f docker-compose.test.yml up -d` e aguarde o healthcheck |
| Testes batem em Supabase                      | `.env.test` apontando para Supabase                           | Restaure `.env.test` a partir de `.env.test.example`                 |
| `prisma migrate dev` falha em Transaction Pooler | Pooler não suporta migrations                                | Use Direct Connection ou Session Pooler para migrations              |
| `/version` mostra `commit: "local"`           | `GIT_SHA` não está setado                                     | Esperado em desenvolvimento. CI/Deploy deve passar o SHA real.       |
| Logs aparecem com `[REDACTED]`                | Comportamento correto — campo sensível                        | Não é um problema. É a redaction protegendo dados.                   |
