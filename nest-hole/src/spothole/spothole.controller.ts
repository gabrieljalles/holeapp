import { Controller, Get, Post, Body } from '@nestjs/common';
import { SpotHoleService } from './spothole.service';

@Controller('spotholes')
export class SpotHoleController {
  constructor(private readonly spotHoleService: SpotHoleService) {}

  @Get()
  async findAll() {
    return this.spotHoleService.findAll();
  }

  @Post()
  async create(
    @Body()
    body: {
      priority: string;
      size: string;
      trafficIntensity: string;
      status: string;
      createdBy: string;
      fixedBy: string;
      latitude: number;
      longitude: number;
      zone: string;
      district: string;
      cep: string;
      address: string;
      number: string;
      observation: string;
      fixedAt: string | Date;
      imgBeforeWork: string;
      imgAfterWork: string;
    },
  ) {
    return this.spotHoleService.create(body);
  }
}
