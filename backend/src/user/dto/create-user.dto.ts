import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

// Auto-cadastro público: o papel nunca vem do cliente, todo mundo nasce VIEWER.
export class CreateUserDto {
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
}
