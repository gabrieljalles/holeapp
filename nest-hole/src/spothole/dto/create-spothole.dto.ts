import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateSpotHoleDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  observation: string;

  @Transform(({ value }) =>{
    if (typeof value === 'string'){
      return value.trim().toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  vereador: boolean;

  @Transform(({ value }) => {
    if(typeof value === 'string'){
      return value.trim().toLowerCase() === 'true';
    }
    return Boolean(value);
  }) 
  @IsBoolean()
  simSystem: boolean;

  @Transform(({ value }) => {
    if(typeof value === 'string'){
      return value.trim().toLowerCase() === 'true';
    }
    return Boolean(value);
  }) 
  @IsBoolean()
  bigHole: boolean;
}