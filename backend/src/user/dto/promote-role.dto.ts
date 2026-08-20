import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class PromoteRoleDto {
  @IsEnum(Role)
  role: Role;
}
