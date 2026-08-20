import { Module } from '@nestjs/common';
import { SpotHoleService } from './spothole.service';
import { SpotHoleController } from './spothole.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpotHoleRepository } from './spothole.repository';
import { SpotHoleAuthorizationService } from './spothole-authorization.service';
import { WorkZoneModule } from '../workzone/workzone.module';

@Module({
  imports: [PrismaModule, WorkZoneModule],
  providers: [SpotHoleService, SpotHoleRepository, SpotHoleAuthorizationService],
  controllers: [SpotHoleController],
})
export class SpotHoleModule {}
