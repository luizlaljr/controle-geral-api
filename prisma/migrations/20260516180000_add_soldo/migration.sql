CREATE TABLE "soldo" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "pst_graduacao_ordem" SMALLINT NOT NULL,
  "valor" NUMERIC(10, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "soldo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "soldo_ordem_vigencia_key" ON "soldo"("pst_graduacao_ordem", "vigencia_inicio");
CREATE INDEX "soldo_ordem_vigencia_idx" ON "soldo"("pst_graduacao_ordem", "vigencia_inicio");
CREATE INDEX "soldo_vigencia_idx" ON "soldo"("vigencia_inicio");

ALTER TABLE "soldo"
  ADD CONSTRAINT "soldo_pst_graduacao_ordem_fkey"
  FOREIGN KEY ("pst_graduacao_ordem") REFERENCES "pst_graduacao"("ordem")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "soldo" ("pst_graduacao_ordem", "valor", "vigencia_inicio", "observacao") VALUES
  (1, 14711.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (2, 14100.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (3, 13639.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (4, 12505.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (5, 12285.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (6, 12108.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (7, 9976.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (8, 9004.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (9, 8179.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (10, 7988.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (11, 6737.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (12, 5988.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (13, 5209.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (14, 4177.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (15, 2869.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (16, 2869.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (17, 2539.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (18, 2103.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (19, 2413.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026'),
  (20, 1927.00, '2026-01-01 00:00:00-03:00', 'Tabela de soldo vigente a partir de 01/01/2026');
