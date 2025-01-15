import { Module } from '@nestjs/common';
import { SpotHoleService } from './spothole.service';
import { SpotHoleController } from './spothole.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpotHoleRepository } from './spothole.repository';

@Module({
  imports: [PrismaModule],
  providers: [SpotHoleService, SpotHoleRepository],
  controllers: [SpotHoleController],
})
export class SpotHoleModule {}
