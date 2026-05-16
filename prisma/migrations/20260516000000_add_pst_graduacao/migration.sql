CREATE TABLE "pst_graduacao" (
  "ordem" SMALLINT NOT NULL,
  "abreviacao" VARCHAR(20) NOT NULL,
  "nome" VARCHAR(80) NOT NULL,

  CONSTRAINT "pst_graduacao_pkey" PRIMARY KEY ("ordem")
);

CREATE UNIQUE INDEX "pst_graduacao_abreviacao_key" ON "pst_graduacao"("abreviacao");
CREATE UNIQUE INDEX "pst_graduacao_nome_key" ON "pst_graduacao"("nome");

INSERT INTO "pst_graduacao" ("ordem", "abreviacao", "nome") VALUES
  (1, 'Ten Brig Ar', 'Tenente-Brigadeiro do Ar'),
  (2, 'Maj Brig Ar', 'Major-Brigadeiro do Ar'),
  (3, 'Brig Ar', 'Brigadeiro do Ar'),
  (4, 'Cel', 'Coronel'),
  (5, 'Ten Cel', 'Tenente-Coronel'),
  (6, 'Maj', 'Major'),
  (7, 'Cap', 'Capitão'),
  (8, '1º Ten', 'Primeiro-Tenente'),
  (9, '2º Ten', 'Segundo-Tenente'),
  (10, 'Asp', 'Aspirante'),
  (11, 'SO', 'Suboficial'),
  (12, '1S', 'Primeiro-Sargento'),
  (13, '2S', 'Segundo-Sargento'),
  (14, '3S', 'Terceiro-Sargento'),
  (15, 'CB', 'Cabo'),
  (16, 'TM', 'Taifeiro-Mor'),
  (17, 'T1', 'Taifeiro de Primeira Classe'),
  (18, 'S1', 'Soldado de Primeira Classe'),
  (19, 'T2', 'Taifeiro de Segunda Classe'),
  (20, 'S2', 'Soldado de Segunda Classe');
