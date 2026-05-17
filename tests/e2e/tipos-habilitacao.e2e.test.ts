import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("TiposHabilitacao e2e", () => {
  const appPromise = buildApp();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("lista e busca tipos de habilitacao", async () => {
    const app = await appPromise;

    const listResponse = await app.inject({ method: "GET", url: "/tipos-habilitacao" });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: "FORMACAO", nome: "Formacao" }),
        expect.objectContaining({ codigo: "APERFEICOAMENTO", nome: "Aperfeicoamento" }),
      ]),
    );

    const formacao = listResponse.json().find((item: { codigo: string }) => item.codigo === "FORMACAO");
    const byIdResponse = await app.inject({ method: "GET", url: `/tipos-habilitacao/${formacao.id}` });
    const byCodigoResponse = await app.inject({
      method: "GET",
      url: "/tipos-habilitacao/codigo/formacao",
    });

    expect(byIdResponse.statusCode).toBe(200);
    expect(byIdResponse.json()).toMatchObject({ id: formacao.id, codigo: "FORMACAO" });
    expect(byCodigoResponse.statusCode).toBe(200);
    expect(byCodigoResponse.json()).toMatchObject({ id: formacao.id, codigo: "FORMACAO" });
  });

  it("retorna 404 para tipo de habilitacao inexistente", async () => {
    const app = await appPromise;

    const byIdResponse = await app.inject({
      method: "GET",
      url: "/tipos-habilitacao/8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
    });
    const byCodigoResponse = await app.inject({
      method: "GET",
      url: "/tipos-habilitacao/codigo/inexistente",
    });

    expect(byIdResponse.statusCode).toBe(404);
    expect(byIdResponse.json()).toMatchObject({ erro: { codigo: "TIPO_HABILITACAO_NAO_ENCONTRADO" } });
    expect(byCodigoResponse.statusCode).toBe(404);
    expect(byCodigoResponse.json()).toMatchObject({ erro: { codigo: "TIPO_HABILITACAO_NAO_ENCONTRADO" } });
  });
});
