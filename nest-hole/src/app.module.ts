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
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: 
        process.env.NODE_ENV === 'development'
        ? join(__dirname, '..', 'uploads')
        : '/app/uploads',
      serveRoot: '/spothole/uploads',
    }),
    PrismaModule,
    SpotHoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
