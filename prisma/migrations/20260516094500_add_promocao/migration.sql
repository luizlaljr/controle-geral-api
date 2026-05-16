CREATE TABLE "promocao" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "militar_id" UUID NOT NULL,
  "pst_graduacao_ordem" SMALLINT NOT NULL,
  "data_promocao" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "promocao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promocao_militar_id_data_promocao_key" ON "promocao"("militar_id", "data_promocao");
CREATE INDEX "promocao_militar_id_data_promocao_idx" ON "promocao"("militar_id", "data_promocao" DESC);
CREATE INDEX "promocao_pst_graduacao_ordem_idx" ON "promocao"("pst_graduacao_ordem");

ALTER TABLE "promocao"
  ADD CONSTRAINT "promocao_militar_id_fkey"
  FOREIGN KEY ("militar_id") REFERENCES "militares"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "promocao"
  ADD CONSTRAINT "promocao_pst_graduacao_ordem_fkey"
  FOREIGN KEY ("pst_graduacao_ordem") REFERENCES "pst_graduacao"("ordem")
  ON DELETE RESTRICT ON UPDATE CASCADE;
