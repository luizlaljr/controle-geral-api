# controle-geral-api

API REST em TypeScript para CRUD de militares, usando Fastify, Prisma, PostgreSQL, Vitest e Docker.

## 1. Visao geral
Servico `controle-geral-api` para cadastro, consulta, atualizacao e remocao de militares.

## 2. Objetivo
Entregar uma API simples, validada, observavel e testavel para dados de militares.

## 3. Escopo
Inclui CRUD de militares, health checks, Swagger, Docker, CI e testes automatizados.

## 4. Fora de escopo
Autenticacao, autorizacao, painel web e provisionamento do banco de producao.

## 5. Stack
Node.js 22, TypeScript, Fastify, Prisma, PostgreSQL, Zod, Pino e Vitest.

## 6. Arquitetura
O codigo fica dividido em `config`, `infra`, `modules` e `shared`.

## 7. Modulos
O modulo principal e `militares`. O modulo `operacao` cobre `/health`, `/ready` e `/version`.

## 8. Convencoes
Codigo, nomes de arquivo e mensagens publicas ficam sem acentos.

## 9. Naming
O nome do servico e sempre `controle-geral-api`.

## 10. Banco
Producao usa PostgreSQL. Testes usam PostgreSQL local via Docker na porta `5433`.

## 11. Modelo Militar
Campos publicos usam camelCase; banco usa snake_case quando aplicavel.

## 12. Booleano de dependente
API usa `temDependente`; banco usa `tem_dependente`.

## 13. Variaveis de ambiente
As 13 variaveis obrigatorias estao documentadas em `.env.example` e `.env.test.example`.

## 14. Instalacao
```bash
npm install
```

## 15. Configuracao local
Crie `.env` baseado em `.env.example`.

## 16. Configuracao de teste
Crie `.env.test` baseado em `.env.test.example`.

## 17. Gerar Prisma Client
```bash
npm run prisma:generate
```

## 18. Criar migration em desenvolvimento
```bash
npm run prisma:migrate:dev
```

## 19. Aplicar migrations
```bash
npm run prisma:migrate:deploy
```

## 20. Rodar em desenvolvimento
```bash
npm run dev
```

## 21. Build
```bash
npm run build
```

## 22. Start
```bash
npm run start
```

## 23. Lint
```bash
npm run lint
```

## 24. Formatacao
```bash
npm run format
npm run format:check
```

## 25. Testes unitarios
```bash
npm run test:unit
```

## 26. Testes de integracao
```bash
docker compose -f docker-compose.test.yml up -d
npm run test:integration
```

## 27. Testes e2e
```bash
docker compose -f docker-compose.test.yml up -d
npm run test:e2e
```

## 28. Cobertura
```bash
npm run test:coverage
```

## 29. Todos os testes
```bash
npm run test
```

## 30. Docker de teste
```bash
docker compose -f docker-compose.test.yml up -d
```

## 31. Docker de producao
```bash
docker compose up -d --build
```

## 32. Health
`GET /health` retorna estado basico do servico.

## 33. Readiness
`GET /ready` valida conectividade com o banco.

## 34. Version
`GET /version` retorna versao, ambiente, commit e timestamp.

## 35. Swagger UI
`GET /docs` abre a interface Swagger.

## 36. OpenAPI JSON
`GET /docs/json` retorna o contrato OpenAPI.

## 37. Criar militar
`POST /militares` cria um registro.

## 38. Listar militares
`GET /militares?page=1&limit=20&search=abc` lista com paginacao.

## 39. Buscar por id
`GET /militares/:id` busca por UUID.

## 40. Buscar por trigrama
`GET /militares/trigrama/:trigrama` busca por trigrama.

## 41. Atualizar militar
`PATCH /militares/:id` atualiza parcialmente.

## 42. Remover militar
`DELETE /militares/:id` remove um registro.

## 43. Paginacao
Respostas paginadas usam `{ dados, meta: { page, limit, total, totalPages } }`.

## 44. Erros
Erros usam `{ erro: { codigo, mensagem, detalhes, requestId } }`.

## 45. Request id
O header `x-request-id` e reutilizado quando enviado; caso contrario, a API gera um UUID.

## 46. Logger
Pino faz redaction de campos sensiveis como CPF, email, banco, agencia, conta e credenciais.

## 47. CORS
`CORS_ORIGINS` define origens permitidas. Wildcard e recusado em producao.

## 48. Rate limit
`RATE_LIMIT_MAX` e `RATE_LIMIT_WINDOW` controlam limites de requisicao.

## 49. Body limit
`BODY_LIMIT` define o tamanho maximo do payload.

## 50. Telemetria
`OTEL_ENABLED=false` desabilita inicializacao de telemetria por padrao.

## 51. CI
O workflow roda install, Prisma, migrations, lint, testes, cobertura e build.

## 52. Deploy
O `Dockerfile` nao executa migrations no build. Aplique migrations fora da imagem.

## 53. Seguranca
Nao commite `.env`, credenciais reais ou URLs privadas.

## 54. Troubleshooting
Se os testes de banco falharem, confirme se o Postgres de teste esta saudavel e se `.env.test` aponta para porta `5433`.

## Decisoes tecnicas

| Decisao | Motivo | Impacto | Alternativas | Status |
| --- | --- | --- | --- | --- |
| Fastify | Alto desempenho e plugins maduros | Baixa latencia | Express, Hono | Aceita |
| TypeScript strict | Reduz erros em runtime | Mais rigor no desenvolvimento | JavaScript | Aceita |
| Prisma | ORM tipado e migrations claras | Camada de dados previsivel | Knex, Drizzle | Aceita |
| PostgreSQL | Banco relacional robusto | Suporte a constraints | MySQL, SQLite | Aceita |
| Zod | Validacao explicita | Contratos legiveis | Ajv puro, Yup | Aceita |
| Pino | Logger rapido | Logs estruturados | Winston | Aceita |
| Redaction | Protege dados sensiveis | Menos risco de vazamento | Redaction manual | Aceita |
| Request id | Rastreabilidade | Debug mais simples | Trace externo apenas | Aceita |
| Swagger | Documentacao navegavel | Facilita consumo | Redoc | Aceita |
| Docker multi-stage | Imagem menor | Build mais previsivel | Imagem unica | Aceita |
| Docker sem migrations | Evita mutacao no build | Deploy mais seguro | Rodar migration no build | Aceita |
| Vitest | Testes rapidos | Feedback curto | Jest | Aceita |
| App inject | E2E sem porta real | Teste HTTP simples | Supertest | Aceita |
| Docker Compose test | Banco real local | Integracao confiavel | Banco em memoria | Aceita |
| CI unico | Fluxo simples | Menor complexidade | Jobs separados | Aceita |
| Sem Supabase no CI | Evita secrets em teste | Testes reproduziveis | Banco remoto | Aceita |
| camelCase na API | Convencao TS | Contrato amigavel | snake_case publico | Aceita |
| snake_case no DB | Convencao SQL | Consistencia relacional | camelCase no DB | Aceita |
| `temDependente` | Nome explicito | Evita ambiguidades | `dependente` | Aceita |
| `AppError` | Erros padronizados | Menos ifs em controllers | Erros soltos | Aceita |
| Error handler global | Contrato unico | Cliente previsivel | Tratamento por rota | Aceita |
| Paginacao default | Protege banco | Menos respostas grandes | Sem limite | Aceita |
| Limite max 100 | Evita abuso | Carga controlada | Limite maior | Aceita |
| UUID | IDs nao sequenciais | Menos exposicao | Inteiro serial | Aceita |
| Unique trigrama | Regra de negocio | Evita duplicidade | Validacao sem constraint | Aceita |
| Health sem banco | Liveness simples | Nao depende de DB | Health com query | Aceita |
| Ready com banco | Sinal real de prontidao | Detecta indisponibilidade | Ready estatico | Aceita |
| Env validation | Falha cedo | Boot mais seguro | Defaults silenciosos | Aceita |
| Husky pre-commit | Feedback antes do commit | Menos regressao | Apenas CI | Aceita |
| Conventional commits | Historico legivel | Releases mais simples | Mensagens livres | Aceita |
