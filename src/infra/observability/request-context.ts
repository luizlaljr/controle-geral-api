import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

export const requestContextPlugin: FastifyPluginAsync = fp(async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });
});
