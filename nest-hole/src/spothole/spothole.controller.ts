import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UploadedFile, 
  UseInterceptors 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/shared/multer.config';
import { SpotHoleService } from './spothole.service';

@Controller('spothole')
export class SpotHoleController {
  constructor(private readonly spotHoleService: SpotHoleService) {}

  @Get()
  async findAll() {
    return this.spotHoleService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('imgBeforeWork', multerOptions))
  async create(
    @Body()
    body: {
      priority: string;
      size: string;
      trafficIntensity: string;
      status: string;
      createdBy: string;
      fixedBy: string;
      lat: number;
      lng: number;
      zone: string;
      district: string;
      cep: string;
      address: string;
      number: string;
      observation: string;
      fixedAt: string | Date;
      imgBeforeWorkPath: string;
      imgAfterWorkPath: string;
    },
    @UploadedFile() imgBeforeWork: Express.Multer.File,
  ) {
    return this.spotHoleService.create({
      ...body, 
      imgBeforeWorkPath: imgBeforeWork.path,})
  }
}
