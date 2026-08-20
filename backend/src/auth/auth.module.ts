import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import {UserModule} from '../user/user.module';


@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'GabrielJalles2025',
        signOptions: {expiresIn: '30d'},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
