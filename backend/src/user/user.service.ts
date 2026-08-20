import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { AuthUser } from '../auth/auth-user.interface';

const ADMIN_ASSIGNABLE_ROLES: Role[] = [Role.VIEWER, Role.REPAIRER, Role.ADDER];

// Janelas de presença no mapa: verde enquanto < 5min sem ping; vermelho até 20min;
// depois disso, some da listagem (ver findLocationsForMap).
const ONLINE_THRESHOLD_MS = 5 * 60_000;
const EXPIRY_THRESHOLD_MS = 20 * 60_000;

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private JwtService: JwtService
  ) {}

  async registerUser(dto: CreateUserDto){
    await this.assertMatriculaAndEmailAvailable(dto.matricula, dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Todo auto-cadastro nasce VIEWER, sem exceção — o papel nunca vem do cliente.
    const newUser = await this.userRepository.createUser({
        matricula: dto.matricula,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        role: Role.VIEWER,
    })

    return this.toPublicUser(newUser);
  }

  async adminCreateUser(admin: AuthUser, dto: CreateUserByAdminDto){
    await this.assertMatriculaAndEmailAvailable(dto.matricula, dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userRepository.createUser({
        matricula: dto.matricula,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role,
        createdByUserId: admin.userId,
    });

    return this.toPublicUser(newUser);
  }

  async listAllUsers(){
    const users = await this.userRepository.findAll();
    return users.map((u) => this.toPublicUser(u));
  }

  // Aba "Zonas de trabalho": lista de usuários reparadores, pra montar o multi-select
  // de atribuição. Já vem só com os campos necessários pra UI — não passa por toPublicUser.
  async listRepairers(){
    return this.userRepository.findRepairers();
  }

  async deleteUser(actingUser: AuthUser, targetUserId: string){
    if (targetUserId === actingUser.userId) {
      throw new BadRequestException('Você não pode excluir a própria conta.');
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    try {
      await this.userRepository.deleteUserById(targetUserId);
    } catch (error) {
      // P2003: violação de FK — ex.: esse usuário ainda é dono de uma equipe.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          'Não é possível excluir este usuário: ele ainda é dono de uma ou mais equipes. Exclua ou transfira as equipes primeiro.',
        );
      }
      throw error;
    }

    return { message: 'Usuário excluído com sucesso.' };
  }

  async promoteRole(actingUser: AuthUser, targetUserId: string, newRole: Role){
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (actingUser.role === Role.ADMIN) {
      if (!ADMIN_ASSIGNABLE_ROLES.includes(newRole)) {
        throw new ForbiddenException('Papel inválido para atribuição via API.');
      }
    } else {
      throw new ForbiddenException('Você não pode alterar o papel de outros usuários.');
    }

    const updated = await this.userRepository.updateUser(targetUserId, { role: newRole });
    return this.toPublicUser(updated);
  }

  // Toda conta pode trocar a própria foto de perfil (para aparecer no mapa no futuro).
  async updateOwnPhoto(actingUser: AuthUser, imgUserPath: string){
    const updated = await this.userRepository.updateUser(actingUser.userId, { imgUserPath });
    return this.toPublicUser(updated);
  }

  // Qualquer usuário autenticado reporta a própria posição a cada 1 min enquanto
  // está no mapa; `lastSeenAt` sempre gravado pelo servidor (nunca aceito do cliente).
  async updateMyLocation(actingUser: AuthUser, lat: number, lng: number){
    await this.userRepository.updateLocation(actingUser.userId, lat, lng);
    return { message: 'Localização atualizada.' };
  }

  // Painel do admin: colaboradores com ping nos últimos 20min, nunca incluindo o
  // próprio admin. Verde (<5min) ou vermelho (5-20min); calculado a cada consulta.
  async listCollaboratorLocations(actingUser: AuthUser){
    const cutoff = new Date(Date.now() - EXPIRY_THRESHOLD_MS);
    const users = await this.userRepository.findLocationsForMap(actingUser.userId, cutoff);
    return users.map((u) => this.toCollaboratorLocation(u));
  }

  async getProfile(matricula: string){
    const user = await this.userRepository.findByMatricula(matricula);

    if (!user){
        throw new NotFoundException('Usuário não encontrado');
    }

    return this.toPublicUser(user);
  }

  private async assertMatriculaAndEmailAvailable(matricula: string, email: string) {
    const [existingByMatricula, existingByEmail] = await Promise.all([
      this.userRepository.findByMatricula(matricula),
      this.userRepository.findByEmail(email),
    ]);

    if (existingByMatricula) {
      throw new ConflictException('Matrícula já cadastrada.');
    }
    if (existingByEmail) {
      throw new ConflictException('E-mail já cadastrado.');
    }
  }

  private toPublicUser(user: { id: string; matricula: string; email: string | null; fullName: string; role: Role; imgUserPath: string | null }) {
    return {
        id: user.id,
        matricula: user.matricula,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        imgUserPath: user.imgUserPath,
    };
  }

  // Não reaproveita toPublicUser: essa listagem não deve vazar matrícula/e-mail.
  private toCollaboratorLocation(user: {
    id: string;
    fullName: string;
    imgUserPath: string | null;
    lastLat: number | null;
    lastLng: number | null;
    lastSeenAt: Date | null;
  }) {
    const isOnline = user.lastSeenAt !== null && Date.now() - user.lastSeenAt.getTime() < ONLINE_THRESHOLD_MS;
    return {
      id: user.id,
      fullName: user.fullName,
      imgUserPath: user.imgUserPath,
      lat: user.lastLat,
      lng: user.lastLng,
      status: isOnline ? 'online' : 'offline',
    };
  }
}
