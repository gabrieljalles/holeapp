import { IsOptional, IsISO8601 } from 'class-validator';

export class ScheduleZoneDto {
  @IsOptional()
  @IsISO8601()
  scheduledStartAt: string | null;
}
