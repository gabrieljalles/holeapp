import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
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

  @Post()
  @UseInterceptors(FileInterceptor('imgBeforeWork', multerOptions))
  async create(
    @Body()
    body: {
      lat: number;
      lng: number;
    },
    @UploadedFile() imgBeforeWork: Express.Multer.File,
  ) {
    const { lat, lng } = body;
    if (!lat || !lng || !imgBeforeWork) {
      throw new HttpException(
        'Latitude, longitude e a imagem são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.spotHoleService.create({ lat, lng, imgBeforeWork });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao criar o registro.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
