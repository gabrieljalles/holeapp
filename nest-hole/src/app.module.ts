import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SpotHoleModule } from './spothole/spothole.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/spothole/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SpotHoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
