import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { env } from "./config/env";
import { prisma } from "./infra/database/prisma";
import { swaggerPlugin } from "./infra/docs/swagger";
import { corsPlugin } from "./infra/http/cors";
import { rateLimitPlugin } from "./infra/http/rate-limit";
import { logger } from "./infra/observability/logger";
import { requestContextPlugin } from "./infra/observability/request-context";
import { adicionalRoutes } from "./modules/adicionais/adicional.routes";
import { militarRoutes } from "./modules/militares/militar.routes";
import { operacaoRoutes } from "./modules/operacao/operacao.routes";
import { promocaoRoutes } from "./modules/promocoes/promocao.routes";
import { pstGraduacaoRoutes } from "./modules/pst-graduacoes/pst-graduacao.routes";
import { soldoRoutes } from "./modules/soldos/soldo.routes";
import { tipoHabilitacaoRoutes } from "./modules/tipos-habilitacao/tipo-habilitacao.routes";
import { errorHandler } from "./shared/errors/errorHandler";

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    bodyLimit: env.BODY_LIMIT,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
    ajv: {
      customOptions: {
        strictSchema: false,
      },
    },
  });

  await app.register(requestContextPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);

  app.setErrorHandler(errorHandler);

  await app.register(operacaoRoutes);
  await app.register(adicionalRoutes);
  await app.register(pstGraduacaoRoutes);
  await app.register(tipoHabilitacaoRoutes);
  await app.register(promocaoRoutes);
  await app.register(soldoRoutes);
  await app.register(militarRoutes);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  await app.ready();

  return app;
}
