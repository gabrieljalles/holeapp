import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/multer.config';
import { SpotHoleService } from './spothole.service';

@Controller('spothole')
export class SpotHoleController {
  constructor(private readonly spotHoleService: SpotHoleService) {}

  @Get()
  async findAll() {
    try {
      return this.spotHoleService.findAll();
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar os registros',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      if (!id) {
        throw new HttpException(
          'O ID fornecido deve um texto válido.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const deletedSpotHole = await this.spotHoleService.delete(id);

      if (!deletedSpotHole) {
        throw new HttpException(
          'Registro não encontrado.',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Registro deletado com sucesso.',
        deletedSpotHole,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao deletar o registro.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  @Post()
  @UseInterceptors(FileInterceptor('imgBeforeWork', multerOptions))
  async create(
    @Body()
    body: {
      lat: number;
      lng: number;
      observation: string;
    },
    @UploadedFile() imgBeforeWork: Express.Multer.File,
  ) {
    const { lat, lng, observation } = body;
    
    if (!lat || !lng || !imgBeforeWork) {
      throw new HttpException(
        'Latitude, longitude e a imagem são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.spotHoleService.create({ lat, lng, imgBeforeWork, observation });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao criar o registro.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
