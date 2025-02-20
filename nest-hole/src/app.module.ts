import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SpotHoleModule } from './spothole/spothole.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { env } from 'process';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      //Para local, alterar o rootPath para "join(__dirname, '..', '..', 'uploads')"
      rootPath: "/app/uplaods",
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
