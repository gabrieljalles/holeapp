import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { WorkZoneRepository } from './workzone.repository';
import { UserRepository } from '../user/user.repository';
import { AuthUser } from '../auth/auth-user.interface';

const FIXED_STATUS = 'Reparado';

@Injectable()
export class WorkZoneService {
  constructor(
    private workZoneRepository: WorkZoneRepository,
    private userRepository: UserRepository,
  ) {}

  async createZone(name: string) {
    return this.workZoneRepository.create(name);
  }

  // Só usuários REPARADOR podem ser atribuídos a uma zona.
  async assignUsers(zoneId: string, userIds: string[]) {
    const zone = await this.workZoneRepository.findById(zoneId);
    if (!zone) {
      throw new NotFoundException('Zona não encontrada.');
    }

    if (userIds.length > 0) {
      const users = await this.userRepository.findByIds(userIds);
      if (users.length !== userIds.length) {
        throw new BadRequestException('Um ou mais usuários informados não existem.');
      }
      if (users.some((u) => u.role !== Role.REPAIRER)) {
        throw new ForbiddenException('Só usuários reparadores podem ser atribuídos a uma zona.');
      }
    }

    await this.workZoneRepository.assignUsers(zoneId, userIds);
    return { message: 'Usuários atribuídos à zona.', count: userIds.length };
  }

  async setScheduledStart(zoneId: string, scheduledStartAt: Date | null) {
    const zone = await this.workZoneRepository.findById(zoneId);
    if (!zone) {
      throw new NotFoundException('Zona não encontrada.');
    }

    if (scheduledStartAt) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (scheduledStartAt < todayStart) {
        throw new BadRequestException('O início planejado não pode ser uma data no passado.');
      }
    }

    return this.workZoneRepository.setScheduledStart(zoneId, scheduledStartAt);
  }

  async assignSpotHoles(zoneId: string, spotHoleIds: string[], polygon?: [number, number][] | null) {
    const zone = await this.workZoneRepository.findById(zoneId);
    if (!zone) {
      throw new NotFoundException('Zona não encontrada.');
    }
    await this.workZoneRepository.assignSpotHoles(zoneId, spotHoleIds, polygon);
    await this.checkAndAutoComplete(zoneId);
    return { message: 'Buracos atribuídos à zona.', count: spotHoleIds.length };
  }

  // Chamado sempre que um buraco de uma zona é marcado como reparado.
  // Se todos os buracos da zona estiverem reparados, a zona se conclui sozinha.
  async checkAndAutoComplete(zoneId: string) {
    const zone = await this.workZoneRepository.findById(zoneId);
    if (!zone || zone.completedAt) return;

    const { total, fixed } = await this.workZoneRepository.countHoles(zoneId);
    if (total > 0 && total === fixed) {
      await this.workZoneRepository.markCompleted(zoneId, { forced: false, completedByUserId: null });
    }
  }

  async forceComplete(admin: AuthUser, zoneId: string) {
    const zone = await this.workZoneRepository.findById(zoneId);
    if (!zone) {
      throw new NotFoundException('Zona não encontrada.');
    }
    if (zone.completedAt) {
      throw new BadRequestException('Esta zona já está concluída.');
    }

    await this.workZoneRepository.forceCloseZoneHoles(zoneId, admin.userId);
    return this.workZoneRepository.markCompleted(zoneId, { forced: true, completedByUserId: admin.userId });
  }

  // Disponível a qualquer momento (não só logo após forçar) — desfaz apenas os
  // buracos que a conclusão forçada alterou, devolvendo cada um ao status anterior.
  async reopen(zoneId: string) {
    const zone = await this.workZoneRepository.findById(zoneId);
    if (!zone) {
      throw new NotFoundException('Zona não encontrada.');
    }
    if (!zone.completedAt) {
      throw new BadRequestException('Esta zona não está concluída.');
    }

    await this.workZoneRepository.reopenZoneHoles(zoneId);
    return this.workZoneRepository.markReopened(zoneId);
  }

  // Admin vê todas as zonas; reparador só as que está atribuído; demais papéis não têm
  // relação nenhuma com zona, então não veem nenhuma.
  async findVisibleTo(actingUser: AuthUser) {
    if (actingUser.role === Role.ADMIN) {
      return this.workZoneRepository.findAll();
    }
    if (actingUser.role === Role.REPAIRER) {
      return this.workZoneRepository.findByUserId(actingUser.userId);
    }
    return [];
  }

  // Zonas do reparador com prazo vencido e não concluídas — alimenta o aviso "dentro
  // do app" mostrado quando ele abre o mapa principal.
  async listDueForUser(actingUser: AuthUser) {
    return this.workZoneRepository.findDueForUser(actingUser.userId, new Date());
  }

  // Indicadores do dashboard gerencial — escopados às mesmas zonas visíveis ao usuário.
  async getStats(actingUser: AuthUser) {
    const visibleZones = await this.findVisibleTo(actingUser);
    const zones = await this.workZoneRepository.getStatsForZoneIds(visibleZones.map((z) => z.id));

    const total = zones.length;
    const completed = zones.filter((z) => z.completedAt).length;
    const now = new Date();
    const overdue = zones.filter((z) => !z.completedAt && z.scheduledStartAt && z.scheduledStartAt < now).length;

    const zonesWithHoles = zones.filter((z) => z.spotHoles.length > 0);
    const avgCompletionPercent = zonesWithHoles.length
      ? zonesWithHoles.reduce((sum, z) => {
          const fixed = z.spotHoles.filter((h) => h.status === FIXED_STATUS).length;
          return sum + (fixed / z.spotHoles.length) * 100;
        }, 0) / zonesWithHoles.length
      : 0;

    return { total, completed, inProgress: total - completed, overdue, avgCompletionPercent };
  }
}
