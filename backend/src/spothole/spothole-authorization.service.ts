import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role, SpotHole } from '@prisma/client';
import { AuthUser } from '../auth/auth-user.interface';

@Injectable()
export class SpotHoleAuthorizationService {
  assertCanCreate(user: AuthUser) {
    const allowed: Role[] = [Role.ADDER, Role.ADMIN];
    if (!allowed.includes(user.role)) {
      throw new ForbiddenException('Você não pode criar buracos.');
    }
  }

  assertCanUpdate(user: AuthUser, spotHole: SpotHole) {
    if (user.role === Role.ADMIN || user.role === Role.REPAIRER) return;

    throw new ForbiddenException('Você não pode atualizar este buraco.');
  }

  assertCanDelete(user: AuthUser, spotHole: SpotHole) {
    if (user.role === Role.ADMIN) return;

    if (user.role === Role.ADDER && spotHole.createdByUserId === user.userId) return;

    throw new ForbiddenException('Você não pode excluir este buraco.');
  }
}
