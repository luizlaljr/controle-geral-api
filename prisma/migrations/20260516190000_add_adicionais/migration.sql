CREATE TABLE "tipo_habilitacao" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "codigo" VARCHAR(80) NOT NULL,
  "nome" VARCHAR(120) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tipo_habilitacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tipo_habilitacao_codigo_key" ON "tipo_habilitacao"("codigo");
CREATE UNIQUE INDEX "tipo_habilitacao_nome_key" ON "tipo_habilitacao"("nome");

ALTER TABLE "militares"
  ADD COLUMN "tipo_habilitacao_id" UUID,
  ADD COLUMN "adicional_compensacao_organica_percentual" NUMERIC(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "adicional_compensacao_organica_pst_graduacao_base_ordem" SMALLINT,
  ADD COLUMN "tem_adicional_tempo_de_servico" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "tem_adicional_promocao" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "tem_adicional_de_comando" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "militares"
  ADD CONSTRAINT "militares_tipo_habilitacao_id_fkey"
  FOREIGN KEY ("tipo_habilitacao_id") REFERENCES "tipo_habilitacao"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "militares"
  ADD CONSTRAINT "militares_compensacao_organica_base_fkey"
  FOREIGN KEY ("adicional_compensacao_organica_pst_graduacao_base_ordem") REFERENCES "pst_graduacao"("ordem")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "adicional_militar" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "pst_graduacao_ordem" SMALLINT NOT NULL,
  "percentual" NUMERIC(5, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "adicional_militar_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "adicional_militar_percentual_check" CHECK ("percentual" >= 0)
);

CREATE UNIQUE INDEX "adicional_militar_ordem_vigencia_key" ON "adicional_militar"("pst_graduacao_ordem", "vigencia_inicio");
CREATE INDEX "adicional_militar_ordem_vigencia_idx" ON "adicional_militar"("pst_graduacao_ordem", "vigencia_inicio");
CREATE INDEX "adicional_militar_vigencia_idx" ON "adicional_militar"("vigencia_inicio");

ALTER TABLE "adicional_militar"
  ADD CONSTRAINT "adicional_militar_pst_graduacao_ordem_fkey"
  FOREIGN KEY ("pst_graduacao_ordem") REFERENCES "pst_graduacao"("ordem")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "adicional_disponibilidade_militar" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "pst_graduacao_ordem" SMALLINT NOT NULL,
  "percentual" NUMERIC(5, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "adicional_disponibilidade_militar_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "adicional_disponibilidade_militar_percentual_check" CHECK ("percentual" >= 0)
);

CREATE UNIQUE INDEX "adicional_disp_ordem_vigencia_key" ON "adicional_disponibilidade_militar"("pst_graduacao_ordem", "vigencia_inicio");
CREATE INDEX "adicional_disp_ordem_vigencia_idx" ON "adicional_disponibilidade_militar"("pst_graduacao_ordem", "vigencia_inicio");
CREATE INDEX "adicional_disp_vigencia_idx" ON "adicional_disponibilidade_militar"("vigencia_inicio");

ALTER TABLE "adicional_disponibilidade_militar"
  ADD CONSTRAINT "adicional_disponibilidade_militar_pst_graduacao_ordem_fkey"
  FOREIGN KEY ("pst_graduacao_ordem") REFERENCES "pst_graduacao"("ordem")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "adicional_habilitacao" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tipo_habilitacao_id" UUID NOT NULL,
  "percentual" NUMERIC(5, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "adicional_habilitacao_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "adicional_habilitacao_percentual_check" CHECK ("percentual" >= 0)
);

CREATE UNIQUE INDEX "adicional_hab_tipo_vigencia_key" ON "adicional_habilitacao"("tipo_habilitacao_id", "vigencia_inicio");
CREATE INDEX "adicional_hab_tipo_vigencia_idx" ON "adicional_habilitacao"("tipo_habilitacao_id", "vigencia_inicio");
CREATE INDEX "adicional_hab_vigencia_idx" ON "adicional_habilitacao"("vigencia_inicio");

ALTER TABLE "adicional_habilitacao"
  ADD CONSTRAINT "adicional_habilitacao_tipo_habilitacao_id_fkey"
  FOREIGN KEY ("tipo_habilitacao_id") REFERENCES "tipo_habilitacao"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "adicional_tempo_servico" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "percentual" NUMERIC(5, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "adicional_tempo_servico_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "adicional_tempo_servico_percentual_check" CHECK ("percentual" >= 0)
);

CREATE UNIQUE INDEX "adicional_tempo_servico_vigencia_inicio_key" ON "adicional_tempo_servico"("vigencia_inicio");
CREATE INDEX "adicional_tempo_vigencia_idx" ON "adicional_tempo_servico"("vigencia_inicio");

CREATE TABLE "adicional_promocao" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "percentual" NUMERIC(5, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "adicional_promocao_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "adicional_promocao_percentual_check" CHECK ("percentual" >= 0)
);

CREATE UNIQUE INDEX "adicional_promocao_vigencia_inicio_key" ON "adicional_promocao"("vigencia_inicio");
CREATE INDEX "adicional_promocao_vigencia_idx" ON "adicional_promocao"("vigencia_inicio");

CREATE TABLE "adicional_comando" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "percentual" NUMERIC(5, 2) NOT NULL,
  "vigencia_inicio" TIMESTAMPTZ(0) NOT NULL,
  "observacao" VARCHAR(200),
  "created_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "adicional_comando_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "adicional_comando_percentual_check" CHECK ("percentual" >= 0)
);

CREATE UNIQUE INDEX "adicional_comando_vigencia_inicio_key" ON "adicional_comando"("vigencia_inicio");
CREATE INDEX "adicional_comando_vigencia_idx" ON "adicional_comando"("vigencia_inicio");

INSERT INTO "adicional_militar" ("pst_graduacao_ordem", "percentual", "vigencia_inicio", "observacao") VALUES
  (1, 28.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (2, 28.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (3, 28.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (4, 24.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (5, 24.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (6, 24.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (7, 19.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (8, 19.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (9, 19.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (10, 19.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (11, 16.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (12, 16.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (13, 16.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (14, 16.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (15, 13.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (16, 16.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (17, 13.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (18, 13.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (19, 13.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar'),
  (20, 13.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional militar');

INSERT INTO "adicional_disponibilidade_militar" ("pst_graduacao_ordem", "percentual", "vigencia_inicio", "observacao") VALUES
  (1, 41.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (2, 38.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (3, 35.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (4, 32.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (5, 26.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (6, 20.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (7, 12.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (8, 6.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (9, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (10, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (11, 32.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (12, 20.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (13, 12.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (14, 6.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (15, 6.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (16, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (17, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (18, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (19, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar'),
  (20, 5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de disponibilidade militar');

WITH tipos AS (
  INSERT INTO "tipo_habilitacao" ("codigo", "nome") VALUES
    ('ALTOS_ESTUDOS_CATEGORIA_I', 'Altos Estudos - Categoria I'),
    ('ALTOS_ESTUDOS_CATEGORIA_II', 'Altos Estudos - Categoria II'),
    ('APERFEICOAMENTO', 'Aperfeicoamento'),
    ('ESPECIALIZACAO', 'Especializacao'),
    ('FORMACAO', 'Formacao')
  RETURNING "id", "codigo"
)
INSERT INTO "adicional_habilitacao" ("tipo_habilitacao_id", "percentual", "vigencia_inicio", "observacao")
SELECT "id",
  CASE "codigo"
    WHEN 'ALTOS_ESTUDOS_CATEGORIA_I' THEN 73.00
    WHEN 'ALTOS_ESTUDOS_CATEGORIA_II' THEN 68.00
    WHEN 'APERFEICOAMENTO' THEN 45.00
    WHEN 'ESPECIALIZACAO' THEN 27.00
    ELSE 12.00
  END,
  '2020-01-01 00:00:00-03:00',
  'Tabela inicial de adicional de habilitacao'
FROM tipos;

INSERT INTO "adicional_tempo_servico" ("percentual", "vigencia_inicio", "observacao") VALUES
  (5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de tempo de servico');

INSERT INTO "adicional_promocao" ("percentual", "vigencia_inicio", "observacao") VALUES
  (5.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de promocao');

INSERT INTO "adicional_comando" ("percentual", "vigencia_inicio", "observacao") VALUES
  (10.00, '2020-01-01 00:00:00-03:00', 'Tabela inicial de adicional de comando');
