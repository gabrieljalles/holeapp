import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateWorkZoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;
}
