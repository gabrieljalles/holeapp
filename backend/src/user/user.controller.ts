import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Request,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { PromoteRoleDto } from './dto/promote-role.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { multerOptions } from 'src/shared/multer.config';
import { baseUploadPath } from 'src/shared/upload-path';
import { processImage } from 'src/utils/image-processor.service';

//Gerenciamento de usuário

@Controller('user')
export class UserController{
    constructor(private userService: UserService){}

    @Get('profile')
    async profile(@Request() req){
        return this.userService.getProfile(req.user.matricula);
    }

    // Usado pelo painel gerencial para resolver uma matrícula digitada em um userId,
    // antes de promover o papel de um usuário.
    @Roles(Role.ADMIN)
    @Get('by-matricula/:matricula')
    async findByMatricula(@Param('matricula') matricula: string){
        return this.userService.getProfile(matricula);
    }

    // Aba "Colaboradores" do painel: admin vê todos os usuários.
    @Roles(Role.ADMIN)
    @Get()
    async listAll(){
        return this.userService.listAllUsers();
    }

    // Aba "Zonas de trabalho": usuários reparadores, pra atribuir a uma zona.
    @Roles(Role.ADMIN)
    @Get('addable')
    async listRepairers(){
        return this.userService.listRepairers();
    }

    @Public()
    @Post('register')
    async register(@Body() dto: CreateUserDto){
        return this.userService.registerUser(dto);
    }

    @Roles(Role.ADMIN)
    @Post('admin-create')
    async adminCreate(@Request() req, @Body() dto: CreateUserByAdminDto){
        return this.userService.adminCreateUser(req.user, dto);
    }

    @Roles(Role.ADMIN)
    @Patch(':userId/role')
    async promoteRole(@Request() req, @Param('userId') userId: string, @Body() dto: PromoteRoleDto){
        return this.userService.promoteRole(req.user, userId, dto.role);
    }

    // Só admin exclui contas — apagar um colaborador na aba "Colaboradores" do painel.
    @Roles(Role.ADMIN)
    @Delete(':userId')
    async deleteUser(@Request() req, @Param('userId') userId: string){
        return this.userService.deleteUser(req.user, userId);
    }

    // Qualquer usuário autenticado reporta a própria posição a cada 1 min enquanto
    // está no mapa — usado pelo admin para ver colaboradores online.
    @Patch('me/location')
    async updateOwnLocation(@Request() req, @Body() dto: UpdateLocationDto){
        return this.userService.updateMyLocation(req.user, dto.lat, dto.lng);
    }

    // Camada de "colaboradores online" no mapa grande — só admin.
    @Roles(Role.ADMIN)
    @Get('locations')
    async listLocations(@Request() req){
        return this.userService.listCollaboratorLocations(req.user);
    }

    // Qualquer usuário autenticado pode trocar a própria foto de perfil.
    @Patch('me/photo')
    @UseInterceptors(FileInterceptor('photo', multerOptions))
    async updateOwnPhoto(@Request() req, @UploadedFile() photo?: Express.Multer.File){
        if (!photo) {
            throw new BadRequestException('Nenhuma imagem enviada.');
        }

        try {
            const processedBuffer = await processImage(photo);
            const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
            const uploadPath = path.join(baseUploadPath, filename);
            await fs.promises.writeFile(uploadPath, processedBuffer);

            return await this.userService.updateOwnPhoto(req.user, `uploads/${filename}`);
        } catch (error) {
            throw new HttpException(
                error.message || 'Erro ao processar a foto.',
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
