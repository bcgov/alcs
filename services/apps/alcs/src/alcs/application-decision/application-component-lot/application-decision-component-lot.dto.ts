import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationDecisionComponentLotDto {
  @IsString()
  @IsOptional()
  type: 'Lot' | 'Road Dedication' | null;

  @IsNumber()
  @IsOptional()
  alrArea: number | null;

  @IsNumber()
  @IsOptional()
  size: number | null;

  @IsString()
  uuid: string;
}

export class ApplicationDecisionComponentLotDto {
  index: number;
  componentUuid: string;
  type: 'Lot' | 'Road Dedication' | null;
  alrArea: number | null;
  size: number | null;
  uuid: string;
}
