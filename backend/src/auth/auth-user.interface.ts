import { Role } from '@prisma/client';

// Formato de `req.user`, populado pela JwtStrategy a partir do token.
export interface AuthUser {
  userId: string;
  matricula: string;
  fullName: string;
  role: Role;
}
