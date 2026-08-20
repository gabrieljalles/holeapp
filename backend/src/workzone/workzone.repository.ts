import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkZone } from '@prisma/client';

const FIXED_STATUS = 'Reparado';

// Resumo do usuário atribuído — não deve vazar matrícula em contextos públicos, mas
// esta zona só é visível a ADMIN (todo mundo) ou ao próprio reparador atribuído.
const ASSIGNED_USERS_INCLUDE = {
  assignedUsers: {
    include: { user: { select: { id: true, matricula: true, fullName: true } } },
  },
  _count: { select: { spotHoles: true } },
} as const;

@Injectable()
export class WorkZoneRepository {
  constructor(private prisma: PrismaService) {}

  // {total: 0, fixed: 0} para uma zona vazia (nunca é considerada concluída automaticamente).
  async countHoles(zoneId: string): Promise<{ total: number; fixed: number }> {
    const [total, fixed] = await Promise.all([
      this.prisma.spotHole.count({ where: { workZoneId: zoneId } }),
      this.prisma.spotHole.count({ where: { workZoneId: zoneId, status: FIXED_STATUS } }),
    ]);
    return { total, fixed };
  }

  async markCompleted(zoneId: string, opts: { forced: boolean; completedByUserId: string | null }): Promise<WorkZone> {
    return this.prisma.workZone.update({
      where: { id: zoneId },
      data: {
        completedAt: new Date(),
        forcedCompletion: opts.forced,
        completedByUserId: opts.completedByUserId,
      },
    });
  }

  async markReopened(zoneId: string): Promise<WorkZone> {
    return this.prisma.workZone.update({
      where: { id: zoneId },
      data: { completedAt: null, forcedCompletion: false, completedByUserId: null },
    });
  }

  // Copia o status atual para statusBeforeForceClose antes de forçar 'Reparado' —
  // é isso que permite reverter exatamente (e só) os buracos que essa ação mudou.
  async forceCloseZoneHoles(zoneId: string, adminId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "SpotHole"
      SET "statusBeforeForceClose" = status,
          status = ${FIXED_STATUS},
          "fixedAt" = now(),
          "fixedByUserId" = ${adminId},
          "forceClosedByZone" = true,
          "updatedAt" = now()
      WHERE "workZoneId" = ${zoneId} AND status != ${FIXED_STATUS}
    `;
  }

  async reopenZoneHoles(zoneId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "SpotHole"
      SET status = "statusBeforeForceClose",
          "statusBeforeForceClose" = NULL,
          "fixedAt" = NULL,
          "fixedByUserId" = NULL,
          "forceClosedByZone" = false,
          "updatedAt" = now()
      WHERE "workZoneId" = ${zoneId} AND "forceClosedByZone" = true
    `;
  }

  async create(name: string): Promise<WorkZone> {
    return this.prisma.workZone.create({ data: { name } });
  }

  async findById(id: string) {
    return this.prisma.workZone.findUnique({ where: { id }, include: ASSIGNED_USERS_INCLUDE });
  }

  async findAll() {
    return this.prisma.workZone.findMany({ include: ASSIGNED_USERS_INCLUDE, orderBy: { createdAt: 'desc' } });
  }

  // Zonas em que o usuário está atribuído — usado pro reparador (painel e mapa principal).
  async findByUserId(userId: string) {
    return this.prisma.workZone.findMany({
      where: { assignedUsers: { some: { userId } } },
      include: ASSIGNED_USERS_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Zonas do usuário com prazo já vencido e ainda não concluídas — alimenta o aviso
  // "dentro do app" mostrado quando ele abre o mapa.
  async findDueForUser(userId: string, now: Date) {
    return this.prisma.workZone.findMany({
      where: {
        assignedUsers: { some: { userId } },
        completedAt: null,
        scheduledStartAt: { not: null, lte: now },
      },
      orderBy: { scheduledStartAt: 'asc' },
    });
  }

  // Substitui o conjunto de usuários atribuídos pelo informado (pode ser vazio).
  async assignUsers(zoneId: string, userIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.workZoneAssignment.deleteMany({ where: { workZoneId: zoneId } }),
      ...(userIds.length > 0
        ? [
            this.prisma.workZoneAssignment.createMany({
              data: userIds.map((userId) => ({ workZoneId: zoneId, userId })),
            }),
          ]
        : []),
    ]);
  }

  async setScheduledStart(id: string, scheduledStartAt: Date | null): Promise<WorkZone> {
    return this.prisma.workZone.update({ where: { id }, data: { scheduledStartAt } });
  }

  // `polygon` só é gravado quando explicitamente informado (undefined = mantém o atual).
  async assignSpotHoles(id: string, spotHoleIds: string[], polygon?: [number, number][] | null): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.spotHole.updateMany({
        where: { id: { in: spotHoleIds } },
        data: { workZoneId: id },
      }),
      ...(polygon !== undefined ? [this.prisma.workZone.update({ where: { id }, data: { polygon: polygon as any } })] : []),
    ]);
  }

  // Dados brutos para o dashboard gerencial, já escopados por `zoneIds` (visíveis ao usuário).
  async getStatsForZoneIds(zoneIds: string[]) {
    if (zoneIds.length === 0) return [];
    return this.prisma.workZone.findMany({
      where: { id: { in: zoneIds } },
      select: {
        id: true,
        completedAt: true,
        scheduledStartAt: true,
        spotHoles: { select: { status: true } },
      },
    });
  }
}
