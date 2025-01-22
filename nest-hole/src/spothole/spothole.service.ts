import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { SpotHoleRepository } from './spothole.repository';
import { Prisma, SpotHole } from '@prisma/client';
import axios from 'axios';
import * as path from 'path';

@Injectable()
export class SpotHoleService {
  constructor(private readonly spotHoleRepository: SpotHoleRepository) {}

  // <<<<
  async findAll(): Promise<SpotHole[]> {
    return this.spotHoleRepository.findAll();
  }

  // >>>>
  async create(data: {
    lat: number;
    lng: number;
    imgBeforeWork: Express.Multer.File;
    observation: string;
  }) {
    const { lat, lng, imgBeforeWork, observation } = data;

    const addressData = await this.getAddressFromLatLng(lat, lng);

    const newSpotHole: Prisma.SpotHoleCreateInput = {
      priority: '',
      size: '',
      trafficIntensity: '',
      observation: observation || null,
      status: 'Em aberto',
      createdBy: 'Sistema',
      fixedBy: '',
      lat: Number(lat),
      lng: Number(lng),
      zone: '',
      district: '',
      cep: '',
      address: '',
      number: '',

      imgBeforeWorkPath: imgBeforeWork.path || null,
      imgAfterWorkPath: null,
      ...addressData,
    };

    return this.spotHoleRepository.create(newSpotHole);
  }

  async delete(id:string): Promise<SpotHole>{

  const spotHole = await this.spotHoleRepository.findUnique(id);
  
  if(!spotHole){
    throw new Error('Registro não encontrado.');
  }

  if(spotHole.imgBeforeWorkPath){
    this.deleteFile(spotHole.imgBeforeWorkPath)
  }

  if(spotHole.imgAfterWorkPath){
    this.deleteFile(spotHole.imgAfterWorkPath)
  }

    return this.spotHoleRepository.delete(id);
  }

  private async getAddressFromLatLng(
    lat: number,
    lng: number,
  ): Promise<Partial<Prisma.SpotHoleCreateInput>> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const response = await axios.get(url);
      const address = response.data.address || {};

      return {
        address: address.road || null,
        district: address.suburb || null,
        cep: address.postcode || null,
        zone: address.city_district || null,
        number: address.house_number || null,
      };
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      throw new Error(
        'Não foi possível buscar o endereço. Verifique a conexão.',
      );
    }
  }

  private deleteFile(filePath: string){
    const absolutePath = path.resolve(filePath);

    fs.unlink(absolutePath, (err)=> {
      if (err){
        console.error(`Erro ao excluir o arquivo ${absolutePath}`, err);
      } else {
        console.log(`Arquivo excluído: ${absolutePath}`)
      }
    })
  }
}
