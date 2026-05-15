import type { Prisma } from "@prisma/client";
import { prisma } from "../../infra/database/prisma";
import { createInputToPrisma, toDomain, updateInputToPrisma } from "./militar.mapper";
import type { Militar, MilitarCreateInput, MilitarUpdateInput } from "./militar.types";

export type MilitarSearchParams = {
  page: number;
  limit: number;
  search?: string | undefined;
};

export class MilitarRepository {
  async create(input: MilitarCreateInput): Promise<Militar> {
    const militar = await prisma.militar.create({
      data: createInputToPrisma(input),
    });

    return toDomain(militar);
  }

  async findMany(params: MilitarSearchParams): Promise<{ dados: Militar[]; total: number }> {
    const where = this.buildSearchWhere(params.search);

    const [dados, total] = await prisma.$transaction([
      prisma.militar.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.militar.count({ where }),
    ]);

    return {
      dados: dados.map(toDomain),
      total,
    };
  }

  async findById(id: string): Promise<Militar | null> {
    const militar = await prisma.militar.findUnique({ where: { id } });
    return militar ? toDomain(militar) : null;
  }

  async findByTrigrama(trigrama: string): Promise<Militar | null> {
    const militar = await prisma.militar.findUnique({ where: { trigrama: trigrama.toUpperCase() } });
    return militar ? toDomain(militar) : null;
  }

  async update(id: string, input: MilitarUpdateInput): Promise<Militar> {
    const militar = await prisma.militar.update({
      where: { id },
      data: updateInputToPrisma(input),
    });

    return toDomain(militar);
  }

  async delete(id: string): Promise<void> {
    await prisma.militar.delete({ where: { id } });
  }

  private buildSearchWhere(search?: string): Prisma.MilitarWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { trigrama: { contains: search, mode: "insensitive" } },
        { nomeCompleto: { contains: search, mode: "insensitive" } },
        { nomeGuerra: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
        { saram: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }
}
