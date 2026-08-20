import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Patch,
  Body,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import {FileFieldsInterceptor, FileInterceptor} from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/multer.config';
import { baseUploadPath } from 'src/shared/upload-path';
import { SpotHoleService } from './spothole.service';
import { CreateSpotHoleDto } from './dto/create-spothole.dto';
import { BulkCloseDto } from './dto/bulk-close.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import path from 'path';
import * as fs from 'fs';
import { processImage } from 'src/utils/image-processor.service';

// Abaixo desse zoom, a cidade inteira cabe na tela: responde com clusters agregados
// em vez de cada buraco individual, para não travar com dezenas de milhares de pontos.
const CLUSTER_ZOOM_THRESHOLD = 14;

// Quanto mais afastado o zoom, maior a célula de agrupamento (menos casas decimais).
function precisionForZoom(zoom: number): number {
  if (zoom < 10) return 1;
  if (zoom < 12) return 2;
  return 3;
}

@Controller('spothole')
export class SpotHoleController {
  constructor(private readonly spotHoleService: SpotHoleService) {}

  @Get()
  async findAll(
    @Query('minLat') minLat?: string,
    @Query('maxLat') maxLat?: string,
    @Query('minLng') minLng?: string,
    @Query('maxLng') maxLng?: string,
    @Query('zoom') zoom?: string,
    // Mapa principal com filtro de zona ligado (reparador restrito às próprias zonas,
    // ou admin com a demarcação ligada). Presente mesmo vazio ("") = restringe a zero
    // zonas; ausente = sem restrição (comportamento de hoje).
    @Query('workZoneIds') workZoneIdsParam?: string,
  ) {
    try {
      const bbox =
        minLat && maxLat && minLng && maxLng
          ? {
              minLat: Number(minLat),
              maxLat: Number(maxLat),
              minLng: Number(minLng),
              maxLng: Number(maxLng),
            }
          : undefined;

      const workZoneIds = workZoneIdsParam !== undefined
        ? (workZoneIdsParam ? workZoneIdsParam.split(',') : [])
        : undefined;

      // Visão restrita a zona nunca é grande o bastante pra precisar de cluster.
      if (workZoneIds === undefined && bbox && zoom && Number(zoom) < CLUSTER_ZOOM_THRESHOLD) {
        const points = await this.spotHoleService.findClustered(
          bbox,
          precisionForZoom(Number(zoom)),
        );
        return { type: 'cluster', points };
      }

      const points = await this.spotHoleService.findAll(bbox, workZoneIds);
      return { type: 'points', points };
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar os registros',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Painel gerencial: listagem completa (sem bbox/clustering/retenção de 7 dias),
  // filtrável por bairro/zona/status — só admin.
  @Roles(Role.ADMIN)
  @Get('filtered')
  async findFiltered(
    @Request() req,
    @Query('district') district?: string,
    @Query('workZoneId') workZoneId?: string,
    @Query('zone') zone?: string,
    @Query('status') status?: string,
    @Query('bigHole') bigHole?: string,
    @Query('vereador') vereador?: string,
    @Query('simSystem') simSystem?: string,
    @Query('page') pageParam?: string,
    @Query('pageSize') pageSizeParam?: string,
  ) {
    try {
      // Sem `page` na query, mantém a resposta antiga (lista completa) — o seletor de
      // buracos no mapa (aba Zonas) depende disso para ver todos os pontos de uma vez.
      const pagination = pageParam
        ? {
            page: Math.max(1, parseInt(pageParam, 10) || 1),
            pageSize: Math.min(100, Math.max(1, parseInt(pageSizeParam, 10) || 25)),
          }
        : undefined;

      return await this.spotHoleService.findFiltered(
        {
          district,
          workZoneId,
          zone,
          status,
          bigHole: bigHole === 'true',
          vereador: vereador === 'true',
          simSystem: simSystem === 'true',
        },
        req.user,
        pagination,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar os registros',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lista de bairros já cadastrados, para autocompletar o filtro do painel gerencial.
  @Roles(Role.ADMIN)
  @Get('districts')
  async findDistinctDistricts(@Request() req) {
    try {
      return await this.spotHoleService.findDistinctDistricts(req.user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar os bairros',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lista de setores já cadastrados (campo `zone`), para autocompletar o filtro do painel.
  @Roles(Role.ADMIN)
  @Get('sectors')
  async findDistinctZones(@Request() req) {
    try {
      return await this.spotHoleService.findDistinctZones(req.user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar os setores',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Indicadores do dashboard gerencial — só admin.
  @Roles(Role.ADMIN)
  @Get('stats')
  async getStats(@Request() req) {
    try {
      return await this.spotHoleService.getStats(req.user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar as estatísticas.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin fecha vários buracos de uma vez (ex.: seleção de área/polígono no mapa).
  @Roles(Role.ADMIN)
  @Patch('bulk-close')
  async bulkClose(@Request() req, @Body() dto: BulkCloseDto) {
    try {
      return await this.spotHoleService.bulkClose(dto.spotHoleIds, req.user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao fechar os registros.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    try {
      if (!id) {
        throw new HttpException(
          'O ID fornecido deve um texto válido.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const deletedSpotHole = await this.spotHoleService.delete(id, req.user);

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
    @Request() req,
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

      return await this.spotHoleService.update(id, updateData, req.user);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message || 'Erro ao atualizar o registro.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

  }

  @Post()
  @UseInterceptors(FileInterceptor('imgBeforeWork', multerOptions))
  async create(
    @Request() req,
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
      return await this.spotHoleService.create({ lat, lng, imgBeforeWorkPath, observation , vereador, simSystem, bigHole }, req.user);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message || 'Erro ao criar o registro.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
