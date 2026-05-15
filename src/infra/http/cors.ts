import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { corsOrigins, env } from "../../config/env";

export const corsPlugin: FastifyPluginAsync = fp(async (app) => {
  if (env.NODE_ENV === "production" && corsOrigins.includes("*")) {
    throw new Error("CORS wildcard is not allowed in production");
  }

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      callback(null, corsOrigins.includes("*") || corsOrigins.includes(origin));
    },
  });
});
