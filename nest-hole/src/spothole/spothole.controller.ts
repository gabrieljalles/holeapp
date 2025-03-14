import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import {FileFieldsInterceptor, FileInterceptor} from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/multer.config';
import { SpotHoleService } from './spothole.service';
import { CreateSpotHoleDto } from './dto/create-spothole.dto';
import path from 'path';
import * as fs from 'fs';
import { processImage } from 'src/utils/image-processor.service';

//Define o lugar onde irá salvar as IMGS
const baseUploadPath = 
process.env.NODE_ENV === 'development'
? path.join(__dirname, '..', '..', 'uploads')
: '/app/uploads';

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

  @Put(':id')
  @UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'imgBeforeWork', maxCount: 1 }, 
      { name: 'imgAfterWork', maxCount: 1 },
    ],
    multerOptions,
  ),
)
  async update(
    @Param('id') id: string,
    @Body() updateData:any,
    @UploadedFiles()
  files: {
    imgBeforeWork?: Express.Multer.File[];
    imgAfterWork?: Express.Multer.File[];
  },
  ){

    try {
      const beforeFile = files?.imgBeforeWork?.[0];
      const afterFile = files?.imgAfterWork?.[0];
  
      if (beforeFile) {
        const processedBuffer = await processImage(beforeFile);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
        const uploadPath = path.join(baseUploadPath, filename);
        await fs.promises.writeFile(uploadPath, processedBuffer);
        updateData.imgBeforeWorkPath = `uploads/${filename}`;
      }
      if (afterFile) {
        const processedBuffer = await processImage(afterFile);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
        const uploadPath = path.join(baseUploadPath, filename);
        await fs.promises.writeFile(uploadPath, processedBuffer);
        updateData.imgAfterWorkPath = `uploads/${filename}`;
      }
  
      return await this.spotHoleService.update(id, updateData);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Erro ao atualizar o registro.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    
  }
  
  @Post()
  @UseInterceptors(FileInterceptor('imgBeforeWork', multerOptions))
  async create(
    @Body() body: CreateSpotHoleDto,
    @UploadedFile() imgBeforeWork?: Express.Multer.File,
  ) {
    const { lat, lng, observation, vereador, simSystem, bigHole } = body;

    if (!lat || !lng) {
      throw new HttpException(
        'Latitude, longitude são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    let imgBeforeWorkPath: string | null = null;

    if(imgBeforeWork){
      const processedBuffer = await processImage(imgBeforeWork);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const uploadPath = path.join(baseUploadPath, filename);
      console.log("Salvando imagem no:", uploadPath);
      await fs.promises.writeFile(uploadPath, processedBuffer);
      imgBeforeWorkPath = `uploads/${filename}`;
    }

    try {
      return await this.spotHoleService.create({ lat, lng, imgBeforeWorkPath, observation , vereador, simSystem, bigHole });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao criar o registro.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
