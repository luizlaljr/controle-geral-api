import { config } from "dotenv";

config({ path: ".env.test" });

process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3000";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5433/controle_geral_api_test?schema=public";
process.env.DIRECT_DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5433/controle_geral_api_test?schema=public";
process.env.CORS_ORIGINS ??= "http://localhost:3000";
process.env.RATE_LIMIT_MAX ??= "1000";
process.env.RATE_LIMIT_WINDOW ??= "1 minute";
process.env.BODY_LIMIT ??= "1048576";
process.env.LOG_LEVEL ??= "error";
process.env.OTEL_ENABLED ??= "false";
process.env.GIT_SHA ??= "test";
process.env.SERVICE_NAME ??= "controle-geral-api";
process.env.APP_VERSION ??= "0.1.0";
