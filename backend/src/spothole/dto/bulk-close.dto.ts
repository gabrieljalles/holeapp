import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class BulkCloseDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  spotHoleIds: string[];
}
