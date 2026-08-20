import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { WorkZoneController } from './workzone.controller';
import { WorkZoneService } from './workzone.service';
import { WorkZoneRepository } from './workzone.repository';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [WorkZoneController],
  providers: [WorkZoneService, WorkZoneRepository],
  exports: [WorkZoneRepository, WorkZoneService],
})
export class WorkZoneModule {}
