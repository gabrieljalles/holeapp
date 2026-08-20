import { ForbiddenException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { SpotHoleRepository, SpotHoleBbox, SpotHoleCluster, SpotHoleFilters } from './spothole.repository';
import { SpotHoleAuthorizationService } from './spothole-authorization.service';
import { WorkZoneService } from '../workzone/workzone.service';
import { Prisma, Role, SpotHole } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';
import { CreateSpotHoleDto } from './dto/create-spothole.dto';
import { AuthUser } from '../auth/auth-user.interface';

const FIXED_STATUS = 'Reparado';

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// Últimos 12 meses (incluindo o atual), com contagem de buracos criados/reparados e o
// tempo médio de reparo (em dias) dos buracos reparados em cada mês.
function buildMonthlyTrend(created: Date[], fixed: { fixedAt: Date; createdAt: Date }[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => monthKey(new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)));

  const createdCounts = new Map<string, number>();
  created.forEach((d) => createdCounts.set(monthKey(d), (createdCounts.get(monthKey(d)) ?? 0) + 1));

  const fixedCounts = new Map<string, number>();
  const fixTimeSumByMonth = new Map<string, number>();
  fixed.forEach((r) => {
    const key = monthKey(r.fixedAt);
    fixedCounts.set(key, (fixedCounts.get(key) ?? 0) + 1);
    const days = (r.fixedAt.getTime() - r.createdAt.getTime()) / 86_400_000;
    fixTimeSumByMonth.set(key, (fixTimeSumByMonth.get(key) ?? 0) + days);
  });

  return months.map((month) => {
    const fixedCount = fixedCounts.get(month) ?? 0;
    const fixTimeSum = fixTimeSumByMonth.get(month) ?? 0;
    return {
      month,
      created: createdCounts.get(month) ?? 0,
      fixed: fixedCount,
      avgFixTimeDays: fixedCount > 0 ? fixTimeSum / fixedCount : null,
    };
  });
}

@Injectable()
export class SpotHoleService {
  constructor(
    private readonly spotHoleRepository: SpotHoleRepository,
    private readonly authorization: SpotHoleAuthorizationService,
    private readonly workZoneService: WorkZoneService,
  ) {}

  // <<<<
  async findAll(bbox?: SpotHoleBbox, workZoneIds?: string[]): Promise<SpotHole[]> {
    return this.spotHoleRepository.findAll(bbox, workZoneIds);
  }

  async findClustered(bbox: SpotHoleBbox, precision: number): Promise<SpotHoleCluster[]> {
    return this.spotHoleRepository.findClustered(bbox, precision);
  }

  // Painel gerencial: lista completa (sem clustering, sem janela de retenção de 7 dias),
  // filtrável por bairro/zona/status — só admin. Paginado quando `pagination` é
  // informado (usado pela tabela do painel); sem paginação, retorna tudo (usado pelo mapa
  // de seleção de buracos da aba de Zonas).
  async findFiltered(
    filters: SpotHoleFilters,
    actingUser: AuthUser,
    pagination?: { page: number; pageSize: number },
  ) {
    const allowed: Role[] = [Role.ADMIN];
    if (!allowed.includes(actingUser.role)) {
      throw new ForbiddenException('Você não pode acessar essa listagem.');
    }
    return this.spotHoleRepository.findFiltered(filters, pagination);
  }

  // Autocompletar o filtro de bairro no painel gerencial.
  async findDistinctDistricts(actingUser: AuthUser): Promise<string[]> {
    const allowed: Role[] = [Role.ADMIN];
    if (!allowed.includes(actingUser.role)) {
      throw new ForbiddenException('Você não pode acessar essa listagem.');
    }
    return this.spotHoleRepository.findDistinctDistricts();
  }

  // Autocompletar o filtro de setor no painel gerencial.
  async findDistinctZones(actingUser: AuthUser): Promise<string[]> {
    const allowed: Role[] = [Role.ADMIN];
    if (!allowed.includes(actingUser.role)) {
      throw new ForbiddenException('Você não pode acessar essa listagem.');
    }
    return this.spotHoleRepository.findDistinctZones();
  }

  // Indicadores do dashboard gerencial — só admin.
  async getStats(actingUser: AuthUser) {
    const allowed: Role[] = [Role.ADMIN];
    if (!allowed.includes(actingUser.role)) {
      throw new ForbiddenException('Você não pode acessar essas estatísticas.');
    }

    const raw = await this.spotHoleRepository.getStats();

    const avgFixTimeDays = raw.fixTimes.length
      ? raw.fixTimes.reduce((sum, r) => sum + (r.fixedAt!.getTime() - r.createdAt.getTime()), 0) /
        raw.fixTimes.length /
        86_400_000
      : null;

    const monthlyTrend = buildMonthlyTrend(
      raw.createdInRange.map((r) => r.createdAt),
      raw.fixedInRange.map((r) => ({ fixedAt: r.fixedAt as Date, createdAt: r.createdAt })),
    );

    return {
      byStatus: raw.byStatus,
      totalCount: raw.totalCount,
      bigHolePending: raw.bigHolePending,
      vereadorPending: raw.vereadorPending,
      topDistricts: raw.topDistricts,
      avgFixTimeDays,
      monthlyTrend,
    };
  }

  // >>>>
  async create(data: CreateSpotHoleDto & {
    imgBeforeWorkPath?: string | null;
  }, actingUser: AuthUser){
    this.authorization.assertCanCreate(actingUser);

    const { lat, lng, imgBeforeWorkPath, observation, vereador, simSystem, bigHole } = data;

    const addressData = await this.getAddressFromLatLng(lat, lng);

    const newSpotHole: Prisma.SpotHoleCreateInput = {
      priority: '',
      size: '',
      trafficIntensity: '',
      observation: observation || null,
      status: 'Aberto',
      createdByUser: { connect: { id: actingUser.userId } },
      vereador: typeof vereador === "string" ? (vereador === "true") : Boolean(vereador),
      simSystem: typeof simSystem === "string" ? (simSystem === "true") : Boolean(simSystem),
      bigHole: typeof bigHole === "string" ? (bigHole === "true") : Boolean(bigHole),
      lat: Number(lat),
      lng: Number(lng),
      zone: '',
      district: '',
      cep: '',
      address: '',
      number: '',

      imgBeforeWorkPath: imgBeforeWorkPath,
      imgAfterWorkPath: null,

      ...addressData,
    };

    return this.spotHoleRepository.create(newSpotHole);
  }

  async update(id: string, data: Partial<SpotHole>, actingUser: AuthUser){
    const spotHole = await this.spotHoleRepository.findUnique(id);

    if(!spotHole){
     throw new NotFoundException(`Spothole com id ${id} não encontrado.`);
    }

    await this.authorization.assertCanUpdate(actingUser, spotHole);

    {/*Se existe no banco e tiver atualizações:*/}
    if(spotHole.imgBeforeWorkPath && data.imgBeforeWorkPath){
      this.deleteFile(spotHole.imgBeforeWorkPath)
    }
    {/*Se existe no banco e tiver atualizações:*/}
    if(spotHole.imgAfterWorkPath && data.imgAfterWorkPath){
      this.deleteFile(spotHole.imgAfterWorkPath)
    }

    if (data.status === FIXED_STATUS && !spotHole.fixedByUserId) {
      data.fixedByUserId = actingUser.userId;
    }

    const updated = await this.spotHoleRepository.update(id, data);

    if (data.status === FIXED_STATUS && spotHole.workZoneId) {
      await this.workZoneService.checkAndAutoComplete(spotHole.workZoneId);
    }

    return updated;
  }

  // Admin fecha vários buracos de uma vez (ex.: seleção de uma área/polígono no mapa).
  async bulkClose(spotHoleIds: string[], actingUser: AuthUser): Promise<{ count: number }> {
    if (actingUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Só o administrador pode fechar buracos em massa.');
    }

    const affectedZoneIds = await this.spotHoleRepository.bulkClose(spotHoleIds, actingUser.userId);

    await Promise.all(affectedZoneIds.map((zoneId) => this.workZoneService.checkAndAutoComplete(zoneId)));

    return { count: spotHoleIds.length };
  }

  async delete(id: string, actingUser: AuthUser): Promise<SpotHole>{

  const spotHole = await this.spotHoleRepository.findUnique(id);

  if(!spotHole){
    throw new Error('Registro não encontrado.');
  }

  await this.authorization.assertCanDelete(actingUser, spotHole);

  if(spotHole.imgBeforeWorkPath){
    this.deleteFile(spotHole.imgBeforeWorkPath)
  }

  if(spotHole.imgAfterWorkPath){
    this.deleteFile(spotHole.imgAfterWorkPath)
  }

    return this.spotHoleRepository.delete(id);
  }

  private async getAddressFromLatLng(
    lat: number,
    lng: number,
  ): Promise<Partial<Prisma.SpotHoleCreateInput>> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const response = await axios.get(url, {
        headers: {
          // Política de uso do Nominatim exige um User-Agent identificando a aplicação,
          // caso contrário as requisições são bloqueadas com 403.
          'User-Agent': 'HoleApp/1.0 (github.com/gabrieljalles/holeapp)',
        },
      });
      const address = response.data.address || {};

      return {
        address: address.road || null,
        district: address.suburb || null,
        cep: address.postcode || null,
        zone: address.city_district || null,
        number: address.house_number || null,
      };
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      throw new Error(
        'Não foi possível buscar o endereço. Verifique a conexão.',
      );
    }
  }

  private deleteFile(filePath: string){
    const absolutePath = path.resolve(filePath);

    fs.unlink(absolutePath, (err)=> {
      if (err){
        console.error(`Erro ao excluir o arquivo ${absolutePath}`, err);
      } else {
        console.log(`Arquivo excluído: ${absolutePath}`)
      }
    })
  }
}
