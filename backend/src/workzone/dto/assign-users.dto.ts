import { IsArray, IsString } from 'class-validator';

export class AssignUsersDto {
  // Pode ser vazio, pra desatribuir todo mundo da zona.
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
