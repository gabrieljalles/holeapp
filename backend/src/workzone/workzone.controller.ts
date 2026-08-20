import { Body, Controller, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { WorkZoneService } from './workzone.service';
import { CreateWorkZoneDto } from './dto/create-workzone.dto';
import { AssignUsersDto } from './dto/assign-users.dto';
import { AssignSpotHolesDto } from './dto/assign-spotholes.dto';
import { ScheduleZoneDto } from './dto/schedule-zone.dto';

@Controller('workzone')
export class WorkZoneController {
  constructor(private workZoneService: WorkZoneService) {}

  // Sem @Roles: qualquer papel autenticado pode listar, mas o resultado é escopado
  // por papel dentro do service (admin vê tudo; reparador só as próprias zonas).
  @Get()
  async findVisible(@Request() req) {
    return this.workZoneService.findVisibleTo(req.user);
  }

  // Indicadores do dashboard gerencial — só admin.
  @Roles(Role.ADMIN)
  @Get('stats')
  async getStats(@Request() req) {
    return this.workZoneService.getStats(req.user);
  }

  // Zonas do reparador com prazo vencido e não concluídas — aviso "dentro do app"
  // mostrado quando ele abre o mapa principal.
  @Roles(Role.REPAIRER)
  @Get('due')
  async listDue(@Request() req) {
    return this.workZoneService.listDueForUser(req.user);
  }

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateWorkZoneDto) {
    return this.workZoneService.createZone(dto.name);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/users')
  async assignUsers(@Param('id') id: string, @Body() dto: AssignUsersDto) {
    return this.workZoneService.assignUsers(id, dto.userIds);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/spotholes')
  async assignSpotHoles(@Param('id') id: string, @Body() dto: AssignSpotHolesDto) {
    return this.workZoneService.assignSpotHoles(id, dto.spotHoleIds, dto.polygon);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/schedule')
  async schedule(@Param('id') id: string, @Body() dto: ScheduleZoneDto) {
    return this.workZoneService.setScheduledStart(id, dto.scheduledStartAt ? new Date(dto.scheduledStartAt) : null);
  }

  @Roles(Role.ADMIN)
  @Post(':id/force-complete')
  async forceComplete(@Request() req, @Param('id') id: string) {
    return this.workZoneService.forceComplete(req.user, id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/reopen')
  async reopen(@Param('id') id: string) {
    return this.workZoneService.reopen(id);
  }
}
