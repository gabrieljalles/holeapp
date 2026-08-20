import { IsArray, IsOptional, IsString } from 'class-validator';

export class AssignSpotHolesDto {
  // Pode ser vazio — permite salvar só a área desenhada (polygon) antes de a zona
  // ter algum buraco dentro dela.
  @IsArray()
  @IsString({ each: true })
  spotHoleIds: string[];

  // Pontos [lat, lng] do polígono usado pra selecionar os buracos, se algum foi
  // desenhado nesta sessão — omitido (não enviado) mantém o polígono já salvo na zona.
  @IsOptional()
  @IsArray()
  polygon?: [number, number][] | null;
}
