import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SpotHole } from '@prisma/client';

export interface SpotHoleBbox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface SpotHoleCluster {
  lat: number;
  lng: number;
  count: number;
  status: string;
}

export interface SpotHoleFilters {
  district?: string;
  workZoneId?: string;
  zone?: string;
  status?: string;
  bigHole?: boolean;
  vereador?: boolean;
  simSystem?: boolean;
}

const FIXED_STATUS = 'Reparado';
const RETENTION_DAYS = 7;

function retentionCutoff(): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  return cutoff;
}

// Um buraco reparado some do mapa público depois de RETENTION_DAYS — mas continua
// no banco (histórico/relatório); ver findFiltered, que ignora essa janela.
function notExpiredFilter(): Prisma.SpotHoleWhereInput {
  return {
    OR: [
      { status: { not: FIXED_STATUS } },
      { fixedAt: null },
      { fixedAt: { gte: retentionCutoff() } },
    ],
  };
}

//Recebe os dados e envia para o banco, não preocupa se eles estão certos.
@Injectable()
export class SpotHoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Lê os dados do banco, opcionalmente filtrados por uma caixa delimitadora (bbox) e/ou
  // por um conjunto de zonas de trabalho (mapa principal do reparador/admin com filtro
  // de zona ligado). `workZoneIds` vazio ([]) retorna zero resultados de propósito.
  async findAll(bbox?: SpotHoleBbox, workZoneIds?: string[]) {
    const workZoneFilter = workZoneIds !== undefined ? { workZoneId: { in: workZoneIds } } : {};

    if (!bbox) {
      return this.prisma.spotHole.findMany({ where: { ...notExpiredFilter(), ...workZoneFilter } });
    }

    return this.prisma.spotHole.findMany({
      where: {
        lat: { gte: bbox.minLat, lte: bbox.maxLat },
        lng: { gte: bbox.minLng, lte: bbox.maxLng },
        ...notExpiredFilter(),
        ...workZoneFilter,
      },
    });
  }

  //Agrupa os buracos numa grade (lat/lng arredondados) para visões de zoom afastado
  async findClustered(bbox: SpotHoleBbox, precision: number) {
    // Dois problemas nessa query: 1) o Prisma manda `precision` como bigint pro Postgres,
    // e ROUND(numeric, bigint) não existe (só ROUND(numeric, integer)) — daí o cast ::int.
    // 2) repetir ${precision} no GROUP BY cria um parâmetro $N diferente a cada ocorrência,
    // e o Postgres não reconhece como a mesma expressão do SELECT — por isso agrupamos
    // pela posição da coluna (1, 2) em vez de repetir a expressão.
    return this.prisma.$queryRaw<SpotHoleCluster[]>`
      SELECT
        ROUND(lat::numeric, ${precision}::int)::float AS lat,
        ROUND(lng::numeric, ${precision}::int)::float AS lng,
        COUNT(*)::int AS count,
        MODE() WITHIN GROUP (ORDER BY status) AS status
      FROM "SpotHole"
      WHERE lat BETWEEN ${bbox.minLat} AND ${bbox.maxLat}
        AND lng BETWEEN ${bbox.minLng} AND ${bbox.maxLng}
        AND (status != ${FIXED_STATUS} OR "fixedAt" IS NULL OR "fixedAt" >= ${retentionCutoff()})
      GROUP BY 1, 2
    `;
  }

  // Painel gerencial: sem bbox/clustering, sem janela de retenção — histórico completo filtrável.
  // Sem `pagination`, mantém o comportamento antigo (lista completa) — usado pelo seletor de
  // buracos no mapa da aba de Zonas, que precisa ver todos os pontos de uma vez.
  async findFiltered(filters: SpotHoleFilters, pagination?: { page: number; pageSize: number }) {
    const where: Prisma.SpotHoleWhereInput = {
      district: filters.district ? { contains: filters.district, mode: 'insensitive' } : undefined,
      workZoneId: filters.workZoneId,
      zone: filters.zone ? { contains: filters.zone, mode: 'insensitive' } : undefined,
      status: filters.status,
      bigHole: filters.bigHole ? true : undefined,
      vereador: filters.vereador ? true : undefined,
      simSystem: filters.simSystem ? true : undefined,
    };

    // Traz só matrícula/nome de quem criou e quem reparou — usado no cartão de detalhe do painel.
    const userSelect = { select: { matricula: true, fullName: true } };

    if (!pagination) {
      return this.prisma.spotHole.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { createdByUser: userSelect, fixedByUser: userSelect },
      });
    }

    const { page, pageSize } = pagination;
    const [items, total] = await Promise.all([
      this.prisma.spotHole.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { createdByUser: userSelect, fixedByUser: userSelect },
      }),
      this.prisma.spotHole.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  // Lista de bairros distintos já cadastrados, para autocompletar o filtro do painel.
  async findDistinctDistricts(): Promise<string[]> {
    const rows = await this.prisma.spotHole.findMany({
      where: { district: { not: null } },
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    });
    return rows.map((r) => r.district).filter((d): d is string => !!d);
  }

  // Lista de setores distintos já cadastrados (campo `zone`, geocodificado do endereço),
  // para autocompletar o filtro do painel. Não confundir com a entidade WorkZone.
  async findDistinctZones(): Promise<string[]> {
    const rows = await this.prisma.spotHole.findMany({
      where: { zone: { not: null } },
      select: { zone: true },
      distinct: ['zone'],
      orderBy: { zone: 'asc' },
    });
    return rows.map((r) => r.zone).filter((z): z is string => !!z);
  }

  //Cria uma linha no banco
  async create(data: Prisma.SpotHoleCreateInput) {
    return this.prisma.spotHole.create({ data });
  }

  //Deleta uma linha no banco
  async delete(id: string){
    return this.prisma.spotHole.delete({
      where: {id},
    })
  }

  //Procura por uma linha específica
  async findUnique(id:string) {
    return this.prisma.spotHole.findUnique({
      where: {id},
    })
  }

  //Update uma linha no banco
  async update(id: string, data: Partial<SpotHole>){
    return this.prisma.spotHole.update({
      where: {id},
      data,
    })
  }

  // Dados brutos para o dashboard gerencial — o service é quem calcula médias/buckets.
  async getStats() {
    const [byStatusRaw, totalCount, bigHolePending, vereadorPending] = await Promise.all([
      this.prisma.spotHole.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.spotHole.count(),
      this.prisma.spotHole.count({ where: { bigHole: true, status: { not: FIXED_STATUS } } }),
      this.prisma.spotHole.count({ where: { vereador: true, status: { not: FIXED_STATUS } } }),
    ]);

    const districtRaw = await this.prisma.spotHole.groupBy({
      by: ['district'],
      where: { status: { not: FIXED_STATUS }, district: { not: null } },
      _count: { _all: true },
    });
    const topDistricts = districtRaw
      .map((d) => ({ district: d.district as string, count: d._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const fixTimes = await this.prisma.spotHole.findMany({
      where: { fixedAt: { not: null } },
      select: { createdAt: true, fixedAt: true },
    });

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11, 1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [createdInRange, fixedInRange] = await Promise.all([
      this.prisma.spotHole.findMany({ where: { createdAt: { gte: twelveMonthsAgo } }, select: { createdAt: true } }),
      this.prisma.spotHole.findMany({
        where: { fixedAt: { gte: twelveMonthsAgo } },
        select: { fixedAt: true, createdAt: true },
      }),
    ]);

    return {
      byStatus: byStatusRaw.map((r) => ({ status: r.status, count: r._count._all })),
      totalCount,
      bigHolePending,
      vereadorPending,
      topDistricts,
      fixTimes,
      createdInRange,
      fixedInRange,
    };
  }

  // Fecha vários buracos de uma vez (ex.: seleção por polígono no mapa admin).
  // Retorna os ids de zona afetados, para o service disparar a checagem de auto-conclusão.
  async bulkClose(spotHoleIds: string[], adminId: string): Promise<string[]> {
    const affected = await this.prisma.spotHole.findMany({
      where: { id: { in: spotHoleIds } },
      select: { workZoneId: true },
    });

    await this.prisma.spotHole.updateMany({
      where: { id: { in: spotHoleIds }, status: { not: FIXED_STATUS } },
      data: { status: FIXED_STATUS, fixedAt: new Date(), fixedByUserId: adminId },
    });

    return [...new Set(affected.map((s) => s.workZoneId).filter((id): id is string => !!id))];
  }
}
