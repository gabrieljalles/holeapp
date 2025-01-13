import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpotHoleService {
  //Não quero apenas ler, mudar depois
  constructor(private readonly prisma: PrismaService) {}

  //Encontre todos buracos;
  async findAll() {
    return this.prisma.spotHole.findMany();
  }

  //Crie um spot
  async create(data: {
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
  }) {
    return this.prisma.spotHole.create({ data });
  }
}
