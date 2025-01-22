import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SpotHole } from '@prisma/client';

//Recebe os dados e envia para o banco, não preocupa se eles estão certos.
@Injectable()
export class SpotHoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  //Le todos os dados do banco
  async findAll() {
    return this.prisma.spotHole.findMany();
  }

  //Cria uma linha no banco
  async create(data: Prisma.SpotHoleCreateInput) {
    return this.prisma.spotHole.create({ data });
  }

  //Deleta uma linha no banco
  async delete(id: string){
    return this.prisma.spotHole.delete({
      where: {id},
    })
  }

  //Procura por uma linha específica
  async findUnique(id:string) {
    return this.prisma.spotHole.findUnique({
      where: {id},
    })
  }
}
