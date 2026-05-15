CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "militares" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "trigrama" VARCHAR(3) NOT NULL,
  "nome_completo" VARCHAR(160) NOT NULL,
  "nome_guerra" VARCHAR(80),
  "cpf" VARCHAR(11) NOT NULL,
  "saram" VARCHAR(10),
  "email" VARCHAR(160),
  "banco" VARCHAR(80),
  "agencia" VARCHAR(20),
  "conta_corrente" VARCHAR(30),
  "tem_dependente" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "militares_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "militares_trigrama_key" ON "militares"("trigrama");
CREATE UNIQUE INDEX "militares_cpf_key" ON "militares"("cpf");
CREATE UNIQUE INDEX "militares_saram_key" ON "militares"("saram");
CREATE UNIQUE INDEX "militares_email_key" ON "militares"("email");
