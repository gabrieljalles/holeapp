import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';


@Injectable()
export class AuthService {
  constructor(
    private UserRepository: UserRepository,
    private JwtService: JwtService
  ) {}

  async login(dto: {matricula: string; password: string}){
    const user = await this.UserRepository.findByMatricula(dto.matricula);

    if(!user){
        throw new NotFoundException('Usuário não encontrado');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid){
        throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
        sub: user.id,
        matricula: user.matricula,
        fullName: user.fullName,
        role: user.role
    };

    const token = this.JwtService.sign(payload);

    return {
        access_token: token
    }
  }
}
