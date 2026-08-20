import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SpotHoleModule } from './spothole/spothole.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorkZoneModule } from './workzone/workzone.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';

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
    UserModule,
    AuthModule,
    WorkZoneModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Toda rota exige JWT válido por padrão; use @Public() para liberar uma rota específica.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Depois de autenticado, checa @Roles(...) quando presente na rota.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
