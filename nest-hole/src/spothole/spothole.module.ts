import { Module } from '@nestjs/common';
import { SpotHoleService } from './spothole.service';
import { SpotHoleController } from './spothole.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SpotHoleService],
  controllers: [SpotHoleController],
})
export class SpotHoleModule {}
