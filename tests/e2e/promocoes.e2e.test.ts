import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { cleanDatabase, ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("Promocoes e2e", () => {
  const appPromise = buildApp();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("cadastra e lista promocoes do militar", async () => {
    const app = await appPromise;

    const createMilitarResponse = await app.inject({
      method: "POST",
      url: "/militares",
      payload: {
        trigrama: "pro",
        nomeCompleto: "Militar Promovido",
        cpf: "12345678906",
      },
    });
    const militar = createMilitarResponse.json();

    const createPromocaoResponse = await app.inject({
      method: "POST",
      url: `/militares/${militar.id}/promocoes`,
      payload: {
        pst_graduacao_ordem: 7,
        data_promocao: "2026-01-01",
      },
    });

    expect(createPromocaoResponse.statusCode).toBe(201);
    expect(createPromocaoResponse.json()).toMatchObject({
      militarId: militar.id,
      pstGraduacaoOrdem: 7,
      pstGraduacao: { ordem: 7 },
    });

    const listResponse = await app.inject({
      method: "GET",
      url: `/militares/${militar.id}/promocoes`,
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toEqual([expect.objectContaining({ militarId: militar.id, pstGraduacaoOrdem: 7 })]);
  });

  it("retorna erro para promocao duplicada ou referencias inexistentes", async () => {
    const app = await appPromise;

    const createMilitarResponse = await app.inject({
      method: "POST",
      url: "/militares",
      payload: {
        trigrama: "dup",
        nomeCompleto: "Militar Duplicado",
        cpf: "12345678907",
      },
    });
    const militar = createMilitarResponse.json();
    const payload = {
      pst_graduacao_ordem: 7,
      data_promocao: "2026-01-01",
    };

    await app.inject({ method: "POST", url: `/militares/${militar.id}/promocoes`, payload });
    const duplicateResponse = await app.inject({ method: "POST", url: `/militares/${militar.id}/promocoes`, payload });
    const missingPstGraduacaoResponse = await app.inject({
      method: "POST",
      url: `/militares/${militar.id}/promocoes`,
      payload: {
        pst_graduacao_ordem: 999,
        data_promocao: "2027-01-01",
      },
    });
    const missingMilitarResponse = await app.inject({
      method: "GET",
      url: "/militares/8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2/promocoes",
    });

    expect(duplicateResponse.statusCode).toBe(409);
    expect(duplicateResponse.json()).toMatchObject({ erro: { codigo: "PROMOCAO_DUPLICADA" } });
    expect(missingPstGraduacaoResponse.statusCode).toBe(404);
    expect(missingPstGraduacaoResponse.json()).toMatchObject({ erro: { codigo: "PST_GRADUACAO_NAO_ENCONTRADA" } });
    expect(missingMilitarResponse.statusCode).toBe(404);
    expect(missingMilitarResponse.json()).toMatchObject({ erro: { codigo: "MILITAR_NAO_ENCONTRADO" } });
  });
});
