import { IsString, IsNotEmpty, MinLength, MaxLength, IsIn, IsEmail } from 'class-validator';
import { Role } from '@prisma/client';

const ADMIN_ASSIGNABLE_ROLES = [Role.VIEWER, Role.REPAIRER, Role.ADDER];

export class CreateUserByAdminDto {
    @IsString()
    @MinLength(4)
    @MaxLength(5)
    @IsNotEmpty()
    matricula: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(4)
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsIn(ADMIN_ASSIGNABLE_ROLES)
    role: Role;
}
